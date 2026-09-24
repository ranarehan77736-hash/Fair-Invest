const express = require("express");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const db = require("../../db/knex");
const env = require("../../config/env");
const { requireAuth, requireRole } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { adjustWalletBalance, getOrCreateWallet } = require("../../services/walletService");
const { getEnrichedReferralNetwork } = require("../../services/referralNetworkService");
const { creditPendingDailyProfitsForUserIds, creditPendingDailyProfitsForAllUsers, settleMaturedPrincipalsForAllUsers, getProfitBacklogSummary } = require("../../services/investmentProfitService");
const { signAccessToken } = require("../../utils/tokens");

const router = express.Router();
const uploadsRoot = path.join(process.cwd(), "uploads");
const paymentsUploadDir = path.join(uploadsRoot, "payments");
const plansUploadDir = path.join(uploadsRoot, "plans");
for (const targetDir of [uploadsRoot, paymentsUploadDir, plansUploadDir]) {
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, _file, callback) {
      if (req.params.type === "payment") return callback(null, paymentsUploadDir);
      return callback(null, plansUploadDir);
    },
    filename(_req, file, callback) {
      const ext = path.extname(file.originalname || "");
      const safeExt = ext && ext.length <= 8 ? ext.toLowerCase() : ".png";
      callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const moderationSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed", "active"]),
});

const depositStatusSchema = z.object({
  status: z.enum(["pending", "completed", "rejected"]),
});
const withdrawalSettleSchema = z
  .object({
    status: z.enum(["pending", "processing", "completed", "rejected"]),
    approvedAmount: z.number().nonnegative().optional(),
    refundAmount: z.number().nonnegative().optional(),
    reason: z.string().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "completed") {
      if (value.approvedAmount === undefined || value.refundAmount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "approvedAmount and refundAmount are required for completed status",
        });
      }
    }
  });
const walletAdjustSchema = z.object({
  delta: z.number().refine((value) => value !== 0, "Delta must be non-zero"),
  reason: z.string().min(3).max(120).optional(),
});
const updateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(6).max(32).optional(),
  country: z.string().max(64).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(120).optional(),
  postalCode: z.string().max(40).optional(),
  nationalId: z.string().max(64).optional(),
  dateOfBirth: z.string().optional(),
});

const createPlanSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  minAmount: z.number().positive(),
  maxAmount: z.number().positive().nullable().optional(),
  durationDays: z.number().int().positive(),
  dailyReturn: z.number().positive(),
  payoutDailyReturn: z.number().positive().optional(),
  totalReturn: z.number().positive(),
  features: z.array(z.string().min(1)).default([]),
  imagePath: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
});

const updatePlanSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().nullable().optional(),
  durationDays: z.number().int().positive().optional(),
  dailyReturn: z.number().positive().optional(),
  payoutDailyReturn: z.number().positive().optional(),
  totalReturn: z.number().positive().optional(),
  features: z.array(z.string().min(1)).optional(),
  imagePath: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
});

const createSocialLinkSchema = z.object({
  title: z.enum(["whatsapp", "telegram", "facebook", "instagram", "tiktok"]),
  url: z.string().url(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

const updateSocialLinkSchema = z.object({
  title: z.enum(["whatsapp", "telegram", "facebook", "instagram", "tiktok"]).optional(),
  url: z.string().url().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const createPaymentAccountSchema = z.object({
  method: z.enum(["bank_transfer", "easypaisa", "jazzcash", "nayapay", "sadapay", "digit_plus", "crypto"]),
  displayName: z.string().min(2).max(120),
  accountTitle: z.string().min(2).max(120).optional(),
  accountNumber: z.string().min(2).max(120).optional(),
  iban: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  instructions: z.string().max(1000).optional(),
  logoPath: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

const updatePaymentAccountSchema = z.object({
  method: z.enum(["bank_transfer", "easypaisa", "jazzcash", "nayapay", "sadapay", "digit_plus", "crypto"]).optional(),
  displayName: z.string().min(2).max(120).optional(),
  accountTitle: z.string().min(2).max(120).optional(),
  accountNumber: z.string().min(2).max(120).optional(),
  iban: z.string().max(120).optional(),
  phone: z.string().max(40).optional(),
  instructions: z.string().max(1000).optional(),
  logoPath: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isSchemaCompatError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("Unknown column") ||
    message.includes("ER_BAD_FIELD_ERROR") ||
    message.includes("doesn't exist") ||
    message.includes("no such column")
  );
}

function isMethodEnumCompatError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("Incorrect enum value") ||
    message.includes("Data truncated for column 'method'") ||
    message.includes("invalid input value for enum")
  );
}

function isReferenceConstraintError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("ER_ROW_IS_REFERENCED") ||
    message.includes("Cannot delete or update a parent row") ||
    message.includes("foreign key constraint fails") ||
    message.includes("FOREIGN KEY constraint failed")
  );
}

router.use(requireAuth, requireRole("admin"));

router.post(
  "/uploads/:type",
  (req, res, next) => {
    if (!["payment", "plan"].includes(req.params.type)) {
      return res.status(400).json({ success: false, message: "Invalid upload type" });
    }
    return next();
  },
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "File is required" });
    const prefix = req.params.type === "payment" ? "payments" : "plans";
    const relativePath = `/uploads/${prefix}/${req.file.filename}`;
    res.status(201).json({ success: true, data: { path: relativePath } });
  }),
);

