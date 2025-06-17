import nodemailer from 'nodemailer';

interface EmailError extends Error {
    code?: string;
}

export const sendEmail = async (email: string, subject: string, message: string) => {
    try {
        if (!process.env.EMAIL_SENDER || !process.env.EMAIL_PASSWORD) {
            console.error('Email configuration missing');
            return "Email configuration error: Missing sender email or password";
        }

        // Create a transporter with more reliable settings
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify the transporter configuration
        await transporter.verify();
        
        const mailOptions = {
            from: {
                name: 'Seat Reservation System',
                address: process.env.EMAIL_SENDER
            },
            to: email,
            subject: subject,
            text: message,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
                        ${message}
                    </div>
                    <p style="color: #6c757d; font-size: 12px; margin-top: 20px;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            `,
            headers: {
                'X-Mailer': 'Seat Reservation System',
                'X-Priority': '1',
                'Importance': 'high'
            }
        };

        console.log('Attempting to send email to:', email);
        const mailRes = await transporter.sendMail(mailOptions);
        console.log('Email sending response:', mailRes);
        
        if (mailRes.accepted && mailRes.accepted.length > 0) {
            console.log('Email accepted by server:', mailRes.accepted);
            return "Email sent successfully";
        } else if (mailRes.rejected && mailRes.rejected.length > 0) {
            console.error('Email rejected by server:', mailRes.rejected);
            return "Email was rejected by the server. Please try again.";
        } else {
            console.error('Unknown email sending status:', mailRes);
            return "Email server error: Unknown status";
        }
    } catch (error) {
        console.error('Email sending error:', error);
        
        // Handle specific error cases
        const emailError = error as EmailError;
        if (emailError.code === 'EAUTH') {
            return "Email authentication failed. Please check sender credentials.";
        } else if (emailError.code === 'ECONNECTION') {
            return "Could not connect to email server. Please try again later.";
        } else if (emailError.code === 'ETIMEDOUT') {
            return "Email server connection timed out. Please try again later.";
        }
        
        return "Email server error: " + (error instanceof Error ? error.message : String(error));
    }
}