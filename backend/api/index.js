"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("../src/app");
const app = (0, app_1.createApp)();
// Debugging rewrite issues on Vercel
app.all('*', (req, res, next) => {
    console.log(`[Backend] Request path: ${req.path}`);
    next();
});
exports.default = app;
