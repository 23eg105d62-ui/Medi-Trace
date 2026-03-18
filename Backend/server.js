import exp from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connect } from 'mongoose';
import { config } from 'dotenv';
import cors from 'cors';
import pharmacyRoutes from './api/pharmacyApi.js';
import reportRoutes from './api/reportApi.js';
import { authRoutes } from './api/authApi.js';

config();

const app = exp();
const httpServer = createServer(app);         

export const io = new Server(httpServer, {   
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

app.use(exp.json());
app.use(cors({ origin: 'http://localhost:5173' }));

app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/auth', authRoutes);


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('join-area', (areaKey) => {
        socket.join(areaKey);
        console.log(`${socket.id} joined area: ${areaKey}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const connectDB = async () => {
    try {
        await connect(process.env.DB_URL);
        console.log('DB connection success');
        httpServer.listen(process.env.PORT, () =>   
            console.log(`Server started on port ${process.env.PORT}`)
        );
    } catch (err) {
        console.log('Err in DB connection', err);
    }
};

connectDB();

app.use((req, res, next) => {
    res.json({ message: `${req.url} Invalid path` });
});

app.use((err, req, res, next) => {
    console.log('err:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
});