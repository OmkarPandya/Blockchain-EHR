import request from "supertest";
import app from "../server";
import mongoose from "mongoose";

afterAll(async () => {
  await mongoose.connection.close();
});

describe("EHR Backend Routes", () => {
  it("GET / - health check", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("Enjoy");
  });

  it("POST /api/users/register - register user", async () => {
    const res = await request(app).post("/api/users/register").send({
      wallet: "x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      name: "Alice",
      email: "alice@example.com",
      user_type: "patient",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty(
      "wallet",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );
  });

  it("GET /api/users - get all users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/reports - upload report", async () => {
    const res = await request(app).post("/api/reports").send({
      scan: "ipfs://scan123",
      doctor: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      patient: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      hospital: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty(
      "patient",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );
  });

  it("GET /api/reports - get all reports", async () => {
    const res = await request(app).get("/api/reports");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
