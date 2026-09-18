import dotenv from 'dotenv';
dotenv.config();

import { sendEmailReminder } from './src/services/notificationService';

async function testEmail() {
  console.log('Sending test email via EmailJS...');
  const success = await sendEmailReminder(
    'nayanajithrajapaksha75@gmail.com',
    'CareMate EmailJS Test',
    '<h2>It worked!</h2><p>This email was sent from your CareMate backend using EmailJS instead of Nodemailer.</p>'
  );
  
  if (success) {
    console.log('Test passed!');
  } else {
    console.log('Test failed.');
  }
}

testEmail();
