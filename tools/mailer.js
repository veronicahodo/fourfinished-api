import db from "./db.js";
import generateId from "./generateId.js";

const mailTable = "mail";

const sendMail = async (to, subject, textBody, htmlBody) => {
    await db(mailTable).insert({
        id: await generateId(mailTable, "mail_"),
        at: Date.now(),
        mail_to: to,
        subject,
        text_body: textBody,
        html_body: htmlBody,
    });
};

export default sendMail;
