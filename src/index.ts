#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { Connection, Request, TYPES, type ConnectionConfiguration } from "tedious";

interface SqlServerConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  trustServerCertificate: boolean;
  encrypt: boolean;
}

class SqlServerDatabase {
  private config: ConnectionConfiguration;
  private connection: Connection | null = null;

  constructor(config: SqlServerConfig) {
    this.config = {
      server: config.server,
      authentication: {
        type: "default",
        options: {
          userName: config.user,
          password: config.password,
        },
      },
      options: {
        port: config.port,
        database: config.database,
        trustServerCertificate: config.trustServerCertificate,
        encrypt: config.encrypt,
      },
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection = new Connection(this.config);
      
      this.connection.on("connect", (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      this.connection.on("error", (err) => {
        console.error("Connection error:", err);
      });

      this.connection.connect();
    });
  }

  async query(sql: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.connection) {
        reject(new Error("Not connected to database"));
        return;
      }

      const results: any[] = [];
      
      const request = new Request(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });

      request.on("row", (columns) => {
        const row: any = {};
        columns.forEach((column: any) => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row);
      });

      this.connection.execSql(request);
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.connection) {
        this.connection.close();
        this.connection.on("end", () => {
          this.connection = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

function getSqlServerConfig(): SqlServerConfig {
  const config: SqlServerConfig = {
    server: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 1433,
    database: process.env.DB_DATABASE || "",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
    encrypt: process.env.DB_ENCRYPT !== "false", // Default to true for security
  };

  if (!config.database) {
    throw new Error("DB_DATABASE environment variable is required");
  }

  if (!config.user) {
    throw new Error("DB_USER environment variable is required");
  }

  return config;
}

async function main() {
  let database: SqlServerDatabase | null = null;

  try {
    const dbConfig = getSqlServerConfig();
    database = new SqlServerDatabase(dbConfig);
    await database.connect();
    
    console.error(`Connected to SQL Server at ${dbConfig.server}:${dbConfig.port}`);

    const server = new McpServer({
      name: "mcp-sql-server",
      description: "SQL Server query server for MCP",
      version: "1.0.0",
      capabilities: {
        tools: {},
      },
    });

    server.tool(
      "query",
      "Execute a SQL query against the connected SQL Server database",
      {
        sql: z.string().describe("The SQL query to execute"),
      },
      async ({ sql }) => {
        try {
          if (!database) {
            throw new Error("Database not connected");
          }

          const results = await database.query(sql);
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(results, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error executing query: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
          };
        }
      }
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("MCP SQL Server running on stdio");

    process.on("SIGINT", async () => {
      if (database) {
        await database.disconnect();
      }
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      if (database) {
        await database.disconnect();
      }
      process.exit(0);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    if (database) {
      await database.disconnect();
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});