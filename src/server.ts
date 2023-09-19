import appConfig from "./config/app-config";
import App from "./app"


const { PORT } = appConfig

const SERVER_PORT: number = parseInt(PORT as string, 10);

const app = new App().app;
app.listen(SERVER_PORT, () => {
  console.log(`Listening on port ${PORT}`)
});


