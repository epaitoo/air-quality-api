import cron from "node-cron";
import { CronManager } from "../../src/services/cron-manager";
import { AppService } from "../../src/services/app.service";
import { prismaMock } from "../../src/config/singleton";
import { AirQualityResponse } from "../../src/interfaces/app.interface";

jest.mock("node-cron");
jest.mock("../../src/services/app.service");

describe("CronManager Unit Tests", () => {
  let cronManager: CronManager;
  let appService: AppService;
  let mockResult: AirQualityResponse;

  beforeEach(() => {
    appService = new AppService();
    cronManager = new CronManager(appService);
    mockResult = {
      Result: {
        Pollution: {
          ts: "2023-09-15T23:00:00.000Z",
          aqius: 46,
          mainus: "p2",
          aqicn: 31,
          maincn: "n2",
        },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("checkAirQuality() method", () => {
    it("should schedule a cron job to check air quality", () => {
      cronManager.checkAirQuality();

      expect(cron.schedule).toHaveBeenCalledWith(
        "* * * * *",
        expect.any(Function)
      );
    });

    it("should call the getAirQuality method of the AppService", () => {
      jest.spyOn(appService, "getAirQuality").mockResolvedValue(mockResult);
      cronManager.checkAirQuality();

      // Simulate the cron job running
      const cronJobCallback = (
        cron.schedule as jest.MockedFunction<typeof cron.schedule>
      ).mock.calls[0][1] as (now: Date | "manual" | "init") => void;
      cronJobCallback(new Date());

      expect(appService.getAirQuality).toHaveBeenCalledWith(
        2.352222,
        48.856613
      );
    });

    it("should schedule a cron job to check air quality and save it to the database", () => {
      jest.spyOn(appService, "getAirQuality").mockResolvedValue(mockResult);

      // Mock the Prisma create method
      prismaMock.airQuality.create({
        data: {
          ts: mockResult.Result.Pollution.ts,
          aqius: mockResult.Result.Pollution.aqius,
          mainus: mockResult.Result.Pollution.mainus,
          aqicn: mockResult.Result.Pollution.aqicn,
          maincn: mockResult.Result.Pollution.maincn,
        },
      });

      cronManager.checkAirQuality();

      // Ensure that the cron.schedule method was called with the expected schedule
      expect(cron.schedule).toHaveBeenCalledWith(
        "* * * * *",
        expect.any(Function)
      );

      // Simulate the cron job running
      const cronJobCallback = (
        cron.schedule as jest.MockedFunction<typeof cron.schedule>
      ).mock.calls[0][1] as (now: Date | "manual" | "init") => void;
      cronJobCallback(new Date());

      expect(appService.getAirQuality).toHaveBeenCalledWith(
        2.352222,
        48.856613
      );

      expect(prismaMock.airQuality.create).toHaveBeenCalledWith({
        data: {
          ts: mockResult.Result.Pollution.ts,
          aqius: mockResult.Result.Pollution.aqius,
          mainus: mockResult.Result.Pollution.mainus,
          aqicn: mockResult.Result.Pollution.aqicn,
          maincn: mockResult.Result.Pollution.maincn,
        },
      });
    });

    it("should throw an error if the getAirQuality method throws an error", async () => {
      const errorMessage = "Error fetching Air quality";
      jest
        .spyOn(appService, "getAirQuality")
        .mockRejectedValue(new Error(errorMessage));

      cronManager.checkAirQuality();

      // Simulate the cron job running
      const cronJobCallback = (
        cron.schedule as jest.MockedFunction<typeof cron.schedule>
      ).mock.calls[0][1] as (now: Date | "manual" | "init") => void;

      await expect(cronJobCallback(new Date())).rejects.toThrow(
        `Job failed: ${errorMessage}`
      );
      expect(appService.getAirQuality).toHaveBeenCalledWith(
        2.352222,
        48.856613
      );
    });

    it("should throw an error if the prisma.airQuality.create method throws an error", async () => {
      jest.spyOn(appService, "getAirQuality").mockResolvedValue(mockResult);

      const errorMessage = "Error saving air quality to the database";
      prismaMock.airQuality.create.mockRejectedValue(new Error(errorMessage));

      cronManager.checkAirQuality();

      // Simulate the cron job running
      const cronJobCallback = (
        cron.schedule as jest.MockedFunction<typeof cron.schedule>
      ).mock.calls[0][1] as (now: Date | "manual" | "init") => void;

      await expect(cronJobCallback(new Date())).rejects.toThrow(
        `Job failed: ${errorMessage}`
      );
      expect(appService.getAirQuality).toHaveBeenCalledWith(
        2.352222,
        48.856613
      );
    });
  });
});
