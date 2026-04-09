import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './models/index.js';
import usersRouter from './routes/users.js';
import sessionsRouter from './routes/sessions.js';
import { handleError } from './middleware/error.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', usersRouter);
app.use('/sessions', sessionsRouter);

app.use(handleError);

async function startServer() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
