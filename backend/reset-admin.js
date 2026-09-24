const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "dev.sqlite3");

async function main() {
  const hash = await bcrypt.hash("Admin@12345", 10);
  const db = new sqlite3.Database(dbPath);

  db.get("SELECT * FROM users WHERE email = 'admin@horizoneinvest.com'", (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO users (role_id, name, email, phone, password_hash, country) VALUES (2, 'Admin User', 'admin@horizoneinvest.com', '+92 300 0000000', ?, 'Pakistan')",
        [hash],
        function (insErr) {
          if (insErr) console.error("Error inserting admin@horizoneinvest.com:", insErr);
          else console.log("Added admin@horizoneinvest.com with password Admin@12345");
        }
      );
    }
  });

  db.run(
    "UPDATE users SET password_hash = ?",
    [hash],
    function (updateErr) {
      if (updateErr) {
        console.error("Error updating password:", updateErr);
      } else {
        console.log(
          "SUCCESS! Updated all user passwords to Admin@12345. Rows affected:",
          this.changes
        );
      }
      db.close();
    }
  );
}

main();
