import db from "../../tools/db.js";

const assigneeTable = "assignees";

export const Assign = {
    async addAssignee(taskId, userId, role) {
        await db(assigneeTable).insert({
            task_id: taskId,
            user_id: userId,
            role,
        });
        return true;
    },

    async removeAssignee(taskId, userId) {
        await db(assigneeTable)
            .where({
                task_id: taskId,
                user_id: userId,
            })
            .del();
        return true;
    },

    async getAssignees(taskId) {
        const assignees = await db(assigneeTable).where({
            task_id: taskId,
        });

        return assignees.map((assignee) => assignee.user_id);
    },

    async getRole(taskId, userId) {
        const assignee = await db(assigneeTable)
            .where({
                task_id: taskId,
                user_id: userId,
            })
            .first();

        if (!assignee) return false;
        return assignee.role;
    },
};
