import { Log } from "../../tools/logger.js";
import { Task } from "../../services/v1/taskService.js";
import { Tag } from "../../services/v1/tagService.js";
import { Assign } from "../../services/v1/assignService.js";
import { handleError } from "../../tools/handleError.js";
import { History } from "../../services/v1/historyService.js";
import { List } from "../../services/v1/listService.js";

export const getTask = async (req, res) => {
    const unit = "taskController.getTask";
    const refUserId = req.user ? req.user.id : "";

    const { taskId } = req.params;

    try {
        const task = await Task.retrieve(taskId);
        if (!task) {
            await Log.warn(unit, `Task ${taskId} not found`, refUserId, req.ip);
            return res
                .status(404)
                .json({ error: "error:notFound", message: "Task not found" });
        }
        if (!Assign.getRole(task.id, req.user.id)) {
            await Log.warn(
                unit,
                `Tried to load ${task.id} without access`,
                refUserId,
                req.ip
            );
            return res.status(403).json({
                error: "error:forbidden",
                message: "You do not have permission to view this task",
            });
        }
        task.tags = (await Tag.getTaskTags(task.id)) ?? [];
        task.assignees = (await Assign.getAssignees(task.id)) ?? [];
        task.history = (await History.retrieve(task.id)) ?? [];
        return res.status(200).json({ data: task });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const getTaskChildren = async (req, res) => {
    const unit = "taskController.getTaskChildren";
    const refUserId = req.user ? req.user.id : "";

    const { taskId } = req.params;

    try {
        let exists;
        if (taskId.startsWith("task_")) exists = await Task.retrieve(taskId);
        else exists = await List.retrieve(taskId);
        if (!exists) {
            await Log.warn(
                unit,
                `Parent ${taskId} not found`,
                refUserId,
                req.ip
            );
            return res.status(400).json({
                error: "error:badRequest",
                message: "Parent not found",
            });
        }
        //  because fuck
        const demKids = await Task.listChildren(taskId);

        const outArray = [];

        for (const kid of demKids) {
            outArray.push({
                ...kid,
                tags: (await Tag.getTaskTags(kid.id)) ?? [],
                assignees: (await Assign.getAssignees(kid.id)) ?? [],
                history: (await History.retrieve(kid.id)) ?? [],
            });
        }
        await Log.info(
            unit,
            `Retrieved children of ${taskId}`,
            refUserId,
            req.ip
        );
        return res.status(200).json({ data: outArray });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};
export const postTask = async (req, res) => {
    const unit = "taskController.postTask";
    const refUserId = req.user ? req.user.id : "";

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
        if (tags && Array.isArray(tags) && tags.length > 0)
            await Tag.add(task.id, tags);
        await Assign.addAssignee(task.id, req.user.id, "manage");
        await Log.info(unit, `Task ${task.id} created`, refUserId, req.ip);
        return res.status(201).json({ data: task });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const putTask = async (req, res) => {
    const unit = "taskController.putTask";
    const refUserId = req.user ? req.user.id : "";

    const { taskId } = req.params;

    const { title, description, completion, tags } = req.body;

    const outData = {};
    if (title !== undefined) outData.title = title;
    if (description !== undefined) outData.description = description;
    if (completion !== undefined) outData.completion = completion;

    try {
        const exists = Task.retrieve(taskId);
        if (!exists) {
            await Log.warn(
                unit,
                `Tried to update non-existant task ${taskId}`,
                refUserId,
                req.ip
            );
            return res
                .status(404)
                .json({ error: "error:notFound", message: "Task not found" });
        }
        const task = await Task.update(taskId, outData);
        task.completion = Number(completion);
        if (tags && tags.length > 0) await Tag.update(task.id, tags);

        await Log.info(unit, `Updated task ${task.id}`, refUserId, req.ip);
        return res.status(200).json({ data: task });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const postTaskNote = async (req, res) => {
    const unit = "taskController.postTaskNode";
    const refUserId = req.user ? req.user.id : "";

    const { taskId } = req.params;

    const { message } = req.body;

    try {
        const task = await Task.retrieve(taskId);
        if (!task) {
            await Log.warn(unit, `Task ${taskId} not found`, refUserId, req.ip);
            return res
                .status(404)
                .json({ error: "error:notFound", message: "Task not found" });
        }
        await History.add(taskId, refUserId, message, 0);
        await Log.info(unit, `Added note to ${taskId}`, refUserId, req.ip);
        return res.status(201).json({ data: true });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};
