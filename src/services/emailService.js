import nodemailer from 'nodemailer';
import config from '../config/env.js'
import { EmailTemplate } from '../templates/emailTemplate.js';

const emailTemplate = new EmailTemplate();

const AWS_REGION = config.s3.s3BucketRegion;
const SES_FROM_EMAIL = config.ses.sesFromEmail;
const SES_SMTP_USER_NAME = config.ses.smtpUserName;
const SES_SMTP_PASSWORD = config.ses.smtpPassword;

const transporter = nodemailer.createTransport({
    host: `email-smtp.${AWS_REGION}.amazonaws.com`,
    port: 587,
    secure: false,
    auth: {
        user: SES_SMTP_USER_NAME,
        pass: SES_SMTP_PASSWORD
    }
});

export class EmailService {
    async sendAccountRequestResult(recipientEmail, result) {
        const { subject, text } = emailTemplate.accountRequestResult(result);

        const email = {
            from: `Future Vision Home <${SES_FROM_EMAIL}>`,
            to: recipientEmail,
            subject: subject,
            text: text
        }

        await transporter.sendMail(email);
    };

    async sendRoleUpdate(recipientEmail, role) {
        const { subject, text } = emailTemplate.roleUpdate(role);

        const email = {
            from: `Future Vision Home <${SES_FROM_EMAIL}>`,
            to: recipientEmail,
            subject: subject,
            text: text
        }

        await transporter.sendMail(email);
    };

    async sendStatusUpdate(recipientEmail, status) {
        const { subject, text } = emailTemplate.statusUpdate(status);

        const email = {
            from: `Future Vision Home <${SES_FROM_EMAIL}>`,
            to: recipientEmail,
            subject: subject,
            text: text
        }

        await transporter.sendMail(email);
    };
}