import config from "@colyseus/tools";
import {monitor} from "@colyseus/monitor";
import {playground} from "@colyseus/playground";
import logger from "./lib/loggerConfig";

/**
 * Import your Room files
 */
import {MyRoom} from "./rooms/MyRoom";

/**
 * Import your API endpoint handlers:
 */
import deckRoutes from "./routes/deckRoutes";

export default config({
  initializeGameServer: gameServer => {
    /**
     * Define your room handlers:
     */
    gameServer.define("my_room", MyRoom);

    //@ts-ignore
    global.gameServer = gameServer;
  },

  initializeExpress: app => {
    app.get("/hello_world", (req, res) => {
      res.send("Hello Cyber Chaos Cards!");
    });

    app.use("/decks", deckRoutes);

    /**
     * Use @colyseus/playground
     * (It is not recommended to expose this route in a production environment)
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/", playground);
    }

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/colyseus", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
    logger.info("Access Colyeus Monitor at http://localhost:2567/colyseus");
    logger.info("Access Colyeus Playground at http://localhost:2567/");
    logger.info("Access game client at http://localhost:3000/");
  },
});
