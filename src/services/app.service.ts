import axios, { AxiosError } from "axios";
import appConfig from "../config/app-config";
import {
  AirQualityData,
  AirQualityResponse,
  ApiResponse,
} from "../interfaces/app.interface";
import prisma from "../config/prisma";


/**
 * Service class responsible for handling air quality data and API requests.
 */
export class AppService {

  /**
   * Retrieves air quality data for a specific longitude and latitude.
   * @param longitude The longitude coordinate.
   * @param latitude The latitude coordinate.
   * @returns A Promise containing the air quality data response.
   * @throws An error if invalid coordinates or API request failure.
   */
  public async getAirQuality(
    longitude: number,
    latitude: number
  ): Promise<AirQualityResponse> {
    if (isNaN(Number(longitude)) || isNaN(Number(longitude))) {
      throw new Error("Both longitude and latitude must be numbers.");
    }

    const { IQ_API_KEY, IQ_API_BASE_URL } = appConfig;

    try {
      const response = await axios.get(
        `${IQ_API_BASE_URL}/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${IQ_API_KEY}`
      );

      const data = (await response.data) as ApiResponse;
      const pollutionData: AirQualityData = data.data.current.pollution;

      const result: AirQualityResponse = {
        Result: {
          Pollution: pollutionData,
        },
      };

      return result;
    } catch (error) {
      const err = error as AxiosError;
      if (err.response?.status === 400) {
        throw new Error(
          "Invalid Longitude and or Latitude input, Check coordinates"
        );
      } else {
        throw new Error(`API Request failed: ${err.message}`);
      }
    }
  }

  /**
   * Retrieves the date and time when the Paris zone is the most polluted based on stored data.
   * @returns A Promise containing the formatted date and time or "No data Found" if no data is available.
   * @throws An error if unable to retrieve data from the database.
   */
  public async getParisPollutedAirPeriod(): Promise<string> {
    try {
      // get only the timestamp by sorting the 'aquis` in desc order
      const mostPollutedAirTimeStamp = await prisma.airQuality.findFirst({
        orderBy: {
          aqius: "desc",
        },
        select: {
          ts: true,
        },
      });

      if (mostPollutedAirTimeStamp) {
         // Format the timestamp to ISO string.
        return mostPollutedAirTimeStamp?.ts.toISOString();
      } else {
        return "No data Found";
      }
    } catch (error: Error | any) {
      throw new Error(`Cannot Get Data: ${error.message}`);
    }
  }
}
