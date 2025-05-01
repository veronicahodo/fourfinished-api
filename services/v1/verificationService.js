import db from "../../tools/db.js";
import { generateBase32String } from "../../tools/base32.js";
import { emails } from "../../resources/v1/emailRegistry.js";
import sendMail from "../../tools/mailer.js";

const verificationTable = "verification";

export const Verification = {
    async verify(token) {
        const res = await db(verificationTable).where({ token }).first();
        if (!res) return false;
        if (res.expires < Date.now()) return false;
        await db(verificationTable).where({ user_id: res.user_id }).delete();
        return res.user_id;
    },

    async issue(userId) {
        const token = generateBase32String(8);
        await db(verificationTable).where({ user_id: userId }).delete();
        await db(verificationTable).insert({
            user_id: userId,
            expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
            token,
        });

        return token;
    },
};