router.get(
  "/metrics",
  asyncHandler(async (_req, res) => {
    const [users, activeInvestments, deposits, withdrawals] = await Promise.all([
      db("users").count({ count: "*" }).first(),
      db("investments").where({ status: "active" }).count({ count: "*" }).first(),
      db("deposits").where({ status: "completed" }).sum({ total: "amount" }).first(),
      db("withdrawals").where({ status: "completed" }).sum({ total: "amount" }).first(),
    ]);
    res.json({
      success: true,
      data: {
        totalUsers: Number(users?.count || 0),
        activeInvestments: Number(activeInvestments?.count || 0),
        totalDeposits: Number(deposits?.total || 0),
        totalWithdrawals: Number(withdrawals?.total || 0),
      },
    });
  }),
);

router.post(
  "/run-profit-sync",
  asyncHandler(async (req, res) => {
    const profitResult = await creditPendingDailyProfitsForAllUsers(db);
    const settleResult = await settleMaturedPrincipalsForAllUsers(db);

    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "run_profit_sync",
      target_type: "system",
      target_id: "all_users",
      meta: JSON.stringify({
        usersProcessed: profitResult.usersProcessed,
        failedUsers: profitResult.failedUsers || 0,
        credited: profitResult.credited,
        entries: profitResult.entries,
        matured: settleResult.settledCount || 0,
      }),
    });

    res.json({
      success: true,
      message:
        profitResult.needsCredit > 0
          ? `Profit sync complete. $${Number(profitResult.credited || 0).toFixed(2)} credited across ${profitResult.entries || 0} day(s). ${profitResult.needsCredit} investment(s) were queued. Still behind: ${profitResult.investmentsStillBehind || 0} investment(s) / ${profitResult.usersStillBehind || 0} user(s).`
          : `All caught up. No pending profit days. Active: ${profitResult.activeInvestments || 0} investment(s), ${profitResult.activeUsers || 0} user(s). Still behind: ${profitResult.investmentsStillBehind || 0}.`,
      data: {
        usersProcessed: profitResult.usersProcessed,
        activeUsers: profitResult.activeUsers || 0,
        activeInvestments: profitResult.activeInvestments || 0,
        usersStillBehind: profitResult.usersStillBehind || 0,
        investmentsStillBehind: profitResult.investmentsStillBehind || 0,
        failedUsers: profitResult.failedUsers || 0,
        credited: profitResult.credited,
        entries: profitResult.entries,
        skipped: profitResult.skipped || 0,
        needsCredit: profitResult.needsCredit || 0,
        errors: profitResult.errors || 0,
        skipZeroAmount: profitResult.skipZeroAmount || 0,
        skipZeroProfit: profitResult.skipZeroProfit || 0,
        skipLoopBlocked: profitResult.skipLoopBlocked || 0,
        matured: settleResult.settledCount || 0,
      },
    });
  }),
);

router.get(
  "/users",
  asyncHandler(async (_req, res) => {
    let rows = [];
    try {
      rows = await db("users")
      .leftJoin("roles", "users.role_id", "roles.id")
        .leftJoin("wallets", "users.id", "wallets.user_id")
        .select(
          "users.id",
          "users.name",
          "users.email",
          "users.phone",
          "users.country",
          "users.address",
          "users.city",
          "users.postal_code as postalCode",
          "users.national_id as nationalId",
          "users.date_of_birth as dateOfBirth",
          "users.created_at as createdAt",
          "users.is_blocked as isBlocked",
          "roles.name as role",
          "wallets.balance as walletBalance",
          "wallets.locked_balance as lockedBalance",
        )
      .orderBy("users.created_at", "desc");
    } catch (error) {
      if (!isSchemaCompatError(error)) throw error;
      rows = await db("users")
        .leftJoin("roles", "users.role_id", "roles.id")
        .leftJoin("wallets", "users.id", "wallets.user_id")
        .select(
          "users.id",
          "users.name",
          "users.email",
          "users.phone",
          "users.country",
          "users.created_at as createdAt",
          "users.is_blocked as isBlocked",
          "roles.name as role",
          "wallets.balance as walletBalance",
        )
        .orderBy("users.created_at", "desc");
    }
    res.json({
      success: true,
      data: rows.map((item) => ({
        ...item,
        walletBalance: Number(item.walletBalance || 0),
        lockedBalance: Number(item.lockedBalance || 0),
      })),
    });
  }),
);

