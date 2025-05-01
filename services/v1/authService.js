import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const Auth = {
    checkPassword(password, hash) {
        return bcrypt.compare(password, hash);
    },

    hashPassword(password) {
        return bcrypt.hash(password, 10);
    },

    generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );
    },
};
