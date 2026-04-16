import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todos.js';

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todoflow';

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'TodoFlow API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });
