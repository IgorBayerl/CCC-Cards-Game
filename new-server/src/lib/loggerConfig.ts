import pino from "pino";

const logger = pino({
  // Set the desired logging level (e.g., "info", "debug", "error")
  level: "info",

  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname",
    },
  },
});

export default logger;