router.get(
  "/users/:id/overview",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) throw new ApiError(400, "Invalid user ID");

    let user;
    try {
      user = await db("users")
        .leftJoin("roles", "users.role_id", "roles.id")
        .leftJoin("wallets", "users.id", "wallets.user_id")
        .select(
          "users.id",
          "users.name",
          "users.email",
          "users.phone",
          "users.country",
          "users.address",
          "users.city",
          "users.postal_code as postalCode",
          "users.national_id as nationalId",
          "users.date_of_birth as dateOfBirth",
          "users.created_at as createdAt",
          "users.is_blocked as isBlocked",
          "roles.name as role",
          "wallets.balance as walletBalance",
          "wallets.locked_balance as lockedBalance",
        )
        .where("users.id", userId)
        .first();
    } catch (error) {
      if (!isSchemaCompatError(error)) throw error;
      user = await db("users")
        .leftJoin("roles", "users.role_id", "roles.id")
        .leftJoin("wallets", "users.id", "wallets.user_id")
        .select(
          "users.id",
          "users.name",
          "users.email",
          "users.phone",
          "users.country",
          "users.created_at as createdAt",
          "users.is_blocked as isBlocked",
          "roles.name as role",
          "wallets.balance as walletBalance",
        )
        .where("users.id", userId)
        .first();
    }
    if (!user) throw new ApiError(404, "User not found");

    const [investments, withdrawalsRaw, deposits, transactions, commissions, dailyProfitsRaw] = await Promise.all([
      db("investments")
        .join("investment_plans", "investments.plan_id", "investment_plans.id")
        .select(
          "investments.id",
          "investments.amount",
          "investments.status",
          "investments.start_date as startDate",
          "investments.end_date as endDate",
          "investments.expected_return as expectedReturn",
          "investment_plans.name as planName",
        )
        .where("investments.user_id", userId)
        .orderBy("investments.created_at", "desc"),
      db("withdrawals")
        .select(
          "id",
          "amount",
          "fee",
          "method",
          "status",
          "reference",
          "approved_amount as approvedAmount",
          "refund_amount as refundAmount",
          "admin_reason as adminReason",
          "account_details as accountDetails",
          "created_at as createdAt",
        )
        .where("user_id", userId)
        .orderBy("created_at", "desc")
        .catch(async (error) => {
          if (!isSchemaCompatError(error)) throw error;
          return db("withdrawals")
            .select("id", "amount", "fee", "method", "status", "reference", "account_details as accountDetails", "created_at as createdAt")
            .where("user_id", userId)
            .orderBy("created_at", "desc");
        }),
      db("deposits")
        .select("id", "amount", "method", "status", "reference", "proof_path as proofPath", "created_at as createdAt")
        .where("user_id", userId)
        .orderBy("created_at", "desc"),
      db("transactions")
        .select("id", "type", "amount", "status", "method", "reference", "created_at as createdAt")
        .where("user_id", userId)
        .orderBy("created_at", "desc")
        .limit(500),
      db("commissions")
        .select("id", "amount", "rate_percent as ratePercent", "status", "reference", "created_at as createdAt")
        .where("user_id", userId)
        .orderBy("created_at", "desc"),
      db("investment_daily_profits")
        .select("id", "investment_id as investmentId", "day_index as dayIndex", "amount", "reference", "created_at as createdAt")
        .where("user_id", userId)
        .orderBy("created_at", "desc")
        .catch((error) => {
          if (!isSchemaCompatError(error)) throw error;
          return [];
        }),
    ]);

    const withdrawals = withdrawalsRaw.map((item) => {
      let parsed = {};
      try {
        parsed = item.accountDetails ? JSON.parse(item.accountDetails) : {};
      } catch {
        parsed = {};
      }
      return { ...item, accountDetails: parsed };
    });
    const dailyProfits = dailyProfitsRaw || [];

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          walletBalance: Number(user.walletBalance || 0),
          lockedBalance: Number(user.lockedBalance || 0),
        },
        investments,
        withdrawals,
        deposits,
        transactions,
        commissions,
        dailyProfits,
      },
    });
  }),
);

router.get(
  "/users/:id/referrals",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) throw new ApiError(400, "Invalid user ID");

    const target = await db("users").where({ id: userId }).first();
    if (!target) throw new ApiError(404, "User not found");

    const [referralCode, directRow, totalRow, earningsRow, network] = await Promise.all([
      db("referral_codes").where({ user_id: userId }).first(),
      db("referral_relations").where({ referrer_id: userId, level: 1 }).count({ count: "*" }).first(),
      db("referral_relations").where({ referrer_id: userId }).count({ count: "*" }).first(),
      db("commissions").where({ user_id: userId }).sum({ total: "amount" }).first(),
      getEnrichedReferralNetwork(db, userId),
    ]);

    const direct = Number(directRow?.count || 0);
    const total = Number(totalRow?.count || 0);
    const code = referralCode?.code || null;

    res.json({
      success: true,
      data: {
        referralCode: code,
        referralLink: code ? `${env.clientUrl}/signup?ref=${code}` : null,
        summary: {
          directReferrals: direct,
          indirectReferrals: Math.max(0, total - direct),
          totalReferrals: total,
          totalCommissionEarnings: Number(earningsRow?.total || 0),
        },
        network,
      },
    });
  }),
);

router.post(
  "/users/:id/wallet-adjust",
  validate(walletAdjustSchema),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) throw new ApiError(400, "Invalid user ID");
    const targetUser = await db("users").where({ id: userId }).first();
    if (!targetUser) throw new ApiError(404, "User not found");
    const reference = `ADM-WLT-${Date.now()}`;
    const reason = req.body.reason || "admin_wallet_adjustment";

    const nextBalance = await db.transaction(async (trx) => {
      await getOrCreateWallet(db, userId, trx);
      const updated = await adjustWalletBalance(
        db,
        {
          userId,
          delta: Number(req.body.delta),
          reason,
          reference,
        },
        trx,
      );
      await trx("notifications").insert({
        user_id: userId,
        title: "Wallet updated by admin",
        message: `Your wallet balance was adjusted by ${Number(req.body.delta).toFixed(2)} USD.`,
      });
      await trx("admin_actions").insert({
        admin_id: req.user.id,
        action: "adjust_wallet_balance",
        target_type: "user",
        target_id: String(userId),
        meta: JSON.stringify({ delta: Number(req.body.delta), reason, reference }),
      });
      return updated;
    });

    res.json({ success: true, message: "Wallet balance adjusted", data: { balance: Number(nextBalance) } });
  }),
);

