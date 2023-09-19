import express, { Request, Response, Application } from "express";
import { AppService } from "./services/app.service";
import { AppRoute } from "./routes/app.route";
import { AppController } from "./controllers/app.controller";
import { CronManager } from "./services/cron-manager";

/**
 * Represents an Express application.
 * Use this class to create and configure an Express app instance.
 */
class App {
  public app: Application;

  /**
   * Initializes a new instance of the App class.
   * Creates an Express application and sets up the routes.
   */
  constructor() {
    this.app = express();
    this.setupRoutes();
    this.setUpCronJobs();
  }

  /**
   * Configures the routes for the Express application.
   * Add custom routes here.
   */
  private setupRoutes(): void {
    const appService: AppService = new AppService();
    const appController: AppController = new AppController(appService);
    const appRoute: AppRoute = new AppRoute(appController);

    // Welcome Route
    this.app.get("/", (_: Request, res: Response) => {
      res.status(200).json({ message: "Hello There!" });
    });

    //air-quality route
    this.app.use("/api/get-air-quality", appRoute.router);
  }

  /**
   * Sets up cron jobs for scheduled tasks.
   * This method initializes a CronManager instance and runs the 'checkAirQuality' cron job.
   * If an error occurs during job execution, it is logged.
   */
  private async setUpCronJobs(): Promise<void> {
    const cronManager: CronManager = new CronManager(new AppService());
    try {
      await cronManager.checkAirQuality();
    } catch (error: Error | any) {
      console.error(
        "An error occurred while running the cron job:",
        error.message
      );
    }
  }
}

export default App;
