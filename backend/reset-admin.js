const bcrypt = require("bcryptjs");
const db = require("./src/db/knex");

async function main() {
  const adminEmail = (
    process.argv[2] ||
    process.env.ADMIN_EMAIL ||
    "admin@fairinvest.site"
  ).trim().toLowerCase();

  const adminPassword = (
    process.argv[3] ||
    process.env.ADMIN_PASSWORD ||
    "Admin@12345"
  ).trim();

  try {
    // 1. Ensure roles exist
    const adminRole = await db("roles").where({ name: "admin" }).first();
    let adminRoleId = adminRole ? adminRole.id : null;

    if (!adminRoleId) {
      const [newRoleId] = await db("roles").insert({ name: "admin" });
      adminRoleId = newRoleId || 2;
    }

    const userRole = await db("roles").where({ name: "user" }).first();
    if (!userRole) {
      await db("roles").insert({ name: "user" });
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // 3. Find or create admin user
    let user = await db("users").where({ email: adminEmail }).first();

    if (user) {
      await db("users")
        .where({ id: user.id })
        .update({
          role_id: adminRoleId,
          password_hash: passwordHash,
          is_blocked: false,
          updated_at: db.fn.now(),
        });
      console.log(`[Admin Setup] Updated existing admin user: ${adminEmail}`);
    } else {
      const [newUserId] = await db("users").insert({
        role_id: adminRoleId,
        name: "Admin User",
        email: adminEmail,
        phone: "+92 300 0000000",
        password_hash: passwordHash,
        is_blocked: false,
        country: "Pakistan",
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      const actualUserId = typeof newUserId === "object" ? newUserId.id : newUserId;
      if (actualUserId) {
        const wallet = await db("wallets").where({ user_id: actualUserId }).first();
        if (!wallet) {
          await db("wallets").insert({
            user_id: actualUserId,
            balance: 0,
            locked_balance: 0,
            created_at: db.fn.now(),
            updated_at: db.fn.now(),
          });
        }
      }
      console.log(`[Admin Setup] Created new admin user: ${adminEmail}`);
    }

    console.log("=========================================");
    console.log(" FairInvest Admin Credentials Ready");
    console.log("=========================================");
    console.log(` Email:    ${adminEmail}`);
    console.log(` Password: ${adminPassword}`);
    console.log(" URL:      https://fairinvest.site/admin");
    console.log("=========================================");
  } catch (error) {
    console.error("[Admin Setup] Error setting up admin:", error.message);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

main();