router.patch(
  "/users/:id",
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) throw new ApiError(400, "Invalid user ID");
    const existing = await db("users").where({ id: userId }).first();
    if (!existing) throw new ApiError(404, "User not found");

    if (req.body.email && req.body.email !== existing.email) {
      const emailInUse = await db("users").where({ email: req.body.email }).whereNot({ id: userId }).first();
      if (emailInUse) throw new ApiError(409, "Email already in use");
    }

    const update = {};
    if (req.body.name !== undefined) update.name = req.body.name;
    if (req.body.email !== undefined) update.email = req.body.email;
    if (req.body.phone !== undefined) update.phone = req.body.phone || null;
    if (req.body.country !== undefined) update.country = req.body.country || null;
    if (req.body.address !== undefined) update.address = req.body.address || null;
    if (req.body.city !== undefined) update.city = req.body.city || null;
    if (req.body.postalCode !== undefined) update.postal_code = req.body.postalCode || null;
    if (req.body.nationalId !== undefined) update.national_id = req.body.nationalId || null;
    if (req.body.dateOfBirth !== undefined) update.date_of_birth = req.body.dateOfBirth || null;
    update.updated_at = db.fn.now();

    await db("users").where({ id: userId }).update(update);
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "update_user_profile",
      target_type: "user",
      target_id: String(userId),
      meta: JSON.stringify(update),
    });

    res.json({ success: true, message: "User profile updated" });
  }),
);

router.get(
  "/plans",
  asyncHandler(async (_req, res) => {
    const rows = await db("investment_plans")
      .select(
        "id",
        "slug",
        "name",
        "min_amount as minAmount",
        "max_amount as maxAmount",
        "duration_days as durationDays",
        "daily_return_percent as dailyReturn",
        "payout_daily_return_percent as payoutDailyReturn",
        "total_return_percent as totalReturn",
        "features",
        "image_path as imagePath",
        "is_active as isActive",
      )
      .orderBy("id", "asc");
    res.json({
      success: true,
      data: rows.map((item) => ({
        ...item,
        features: item.features ? JSON.parse(item.features) : [],
      })),
    });
  }),
);

router.post(
  "/plans",
  validate(createPlanSchema),
  asyncHandler(async (req, res) => {
    const payload = req.body;
    const slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
    const existing = await db("investment_plans").where({ slug }).first();
    if (existing) throw new ApiError(409, "A plan with this slug already exists");

    const [id] = await db("investment_plans").insert({
      slug,
      name: payload.name,
      min_amount: payload.minAmount,
      max_amount: payload.maxAmount ?? null,
      duration_days: payload.durationDays,
      daily_return_percent: payload.dailyReturn,
      payout_daily_return_percent: payload.payoutDailyReturn ?? 1,
      total_return_percent: payload.totalReturn,
      features: JSON.stringify(payload.features || []),
      image_path: payload.imagePath || null,
      is_active: payload.isActive,
    });

    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "create_plan",
      target_type: "investment_plan",
      target_id: String(id),
    });

    res.status(201).json({ success: true, message: "Plan created", data: { id } });
  }),
);

router.patch(
  "/plans/:id",
  validate(updatePlanSchema),
  asyncHandler(async (req, res) => {
    const planId = Number(req.params.id);
    if (!planId) throw new ApiError(400, "Invalid plan ID");
    const existing = await db("investment_plans").where({ id: planId }).first();
    if (!existing) throw new ApiError(404, "Plan not found");

    const update = {};
    if (req.body.name !== undefined) update.name = req.body.name;
    if (req.body.slug !== undefined || req.body.name !== undefined) {
      const nextSlug = slugify(req.body.slug || req.body.name || existing.slug);
      const conflict = await db("investment_plans")
        .where({ slug: nextSlug })
        .whereNot({ id: planId })
        .first();
      if (conflict) throw new ApiError(409, "A plan with this slug already exists");
      update.slug = nextSlug;
    }
    if (req.body.minAmount !== undefined) update.min_amount = req.body.minAmount;
    if (req.body.maxAmount !== undefined) update.max_amount = req.body.maxAmount;
    if (req.body.durationDays !== undefined) update.duration_days = req.body.durationDays;
    if (req.body.dailyReturn !== undefined) update.daily_return_percent = req.body.dailyReturn;
    if (req.body.payoutDailyReturn !== undefined) update.payout_daily_return_percent = req.body.payoutDailyReturn;
    if (req.body.totalReturn !== undefined) update.total_return_percent = req.body.totalReturn;
    if (req.body.features !== undefined) update.features = JSON.stringify(req.body.features);
    if (req.body.imagePath !== undefined) update.image_path = req.body.imagePath || null;
    if (req.body.isActive !== undefined) update.is_active = req.body.isActive;
    update.updated_at = db.fn.now();

    await db("investment_plans").where({ id: planId }).update(update);

    if (req.body.payoutDailyReturn !== undefined) {
      await db("investments")
        .where({ plan_id: planId, status: "active" })
        .update({
          payout_daily_return_percent: req.body.payoutDailyReturn,
          updated_at: db.fn.now(),
        });

      const affectedUserIds = await db("investments")
        .where({ plan_id: planId, status: "active" })
        .groupBy("user_id")
        .pluck("user_id");
      if (affectedUserIds.length) {
        await creditPendingDailyProfitsForUserIds(db, affectedUserIds);
      }
    }

    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "update_plan",
      target_type: "investment_plan",
      target_id: String(planId),
      meta: JSON.stringify(update),
    });

    res.json({ success: true, message: "Plan updated" });
  }),
);

