import * as cron from "node-cron";
import { AppService } from "./app.service";
import prisma from "../config/prisma";

/**
 * CronManager class responsible for managing cron jobs related to air quality.
 */
export class CronManager {
  constructor(private appService: AppService) {}

  /**
   * Cron Job to check and save air quality data for a specific city (Paris) every minute.
   * @returns A Promise that resolves when the cron job is successfully scheduled.
   */
  public async checkAirQuality(): Promise<{ message: string }> {
    return new Promise(async (resolve, _) => {
      // Schedule a cron job to run every minute.
      cron.schedule("* * * * *", async () => {
        console.log("Cron job is running!");
        try {
          const result = await this.appService.getAirQuality(
            2.352222,
            48.856613
          );
          // save result to db
          await prisma.airQuality.create({
            data: {
              ts: result.Result.Pollution.ts,
              aqius: result.Result.Pollution.aqius,
              mainus: result.Result.Pollution.mainus,
              aqicn: result.Result.Pollution.aqicn,
              maincn: result.Result.Pollution.maincn,
            },
          });
          resolve({ message: "cron job successful" });
        } catch (error: Error | any) {
          throw new Error(`Job failed: ${error.message}`);
        }
      });
    });
  }
}
