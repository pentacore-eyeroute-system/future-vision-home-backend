import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

const app = express();

// Disables the X-Powered-By header
app.disable('x-powered-by');

// Hides Server Header
app.use((req, res, next) => {
    res.removeHeader('Server');
    next();
});

// Fixes Anti-clickjacking, X-Content-Type-Options, and other systemic alerts
app.use(helmet());

app.use(cors({
    origin: ['https://future-vision-home.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Custom Security Header Overrides
app.use(
    helmet.hsts({
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    }),
    helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"], // unsafe-inline may be needed for some frontends, but 'self' is safer
      "style-src": ["'self'", "fonts.googleapis.com"],
      "img-src": ["'self'", "data:"],
    },
  })
);
app.set('trust proxy', 1);

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
