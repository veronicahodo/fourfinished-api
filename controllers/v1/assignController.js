import { Assign } from "../../services/v1/assignService.js";
import { Task } from "../../services/v1/taskService.js";
import { User } from "../../services/v1/userService.js";
import { handleError } from "../../tools/handleError.js";
import { Log } from "../../tools/logger.js";

export const postAssign = async (req, res) => {
    const unit = "assignController.postAssign";
    const refUserId = req.user ? req.user.id : "";

    const { taskId, userId, role } = req.params;

    try {
        const task = Task.retrieve(taskId);
        if (!task) {
            await Log.warn(unit, `Task ${taskId} not found`, refUserId, req.ip);
            return res
                .status(404)
                .json({ error: "error:notFound", message: "Task not found" });
        }
        const user = User.retrieve(userId);
        if (!user) {
            await Log.warn(unit, `User ${userId} not found`, refUserId, req.ip);
            return res
                .status(404)
                .json({ error: "error:notFound", message: "User not found" });
        }
        if ((await Assign.getRole(task.id, user.id)) !== "manage") {
            await Log.warn(
                unit,
                `User is not a manager of ${task.id}`,
                refUserId,
                req.ip
            );
            return res.status(403).json({
                error: "error:forbidden",
                message: "User is not a manager of this task",
            });
        }
        await Assign.addAssignee(task.id, user.id, role);
        await Log.info(
            unit,
            `${user.id} assigned to ${task.id} with ${role} access`,
            refUserId,
            req.ip
        );
        return res.status(200).json({ data: true });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const putAssign = async (req, res) => {
    const unit = "assignController.putAssign";
    const refUserId = req.user ? req.user.id : "";

    const { taskId, userId, role } = req.params;

    try {
        if (!(await Assign.getRole(taskId, userId))) {
            await Log.warn(
                unit,
                `Tried to unassign ${userId} from ${taskId} when not assigned`,
                refUserId,
                req.ip
            );
            return res
                .status(400)
                .json({
                    error: "error:badRequest",
                    message: "User is not assigned to this task",
                });
        }
        if ((await Assign.getRole(taskId, req.user.id)) !== "manage") {
            await Log.warn(
                unit,
                `User not a manager of ${taskId}`,
                refUserId,
                req.ip
            );
            return res.status(403).json({
                error: "error:forbidden",
                message: "You are not a manager of this task",
            });
        }
        await Assign.updateRole(taskId, userId, role);
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const deleteAssign = async (req, res) => {
    const unit = "assignController.deleteAssign";
    const refUserId = req.user ? req.user.id : "";

    const { taskId, userId } = req.params;

    try {
        if (!(await Assign.getRole(taskId, userId))) {
            await Log.warn(
                unit,
                `Tried to unassign ${userId} from ${taskId} when not assigned`,
                refUserId,
                req.ip
            );
            return res
                .status(400)
                .json({
                    error: "error:badRequest",
                    message: "User is not assigned to this task",
                });
        }
        if ((await Assign.getRole(taskId, req.user.id)) !== "manage") {
            await Log.warn(
                unit,
                `User not a manager of ${taskId}`,
                refUserId,
                req.ip
            );
            return res.status(403).json({
                error: "error:forbidden",
                message: "You are not a manager of this task",
            });
        }
        await Assign.removeAssignee(taskId, userId);
        await Log.info(
            unit,
            `Removed ${userId} from ${taskId}`,
            refUserId,
            req.ip
        );
        return res.status(200).json({ data: true });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};
