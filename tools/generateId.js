import db from "./db.js";
import { generateBase32String } from "./base32.js";

const generateId = async (table, prefix) => {
    let attempts = 0;
    let id = "";
    let done = false;

    while (!done) {
        if (attempts > 1000)
            throw new Error("Too many attempts to generate id " + prefix);
        id = prefix + generateBase32String(16);
        const exists = await db(table).where({ id }).first();
        if (!exists) done = true;
        attempts++;
    }

    return id;
};

export default generateId;
