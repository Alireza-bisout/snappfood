namespace NodeJS {
    interface ProcessEnv {
        // Application
        PORT: string;
        // Database 
        DB_PORT: string;
        DB_HOST: string;
        DB_USERNAME: string;
        DB_PASSWORD: string;
        DB_NAME: string;
        // s3
        S3_ENDPOINT: string;
        S3_ACCESS_KEY: string;
        S3_SECRET_KEY: string;
        S3_BUCKET_NAME: string;
        // SMS Provider
        SEND_SMS_URL: string;

        ACCESS_TOKEN_SECRET: string
        REFRESH_TOKEN_SECRET: string
    }
}