import db from "./db.js";

const logTable = "logs";

const icons = {
    start: "🚀",
    stop: "🛑",
    info: "🔷",
    warn: "⚠️",
    error: "❌",
};

export const Log = {
    async general(severity, unit, message, user, ipAddress) {
        await db(logTable).insert({
            at: Date.now(),
            severity,
            unit,
            message,
            user_id: user,
            ip_address: ipAddress,
        });
        console.log(
            `${new Date().toISOString()} ${
                icons[severity] || ""
            } [${unit}] ${message} :: ${user} / ${ipAddress}`
        );
    },

    async info(unit, message, user, ipAddress) {
        await this.general("info", unit, message, user, ipAddress);
    },

    async warn(unit, message, user, ipAddress) {
        await this.general("warn", unit, message, user, ipAddress);
    },

    async error(unit, message, user, ipAddress) {
        await this.general("error", unit, message, user, ipAddress);
    },
};
