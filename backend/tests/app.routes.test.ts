import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("app routes", () => {
  const app = createApp();

  it("returns ok on health check", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("validates register payload shape before hitting the database", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "bad-email",
      password: "123",
      name: ""
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("VALIDATION_ERROR");
  });

  it("requires a refresh cookie for refresh endpoint", async () => {
    const response = await request(app).post("/api/auth/refresh");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("REFRESH_TOKEN_REQUIRED");
  });
});
