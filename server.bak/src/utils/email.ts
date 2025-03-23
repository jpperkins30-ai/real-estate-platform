import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const emailStyles = `
  .email-container {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
  }
  .header {
    background-color: #2c3e50;
    color: white;
    padding: 20px;
    text-align: center;
    border-radius: 5px 5px 0 0;
  }
  .content {
    background-color: white;
    padding: 20px;
    border-radius: 0 0 5px 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  .button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #3498db;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    margin: 20px 0;
  }
  .footer {
    text-align: center;
    margin-top: 20px;
    color: #666;
    font-size: 12px;
  }
`;

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  resetUrl: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@realestate.com',
    to,
    subject: 'Password Reset Request - Real Estate Platform',
    html: `
      <div class="email-container">
        <style>${emailStyles}</style>
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password for your Real Estate Platform account. To proceed with the password reset, click the button below:</p>
          
          <a href="${resetUrl}?token=${resetToken}" class="button">Reset Password</a>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in 1 hour</li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>For security, please create a strong password with at least:</li>
            <ul>
              <li>6 characters</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </ul>
          
          <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; font-size: 12px; color: #666;">
            ${resetUrl}?token=${resetToken}
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Real Estate Platform. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendWelcomeEmail = async (
  to: string,
  name: string
): Promise<void> => {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@realestate.com',
    to,
    subject: 'Welcome to Real Estate Platform!',
    html: `
      <div class="email-container">
        <style>${emailStyles}</style>
        <div class="header">
          <h1>Welcome to Real Estate Platform!</h1>
        </div>
        <div class="content">
          <p>Hello${name ? ` ${name}` : ''},</p>
          <p>Thank you for joining Real Estate Platform! We're excited to have you on board.</p>
          
          <h2>Getting Started</h2>
          <ul>
            <li>Complete your profile</li>
            <li>Browse available properties</li>
            <li>Save your favorite listings</li>
            <li>Set up property alerts</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">
            Visit Your Dashboard
          </a>
          
          <p>If you have any questions or need assistance, our support team is here to help!</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Real Estate Platform. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}; 