import config from "@colyseus/tools";
import {monitor} from "@colyseus/monitor";
import {playground} from "@colyseus/playground";
import logger from "./lib/loggerConfig";
import cors from "cors";

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
  },

  initializeExpress: app => {
    app.use(cors());

    app.get("/hello_world", (req, res) => {
      res.send("Hello Cyber Chaos Cards!");
    });

    /**
     * Used to check if the game server is online.
     */
    app.get("/ping", (req, res) => {
      res.send("pong");
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
    logger.info("Access Rest API at http://localhost:2567/");
  },
});
