import http from 'node:http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import { createSocketServer } from './socket.js';
import { ensureSystemAdmin, ensureUsernames } from './utils/adminAccount.js';

dotenv.config();

const port = Number(process.env.PORT) || 3002;
const server = http.createServer(app);
const io = createSocketServer(server);
app.set('io', io);

function handleServerError(error) {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${port} is already in use. Stop the other server process or change PORT in backend/.env.`
    );
    process.exit(1);
  }

  console.error('Server failed to start:', error.message);
  process.exit(1);
}

async function startServer() {
  try {
    await connectDatabase();
    await ensureUsernames();
    await ensureSystemAdmin();

    server.on('error', handleServerError);
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
