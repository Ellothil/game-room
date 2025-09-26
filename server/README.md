# Game Room Server

A basic Express server with Socket.IO integration for real-time communication.

## Features

- **Express.js** server with REST API endpoints
- **Socket.IO** for real-time bidirectional communication
- **Room-based** messaging system
- **Health check** endpoint
- **CORS** enabled for cross-origin requests

## Installation

```bash
# Install dependencies
pnpm install

# Install additional dependencies if needed
pnpm add cors @types/cors
pnpm add -D typescript @types/node @types/express ts-node
```

## Usage

### Development

```bash
# Start the server in development mode
pnpm dev

# Build the server
pnpm build

# Start the production server
pnpm start
```

The server will start on port 3001 by default, or use the `PORT` environment variable to specify a different port.

### API Endpoints

- `GET /` - Returns server status
- `GET /health` - Health check endpoint

### Socket.IO Events

#### Client → Server

- `join-room(roomId, userId)` - Join a room
- `leave-room(roomId, userId)` - Leave a room
- `chat-message({ roomId, message, userId })` - Send a chat message
- `ping(data)` - Send a ping to the server

#### Server → Client

- `user-joined({ userId, socketId, timestamp })` - When a user joins a room
- `user-left({ userId, socketId, timestamp })` - When a user leaves a room
- `chat-message({ userId, message, timestamp })` - When a chat message is received
- `user-disconnected({ socketId, timestamp })` - When a user disconnects
- `pong({ data, timestamp, server })` - Response to ping
- `room-joined({ roomId, message })` - Confirmation when joining a room

## Testing

1. Start the server:
   ```bash
   pnpm dev
   ```

2. Open the test client in your browser:
   ```bash
   # Navigate to the server directory and open test-client.html
   open server/test-client.html
   ```

3. Or use curl to test the REST endpoints:
   ```bash
   curl http://localhost:3001/
   curl http://localhost:3001/health
   ```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - CORS origin for client connections (default: http://localhost:3000)

## Project Structure

```
server/
├── index.ts          # Main server file
├── tsconfig.json     # TypeScript configuration
├── package.json      # Dependencies and scripts
├── test-client.html  # Simple HTML test client
└── README.md         # This file
```

## Example Usage

### Basic Connection

```javascript
// Client-side JavaScript
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});

// Join a room
socket.emit('join-room', 'room-123', 'user-456');

// Send a message
socket.emit('chat-message', {
  roomId: 'room-123',
  message: 'Hello everyone!',
  userId: 'user-456'
});

// Listen for messages
socket.on('chat-message', (data) => {
  console.log(`${data.userId}: ${data.message}`);
});
```

### Node.js Client

```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  socket.emit('join-room', 'test-room', 'node-client');
});
```

## Troubleshooting

1. **Port already in use**: Change the port using `PORT=3002 pnpm dev`
2. **CORS issues**: Ensure `CLIENT_URL` matches your client origin
3. **TypeScript errors**: Run `pnpm add -D @types/express @types/node`

## Next Steps

- Add authentication middleware
- Implement user presence tracking
- Add database integration
- Create room management endpoints
- Add message history/persistence
