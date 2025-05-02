import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import { Log } from "./tools/logger.js";

import userRoutes from "./routes/v1/userRoutes.js";
import taskRoutes from "./routes/v1/taskRoutes.js";
import assignRoutes from "./routes/v1/assignRoutes.js";
import listRoutes from "./routes/v1/listRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/v1/user", userRoutes);
app.use("/v1/task", taskRoutes);
app.use("/v1/assign", assignRoutes);
app.use("/v1/list", listRoutes);

// "Oh shit, we didn't match anything else."
app.use("/", (req, res) => {
    Log.warn("server", `Route ${req.originalUrl} not found`, "", req.ip);
    return res.status(404).json({
        error: "error:notFound",
        message: "Route not found",
    });
});

const httpPort = process.env.SERVER_HTTP_PORT;
const httpsPort = process.env.SERVER_HTTPS_PORT;

const httpServer = http.createServer(app);
const httpsServer = https.createServer(app);

httpServer.listen(httpPort, async () => {
    await Log.general(
        "start",
        "startup",
        `HTTP Server running on port ${httpPort}`,
        "",
        ""
    );
});

httpsServer.listen(httpsPort, async () => {
    await Log.general(
        "start",
        "startup",
        `HTTPS Server running on port ${httpsPort}`,
        "",
        ""
    );
});
