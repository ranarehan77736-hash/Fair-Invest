const express = require("express");

const db = require("../../db/knex");
const env = require("../../config/env");
const { requireAuth } = require("../../middleware/auth");
const asyncHandler = require("../../utils/asyncHandler");
const { getEnrichedReferralNetwork } = require("../../services/referralNetworkService");

const router = express.Router();

router.get(
  "/overview",
  requireAuth,
  asyncHandler(async (req, res) => {
    const referralCode = await db("referral_codes").where({ user_id: req.user.id }).first();
    const referralLink = await db("referral_links").where({ user_id: req.user.id }).first();
    const directCount = await db("referral_relations").where({ referrer_id: req.user.id, level: 1 }).count({ count: "*" }).first();
    const totalCount = await db("referral_relations").where({ referrer_id: req.user.id }).count({ count: "*" }).first();
    const earnings = await db("commissions")
      .where({ user_id: req.user.id })
      .sum({ total: "amount" })
      .first();
    const direct = Number(directCount?.count || 0);
    const total = Number(totalCount?.count || 0);
    const indirect = Math.max(0, total - direct);

    res.json({
      success: true,
      data: {
        code: referralCode?.code || null,
        linkToken: referralLink?.token || null,
        link: referralLink ? `${env.clientUrl}/signup?ref=${referralCode?.code || ""}` : null,
        totalReferrals: total,
        directReferrals: direct,
        indirectReferrals: indirect,
        totalEarnings: Number(earnings?.total || 0),
      },
    });
  }),
);

router.get(
  "/tree",
  requireAuth,
  asyncHandler(async (req, res) => {
    const enriched = await getEnrichedReferralNetwork(db, req.user.id);
    return res.json({ success: true, data: enriched });
  }),
);

router.get(
  "/commission-structure",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: [
        { level: 1, ratePercent: 10 },
        { level: 2, ratePercent: 5 },
        { level: 3, ratePercent: 2 },
      ],
    });
  }),
);

router.get(
  "/earnings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await db("commissions")
      .join("users", "commissions.source_user_id", "users.id")
      .where("commissions.user_id", req.user.id)
      .select(
        "commissions.id",
        "commissions.amount",
        "commissions.rate_percent as ratePercent",
        "commissions.status",
        "commissions.created_at as createdAt",
        "users.name as sourceUserName",
      )
      .orderBy("commissions.created_at", "desc");

    const total = rows.reduce((sum, item) => sum + Number(item.amount), 0);
    res.json({ success: true, data: { total, entries: rows } });
  }),
);

module.exports = router;
