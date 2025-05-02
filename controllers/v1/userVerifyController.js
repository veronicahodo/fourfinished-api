import { Log } from "../../tools/logger.js";
import { User } from "../../services/v1/userService.js";
import { Verification } from "../../services/v1/verificationService.js";
import { handleError } from "../../tools/handleError.js";
import sendMail, { getMailTemplate } from "../../tools/mailer.js";
import { emails } from "../../resources/v1/emailRegistry.js";
import { body } from "express-validator";

export const postUserVerify = async (req, res) => {
    const unit = "userVerifyController.postUserVerify";
    const refUserId = req.user ? req.user.id : "";

    const { token } = req.params;

    try {
        const user = await Verification.verify(token);
        if (!user) {
            await Log.warn(
                unit,
                `Verification token ${token} not found`,
                refUserId,
                req.ip
            );
            return res.status(404).json({
                error: "error:notFound",
                message: "Verification token not found",
            });
        }
        await User.update(user.id, { verified: true });
        await Log.info(
            "userController.postUserVerify",
            `User ${user.id} verified`,
            refUserId,
            req.ip
        );
        return res.status(200).json({ data: user });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const postUserVerifyResend = async (req, res) => {
    const unit = "userVerifyController.postUserVerifyResend";
    const refUserId = req.user ? req.user.id : "";

    const { userId } = req.params;
    const workingUserId = userId ?? req.user.id;
    try {
        const user = await User.retrieve(workingUserId);
        if (!user) {
            await Log.warn(
                unit,
                `User ${workingUserId} not found`,
                refUserId,
                req.ip
            );
            return res.status(404).json({
                error: "error:notFound",
                message: "User not found",
            });
        }
        if (user.verified) {
            await Log.warn(
                unit,
                `User ${workingUserId} already verified`,
                refUserId,
                req.ip
            );
            return res.status(400).json({
                error: "error:badRequest",
                message: "User already verified",
            });
        }
        const token = await Verification.issue(user.id);
        // Send email again.
        const { subject, textBody, htmlBody } = getMailTemplate(
            "verifcation",
            user.language
        );
        const tag = "%%VERIFY_LINK%%";
        const value = `${process.env.APP_URL}/verify/${token}`;
        await sendMail(
            user.email,
            subject,
            textBody.replace(tag, value),
            htmlBody.replace(tag, value)
        );
        await Log.info(
            unit,
            `Verification token issued for user ${user.id}`,
            refUserId,
            req.ip
        );
        return res.status(200).json({ data: user });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};
