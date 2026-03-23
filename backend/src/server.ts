import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import { setupSockets } from './sockets/socketManager';
import apiRoutes from './routes/api.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const httpServer = createServer(app);

// --- Global Middlewares ---

// 1. Helmet: Injects essential security headers (XSS, Clickjacking prevention).
app.use(helmet());

// 2. CORS: Restricts which domains can talk to this API. 
// We will lock this down to your Next.js frontend URL in production.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Crucial: Allows the frontend to send cookies/auth headers
}));

// 3. Body Parsers: Allows Express to read JSON and URL-encoded payloads.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Cookie Parser: Extracts secure cookies for authentication logic.
app.use(cookieParser());

// --- Socket.IO Initialization ---
// We attach Socket.IO to the raw HTTP server, not the Express app.
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Basic Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'SyncSpace API is running' });
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1', apiRoutes);

setupSockets(io);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});