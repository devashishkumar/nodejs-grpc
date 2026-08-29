const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

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

// Mock database
const mockUsers = [
  {
    id: 1,
    name: 'Name1',
    email: 'name1@example.com',
    phone: '1234567890'
  },
  {
    id: 2,
    name: 'Name2',
    email: 'name2@example.com',
    phone: '2345678901'
  },
  {
    id: 3,
    name: 'Name3',
    email: 'name3@example.com',
    phone: '3456789012'
  },
  {
    id: 4,
    name: 'Name4',
    email: 'name4@example.com',
    phone: '4567890123'
  },
  {
    id: 5,
    name: 'Name5',
    email: 'name5@example.com',
    phone: '5678901234'
  }
];

let nextUserId = 6;

// Implement the GetUser RPC
function getUser(call, callback) {
  const userId = call.request.id;
  const user = mockUsers.find(u => u.id === userId);

  if (user) {
    callback(null, user);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      message: `User with ID ${userId} not found`
    });
  }
}

// Implement the ListUsers RPC
function listUsers(call, callback) {
  callback(null, { users: mockUsers });
}

// Implement the CreateUser RPC
function createUser(call, callback) {
  const newUser = {
    id: nextUserId++,
    name: call.request.name,
    email: call.request.email,
    phone: call.request.phone
  };

  mockUsers.push(newUser);
  callback(null, newUser);
}

// Implement the StreamUsers RPC (Server-side streaming)
function streamUsers(call) {
  // Send each user one at a time as a separate message
  mockUsers.forEach((user) => {
    call.write(user);
  });
  // End the stream
  call.end();
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
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.forceShutdown();
  process.exit(0);
});
