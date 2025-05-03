import { List } from "../../services/v1/listService.js";
import { Task } from "../../services/v1/taskService.js";
import { handleError } from "../../tools/handleError.js";
import { Log } from "../../tools/logger.js";

export const postList = async (req, res) => {
    const unit = "listController.postList";
    const refUserId = req.user ? req.user.id : "";

    const { title, color, icon } = req.body;

    const outData = { title, owner_id: req.user.id };
    if (color) outData.color = color;
    if (icon) outData.icon = icon;

    try {
        const list = await List.create(outData);
        if (!list) {
            await Log.error(
                unit,
                `Could not create list with title ${title}`,
                refUserId,
                req.ip
            );
            return res.status(500).json({
                error: "error:internalServerError",
                message: "Could not create list",
            });
        }
        await Log.info(unit, `Created list ${list.id}`, refUserId, req.ip);
        return res.status(201).json({ data: list });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const getList = async (req, res) => {
    const unit = "listController.getList";
    const refUserId = req.user ? req.user.id : "";

    const { listId } = req.params;

    try {
        const list = await List.retrieve(listId);
        if (!list) {
            await Log.warn(unit, `List ${listId} not found`, refUserId, req.ip);
            return res
                .status(404)
                .json({ error: "error:notFound", message: "List not found" });
        }
        if (list.owner_id !== req.user.id) {
            await Log.warn(
                unit,
                `List ${list.id} tried to load without access`,
                refUserId,
                req.ip
            );
            return res.status(403).json({
                error: "error:forbidden",
                message: "You do not have access to that",
            });
        }
        await Log.info(unit, `List ${listId} retrieved`, refUserId, req.ip);
        return res.status(200).json({ data: list });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const getListAll = async (req, res) => {
    const unit = "listController.getListAll";
    const refUserId = req.user ? req.user.id : "";

    try {
        const lists = await List.retrieveAll(req.user.id);
        if (lists.length === 0) {
            await Log.warn(
                unit,
                `Could not find any lists for ${req.user.id}`,
                refUserId,
                req.ip
            );
            return res
                .status(404)
                .json({ error: "error:notFound", message: "No lists found" });
        }
        await Log.info(
            unit,
            `Retrieved lists for ${req.user.id}`,
            refUserId,
            req.ip
        );
        return res.status(200).json({ data: lists });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const putList = async (req, res) => {
    const unit = "listController.putList";
    const refUserId = req.user ? req.user.id : "";

    const { listId } = req.params;

    const { title, color, icon } = req.body;

    const outData = {};
    if (title) outData.title = title;
    if (color) outData.color = color;
    if (icon) outData.icon = icon;

    try {
        let list = await List.retrieve(listId);
        if (!list) {
            await Log.warn(unit, `List ${listId} not found`, refUserId, req.ip);
            return res
                .status(404)
                .json({ error: "error:notFound", message: "List not found" });
        }
        list = await List.update(listId, outData);
        await Log.info(unit, `List ${list.id} updated`, refUserId, req.ip);
        return res.status(200).json({ data: list });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};

export const deleteList = async (req, res) => {
    const unit = "listController.deleteList";
    const refUserId = req.user ? req.user.id : "";

    const { listId } = req.params;

    try {
        const list = await List.retrieve(listId);
        if (!list) {
            await Log.warn(unit, `List ${listId} not found`, refUserId, req.ip);
            return res
                .status(404)
                .json({ error: "error:notFound", message: "List not found" });
        }
        const children = await Task.listChildren(list.id);
        if (children && children.length > 0) {
            await Log.warn(
                unit,
                `List ${list.id} has children and cannot be deleted.`,
                refUserId,
                req.ip
            );
        }
        if (list.owner_id !== req.user.id) {
            await Log.warn(
                unit,
                `Tried to delete ${listId} without access`,
                refUserId,
                req.ip
            );
            return res.status(403).json({ error: "error:forbidden" });
        }
        await List.delete(listId);
        await Log.info(unit, `Deleted list ${listId}`, refUserId, req.ip);
        return res.status(200).json({ data: null });
    } catch (error) {
        return await handleError(req, res, unit, error);
    }
};
