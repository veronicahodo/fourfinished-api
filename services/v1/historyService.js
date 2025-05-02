import db from "../../tools/db.js";

const historyTable = "history";

export const History = {
    async add(taskId, userId, message, systemMessage) {
        await db(historyTable).insert({
            at: Date.now(),
            user_id: userId,
            message: message,
            system_message: systemMessage,
        });
        return true;
    },

    async retrieve(taskId) {
        return await db(historyTable).where({ task_id: taskId });
    },
};
