export class EmailTemplate {
    accountRequestResult(result) {
        const isApproved = result === 'approved';

        return {
            subject: 'Future Vision Home Account Request Result',

            text: isApproved
                ? `
Hello,

We are pleased to inform you that your Future Vision Home account request has been approved.

Your account has been granted the Editor role.

You may now log in using the credentials you provided during your account request.

Thank you for your interest in joining Future Vision Home.

Best regards,

Future Vision Home
            `
                : `
Hello,

Thank you for your interest in joining Future Vision Home.

After reviewing your account request, we regret to inform you that your request has been rejected.

If you believe this decision was made in error or would like further information, please contact the Future Vision Home administration.

Best regards,

Future Vision Home
            `
        };
    }
}