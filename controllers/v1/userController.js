import { Log } from "../../tools/logger.js";
import { User } from "../../services/v1/userService.js";
import { Verification } from "../../services/v1/verificationService.js";
import { emails } from "../../resources/v1/emailRegistry.js";
import sendMail from "../../tools/mailer.js";
import { List } from "../../services/v1/listService.js";
import { Task } from "../../services/v1/taskService.js";
import { handleError } from "../../tools/handleError.js";

export const getUser = async (req, res) => {
    const unit = "userController.getUser";
    const refUserId = req.user ? req.user.id : "";

    const { userId } = req.params;

    const workingUserId = userId ?? req.user.id;

    try {
        const user = await User.retrieve(workingUserId);
        if (!user) {
            Log.warn(
                unit,
                `User ${workingUserId} not found`,
                refUserId,
                req.ip
            );
        }
        return res.status(200).json({ data: user });
    } catch (error) {
        await Log.error(unit, error.message, refUserId, req.ip);
        return res.status(500).json({
            error: "error:internalServerError",
            message: error.message,
        });
    }
};

export const postUser = async (req, res) => {
    const unit = "userController.postUser";
    const refUserId = req.user ? req.user.id : "";

    const { email, password, first_name, last_name, language } = req.body;

    const lang = language ?? "en";

    const taskParams = {
        owner_id: req.user.id,
        completion: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
        archived: 0,
    };

    try {
        // Create the user
        const user = await User.create({
            email,
            password,
            first_name,
            last_name,
            language: lang,
            deleted: false,
            verified: false,
            created_at: Date.now(),
        });
        // Make their first list for them
        const list = await List.create({
            owner_id: req.user.id,
            title: "Welcome!",
            color: "purple",
            icon: "explode",
        });
        // ... and populate it with some tasks
        await Task.create({
            ...taskParams,
            parent_id: list.id,
            title: "Here's your first task 🎉",
            description: "Complete with a description",
        });
        const secondTask = await Task.create({
            ...taskParams,
            parent_id: list.id,
            title: "This is the second task 🤖",
            description: null,
            completion: 20,
        });
        await Task.create({
            ...taskParams,
            parent_id: secondTask.id,
            title: "And this one is nested under it's parent! 🕶️",
            description: null,
        });
        const token = await Verification.issue(user.id);
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
        await Log.info(unit, `User ${user.id} created`, refUserId, req.ip);
        delete user.password_hash;
        return res.status(201).json({ data: user });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const putUser = async (req, res) => {
    const unit = "userController.putUser";
    const refUserId = req.user ? req.user.id : "";

    const { first_name, last_name, language } = req.body;

    const outData = {};
    if (first_name) outData.first_name = first_name;
    if (last_name) outData.last_name = last_name;
    if (language) outData.language = language;

    try {
        const user = await User.retrieve(req.user.id);
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
        await User.update(workingUserId, outData);
        await Log.info(
            unit,
            `User ${workingUserId} updated`,
            refUserId,
            req.ip
        );
        return res.status(200).json({ data: user });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};
