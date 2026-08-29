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

// Create a client
const client = new userProto.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Helper function to display results
function printResult(title, data) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`${title}`);
  console.log('='.repeat(50));
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  try {
    // Test GetUser
    console.log('\n📝 Testing GetUser RPC...');
    client.getUser({ id: 1 }, (err, response) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        printResult('GetUser Response (ID: 1)', response);
      }
    });

    // Test ListUsers
    console.log('\n📝 Testing ListUsers RPC...');
    client.listUsers({}, (err, response) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        printResult('ListUsers Response', response);
      }
    });

    // Test CreateUser
    console.log('\n📝 Testing CreateUser RPC...');
    client.createUser(
      {
        name: 'name6',
        email: 'name6@example.com',
        phone: '6789012345'
      },
      (err, response) => {
        if (err) {
          console.error('Error:', err.message);
        } else {
          printResult('CreateUser Response', response);
          
          // After creating a user, list all users again
          console.log('\n📝 Listing all users after creation...');
          setTimeout(() => {
            client.listUsers({}, (err, response) => {
              if (err) {
                console.error('Error:', err.message);
              } else {
                printResult('Updated UserList', response);
              }
            });
          }, 500);
        }
      }
    );

    // Test GetUser with invalid ID
    console.log('\n📝 Testing GetUser with invalid ID...');
    setTimeout(() => {
      client.getUser({ id: 999 }, (err, response) => {
        if (err) {
          console.log(`\n${'='.repeat(50)}`);
          console.log('GetUser (ID: 999) - Error Response');
          console.log('='.repeat(50));
          console.log(`Error Code: ${err.code}`);
          console.log(`Error Message: ${err.message}`);
        } else {
          printResult('GetUser Response (ID: 999)', response);
        }
      });
    }, 1000);

    // Test StreamUsers (Server-side streaming)
    console.log('\n📝 Testing StreamUsers RPC (Server-side Streaming)...');
    setTimeout(() => {
      console.log(`\n${'='.repeat(50)}`);
      console.log('StreamUsers Response (Streaming in Chunks)');
      console.log('='.repeat(50));
      
      const stream = client.streamUsers({});
      let chunkCount = 0;

      stream.on('data', (user) => {
        chunkCount++;
        console.log(`\nChunk ${chunkCount}:`);
        console.log(JSON.stringify(user, null, 2));
      });

      stream.on('end', () => {
        console.log(`\n✅ Stream ended - Received ${chunkCount} user(s) in ${chunkCount} chunk(s)`);
      });

      stream.on('error', (err) => {
        console.error('Stream error:', err.message);
      });
    }, 1500);

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Wait a bit for server to be ready
setTimeout(() => {
  main();
}, 1000);

// Keep the client alive for a bit to see all responses
setTimeout(() => {
  console.log('\n✅ All tests completed!');
  process.exit(0);
}, 4000);
