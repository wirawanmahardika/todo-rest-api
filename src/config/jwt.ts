import jwt from "@elysiajs/jwt";

export const jwtConf = () =>
    jwt({
        name: "jwt",
        secret: "this is secret jwt okeee!!",
        exp: "7d",
    });
