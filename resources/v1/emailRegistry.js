import dotenv from "dotenv";

dotenv.config();

export const emails = {
    test: {
        en: {
            subject: "Testing Email",
            textBody: "This is only a test",
            htmlBody: "<h1>This is only a test</h1>",
        },
        es: {
            subject: "Correo de prueba",
            textBody: "Esto es solo una prueba",
            htmlBody: "<h1>Esto es solo una prueba</h1>",
        },
    },
    verification: {
        en: {
            subject: `${process.env.APP_NAME} | Email Verification`,
            textBody: `Click or copy the link below to verify your email:\n\n%%VERIFY_LINK%%`,
            htmlBody: `<p>Click or copy the link below to verify your email:</p><a href="%%VERIFY_LINK%%">%%VERIFY_LINK%%</a>`,
        },
        es: {
            subject: `${process.env.APP_NAME} | Verificación de correo`,
            textBody: `Haz clic o copia el siguiente enlace para verificar tu correo:\n\n%%VERIFY_LINK%%`,
            htmlBody: `<p>Haz clic o copia el siguiente enlace para verificar tu correo:</p><a href="%%VERIFY_LINK%%">%%VERIFY_LINK%%</a>`,
        },
    },
};
