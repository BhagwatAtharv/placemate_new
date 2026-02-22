import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { migrate } from "./db/migrate.js";
import { createApp } from "./app.js";

async function start() {
  await pool.query("SELECT 1");
  await migrate();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
