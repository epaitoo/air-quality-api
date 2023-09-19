import { Request, Response } from "express";
import { AppService } from "../services/app.service";

/**
 * Controller for handling air quality-related routes.
 */
export class AppController {
  constructor(
    private appService: AppService
  ) {}

  /**
   * Handles the route for getting air quality data by longitude and latitude.
   * @param req The Express Request object.
   * @param res The Express Response object.
   */
  public getAirQuality = async (req: Request, res: Response) => {
    const { longitude, latitude } = req.params;


    if (isNaN(Number(longitude)) || isNaN(Number(longitude))) {
      res.status(400).json({ error: "Longitude and Latitude must be a Number" })
      return;
    }

    try {
      const airQualityData = await this.appService.getAirQuality(Number(longitude), Number(latitude));
      res.status(200).json(airQualityData)
    } catch (error: Error | any) {
      res.status(500).json({ error: `${error.message}` });
    }
  }


  /**
   * Handles the route for getting the most polluted air period in Paris.
   * @param _: The Express Request object (unused).
   * @param res The Express Response object.
   */
  public getMostPollutedAirPeriod = async (_: Request, res: Response) => {
    try {
      const parisMostPollutedTimeStamp = await this.appService.getParisPollutedAirPeriod();
      if (parisMostPollutedTimeStamp === "No data Found") {
        res.status(404).json({ error: parisMostPollutedTimeStamp })
      } else {
        res.status(200).json({data: parisMostPollutedTimeStamp})
      }
    } catch (error: Error | any) {
      res.status(500).json({ error: `${error.message}` });
    }
  }
}