import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import visionistaRoutes from './routes/visionistaRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js'

const app = express();

app.use(cors());
app.use(express.json());

//API routes
app.use('/api/auth', authRoutes);
app.use('/api/visionistas', visionistaRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);

export default app;
