import axios from "axios";
import { AirQuality, PrismaClient } from "@prisma/client";
import { AppService } from "../../src/services/app.service";
import { airQualityData } from "../helpers/mock-data";
import { prismaMock } from "../../src/config/singleton";

jest.mock("axios");

describe("AppService Unit Test", () => {
  let appService: AppService;
  const longitude = 2.352222;
  const latitude = 48.856613;
  const resp = {
    status: 200,
    data: {
      data: {
        current: {
          pollution: {
            ts: "2023-09-15T23:00:00.000Z",
            aqius: 46,
            mainus: "p2",
            aqicn: 31,
            maincn: "n2",
          },
        },
      },
    },
  };

  beforeEach(() => {
    appService = new AppService();
  });

  describe("getAirQuality() method", () => {
    it("should throw an error if longitude and latitude are not numbers", async () => {
      const longitude = Number("not a number");
      const latitude = Number("not a number");

      await expect(
        appService.getAirQuality(longitude, latitude)
      ).rejects.toThrowError("Both longitude and latitude must be numbers.");
    });

    it("should make an API request to the correct URL", async () => {
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(
        resp
      );

      await appService.getAirQuality(longitude, latitude);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(
          `/v2/nearest_city?lat=${latitude}&lon=${longitude}`
        )
      );
    });

    it("should get air quality data", async () => {
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue(
        resp
      );

      const airQuality = await appService.getAirQuality(longitude, latitude);

      const pollutionData = resp.data.data.current.pollution;

      expect(airQuality).toEqual({
        Result: {
          Pollution: {
            ts: pollutionData.ts,
            aqius: pollutionData.aqius,
            mainus: pollutionData.mainus,
            aqicn: pollutionData.aqicn,
            maincn: pollutionData.maincn,
          },
        },
      });
    });

    it("should throw an error on invalid coordinates with axios API call", async () => {
      const errorMessage =
        "Invalid Longitude and or Latitude input, Check coordinates";
      const longitude = -4;
      const latitude = 3;

      const mockErrorResponse = {
        response: {
          status: 400,
          statusText: "Bad Request",
          data: { status: "fail", data: { message: "city_not_found" } },
        },
      };

      (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(
        mockErrorResponse
      );

      try {
        await appService.getAirQuality(longitude, latitude);
      } catch (error: Error | any) {
        expect(error.message).toEqual(errorMessage);
      }
    });

    it("should throw an error when API request fails", async () => {
      const errorMessage = "Request Failed";

      const mockErrorResponse = {
        message: errorMessage,
      };

      (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(
        mockErrorResponse
      );

      try {
        await appService.getAirQuality(longitude, latitude);
      } catch (error: Error | any) {
        expect(error.message).toEqual(`API Request failed: ${errorMessage}`);
      }
    });
  });

  describe("getParisPollutedAirPeriod() for Paris", () => {
    const prisma: PrismaClient = prismaMock as unknown as PrismaClient;

    it("should return formatted date and time for the most polluted air", async () => {
      // Mock the creation of many airQuality data
      prismaMock.airQuality.createMany.mockResolvedValue({
        count: airQualityData.length,
      });
      await prismaMock.airQuality.createMany({ data: airQualityData });

      const airQualityDataWithDate: AirQuality[] = airQualityData.map(
        (data) => ({
          ...data,
          ts: new Date(data.ts),
        })
      );

      // Mock the findMany method and return the airQualityData
      prismaMock.airQuality.findMany.mockResolvedValue(airQualityDataWithDate);

      // Retrieve the mock data using findMany
      const airQualityList = await prisma.airQuality.findMany();
      const sortedAirQualityList = airQualityList.sort(
        (a, b) => b.aqius - a.aqius
      );
      prismaMock.airQuality.findFirst.mockResolvedValue(
        sortedAirQualityList[0]
      );

      const mostPollutedAirTimeStamp = await prisma.airQuality.findFirst();

      const result = await appService.getParisPollutedAirPeriod();

      expect(result).toEqual(mostPollutedAirTimeStamp?.ts.toISOString());
    });

    it('should return "No data Found" when no data is available', async () => {
      prismaMock.airQuality.findFirst.mockResolvedValue(null);

      const result = await appService.getParisPollutedAirPeriod();

      expect(result).toEqual("No data Found");
    });

    it("should throw an error when there is an error", async () => {
      const errorMessage = "Database Error";
      // Mock Prisma behavior to throw an error
      prismaMock.airQuality.findFirst.mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(appService.getParisPollutedAirPeriod()).rejects.toThrowError(
        `Cannot Get Data: ${errorMessage}`
      );
    });
  });
});
