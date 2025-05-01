import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const db = knex({
    client: "mysql2",
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        charset: "utf8mb4_unicode_ci",
    },
});

export default db;
