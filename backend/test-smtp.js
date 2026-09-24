const nodemailer = require('nodemailer');

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: 'mail.horizoneinvest.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'info@horizoneinvest.com',
      pass: 'l&5+4[GZPWC5Ez]H',
    },
  });

  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('Connection successful!');

    const info = await transporter.sendMail({
      from: '"Horizoneinvest" <info@horizoneinvest.com>',
      to: 'syehassanali@gmail.com, info@devsynx.com',
      subject: 'SMTP Test - Horizoneinvest',
      text: 'This is a test email to verify SMTP settings for Horizoneinvest OTP implementation.',
      html: '<b>This is a test email to verify SMTP settings for Horizoneinvest OTP implementation.</b>',
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('SMTP Error:', error);
  }
}

testSMTP();
