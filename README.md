# Node.js gRPC Application

A complete Node.js application demonstrating gRPC communication between a client and server using mock user data. This project serves as a practical example of building microservices with gRPC and Protocol Buffers.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Available RPC Methods](#available-rpc-methods)
- [Mock Data](#mock-data)
- [Example Usage](#example-usage)
- [Protocol Buffer Definition](#protocol-buffer-definition)
- [Error Handling](#error-handling)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Technical Details](#technical-details)
- [Learning Resources](#learning-resources)
- [License](#license)
- [Contributing](#contributing)
- [Future Enhancements](#future-enhancements)

## 📁 Project Structure

```
gRPC-apis/
├── package.json          # NPM project configuration with dependencies
├── user.proto            # Protocol Buffer definition for UserService
├── server.js             # gRPC server with UserService implementation
├── client.js             # gRPC client for testing the server
└── README.md             # This documentation file
```

## ✨ Features

### gRPC Server (`server.js`)

- **Port**: 50051
- **Credentials**: Insecure (development only)
- **Four RPC Methods**:
  - `GetUser(id)` - Retrieve a single user by ID (Unary RPC)
  - `ListUsers()` - Retrieve all users at once (Unary RPC)
  - `CreateUser(name, email, phone)` - Create a new user with auto-generated ID (Unary RPC)
  - `StreamUsers()` - Stream all users in chunks (Server-side Streaming RPC)

### Mock Database

- 5 pre-loaded users with realistic data
- In-memory storage (resets on server restart)
- Auto-incrementing user ID for new users
- All user data includes: id, name, email, phone

### gRPC Client (`client.js`)

- Demonstrates all 3 RPC methods
- Shows proper error handling (tests retrieving non-existent user)
- Handles async callback-based responses
- Formatted output for easy visualization

## 📦 Prerequisites

- **Node.js** version 12.0.0 or higher
- **npm** version 6.0.0 or higher

## 🚀 Installation

### Step 1: Navigate to project directory

```bash
cd "e:\apps\node js\gRPC-apis"
```

### Step 2: Install dependencies

```bash
npm install
```

This will install:
- `@grpc/grpc-js` (v1.10.0) - gRPC runtime for Node.js
- `@grpc/proto-loader` (v0.7.10) - Loads and parses .proto files
- `nodemon` (v3.0.1) - Development dependency for auto-restart

### Dependency Details

| Package | Version | Purpose |
|---------|---------|---------|
| @grpc/grpc-js | ^1.10.0 | Core gRPC framework for Node.js |
| @grpc/proto-loader | ^0.7.10 | Loads Protocol Buffer definitions |
| nodemon | ^3.0.1 | Auto-restarts server on file changes (dev only) |

## ▶️ Running the Application

### Terminal 1: Start the Server

```bash
npm start
```

Or alternatively:

```bash
node server.js
```

**Expected output:**
```
✅ gRPC Server running at 0.0.0.0:50051
```

The server will continue running and listening for client requests.

### Terminal 2: Run the Client (in a separate terminal)

```bash
npm run client
```

Or alternatively:

```bash
node client.js
```

The client will execute all test cases and display results with formatted JSON output.

## 📡 Available RPC Methods

### 1. GetUser

Retrieves a single user by their ID.

**Request Message:**
```protobuf
message UserRequest {
  int32 id = 1;
}
```

**Response Message:**
```protobuf
message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  string phone = 4;
}
```

**Example Call:**
```javascript
client.getUser({ id: 1 }, (err, response) => {
  if (err) console.error('Error:', err.message);
  else console.log(response);
});
```

**Success Response:**
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "555-0101"
}
```

**Error Response (User Not Found):**
```
Error Code: 5
Error Message: User with ID 999 not found
```

---

### 2. ListUsers

Retrieves all users from the database.

**Request Message:**
```protobuf
message Empty {
}
```

**Response Message:**
```protobuf
message UserList {
  repeated UserResponse users = 1;
}
```

**Example Call:**
```javascript
client.listUsers({}, (err, response) => {
  if (err) console.error('Error:', err.message);
  else console.log(response.users);
});
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "phone": "555-0101"
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "email": "bob@example.com",
      "phone": "555-0102"
    }
  ]
}
```

---

### 3. CreateUser

Creates a new user and returns it with an auto-generated ID.

**Request Message:**
```protobuf
message CreateUserRequest {
  string name = 1;
  string email = 2;
  string phone = 3;
}
```

**Response Message:**
```protobuf
message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  string phone = 4;
}
```

**Example Call:**
```javascript
client.createUser(
  {
    name: 'Name6',
    email: 'name6@example.com',
    phone: '6789012345'
  },
  (err, response) => {
    if (err) console.error('Error:', err.message);
    else console.log(response);
  }
);
```

**Response:**
```json
{
  "id": 6,
  "name": "Name6",
  "email": "name6@example.com",
  "phone": "6789012345"
}
```

---

### 4. StreamUsers (Server-side Streaming)

Streams all users from the server to the client in separate chunks. Each user is sent as a individual message, allowing efficient handling of large datasets without loading everything in memory at once.

**Request Message:**
```protobuf
message Empty {
}
```

**Response Messages (Stream):**
```protobuf
stream UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  string phone = 4;
}
```

**Example Call:**
```javascript
const stream = client.streamUsers({});

stream.on('data', (user) => {
  console.log('Received user:', user);
});

stream.on('end', () => {
  console.log('Stream completed');
});

stream.on('error', (err) => {
  console.error('Stream error:', err.message);
});
```

**Response (Multiple Messages in Stream):**
```
Chunk 1: { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101" }
Chunk 2: { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102" }
Chunk 3: { id: 3, name: "Charlie Brown", email: "charlie@example.com", phone: "555-0103" }
...and so on
```

**Stream Events:**
- `'data'` - Fired when a new chunk (user) is received
- `'end'` - Fired when the stream is complete
- `'error'` - Fired if an error occurs during streaming

## 💾 Mock Data

The server comes pre-loaded with 5 users in the mock database:

| ID | Name | Email | Phone |
|----|------|-------|-------|
| 1 | Name1 | name1@example.com | 1234567890 |
| 2 | Name2 | name2@example.com | 2345678901 |
| 3 | Name3 | name3@example.com | 3456789012 |
| 4 | Name4 | name4@example.com | 4567890123 |
| 5 | Name5 | name5@example.com | 5678901234 |

### Adding New Users

New users can be created via the `CreateUser` RPC. Each new user receives an auto-incrementing ID starting from 6.

**Important**: Mock data is stored in memory. All newly created users will be lost when the server is restarted.

## 📝 Example Usage

### Using the Client Test Suite

Run the provided client to see all RPC methods in action:

```bash
npm run client
```

This will:
1. Call `GetUser` with ID 1 → Returns Alice Johnson
2. Call `ListUsers` → Returns all users at once
3. Call `CreateUser` → Creates Frank Castle (auto-generated ID)
4. Call `ListUsers` again → Shows updated user list
5. Call `GetUser` with ID 999 → Demonstrates error handling (NOT_FOUND)
6. Call `StreamUsers` → Streams each user in separate chunks

### Custom Client Example

Create a custom client (`my-client.js`):

```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const packageDefinition = protoLoader.loadSync(
  path.join(__dirname, 'user.proto'),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);

const userProto = grpc.loadPackageDefinition(packageDefinition).user;
const client = new userProto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Get user by ID
client.getUser({ id: 2 }, (err, response) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('User:', response);
  }
});
```

Run it:
```bash
node my-client.js
```

## 🔧 Protocol Buffer Definition

The service is defined in `user.proto`:

```protobuf
syntax = "proto3";
package user;

service UserService {
  rpc GetUser(UserRequest) returns (UserResponse);
  rpc ListUsers(Empty) returns (UserList);
  rpc CreateUser(CreateUserRequest) returns (UserResponse);
  rpc StreamUsers(Empty) returns (stream UserResponse);
}

message UserRequest {
  int32 id = 1;
}

message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  string phone = 4;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
  string phone = 3;
}

message UserList {
  repeated UserResponse users = 1;
}

message Empty {
}
```

**Key Points:**
- **Syntax**: proto3 (latest Protocol Buffer syntax)
- **Package**: `user` (namespace for generated code)
- **Service**: `UserService` with 4 RPC methods
- **Message Types**: Strongly typed request/response messages
- **Streaming**: The `stream` keyword indicates server-side streaming
  - Single request followed by multiple response messages
  - Efficient for large datasets

## ❌ Error Handling

The application implements proper gRPC error handling using standard gRPC status codes:

| Code | Name | When Used |
|------|------|-----------|
| 5 | NOT_FOUND | User ID doesn't exist |
| 3 | INVALID_ARGUMENT | Invalid request parameters |
| 13 | INTERNAL | Unexpected server error |

**Example Error Response:**
```
Error Code: 5
Error Message: 5 NOT_FOUND: User with ID 999 not found
```

## 🔨 Development

### Auto-Restart on File Changes

For development, use `nodemon` to automatically restart the server on file changes:

```bash
npm run dev
```

This requires `nodemon` to be installed (included in devDependencies).

### Modifying the Service

To add new RPC methods:

1. Update `user.proto` with new message types and RPC definitions
2. Implement the handler function in `server.js`
3. Add the handler to the service in `server.addService()`
4. Update the client to test the new method

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::50051`

**Solution**: 
- Kill the existing process on port 50051
- Or change the PORT in `server.js` to a different port (e.g., 50052)

### Connection Refused

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:50051`

**Solution**:
- Ensure the server is running in another terminal
- Check that the server address matches in client.js

### Cannot Find Module

**Error**: `Error: Cannot find module '@grpc/grpc-js'`

**Solution**:
```bash
npm install
```

### Deprecation Warnings

Modern versions of @grpc/grpc-js don't require calling `server.start()`. This has been removed from the code.

## 🔍 Technical Details

### gRPC Communication Types

This project demonstrates two types of gRPC communication:

#### 1. **Unary RPC** (Request-Response)
- **Flow**: Client sends ONE request → Server sends ONE response
- **Methods**: `GetUser`, `ListUsers`, `CreateUser`
- **Use Case**: Simple request-response operations
- **Example**: 
  ```javascript
  client.getUser({ id: 1 }, (err, response) => {
    console.log(response); // Single response received
  });
  ```

#### 2. **Server-side Streaming RPC**
- **Flow**: Client sends ONE request → Server sends MULTIPLE responses (stream)
- **Methods**: `StreamUsers`
- **Use Case**: Sending large datasets in chunks
- **Example**: 
  ```javascript
  const stream = client.streamUsers({});
  stream.on('data', (user) => {
    console.log(user); // Multiple responses received one by one
  });
  ```

### How gRPC Works

1. **Protocol Buffers** (`.proto`): Define message schemas and service interfaces
2. **Proto Loader**: Converts `.proto` files into JavaScript objects at runtime
3. **Server**: Implements the RPC methods and listens on a port
4. **Client**: Makes RPC calls to the server
5. **Bidirectional Communication**: Uses HTTP/2 under the hood for efficient streaming

### Server Lifecycle

```
1. Load proto file using proto-loader
2. Create gRPC server instance
3. Bind to port 50051 with insecure credentials
4. Add UserService implementation with 4 methods
5. Server starts listening for client requests
6. On SIGTERM: Gracefully shutdown and close connections
```

### Client Lifecycle

```
1. Load proto file using proto-loader
2. Create client stub connected to server:50051
3. Make RPC calls (async, callback-based or streaming)
4. Server processes and returns response(s)
5. Client callback/stream handler processes response(s)
6. Exit after all callbacks/streams complete
```

### Streaming vs Non-Streaming

| Aspect | Unary RPC | Server-side Streaming |
|--------|-----------|----------------------|
| Request | Single | Single |
| Response | Single | Multiple (stream) |
| Memory Usage | All data at once | Data in chunks |
| Best For | Small datasets | Large datasets |
| Callback Type | Single callback | Stream event handlers |
| Example | `GetUser`, `ListUsers` | `StreamUsers` |

### Performance Advantages of Streaming

- **Memory Efficient**: Process data as it arrives instead of loading all at once
- **Real-time Updates**: Send/receive data without waiting for entire response
- **Large Files**: Download files in chunks without memory overhead
- **Bandwidth Optimization**: Send only what's needed when it's needed

## 📚 Learning Resources

- [gRPC Official Documentation](https://grpc.io/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [@grpc/grpc-js Documentation](https://grpc.io/docs/languages/node/)
- [Node.js gRPC Examples](https://github.com/grpc/grpc/tree/master/examples)

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork, modify, and extend this project for your own use cases.

## 🚀 Future Enhancements

Possible improvements and extensions to this project:

1. **Client-side Streaming**: Client sends multiple messages, server responds once
   ```javascript
   const stream = client.uploadUsers();
   stream.write(user1);
   stream.write(user2);
   stream.end((err, response) => { /* handle response */ });
   ```

2. **Bidirectional Streaming**: Both client and server send multiple messages
   ```javascript
   const stream = client.chatWithServer();
   stream.on('data', (msg) => { /* handle server message */ });
   stream.write(myMessage);
   ```

3. **Authentication**: Add SSL/TLS for secure communication
   ```javascript
   const credentials = grpc.credentials.createSsl(
     fs.readFileSync('ca.crt'),
     fs.readFileSync('client.key'),
     fs.readFileSync('client.crt')
   );
   const client = new userProto.UserService('localhost:50051', credentials);
   ```

4. **Database Integration**: Replace in-memory mock data with real database
   - MongoDB, PostgreSQL, MySQL, etc.

5. **Error Recovery**: Implement retry logic and exponential backoff

6. **Metadata**: Add request/response metadata for tracking and debugging

7. **Interceptors**: Add logging, authentication, and request validation middleware

8. **Load Balancing**: Scale to multiple server instances

9. **Health Checks**: Implement gRPC health check protocol

10. **Metrics**: Add Prometheus metrics for monitoring

---