import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.PORT, () => {
  console.info(`Backend listening on http://localhost:${env.PORT}`);
});

