import express from 'express';
import AppDataSource from './config/data-source.js'; // Your TypeORM config
import authRoutes from './routes/auth.routes.js';   // We'll create this

const app = express();
app.use(express.json()); // Essential for reading JSON from requests

// Routes
// app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
// Initialize DB then Start Server
AppDataSource.initialize()
    .then(() => {
        console.log(" Database Connected");
        app.listen(3000, () => {
            console.log(' Server is running on port 3000');
        });
    })
    .catch((error) => console.log(" DB Connection Error: ", error));