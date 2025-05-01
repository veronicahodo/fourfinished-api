import { generateBase32String } from "../../tools/base32.js";
import db from "../../tools/db.js";
import { Auth } from "./authService.js";
import generateId from "../../tools/generateId.js";

const userTable = "users";
const resetTable = "password_resets";

export const User = {
    async create(data) {
        data.id = await generateId(userTable, "user_");
        data.password_hash = await Auth.hashPassword(data.password);
        delete data.password;
        await db(userTable).insert(data);
        return await this.retrieve(data.id);
    },

    async retrieve(id) {
        const user = await db(userTable).where({ id }).first();
        if (user) delete user.password_hash;
        return user;
    },

    async retrieveByEmail(email) {
        const user = await db(userTable).where({ email }).first();
        if (user) delete user.password_hash;
        return user;
    },

    async update(id, data) {
        await db(userTable).where({ id }).update(data);
        return await this.retrieve(id);
    },

    async delete(id) {
        await db(userTable).where({ id }).update({ deleted: true });
        return true;
    },

    async login(email, password) {
        const user = await db(userTable).where({ email }).first();
        if (!user) return false;
        if (user.deleted) return false;
        if (!user.verified) throw new Error("User not verified");
        if (!(await Auth.checkPassword(password, user.password_hash))) {
            return false;
        }
        return Auth.generateToken(user);
    },

    async changePassword(userId, oldPassword, newPassword) {
        // We have to bypass this.retrieve because it removes the hash
        const user = db(userTable).where({ id: userId }).first();
        if (!user) throw new Error("User not found");
        if (!Auth.checkPassword(oldPassword, user.password_hash))
            throw new Error("Old password incorrect");
        const updatedUser = this.update(userId, {
            password_hash: Auth.hashPassword(newPassword),
        });
        return updatedUser;
    },

    async initPasswordReset(userId) {
        const token = generateBase32String(8);
        await db(resetTable).insert({
            user_id: userId,
            token,
            expires: Date.now() + 1000 * 60 * 60 * 24,
        });
        return token;
    },

    async verifyPaswordReset(token, newPassword) {
        // purge the db of expired tokens each time someone verifies one
        await db(resetTable).where("expires", "<", Date.now()).delete();
        // do the actual verification
        const res = await db(resetTable).where({ token }).first();
        if (!res) throw new Error("Token not found");
        if (res.expires < Date.now()) throw new Error("Expired");
        await db(resetTable).where({ token }).delete();
        await this.update(res.user_id, {
            password_hash: await Auth.hashPassword(newPassword),
        });
        return res.user_id;
    },
};
