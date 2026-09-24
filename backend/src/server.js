const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { initializeSocket } = require("./socket");
const db = require("./db/knex");
const {
  creditPendingDailyProfitsForAllUsers,
  settleMaturedPrincipalsForAllUsers,
} = require("./services/investmentProfitService");
const { isSmtpConfigured, verifySmtpConnection } = require("./services/emailService");

const server = http.createServer(app);
initializeSocket(server);

let autoProfitTimer = null;
async function runAutoProfitCycle() {
  try {
    const profitResult = await creditPendingDailyProfitsForAllUsers(db);
    const settleResult = await settleMaturedPrincipalsForAllUsers(db);
    // eslint-disable-next-line no-console
    console.log(
      `Auto profit cycle (${profitResult.profitDayMode || "calendar"}): users=${profitResult.usersProcessed}, credited=$${Number(profitResult.credited || 0).toFixed(2)}, entries=${profitResult.entries || 0}, still_behind=${profitResult.usersStillBehind || 0} user(s) / ${profitResult.investmentsStillBehind || 0} investment(s), matured=${settleResult.settledCount || 0}`,
    );
    if (Number(profitResult.usersStillBehind || 0) > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `Auto profit cycle: ${profitResult.usersStillBehind} user(s) still missing profit — will retry next cycle.`,
      );
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Auto profit cycle failed:", error.message);
  }
}

server.listen(env.port, async () => {
  // eslint-disable-next-line no-console
  console.log(`HorizonInvest backend running on port ${env.port}`);
  // eslint-disable-next-line no-console
  console.log(
    `Auth OTP: signup=${env.skipSignupOtp ? "off" : "on"}, forgot-password=${env.enableForgotPasswordOtp ? "on" : "off"}, smtp=${isSmtpConfigured() ? "configured" : "missing"}`,
  );
  if (env.enableForgotPasswordOtp && isSmtpConfigured()) {
    try {
      await verifySmtpConnection();
      // eslint-disable-next-line no-console
      console.log("SMTP connection verified for password-reset emails.");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("SMTP verification failed:", error?.message || error);
    }
  }
  const intervalMinutes = env.autoProfitIntervalMinutes;
  if (env.autoProfitEnabled) {
    runAutoProfitCycle();
    autoProfitTimer = setInterval(runAutoProfitCycle, intervalMinutes * 60 * 1000);
    // eslint-disable-next-line no-console
    console.log(
      `Auto profit scheduler enabled (every ${intervalMinutes} min, mode=${env.profitDayMode}, utc+${env.profitUtcOffsetHours}, tz=${env.mysqlTimezone}, principal_refund=${env.enablePrincipalRefund ? "on" : "off"})`,
    );
  } else {
    // eslint-disable-next-line no-console
    console.log("Auto profit scheduler is disabled (AUTO_PROFIT_ENABLED=false).");
  }
});

server.on("close", () => {
  if (autoProfitTimer) clearInterval(autoProfitTimer);
});
