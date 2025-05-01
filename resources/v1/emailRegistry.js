import dotenv from "dotenv";

dotenv.config();

export const emails = {
    test: {
        subject: {
            en: "Testing Email",
        },
        textBody: {
            en: "This is only a test",
        },
        htmlBody: "<h1>This is only a test</h1>",
    },
    verification: {
        subject: `${process.env.APP_NAME} | Email Verification`,
        textBody: `Click or copy the link below to verify your email:

%%VERIFY_LINK%%`,
        htmlBody: `<p>Click or copy the link below to verify your email:</p>
<a href="%%VERIFY_LINK%%">%%VERIFY_LINK%%</a>`,
    },
};
