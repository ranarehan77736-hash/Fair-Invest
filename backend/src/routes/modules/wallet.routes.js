const express = require("express");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const db = require("../../db/knex");
const { requireAuth, requireRole } = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const { getOrCreateWallet, adjustWalletBalance } = require("../../services/walletService");
const { creditPendingDailyProfits, creditPendingDailyProfitsIfDue } = require("../../services/investmentProfitService");

const router = express.Router();
const PAYMENT_METHODS = [
  "bank_transfer",
  "easypaisa",
  "jazzcash",
  "nayapay",
  "sadapay",
  "digit_plus",
  "crypto",
];

const depositSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(PAYMENT_METHODS),
  paymentAccountId: z.coerce.number().int().positive().optional(),
});

const withdrawalSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(PAYMENT_METHODS),
  accountDetails: z
    .object({
      accountTitle: z.string().min(2).optional(),
      accountNumber: z.string().min(2).optional(),
      walletAddress: z.string().min(2).optional(),
      selectedPayoutAccountId: z.string().optional(),
      selectedPayoutAccountName: z.string().optional(),
      bankName: z.string().optional(),
      note: z.string().max(255).optional(),
    })
    .passthrough()
    .optional(),
});

function isCryptoMethod(method) {
  return String(method || "").toLowerCase() === "crypto";
}

const WITHDRAWAL_COOLDOWN_MS = 24 * 60 * 60 * 1000;

async function getWithdrawalCooldown(db, userId) {
  const last = await db("withdrawals")
    .where({ user_id: userId })
    .orderBy("created_at", "desc")
    .select("id", "status", "created_at as createdAt")
    .first();

  if (!last?.createdAt) {
    return { canWithdraw: true, nextAllowedAt: null, hoursRemaining: 0, lastWithdrawalAt: null };
  }

  const lastAt = new Date(last.createdAt).getTime();
  const elapsed = Date.now() - lastAt;
  if (elapsed >= WITHDRAWAL_COOLDOWN_MS) {
    return { canWithdraw: true, nextAllowedAt: null, hoursRemaining: 0, lastWithdrawalAt: last.createdAt };
  }

  const remainingMs = WITHDRAWAL_COOLDOWN_MS - elapsed;
  const nextAllowedAt = new Date(lastAt + WITHDRAWAL_COOLDOWN_MS).toISOString();
  const hoursRemaining = Number((remainingMs / (60 * 60 * 1000)).toFixed(2));

  return {
    canWithdraw: false,
    nextAllowedAt,
    hoursRemaining,
    lastWithdrawalAt: last.createdAt,
    lastWithdrawalStatus: last.status,
  };
}

async function assertWithdrawalCooldown(db, userId) {
  const cooldown = await getWithdrawalCooldown(db, userId);
  if (cooldown.canWithdraw) return cooldown;

  const hours = Math.ceil(cooldown.hoursRemaining);
  throw new ApiError(
    400,
    `You can request your next withdrawal 24 hours after your last request. Please try again in about ${hours} hour(s).`,
  );
}

const uploadsRoot = path.join(process.cwd(), "uploads");
const depositProofDir = path.join(uploadsRoot, "deposit-proofs");
for (const targetDir of [uploadsRoot, depositProofDir]) {
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
}