router.delete(
  "/plans/:id",
  asyncHandler(async (req, res) => {
    const planId = Number(req.params.id);
    if (!planId) throw new ApiError(400, "Invalid plan ID");

    const existing = await db("investment_plans").where({ id: planId }).first();
    if (!existing) throw new ApiError(404, "Plan not found");

    await db("investment_plans").where({ id: planId }).del();
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "delete_plan",
      target_type: "investment_plan",
      target_id: String(planId),
    });

    res.json({ success: true, message: "Plan deleted" });
  }),
);

router.get(
  "/social-links",
  asyncHandler(async (_req, res) => {
    const rows = await db("site_links")
      .select("id", "title", "url", "is_active as isActive", "sort_order as sortOrder", "created_at as createdAt")
      .orderBy([{ column: "sort_order", order: "asc" }, { column: "id", order: "asc" }]);
    res.json({ success: true, data: rows });
  }),
);

router.post(
  "/social-links",
  validate(createSocialLinkSchema),
  asyncHandler(async (req, res) => {
    const [id] = await db("site_links").insert({
      title: req.body.title,
      url: req.body.url,
      is_active: req.body.isActive,
      sort_order: req.body.sortOrder,
    });

    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "create_social_link",
      target_type: "site_link",
      target_id: String(id),
      meta: JSON.stringify(req.body),
    });

    res.status(201).json({ success: true, message: "Social link created", data: { id } });
  }),
);

router.patch(
  "/social-links/:id",
  validate(updateSocialLinkSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid link ID");
    const existing = await db("site_links").where({ id }).first();
    if (!existing) throw new ApiError(404, "Social link not found");

    const update = {};
    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.url !== undefined) update.url = req.body.url;
    if (req.body.isActive !== undefined) update.is_active = req.body.isActive;
    if (req.body.sortOrder !== undefined) update.sort_order = req.body.sortOrder;
    update.updated_at = db.fn.now();

    await db("site_links").where({ id }).update(update);
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "update_social_link",
      target_type: "site_link",
      target_id: String(id),
      meta: JSON.stringify(update),
    });

    res.json({ success: true, message: "Social link updated" });
  }),
);

router.delete(
  "/social-links/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid link ID");
    const existing = await db("site_links").where({ id }).first();
    if (!existing) throw new ApiError(404, "Social link not found");
    await db("site_links").where({ id }).del();
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "delete_social_link",
      target_type: "site_link",
      target_id: String(id),
    });
    res.json({ success: true, message: "Social link deleted" });
  }),
);

router.get(
  "/payment-accounts",
  asyncHandler(async (_req, res) => {
    const rows = await db("payment_accounts")
      .select(
        "id",
        "method",
        "display_name as displayName",
        "account_title as accountTitle",
        "account_number as accountNumber",
        "iban",
        "phone",
        "instructions",
        "logo_path as logoPath",
        "is_active as isActive",
        "sort_order as sortOrder",
      )
      .orderBy([{ column: "method", order: "asc" }, { column: "sort_order", order: "asc" }, { column: "id", order: "asc" }]);
    res.json({ success: true, data: rows });
  }),
);

router.post(
  "/payment-accounts",
  validate(createPaymentAccountSchema),
  asyncHandler(async (req, res) => {
    let id;
    try {
      const inserted = await db("payment_accounts").insert({
      method: req.body.method,
      display_name: req.body.displayName,
      account_title: req.body.accountTitle || null,
      account_number: req.body.accountNumber || null,
      iban: req.body.iban || null,
      phone: req.body.phone || null,
      instructions: req.body.instructions || null,
        logo_path: req.body.logoPath || null,
      is_active: req.body.isActive,
      sort_order: req.body.sortOrder,
    });
      id = Array.isArray(inserted) ? inserted[0] : inserted;
    } catch (error) {
      if (isMethodEnumCompatError(error)) {
        throw new ApiError(
          400,
          "Database schema is outdated for payment method values. Please run latest backend migrations and try again.",
        );
      }
      throw error;
    }
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "create_payment_account",
      target_type: "payment_account",
      target_id: String(id),
      meta: JSON.stringify(req.body),
    });
    res.status(201).json({ success: true, message: "Payment account created", data: { id } });
  }),
);

