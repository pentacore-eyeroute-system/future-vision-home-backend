import { Sequelize } from 'sequelize';
import config from './env.js';

const MYSQL_HOST = config.db.host;
const MYSQL_PORT = config.db.port;
const MYSQL_USER = config.db.user;
const MYSQL_PASSWORD = config.db.password;
const MYSQL_DATABASE = config.db.database;

export const sequelize = new Sequelize(
    MYSQL_DATABASE,
    MYSQL_USER,
    MYSQL_PASSWORD,    
    {
        dialect : 'mysql',
        host    : MYSQL_HOST,
        port    : MYSQL_PORT,
    }
);

export async function startDbConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful');

        await sequelize.sync();
    } catch (err) {
        console.log(`Database connection error: ${err}`);
        process.exit(1);
    }
};