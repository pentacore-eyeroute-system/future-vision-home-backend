import pkg from 'sequelize';
const { Sequelize } = pkg;
import config from './env.js';

export const sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    {
        dialect: 'mysql',
        host: config.db.host,
        port: Number(config.db.port),
        logging: false
    }
);

export async function startDbConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful');
        await sequelize.sync();
    } catch (err) {
        process.exit(1);
    }
}