router.patch(
  "/payment-accounts/:id",
  validate(updatePaymentAccountSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid payment account ID");
    const existing = await db("payment_accounts").where({ id }).first();
    if (!existing) throw new ApiError(404, "Payment account not found");
    const update = {};
    if (req.body.method !== undefined) update.method = req.body.method;
    if (req.body.displayName !== undefined) update.display_name = req.body.displayName;
    if (req.body.accountTitle !== undefined) update.account_title = req.body.accountTitle || null;
    if (req.body.accountNumber !== undefined) update.account_number = req.body.accountNumber || null;
    if (req.body.iban !== undefined) update.iban = req.body.iban || null;
    if (req.body.phone !== undefined) update.phone = req.body.phone || null;
    if (req.body.instructions !== undefined) update.instructions = req.body.instructions || null;
    if (req.body.logoPath !== undefined) update.logo_path = req.body.logoPath || null;
    if (req.body.isActive !== undefined) update.is_active = req.body.isActive;
    if (req.body.sortOrder !== undefined) update.sort_order = req.body.sortOrder;
    update.updated_at = db.fn.now();

    try {
    await db("payment_accounts").where({ id }).update(update);
    } catch (error) {
      if (isMethodEnumCompatError(error)) {
        throw new ApiError(
          400,
          "Database schema is outdated for payment method values. Please run latest backend migrations and try again.",
        );
      }
      throw error;
    }
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "update_payment_account",
      target_type: "payment_account",
      target_id: String(id),
      meta: JSON.stringify(update),
    });
    res.json({ success: true, message: "Payment account updated" });
  }),
);

router.delete(
  "/payment-accounts/:id",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid payment account ID");
    const existing = await db("payment_accounts").where({ id }).first();
    if (!existing) throw new ApiError(404, "Payment account not found");
    try {
    await db("payment_accounts").where({ id }).del();
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "delete_payment_account",
      target_type: "payment_account",
      target_id: String(id),
    });
      return res.json({ success: true, message: "Payment account deleted" });
    } catch (error) {
      if (!isReferenceConstraintError(error)) throw error;
      await db("payment_accounts").where({ id }).update({
        is_active: false,
        updated_at: db.fn.now(),
      });
      await db("admin_actions").insert({
        admin_id: req.user.id,
        action: "deactivate_payment_account",
        target_type: "payment_account",
        target_id: String(id),
        meta: JSON.stringify({ reason: "has_referenced_deposits" }),
      });
      return res.json({
        success: true,
        message: "Payment account is used in existing deposit records, so it was deactivated instead of deleted.",
      });
    }
  }),
);

router.patch(
  "/users/:id/block",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid user ID");
    await db("users").where({ id }).update({ is_blocked: true, updated_at: db.fn.now() });
    await db("sessions").where({ user_id: id }).del();
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "block_user",
      target_type: "user",
      target_id: String(id),
    });
    res.json({ success: true, message: "User blocked" });
  }),
);

router.patch(
  "/users/:id/unblock",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid user ID");
    await db("users").where({ id }).update({ is_blocked: false, updated_at: db.fn.now() });
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "unblock_user",
      target_type: "user",
      target_id: String(id),
    });
    res.json({ success: true, message: "User unblocked" });
  }),
);

router.post(
  "/users/:id/impersonate",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid user ID");
    const user = await db("users")
      .leftJoin("roles", "users.role_id", "roles.id")
      .select("users.id", "users.email", "users.name", "roles.name as role")
      .where("users.id", id)
      .first();
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role || "user",
      impersonatedBy: req.user.id,
    });

    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "impersonate_user",
      target_type: "user",
      target_id: String(id),
      meta: JSON.stringify({ targetEmail: user.email }),
    });

    res.json({
      success: true,
      data: {
        accessToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role || "user" },
      },
      message: "Impersonation token issued",
    });
  }),
);

router.get(
  "/transactions",
  asyncHandler(async (_req, res) => {
    let rows = [];
    try {
      rows = await db("transactions")
        .leftJoin("users", "transactions.user_id", "users.id")
        .select(
          "transactions.id",
          "transactions.user_id as userId",
          "users.name as userName",
          "users.email as userEmail",
          "users.phone as userPhone",
          "transactions.type",
          "transactions.amount",
          "transactions.status",
          "transactions.method",
          "transactions.reference",
          "transactions.created_at as createdAt",
        )
        .orderBy("transactions.created_at", "desc")
      .limit(200);
    } catch (error) {
      // Compatibility fallback for partially migrated production databases.
      if (!isSchemaCompatError(error)) throw error;
      try {
        rows = await db("transactions")
          .leftJoin("users", "transactions.user_id", "users.id")
          .select(
            "transactions.id",
            "transactions.user_id as userId",
            "users.name as userName",
            "users.email as userEmail",
            "users.phone as userPhone",
            "transactions.type",
            "transactions.amount",
            "transactions.status",
            "transactions.created_at as createdAt",
          )
          .orderBy("transactions.created_at", "desc")
          .limit(200);
      } catch (fallbackError) {
        if (!isSchemaCompatError(fallbackError)) throw fallbackError;
        rows = await db("transactions")
          .select(
            "transactions.id",
            "transactions.user_id as userId",
            "transactions.type",
            "transactions.amount",
            "transactions.status",
            "transactions.created_at as createdAt",
          )
          .orderBy("transactions.created_at", "desc")
          .limit(200);
      }
    }
    res.json({ success: true, data: rows });
  }),
);

