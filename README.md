# MCP SQL Server

A Model Context Protocol (MCP) server that provides SQL Server database query capabilities.

## Features

- SQL Server database support using tedious driver
- No native dependencies - pure JavaScript implementation
- Simple query tool for executing SQL statements
- Environment variable based configuration
- Support for encrypted and unencrypted connections

## Installation

```bash
npm install
npm run build
```

## Configuration

Configure the server using environment variables:

- `DB_HOST`: SQL Server host (default: `localhost`)
- `DB_PORT`: SQL Server port (default: `1433`)
- `DB_DATABASE` (required): Database name
- `DB_USER` (required): Database user
- `DB_PASSWORD`: Database password
- `DB_TRUST_SERVER_CERTIFICATE`: Set to `true` to trust server certificate (default: `false`)
- `DB_ENCRYPT`: Set to `false` to disable encryption (default: `true`)

## Usage

### Basic Example

```bash
DB_HOST=localhost \
DB_PORT=1433 \
DB_DATABASE=mydb \
DB_USER=sa \
DB_PASSWORD=MyPassword123! \
npm start
```

### With Trusted Certificate

```bash
DB_HOST=sqlserver.example.com \
DB_DATABASE=production \
DB_USER=appuser \
DB_PASSWORD=SecurePass \
DB_TRUST_SERVER_CERTIFICATE=true \
npm start
```

### Without Encryption (for local development)

```bash
DB_HOST=localhost \
DB_DATABASE=testdb \
DB_USER=sa \
DB_PASSWORD=DevPassword \
DB_ENCRYPT=false \
npm start
```

## MCP Integration

This server provides one tool:

- `query`: Execute SQL queries against the connected SQL Server database
  - Parameters:
    - `sql` (string): The SQL query to execute
  - Returns: JSON formatted query results

### Example Queries

```sql
-- Select data
SELECT TOP 10 * FROM Users

-- Join tables
SELECT o.OrderID, c.CustomerName, o.OrderDate
FROM Orders o
INNER JOIN Customers c ON o.CustomerID = c.CustomerID

-- Aggregate data
SELECT COUNT(*) as TotalOrders, SUM(Amount) as TotalRevenue
FROM Orders
WHERE OrderDate >= '2024-01-01'
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
DB_HOST=localhost \
DB_DATABASE=testdb \
DB_USER=sa \
DB_PASSWORD=TestPass123! \
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Connection Issues

1. **Login failed**: Ensure SQL Server authentication is enabled and credentials are correct
2. **Certificate error**: Set `DB_TRUST_SERVER_CERTIFICATE=true` for self-signed certificates
3. **Encryption error**: Set `DB_ENCRYPT=false` for older SQL Server versions or local development
4. **Network error**: Check firewall settings and ensure SQL Server is listening on the correct port

### SQL Server Configuration

Ensure your SQL Server instance:
- Has SQL Server authentication enabled (not just Windows authentication)
- Is configured to accept TCP/IP connections
- Has the necessary firewall rules configured

## License

MIT