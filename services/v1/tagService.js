import db from "../../tools/db.js";

const tagTable = "tags";

export const Tag = {
    async add(taskId, tags) {
        for (const tag of tags) {
            await db(tagTable).insert({
                task_id: taskId,
                tag,
            });
        }
    },

    async remove(taskId, tag) {
        await db(tagTable)
            .where({
                task_id: taskId,
                tag,
            })
            .del();
    },

    async update(taskId, tags) {
        await db(tagTable)
            .where({
                task_id: taskId,
            })
            .del();

        await this.add(taskId, tags);
    },

    async getTaskTags(taskId) {
        const tags = await db(tagTable).where({ task_id: taskId });
        return tags.map((tag) => tag.tag);
    },
};