router.get(
  "/deposits",
  asyncHandler(async (_req, res) => {
    let rows = [];
    try {
      rows = await db("deposits")
        .leftJoin("payment_accounts", "deposits.payment_account_id", "payment_accounts.id")
        .leftJoin("users", "deposits.user_id", "users.id")
        .select(
          "deposits.id",
          "deposits.user_id as userId",
          "users.name as userName",
          "users.email as userEmail",
          "users.phone as userPhone",
          "deposits.amount",
          "deposits.method",
          "deposits.status",
          "deposits.reference",
          "deposits.proof_path as proofPath",
          "payment_accounts.display_name as paymentAccountName",
          "deposits.created_at as createdAt",
        )
        .orderBy("deposits.created_at", "desc");
    } catch (error) {
      // Backward compatibility for environments where latest deposit-proof migration is not applied yet.
      const message = String(error?.message || "");
      const canFallback =
        message.includes("Unknown column") ||
        message.includes("ER_BAD_FIELD_ERROR") ||
        message.includes("doesn't exist") ||
        message.includes("no such column");
      if (!canFallback) throw error;
      rows = await db("deposits")
        .leftJoin("users", "deposits.user_id", "users.id")
        .select(
          "deposits.id",
          "deposits.user_id as userId",
          "users.name as userName",
          "users.email as userEmail",
          "users.phone as userPhone",
          "deposits.amount",
          "deposits.method",
          "deposits.status",
          "deposits.reference",
          "deposits.created_at as createdAt",
        )
        .orderBy("deposits.id", "desc");
    }
    res.json({ success: true, data: rows });
  }),
);

router.delete(
  "/deposits/:id",
  asyncHandler(async (req, res) => {
    const depositId = Number(req.params.id);
    if (!depositId) throw new ApiError(400, "Invalid deposit ID");
    const deposit = await db("deposits").where({ id: depositId }).first();
    if (!deposit) throw new ApiError(404, "Deposit not found");
    if (deposit.status !== "pending") {
      throw new ApiError(400, "Only pending deposits can be deleted");
    }

    await db.transaction(async (trx) => {
      await trx("deposits").where({ id: depositId }).del();
      await trx("transactions").where({ reference: deposit.reference }).del();
      await trx("admin_actions").insert({
        admin_id: req.user.id,
        action: "delete_deposit",
        target_type: "deposit",
        target_id: String(depositId),
      });
    });

    res.json({ success: true, message: "Deposit deleted" });
  }),
);

router.get(
  "/withdrawals",
  asyncHandler(async (_req, res) => {
    let rows = [];
    try {
      rows = await db("withdrawals")
        .leftJoin("users", "withdrawals.user_id", "users.id")
        .select(
          "withdrawals.id",
          "withdrawals.user_id as userId",
          "users.name as userName",
          "users.email as userEmail",
          "users.phone as userPhone",
          "withdrawals.amount",
          "withdrawals.fee",
          "withdrawals.method",
          "withdrawals.status",
          "withdrawals.reference",
          "withdrawals.account_details as accountDetails",
          "withdrawals.approved_amount as approvedAmount",
          "withdrawals.refund_amount as refundAmount",
          "withdrawals.admin_reason as adminReason",
          "withdrawals.processed_at as processedAt",
          "withdrawals.created_at as createdAt",
        )
        .orderBy("withdrawals.created_at", "desc");
    } catch (error) {
      if (!isSchemaCompatError(error)) throw error;
      rows = await db("withdrawals")
        .leftJoin("users", "withdrawals.user_id", "users.id")
        .select(
          "withdrawals.id",
          "withdrawals.user_id as userId",
          "users.name as userName",
          "users.email as userEmail",
          "users.phone as userPhone",
          "withdrawals.amount",
          "withdrawals.fee",
          "withdrawals.method",
          "withdrawals.status",
          "withdrawals.reference",
          "withdrawals.account_details as accountDetails",
          "withdrawals.created_at as createdAt",
        )
        .orderBy("withdrawals.created_at", "desc");
    }
    res.json({
      success: true,
      data: rows.map((item) => ({
        ...item,
        accountDetails: (() => {
          try {
            return item.accountDetails ? JSON.parse(item.accountDetails) : {};
          } catch {
            return {};
          }
        })(),
      })),
    });
  }),
);

router.patch(
  "/transactions/:id/status",
  validate(moderationSchema),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid transaction ID");
    await db("transactions").where({ id }).update({ status: req.body.status, updated_at: db.fn.now() });
    await db("admin_actions").insert({
      admin_id: req.user.id,
      action: "update_transaction_status",
      target_type: "transaction",
      target_id: String(id),
      meta: JSON.stringify({ status: req.body.status }),
    });
    res.json({ success: true, message: "Transaction updated" });
  }),
);

