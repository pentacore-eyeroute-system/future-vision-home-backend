import dotenv from 'dotenv';

dotenv.config();

export default {
    port : process.env.PORT,
    db : {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,        
    },
    adminSecretKey : process.env.ADMIN_SECRET_KEY,
    s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        s3BucketRegion: process.env.S3_BUCKET_REGION,
        s3BucketName: process.env.S3_BUCKET_NAME,
    },
}