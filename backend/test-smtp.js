const nodemailer = require("nodemailer");
const env = require("./src/config/env");

async function testSMTP() {
  const { host, port, secure, user, pass, fromEmail, fromName } = env.smtp;

  console.log("Testing SMTP Configuration:");
  console.log(`- Host: ${host || "(not set)"}`);
  console.log(`- Port: ${port}`);
  console.log(`- Secure: ${secure}`);
  console.log(`- User: ${user || "(not set)"}`);
  console.log(`- From: ${fromName} <${fromEmail || user || "(not set)"}>`);

  if (!host || !user || !pass) {
    console.error("\n[Error] SMTP credentials missing in .env (SMTP_HOST, SMTP_USER, SMTP_PASS).");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15000,
  });

  try {
    console.log("\nVerifying SMTP connection to server...");
    await transporter.verify();
    console.log("SUCCESS: SMTP server connection and credentials verified!");

    const testRecipient = process.argv[2] || user;
    console.log(`Sending test email to: ${testRecipient}...`);

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail || user}>`,
      to: testRecipient,
      subject: "FairInvest - SMTP Verification Test",
      text: "This is a test email verifying that your FairInvest cPanel SMTP is working correctly.",
      html: "<h3>FairInvest SMTP Test</h3><p>Your cPanel SMTP settings are configured and sending emails successfully!</p>",
    });

    console.log(`SUCCESS: Test email sent! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("\nSMTP Error:", error.message || error);
  }
}

testSMTP();
