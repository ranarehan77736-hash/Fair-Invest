require("dotenv").config();
const path = require("path");

const dbClient = process.env.DB_CLIENT || (process.env.DB_HOST ? "mysql2" : "sqlite3");

const shared = {
  client: dbClient,
  useNullAsDefault: true,
  migrations: {
    directory: "./src/db/migrations",
  },
  seeds: {
    directory: "./src/db/seeds",
  },
  pool: dbClient === "sqlite3" ? {} : {
    min: 0,
    max: 10,
  },
};

const sqliteConnection = {
  filename: process.env.DB_FILENAME || path.join(__dirname, "dev.sqlite3"),
};

const mysqlConnection = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

module.exports = {
  development: {
    ...shared,
    connection: dbClient === "sqlite3" ? sqliteConnection : mysqlConnection,
  },
  production: {
    ...shared,
    connection: dbClient === "sqlite3" ? sqliteConnection : mysqlConnection,
  },
  test: {
    ...shared,
    connection: dbClient === "sqlite3" ? sqliteConnection : mysqlConnection,
  },
};

