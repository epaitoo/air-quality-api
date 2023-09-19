import { Router } from "express";
import { AppController } from "../controllers/app.controller";

/**
 * Routes for handling air quality data.
 */
export class AppRoute {
  public router = Router();

  constructor(private appController: AppController) {
    this.setRoute();
  }

   /**
   * Sets up the routes for the Express router.
   */
  private setRoute(): void {
    // Route for getting air quality by longitude and latitude.
    this.router.get("/:longitude/:latitude", this.appController.getAirQuality)

    // Route for getting the most polluted air period in Paris.
    this.router.get("/paris-most-polluted-time", this.appController.getMostPollutedAirPeriod)
  }
}