router.patch(
  "/deposits/:id/status",
  validate(depositStatusSchema),
  asyncHandler(async (req, res) => {
    const depositId = Number(req.params.id);
    if (!depositId) throw new ApiError(400, "Invalid deposit ID");

    await db.transaction(async (trx) => {
      const deposit = await trx("deposits").where({ id: depositId }).first();
      if (!deposit) throw new ApiError(404, "Deposit not found");

      const alreadyCompleted = deposit.status === "completed";
      const transactionStatus = req.body.status === "rejected" ? "failed" : req.body.status;
      await trx("deposits").where({ id: depositId }).update({ status: req.body.status, updated_at: trx.fn.now() });
      await trx("transactions")
        .where({ reference: deposit.reference })
        .update({ status: transactionStatus, updated_at: trx.fn.now() });

      if (!alreadyCompleted && req.body.status === "completed") {
        await adjustWalletBalance(
          db,
          {
            userId: deposit.user_id,
            delta: Number(deposit.amount),
            reason: "deposit",
            reference: deposit.reference,
          },
          trx,
        );
        const wallet = await getOrCreateWallet(db, deposit.user_id, trx);
        const walletRow = await trx("wallets").where({ id: wallet.id }).first();
        await trx("wallets")
          .where({ id: wallet.id })
          .update({
            locked_balance: Number((Number(walletRow.locked_balance || 0) + Number(deposit.amount || 0)).toFixed(2)),
            updated_at: trx.fn.now(),
          });
        await trx("notifications").insert({
          user_id: deposit.user_id,
          title: "Deposit approved and locked",
          message: `Deposit #${deposit.id} approved. Amount is locked for investment use and cannot be withdrawn directly.`,
        });
      }
      if (req.body.status === "rejected") {
        await trx("notifications").insert({
          user_id: deposit.user_id,
          title: "Deposit rejected",
          message: `Deposit request #${deposit.id} was rejected by admin.`,
        });
      }

      await trx("admin_actions").insert({
        admin_id: req.user.id,
        action: "update_deposit_status",
        target_type: "deposit",
        target_id: String(depositId),
        meta: JSON.stringify({ status: req.body.status }),
      });
    });

    res.json({ success: true, message: "Deposit status updated" });
  }),
);

router.patch(
  "/withdrawals/:id/status",
  validate(withdrawalSettleSchema),
  asyncHandler(async (req, res) => {
    const withdrawalId = Number(req.params.id);
    if (!withdrawalId) throw new ApiError(400, "Invalid withdrawal ID");

    await db.transaction(async (trx) => {
      const withdrawal = await trx("withdrawals").where({ id: withdrawalId }).first();
      if (!withdrawal) throw new ApiError(404, "Withdrawal not found");
      if (withdrawal.status === "completed" || withdrawal.status === "rejected") {
        throw new ApiError(400, "Withdrawal already finalized");
      }

      const requestedTotal = Number(withdrawal.amount) + Number(withdrawal.fee);
      const nextStatus = req.body.status;
      const approvedAmount =
        nextStatus === "completed" ? Number(req.body.approvedAmount || 0) : withdrawal.approved_amount;
      const refundAmount =
        nextStatus === "completed"
          ? Number(req.body.refundAmount || 0)
          : nextStatus === "rejected"
            ? requestedTotal
            : withdrawal.refund_amount;
      if (nextStatus === "completed") {
        if (approvedAmount < 0 || refundAmount < 0) throw new ApiError(400, "Invalid approved/refund amounts");
        if (Number((approvedAmount + refundAmount).toFixed(2)) !== Number(requestedTotal.toFixed(2))) {
          throw new ApiError(400, "approvedAmount + refundAmount must equal requested withdrawal total");
        }
      }

      await trx("withdrawals").where({ id: withdrawalId }).update({
        status: nextStatus,
        approved_amount: approvedAmount,
        refund_amount: refundAmount,
        admin_reason: req.body.reason || null,
        processed_at: nextStatus === "pending" || nextStatus === "processing" ? null : trx.fn.now(),
        processed_by: nextStatus === "pending" || nextStatus === "processing" ? null : req.user.id,
        updated_at: trx.fn.now(),
      });
      await trx("transactions")
        .where({ reference: withdrawal.reference })
        .update({ status: nextStatus === "rejected" ? "failed" : nextStatus, updated_at: trx.fn.now() });

      if (nextStatus === "rejected" || (nextStatus === "completed" && refundAmount > 0)) {
        const refund = nextStatus === "rejected" ? requestedTotal : refundAmount;
        await adjustWalletBalance(
          db,
          {
            userId: withdrawal.user_id,
            delta: refund,
            reason: "withdrawal_refund",
            reference: `WTH-RFD-${withdrawal.id}`,
          },
          trx,
        );
      }

      if (nextStatus === "completed") {
        await trx("notifications").insert({
          user_id: withdrawal.user_id,
          title: "Withdrawal processed",
          message: `Requested $${requestedTotal.toFixed(2)}. Approved: $${approvedAmount.toFixed(2)}. Refunded: $${refundAmount.toFixed(2)}.`,
        });
      } else if (nextStatus === "rejected") {
        await trx("notifications").insert({
          user_id: withdrawal.user_id,
          title: "Withdrawal rejected",
          message: `Withdrawal #${withdrawal.id} was rejected and $${requestedTotal.toFixed(2)} refunded to wallet.`,
        });
      }

      await trx("admin_actions").insert({
        admin_id: req.user.id,
        action: "update_withdrawal_status",
        target_type: "withdrawal",
        target_id: String(withdrawalId),
        meta: JSON.stringify({
          status: nextStatus,
          approvedAmount: approvedAmount ?? null,
          refundAmount: refundAmount ?? null,
          reason: req.body.reason || null,
        }),
      });
    });

    res.json({ success: true, message: "Withdrawal status updated" });
  }),
);

module.exports = router;
