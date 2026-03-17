import { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from "../src/app";
const app = createApp();

// Debugging rewrite issues on Vercel
app.all('*', (req, res, next) => {
  console.log(`[Backend] Request path: ${req.path}`);
  next();
});

export default app;
