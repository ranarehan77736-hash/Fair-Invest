const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");

const db = require("../../db/knex");
const { requireAuth } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");

const router = express.Router();

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(6).optional(),
  country: z.string().optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(120).optional(),
  postalCode: z.string().max(40).optional(),
  nationalId: z.string().max(64).optional(),
  dateOfBirth: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const twoFactorSchema = z.object({
  enabled: z.boolean(),
});

const verifyTwoFactorSchema = z.object({
  code: z.string().min(4),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  investmentUpdates: z.boolean(),
  referralActivity: z.boolean(),
});

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [user, wallet, settings, referralCode] = await Promise.all([
      db("users").where({ id: req.user.id }).first(),
      db("wallets").where({ user_id: req.user.id }).first(),
      db("settings").where({ user_id: req.user.id }).first(),
      db("referral_codes").where({ user_id: req.user.id }).first(),
    ]);

    if (!user) throw new ApiError(404, "User not found");

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        address: user.address || "",
        city: user.city || "",
        postalCode: user.postal_code || "",
        nationalId: user.national_id || "",
        dateOfBirth: user.date_of_birth || null,
        isTwoFactorEnabled: !!user.is_two_factor_enabled,
        balance: Number(wallet?.balance || 0),
        lockedBalance: Number(wallet?.locked_balance || 0),
        referralCode: referralCode?.code || null,
        settings: settings
          ? {
              emailNotifications: !!settings.email_notifications,
              smsNotifications: !!settings.sms_notifications,
              investmentUpdates: !!settings.investment_updates,
              referralActivity: !!settings.referral_activity,
            }
          : null,
      },
    });
  }),
);

router.patch(
  "/me",
  requireAuth,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    await db("users")
      .where({ id: req.user.id })
      .update({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        country: req.body.country || "Pakistan",
        address: req.body.address || null,
        city: req.body.city || null,
        postal_code: req.body.postalCode || null,
        national_id: req.body.nationalId || null,
        date_of_birth: req.body.dateOfBirth || null,
        updated_at: db.fn.now(),
      });
    res.json({ success: true, message: "Profile updated" });
  }),
);

router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const user = await db("users").where({ id: req.user.id }).first();
    const match = await bcrypt.compare(req.body.currentPassword, user.password_hash);
    if (!match) throw new ApiError(400, "Current password is incorrect");
    const passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    await db("users").where({ id: req.user.id }).update({ password_hash: passwordHash, updated_at: db.fn.now() });
    res.json({ success: true, message: "Password changed" });
  }),
);

router.patch(
  "/two-factor",
  requireAuth,
  validate(twoFactorSchema),
  asyncHandler(async (req, res) => {
    await db("users")
      .where({ id: req.user.id })
      .update({ is_two_factor_enabled: req.body.enabled, updated_at: db.fn.now() });

    const existing = await db("two_factor").where({ user_id: req.user.id }).first();
    if (existing) {
      await db("two_factor").where({ user_id: req.user.id }).update({ is_verified: req.body.enabled, updated_at: db.fn.now() });
    } else {
      await db("two_factor").insert({ user_id: req.user.id, is_verified: req.body.enabled });
    }
    res.json({ success: true, message: "2FA status updated" });
  }),
);

router.post(
  "/two-factor/verify",
  requireAuth,
  validate(verifyTwoFactorSchema),
  asyncHandler(async (req, res) => {
    const row = await db("two_factor").where({ user_id: req.user.id }).first();
    if (!row || !row.is_verified) throw new ApiError(400, "2FA is not enabled for this account");
    // Placeholder local verification until authenticator app integration.
    if (req.body.code !== "123456" && req.body.code !== row.backup_code) {
      throw new ApiError(400, "Invalid 2FA code");
    }
    res.json({ success: true, message: "2FA verification successful" });
  }),
);

router.patch(
  "/notifications",
  requireAuth,
  validate(notificationSchema),
  asyncHandler(async (req, res) => {
    const payload = {
      email_notifications: req.body.emailNotifications,
      sms_notifications: req.body.smsNotifications,
      investment_updates: req.body.investmentUpdates,
      referral_activity: req.body.referralActivity,
      updated_at: db.fn.now(),
    };
    const current = await db("settings").where({ user_id: req.user.id }).first();
    if (current) {
      await db("settings").where({ user_id: req.user.id }).update(payload);
    } else {
      await db("settings").insert({ user_id: req.user.id, ...payload });
    }
    res.json({ success: true, message: "Notification settings updated" });
  }),
);

module.exports = router;
