import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./configs/env";
import v1_router from "./routers/v1/router.v1";
import { not_found_handler } from "./middlewares/middleware.error";

const app = express();

app.use(
    cors({
        origin: [env.WEB_ORIGIN],
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", v1_router);

app.use(not_found_handler);

const server = app.listen(env.SERVER_PORT, () => {
    console.log(`Server running on port ${env.SERVER_PORT}`);
});

const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}, shutting down gracefully...`);
    server.close((err) => {
        if (err) {
            console.error("Error during shutdown:", err);
            process.exit(1);
        }
        console.log("Server closed.");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("Forced shutdown after 10s timeout.");
        process.exit(1);
    }, 10_000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
