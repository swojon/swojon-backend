import { SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USERNAME } from ".";

export const mailConfig = {
    host: SMTP_HOST, 
    port: 465,
    secure: true,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD
    },
    secureProtocol: 'TLSv1_2_method'
  }