import {Config} from "drizzle-kit";

const config: Config = {
  schema: "./database/schema.ts",
  out: "./database/migrations",
  driver: "better-sqlite",
};

export default config;
