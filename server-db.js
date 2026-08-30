const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { Pool } = require('pg');

// Load the proto file
const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, 'user.proto'),
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  }
);

// Load the gRPC package definition
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// Initialize PostgreSQL database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydb'
});

// Implement the GetUser RPC
async function getUser(call, callback) {
  const userId = call.request.id;
  
  try {
    const result = await pool.query('SELECT id, name, email, phone FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (user) {
      callback(null, user);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        message: `User with ID ${userId} not found`
      });
    }
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: `Database error: ${err.message}`
    });
  }
}

// Implement the ListUsers RPC
async function listUsers(call, callback) {
  try {
    const result = await pool.query('SELECT id, name, email, phone FROM users');
    callback(null, { users: result.rows });
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: `Database error: ${err.message}`
    });
  }
}

// Implement the CreateUser RPC
async function createUser(call, callback) {
  const { name, email, phone } = call.request;
  
  try {
    const query = 'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING id, name, email, phone';
    const result = await pool.query(query, [name, email, phone]);
    callback(null, result.rows[0]);
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: `Database error: ${err.message}`
    });
  }
}

// Implement the StreamUsers RPC (Server-side streaming)
async function streamUsers(call) {
  try {
    const result = await pool.query('SELECT id, name, email, phone FROM users');
    
    result.rows.forEach((user) => {
      call.write(user);
    });
    
    call.end();
  } catch (err) {
    call.emit('error', {
      code: grpc.status.INTERNAL,
      message: `Database error: ${err.message}`
    });
  }
}

// Create the gRPC server
const server = new grpc.Server();

// Add the UserService implementation
server.addService(userProto.UserService.service, {
  getUser,
  listUsers,
  createUser,
  streamUsers
});

// Start the server
const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    process.exit(1);
  }
  console.log(`✅ gRPC Server running at 0.0.0.0:${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing server and database pool');
  server.forceShutdown();
  await pool.end();
  process.exit(0);
});