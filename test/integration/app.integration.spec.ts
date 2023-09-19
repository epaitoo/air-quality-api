import express, { Request, Response, Application } from "express";
import request from "supertest";
import { AppService } from "../../src/services/app.service";
import { AppController } from "../../src/controllers/app.controller";
import { AppRoute } from "../../src/routes/app.route";
import { airQualityData } from "../helpers/mock-data";
import prismaTestClient from "../helpers/db-test-helper";

describe("App Controller - Integration Test", () => {
  let app: Application;
  let appService: AppService;
  let server: any;

  beforeAll(async () => {
    app = express();
    appService = new AppService();
    const appController = new AppController(appService);
    const appRoute = new AppRoute(appController);

    // Routes for testing
    app.get("/", (_: Request, res: Response) => {
      res.status(200).json({ message: "Hello There!" });
    });

    //air-quality route
    app.use("/api/get-air-quality", appRoute.router);

    // starts the server and selects an available port
    server = app.listen(0);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("Welcome Route - Root Route (/)", () => {
    it("should return a welcome message with a 200 status code", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Hello There!");
    });
  });

  describe("AppController - GET (/api/get-air-quality/longitude/latitude)", () => {
    it("should return a 400 response for longitude and latitudes not been numbers", async () => {
      // Invalid longitude and latitude values
      const longitude = "invalid";
      const latitude = "invalid";

      const response = await request(app).get(
        `/api/get-air-quality/${longitude}/${latitude}`
      );
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        "Longitude and Latitude must be a Number"
      );
    });

    // Test for invalid longitude & latitude numbers
    it("should return an error for invalid Longitude and or latitude numbers", async () => {
      const longitude = -4;
      const latitude = 3;

      const response = await request(app).get(
        `/api/get-air-quality/${longitude}/${latitude}`
      );
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(
        "Invalid Longitude and or Latitude input, Check coordinates"
      );
    });

    it("should return an error for a failed air quality retrieval", async () => {
      // Mock the AppService to simulate a failure
      jest
        .spyOn(appService, "getAirQuality")
        .mockRejectedValue(new Error("Air quality retrieval failed"));

      const longitude = 2.352222;
      const latitude = 48.856613;

      const response = await request(app).get(
        `/api/get-air-quality/${longitude}/${latitude}`
      );
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Air quality retrieval failed");
    });

    it("should return 200 status code with air quality data", async () => {
      const longitude = 2.352222;
      const latitude = 48.856613;
      const response = await request(app).get(
        `/api/get-air-quality/${longitude}/${latitude}`
      );
      expect(response.status).toBe(200);
    });
  });

  describe("AppController - GET (/api/get-air-quality/paris-most-polluted-time)", () => {
    it("should return 200 status code with Paris most polluted Air timestamp", async () => {
      const data = await prismaTestClient.airQuality.createMany({
        data: airQualityData,
      });
      expect(data).toBeTruthy();

      const mostPollutedAirTimeStamp =
        await prismaTestClient.airQuality.findFirst({
          orderBy: {
            aqius: "desc",
          },
          select: {
            ts: true,
          },
        });

      const result = mostPollutedAirTimeStamp?.ts.toISOString();

      jest
        .spyOn(appService, "getParisPollutedAirPeriod")
        .mockResolvedValue(
          result !== undefined
            ? Promise.resolve(result)
            : Promise.reject("No data Found")
        );

      const response = await request(app).get(
        "/api/get-air-quality/paris-most-polluted-time"
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toBe(result);
    });

    it("should return 404 status code with no Data Found", async () => {
      const response = await request(app).get(
        "/api/get-air-quality/paris-most-polluted-time"
      );
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("No data Found");
    });

    it("should return an error for a failed air quality retrieval", async () => {
      const errorMessage = "Request Cannot be Completed";
      jest
        .spyOn(appService, "getParisPollutedAirPeriod")
        .mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get(
        "/api/get-air-quality/paris-most-polluted-time"
      );
      expect(response.status).toBe(500);
      expect(response.body.error).toBe(errorMessage);
    });
  });

  afterAll(async () => {
    await prismaTestClient.airQuality.deleteMany();
    await prismaTestClient.$disconnect();
    await server.close();
  });
});
