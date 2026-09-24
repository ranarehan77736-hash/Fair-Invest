const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/db/knex");

const shouldRunDbTests = process.env.RUN_DB_TESTS === "true";
const describeIf = shouldRunDbTests ? describe : describe.skip;

describeIf("Core integration flows", () => {
  let accessToken = "";
  let createdEmail = "";

  afterAll(async () => {
    await db.destroy();
  });

  it("registers and logs in a user", async () => {
    createdEmail = `qa_${Date.now()}@example.com`;
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "QA User",
      email: createdEmail,
      phone: "+92 300 9998888",
      password: "Secure@12345",
    });
    expect(registerRes.statusCode).toBe(201);
    expect(registerRes.body.success).toBe(true);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: createdEmail,
      password: "Secure@12345",
    });
    expect(loginRes.statusCode).toBe(200);
    accessToken = loginRes.body.data.accessToken;
  });

  it("loads plans and creates deposit/withdraw requests", async () => {
    const plans = await request(app).get("/api/investments/plans");
    expect(plans.statusCode).toBe(200);

    const deposit = await request(app)
      .post("/api/wallet/deposit")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 200, method: "bank_transfer" });
    expect(deposit.statusCode).toBe(201);

    const withdraw = await request(app)
      .post("/api/wallet/withdraw")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 10, method: "bank_transfer", accountDetails: { iban: "PK00TEST123" } });
    expect([201, 400]).toContain(withdraw.statusCode);
  });

  it("loads referral overview", async () => {
    const referralRes = await request(app)
      .get("/api/referrals/overview")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(referralRes.statusCode).toBe(200);
  });
});
