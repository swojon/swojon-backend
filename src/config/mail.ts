import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME } from ".";

export const mailConfig = {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth : {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
    }
} 