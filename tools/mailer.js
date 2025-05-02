import { emails } from "../resources/v1/emailRegistry.js";
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

export const getMailTemplate = (template, language = "en") => {
    const templateSet = emails[template];
    if (!templateSet) throw new Error(`Template ${template} not found`);
    const localized = templateSet[language];
    if (!localized) throw new Error(`Language ${language} not found`);
    return localized;
};

export default sendMail;
