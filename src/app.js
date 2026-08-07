import express from 'express';
import cors from 'cors';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import visionistaRoutes from './routes/visionistaRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js'
import reviewerAuthRoutes from './routes/reviewerAuthRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import './models/associateModels.js';

const app = express();

app.use(cors({
    origin: ['https://future-vision-home.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1);

//API routes
app.use('/api/reviewer-auth', reviewerAuthRoutes);
app.use('/api/auth', adminAuthRoutes);
app.use('/api/visionistas', visionistaRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/reviews', reviewRoutes);

export default app;
