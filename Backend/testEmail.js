
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: 'nayanajithrajapaksha75@gmail.com',
  subject: 'Test Email CareMate (Gmail)',
  text: 'Hello from local test using Gmail App Password!'
}).then(info => {
  console.log('Email sent successfully via Gmail:', info.messageId);
}).catch(err => {
  console.error('Error:', err);
});

