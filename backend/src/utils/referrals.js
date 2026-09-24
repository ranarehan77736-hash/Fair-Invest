const { randomUUID } = require("crypto");

function generateReferralCode(name = "USER") {
  const sanitized = name.replace(/[^a-zA-Z]/g, "").slice(0, 4).toUpperCase() || "USER";
  const suffix = randomUUID().slice(0, 6).toUpperCase();
  return `${sanitized}-${suffix}`;
}

function generateReferralLinkToken() {
  return `ref-${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

module.exports = { generateReferralCode, generateReferralLinkToken };
