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
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1);

//API routes
app.use('/fvh/api/reviewer-auth', reviewerAuthRoutes);
app.use('/fvh/api/auth', adminAuthRoutes);
app.use('/fvh/api/visionistas', visionistaRoutes);
app.use('/fvh/api/partners', partnerRoutes);
app.use('/fvh/api/news', newsRoutes);
app.use('/fvh/api/gallery', galleryRoutes);
app.use('/api/reviews', reviewRoutes);

export default app;
