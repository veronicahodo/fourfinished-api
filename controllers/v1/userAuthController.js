import { User } from "../../services/v1/userService.js";
import { handleError } from "../../tools/handleError.js";
import { Log } from "../../tools/logger.js";

export const postUserAuthenticate = async (req, res) => {
    const unit = "userAuthController.postUserAuthenticate";
    const { email, password } = req.body;

    try {
        const token = await User.login(email, password);
        if (!token) {
            await Log.warn(unit, `${email} failed to authenticate`, "", req.ip);
            return res.status(400).json({
                error: "error:invalidCredientials",
                message: "Invalid credentials",
            });
        }
        await Log.info(unit, `${email} successfully authenticated`, "", req.ip);
        return res.status(200).json({ data: token });
    } catch (error) {
        if (error.message === "User not verified") {
            await Log.warn(
                unit,
                `${email} tried to log in unverified`,
                "",
                req.ip
            );
            return res.status(400).json({
                error: "error:userNotVerified",
                message: error.message,
            });
        }
        return await handleError(req, res, unit, error);
    }
};
