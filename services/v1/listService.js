import db from "../../tools/db.js";
import generateId from "../../tools/generateId.js";

const listTable = "lists";

export const List = {
    async create(data) {
        data.id = await generateId(listTable, "list_");
        await db(listTable).insert(data);
        return data;
    },

    async retrieve(id) {
        return await db(listTable).where({ id }).first();
    },

    async retrieveAll(userId) {
        return await db(listTable).where({ owner_id: userId });
    },

    async update(id, data) {
        return await db(listTable).where({ id }).update(data);
    },

    async delete(id) {
        return await db(listTable).where({ id }).del();
    },
};
