import jwt from "jsonwebtoken";
import { Log } from "../tools/logger.js";

export const secureAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                await Log.error(
                    "userAuthController.postUserAuthenticate",
                    err.message,
                    "",
                    req.ip
                );
                return res
                    .status(401)
                    .json({
                        error: "error:tokenInvalid",
                        message: err.message,
                    });
            }
            req.user = decoded;
            next();
        });
    } else {
        return res.status(401).json({ error: "error:noToken" });
    }
};