const uploadDepositProof = multer({
  storage: multer.diskStorage({
    destination(_req, _file, callback) {
      callback(null, depositProofDir);
    },
    filename(_req, file, callback) {
      const ext = path.extname(file.originalname || "");
      const safeExt = ext && ext.length <= 8 ? ext.toLowerCase() : ".png";
      callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.get(
  "/balance",
  requireAuth,
  asyncHandler(async (req, res) => {
    const wallet = await getOrCreateWallet(db, req.user.id);
    const balance = Number(wallet.balance || 0);
    const lockedBalance = Number(wallet.locked_balance || 0);
    const withdrawableBalance = Math.max(0, Number((balance - lockedBalance).toFixed(2)));
    res.json({
      success: true,
      data: {
        balance,
        lockedBalance,
        withdrawableBalance,
      },
    });
  }),
);

router.get(
  "/transactions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await db("transactions")
      .where({ user_id: req.user.id })
      .select("id", "type", "amount", "status", "method", "reference", "created_at as createdAt")
      .orderBy("created_at", "desc")
      .limit(200);
    res.json({ success: true, data: rows });
  }),
);

router.post(
  "/deposit",
  requireAuth,
  uploadDepositProof.single("proof"),
  asyncHandler(async (req, res) => {
    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.issues[0]?.message || "Invalid deposit payload");
    if (!req.file) throw new ApiError(400, "Payment proof screenshot is required");
    if (Number(parsed.data.amount) < 5) throw new ApiError(400, "Minimum deposit is $5");
    await db.transaction(async (trx) => {
      const amount = Number(parsed.data.amount);
      const reference = `DEP-${Date.now()}`;
      const [depositId] = await trx("deposits").insert({
        user_id: req.user.id,
        amount,
        method: parsed.data.method,
        status: "pending",
        reference,
        payment_account_id: parsed.data.paymentAccountId || null,
        proof_path: `/uploads/deposit-proofs/${req.file.filename}`,
      });
      await trx("transactions").insert({
        user_id: req.user.id,
        type: "deposit",
        amount,
        status: "pending",
        method: parsed.data.method,
        reference,
      });
      await trx("notifications").insert({
        user_id: req.user.id,
        title: "Deposit submitted",
        message: `Deposit #${depositId} of $${amount.toFixed(2)} is pending review`,
      });
    });
    res.status(201).json({ success: true, message: "Deposit request submitted" });
  }),
);

router.post(
  "/withdraw",
  requireAuth,
  validate(withdrawalSchema),
  asyncHandler(async (req, res) => {
    await creditPendingDailyProfitsIfDue(db, req.user.id, { force: true });
    await assertWithdrawalCooldown(db, req.user.id);
    const amount = Number(req.body.amount);
    if (amount < 1) throw new ApiError(400, "Minimum withdrawal is $1");
    const fee = Number((amount * 0.1).toFixed(2));
    const totalDebit = amount + fee;
    const accountDetails = req.body.accountDetails || {};
    const accountTitle = String(accountDetails.accountTitle || "").trim();
    const accountNumber = String(accountDetails.accountNumber || "").trim();
    const walletAddress = String(accountDetails.walletAddress || accountNumber || "").trim();
    if (isCryptoMethod(req.body.method) && !walletAddress) {
      throw new ApiError(400, "Wallet address is required for crypto withdrawal");
    }
    if (!isCryptoMethod(req.body.method) && (!accountTitle || !accountNumber)) {
      throw new ApiError(400, "Account holder name and account number are required");
    }
    await db.transaction(async (trx) => {
      const wallet = await getOrCreateWallet(db, req.user.id, trx);
      const lockedRow = await trx("wallets").where({ id: wallet.id }).forUpdate().first();
      const availableToWithdraw = Math.max(0, Number(lockedRow.balance || 0) - Number(lockedRow.locked_balance || 0));
      if (availableToWithdraw < totalDebit) {
        throw new ApiError(
          400,
          `Insufficient withdrawable profit balance. Withdrawable: $${availableToWithdraw.toFixed(2)} (principal/deposits are locked).`,
        );
      }

      const reference = `WTH-${Date.now()}`;
      const payoutAccountName = String(accountDetails.selectedPayoutAccountName || accountDetails.bankName || "").trim();
      const payoutAccountId = String(accountDetails.selectedPayoutAccountId || "").trim();
      await adjustWalletBalance(db, { userId: req.user.id, delta: -totalDebit, reason: "withdrawal", reference }, trx);
      await trx("withdrawals").insert({
        user_id: req.user.id,
        amount,
        fee,
        method: req.body.method,
        status: "pending",
        reference,
        account_details: JSON.stringify({
          ...accountDetails,
          accountTitle: isCryptoMethod(req.body.method) ? undefined : accountTitle,
          accountNumber: isCryptoMethod(req.body.method) ? walletAddress : accountNumber,
          walletAddress: isCryptoMethod(req.body.method) ? walletAddress : undefined,
          selectedPayoutAccountId: payoutAccountId || undefined,
          selectedPayoutAccountName: payoutAccountName || undefined,
        }),
      });
      await trx("transactions").insert({
        user_id: req.user.id,
        type: "withdrawal",
        amount,
        status: "pending",
        method: req.body.method,
        reference,
      });
      await trx("notifications").insert({
        user_id: req.user.id,
        title: "Withdrawal submitted",
        message: `Withdrawal request of $${amount.toFixed(2)} submitted. Fee: $${fee.toFixed(2)}.`,
      });
    });
    res.status(201).json({ success: true, message: "Withdrawal request submitted" });
  }),
);

router.get(
  "/withdrawals",
  requireAuth,
  asyncHandler(async (req, res) => {
    const cooldown = await getWithdrawalCooldown(db, req.user.id);
    const rows = await db("withdrawals")
      .where({ user_id: req.user.id })
      .select("id", "amount", "fee", "method", "status", "reference", "account_details as accountDetails", "admin_reason as adminReason", "approved_amount as approvedAmount", "refund_amount as refundAmount", "created_at as createdAt")
      .orderBy("created_at", "desc");
    res.json({
      success: true,
      data: rows.map((item) => ({
        ...item,
        accountDetails: item.accountDetails ? JSON.parse(item.accountDetails) : {},
      })),
      cooldown,
    });
  }),
);

router.get(
  "/deposits",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await db("deposits")
      .where({ user_id: req.user.id })
      .select("id", "amount", "method", "status", "reference", "proof_path as proofPath", "created_at as createdAt")
      .orderBy("created_at", "desc");
    res.json({ success: true, data: rows });
  }),
);

router.patch(
  "/withdrawals/:id/status",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!id) throw new ApiError(400, "Invalid withdrawal ID");
    await db("withdrawals").where({ id }).update({ status: req.body.status || "processing", updated_at: db.fn.now() });
    res.json({ success: true, message: "Withdrawal status updated" });
  }),
);

module.exports = router;
