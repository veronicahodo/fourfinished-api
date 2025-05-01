import { Log } from "./logger.js";

export const handleError = async (req, res, unit, error, statusCode = 500) => {
    const userId = req.user ? req.user.id : "";
    const ipAddress = req.ip;

    await Log.error(unit, error.message || String(error), userId, ipAddress);

    return res.status(statusCode).json({
        error: "error:internalServerError",
        message: error.message || "Internal Server Error",
    });
};
