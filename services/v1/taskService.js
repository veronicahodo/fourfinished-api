import db from "../../tools/db.js";
import generateId from "../../tools/generateId.js";

const taskTable = "tasks";

export const Task = {
    async create(data) {
        data.id = await generateId(taskTable, "task_");
        await db(taskTable).insert(data);
        return await this.retrieve(data.id);
    },

    async retrieve(id) {
        return await db(taskTable).where({ id }).first();
    },

    async update(id, data) {
        await db(taskTable).where({ id }).update(data);
        return await this.retrieve(id);
    },

    async delete(id) {
        return await db(taskTable).where({ id }).del();
    },

    async listByUser(userId) {
        return await db(taskTable).where({ user_id: userId });
    },

    async listChildren(parentId) {
        return await db(taskTable).where({ parent_id: parentId });
    },

    async changeOwnership(taskId, newOwnerId) {
        return await db(taskTable)
            .where({ task_id: taskId })
            .update({ owner_id: newOwnerId });
    },
};
