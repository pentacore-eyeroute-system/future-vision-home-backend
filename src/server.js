import app from './app.js';
import config from './config/env.js';
import { startDbConnection } from './config/db.js';

const PORT = config.port;

startDbConnection();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);  
});