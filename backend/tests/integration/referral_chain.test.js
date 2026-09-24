const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/db/knex");

const shouldRunDbTests = process.env.RUN_DB_TESTS === "true";
const describeIf = shouldRunDbTests ? describe : describe.skip;

describeIf("Referral Chain Integration", () => {
  let userA = { email: `a_${Date.now()}@test.com`, password: "password123", code: "" };
  let userB = { email: `b_${Date.now()}@test.com`, password: "password123", code: "" };
  let userC = { email: `c_${Date.now()}@test.com`, password: "password123", token: "" };

  afterAll(async () => {
    await db.destroy();
  });

  it("sets up a 3-level chain: A -> B -> C", async () => {
    // 1. Register A
    const regA = await request(app).post("/api/auth/register").send({
      name: "User A",
      email: userA.email,
      password: userA.password,
    });
    expect(regA.statusCode).toBe(201);
    
    // Get A's referral code
    const loginA = await request(app).post("/api/auth/login").send({
      email: userA.email,
      password: userA.password,
    });
    const tokenA = loginA.body.data.accessToken;
    const overviewA = await request(app).get("/api/referrals/overview").set("Authorization", `Bearer ${tokenA}`);
    userA.code = overviewA.body.data.code;

    // 2. Register B referring A
    const regB = await request(app).post("/api/auth/register").send({
      name: "User B",
      email: userB.email,
      password: userB.password,
      referralCode: userA.code,
    });
    expect(regB.statusCode).toBe(201);

    // Get B's referral code
    const loginB = await request(app).post("/api/auth/login").send({
      email: userB.email,
      password: userB.password,
    });
    const tokenB = loginB.body.data.accessToken;
    const overviewB = await request(app).get("/api/referrals/overview").set("Authorization", `Bearer ${tokenB}`);
    userB.code = overviewB.body.data.code;

    // 3. Register C referring B
    const regC = await request(app).post("/api/auth/register").send({
      name: "User C",
      email: userC.email,
      password: userC.password,
      referralCode: userB.code,
    });
    expect(regC.statusCode).toBe(201);

    // Get C's token
    const loginC = await request(app).post("/api/auth/login").send({
      email: userC.email,
      password: userC.password,
    });
    userC.token = loginC.body.data.accessToken;
  });

  it("verifies the tree structure for A", async () => {
    const loginA = await request(app).post("/api/auth/login").send({
      email: userA.email,
      password: userA.password,
    });
    const tokenA = loginA.body.data.accessToken;

    const treeRes = await request(app).get("/api/referrals/tree").set("Authorization", `Bearer ${tokenA}`);
    expect(treeRes.body.data).toHaveLength(2); // B and C
    
    const relB = treeRes.body.data.find(u => u.name === "User B");
    const relC = treeRes.body.data.find(u => u.name === "User C");
    
    expect(relB.level).toBe(1);
    expect(relC.level).toBe(2);
  });

  it("applies commissions when C invests", async () => {
    // Manually add balance to C for investment (mocking deposit)
    const userRowC = await db("users").where({ email: userC.email }).first();
    await db("wallets").where({ user_id: userRowC.id }).update({ balance: 1000 });

    // C invests in a plan (assuming ID 1 exists from seed)
    const investRes = await request(app)
      .post("/api/investments/invest")
      .set("Authorization", `Bearer ${userC.token}`)
      .send({ planId: 1, amount: 100 });
    
    expect(investRes.statusCode).toBe(201);

    // Check B's earnings (Level 1 - 10%)
    const loginB = await request(app).post("/api/auth/login").send({
      email: userB.email,
      password: userB.password,
    });
    const overviewB = await request(app)
      .get("/api/referrals/overview")
      .set("Authorization", `Bearer ${loginB.body.data.accessToken}`);
    
    expect(Number(overviewB.body.data.totalEarnings)).toBe(10); // 10% of 100

    // Check A's earnings (Level 2 - 5%)
    const loginA = await request(app).post("/api/auth/login").send({
      email: userA.email,
      password: userA.password,
    });
    const overviewA = await request(app)
      .get("/api/referrals/overview")
      .set("Authorization", `Bearer ${loginA.body.data.accessToken}`);
    
    expect(Number(overviewA.body.data.totalEarnings)).toBe(5); // 5% of 100
  });
});
