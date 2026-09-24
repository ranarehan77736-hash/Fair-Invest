const request = require("supertest");
const app = require("../../src/app");
const db = require("../../src/db/knex");

describe("App smoke tests", () => {
  afterAll(async () => {
    await db.destroy();
  });

  it("returns 404 for unknown route", async () => {
    const res = await request(app).get("/api/unknown-route");
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
