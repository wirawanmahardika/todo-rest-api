import { CookieOptions } from "elysia";

export const cookieConf = () => {
    return {
        secrets: "this is secret cookie",
        sign: ["auth"],
    };
};