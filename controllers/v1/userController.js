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

    const { userId } = req.params;

    const workingUserId = userId ?? req.user.id;

    try {
        const user = await User.retrieve(workingUserId);
        if (!user) {
            Log.warn(
                unit,
                `User ${workingUserId} not found`,
                req.user ? req.user.id : "",
                req.ip
            );
        }
        return res.status(200).json({ data: user });
    } catch (error) {
        await Log.error(
            unit,
            error.message,
            req.user ? req.user.id : "",
            req.ip
        );
        return res.status(500).json({
            error: "error:internalServerError",
            message: error.message,
        });
    }
};

export const postUser = async (req, res) => {
    const unit = "userController.postUser";

    const { email, password, first_name, last_name } = req.body;

    try {
        // Create the user
        const user = await User.create({
            email,
            password,
            first_name,
            last_name,
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
            owner_id: req.user.id,
            parent_id: list.id,
            title: "Here's your first task 🎉",
            description: "Complete with a description",
            completion: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            archived: 0,
        });
        const secondTask = await Task.create({
            owner_id: req.user.id,
            parent_id: list.id,
            title: "This is the second task 🤖",
            description: null,
            completion: 20,
            created_at: Date.now(),
            updated_at: Date.now(),
            archived: 0,
        });
        await Task.create({
            owner_id: req.user.id,
            parent_id: secondTask.id,
            title: "And this one is nested under it's parent! 🕶️",
            description: null,
            completion: 0,
            created_at: Date.now(),
            updated_at: Date.now(),
            archived: 0,
        });
        const token = await Verification.issue(user.id);
        await sendMail(
            email,
            emails.verification.subject,
            emails.verification.textBody.replace(
                "%%VERIFY_LINK%%",
                `${process.env.APP_URL}/verify/${token}`
            )
        );
        await Log.info(
            unit,
            `User ${user.id} created`,
            req.user ? req.user.id : "",
            req.ip
        );
        delete user.password_hash;
        return res.status(201).json({ data: user });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const putUser = async (req, res) => {
    const unit = "userController.putUser";

    const { first_name, last_name } = req.body;

    const outData = {};
    if (first_name) outData.first_name = first_name;
    if (last_name) outData.last_name = last_name;

    try {
        const user = await User.retrieve(req.user.id);
        if (!user) {
            await Log.warn(
                unit,
                `User ${workingUserId} not found`,
                req.user ? req.user.id : "",
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
            req.user ? req.user.id : "",
            req.ip
        );
        return res.status(200).json({ data: user });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};
