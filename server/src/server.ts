import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { connectDB } from './config/db';
import routes from './routes';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 