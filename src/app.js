import express from 'express';
import cors from 'cors';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import visionistaRoutes from './routes/visionistaRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js'
import reviewerAuthRoutes from './routes/reviewerAuthRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import userManagementRoutes from './routes/userManagementRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import './models/associateModels.js';
import { noCache } from './middleware/noCache.js';

const app = express();

// Tells Express to trust Nginx
app.set('trust proxy', 1);

// Disables the X-Powered-By header
app.disable('x-powered-by');

// Hides Server Header
app.use((req, res, next) => {
    res.removeHeader('Server');
    next();
});

app.use(cors({
    origin: ['https://future-vision-home.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

// Request body limits (Handles 413 status code error)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Insert header in all routes
app.use('/api', noCache);

//API routes
app.use('/api/reviewer-auth', reviewerAuthRoutes);
app.use('/api/auth', adminAuthRoutes);
app.use('/api/visionistas', visionistaRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/user-management', userManagementRoutes);
app.use('/api/audit-logs', auditLogRoutes);

export default app;
