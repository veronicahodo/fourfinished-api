import { Log } from "../../tools/logger.js";
import { Task } from "../../services/v1/taskService.js";
import { Tag } from "../../services/v1/tagService.js";
import { Assign } from "../../services/v1/assignService.js";
import { handleError } from "../../tools/handleError.js";

export const getTask = async (req, res) => {
    const unit = "taskController.getTask";

    const { taskId } = req.params;

    try {
        const task = await Task.retrieve(taskId);
        if (!task) {
            await Log.warn(
                unit,
                `Task ${taskId} not found`,
                req.user ? req.user.id : "",
                req.ip
            );
            return res
                .status(404)
                .json({ error: "error:notFound", message: "Task not found" });
        }
        if (!Assign.getRole(task.id, req.user.id)) {
            await Log.warn(
                unit,
                `Tried to load ${task.id} without access`,
                req.user ? req.user.id : "",
                req.ip
            );
            return res.status(403).json({
                error: "error:forbidden",
                message: "You do not have permission to view this task",
            });
        }
        task.tags = await Tag.getTaskTags(task.id);
        task.assignees = await Assign.getAssignees(task.id);
        return res.status(200).json({ data: task });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const postTask = async (req, res) => {
    const unit = "taskController.postTask";

    const { title, description, completion, parent_id, tags } = req.body;

    const outData = {
        owner_id: req.user.id,
        created_at: Date.now(),
        updated_at: Date.now(),
        title,
    };
    if (description) outData.description = description;
    else outData.description = null;
    if (completion) outData.completion = completion;
    else outData.completion = 0;
    if (parent_id) outData.parent_id = parent_id;
    else outData.parent_id = null;

    try {
        const task = await Task.create(outData);
        if (Array.isArray(tags) && tags.length > 0)
            await Tag.add(task.id, tags);
        await Assign.addAssignee(task.id, req.user.id, "edit");
        await Log.info(
            unit,
            `Task ${task.id} created`,
            req.user ? req.user.id : "",
            req.ip
        );
        return res.status(201).json({ data: task });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const putTask = async (req, res) => {
    const unit = "taskController.putTask";

    const { taskId } = req.params;

    const { title, description, completion, tags } = req.body;

    const outData = {};
    if (title !== undefined) outData.title = title;
    if (description !== undefined) outData.description = description;
    if (completion) outData.completion = completion;

    try {
        const exists = Task.retrieve(taskId);
        if (!exists) {
            await Log.warn(
                unit,
                `Tried to update non-existant task ${taskId}`,
                req.user ? req.user.id : "",
                req.ip
            );
            return res
                .status(404)
                .json({ error: "error:notFound", message: "Task not found" });
        }
        const task = await Task.update(taskId, outData);

        if (tags && tags.length > 0) await Tag.update(task.id, tags);

        await Log.info(
            "taskController.putTask",
            `Updated task ${task.id}`,
            req.user ? req.user.ip : "",
            req.ip
        );
        return res.status(200).json({ data: task });
    } catch (error) {
        return await handleError(req, res, "taskController.putTask");
    }
};
