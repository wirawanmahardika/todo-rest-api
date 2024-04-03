import Elysia, { t } from "elysia";
import { jwtConf } from "../config/jwt";
import UserService from "../service/user-service";

const userGroup = new Elysia({ prefix: "/api/v1/user" })
    .use(jwtConf())
    .post(
        "/login",
        async ({ jwt, body, cookie }) => {
            const authResponse = await UserService.authenticate(body);
            if (authResponse.status < 300) {
                cookie.auth.set({
                    value: await jwt.sign({ username: body.username }),
                    maxAge: 3600 * 24 * 7,
                    path: "/",
                    httpOnly: true,
                    sameSite: "strict",
                });
            }

            return authResponse;
        },
        {
            body: t.Object({
                username: t.String(),
                password: t.String(),
            }),
        }
    )
    .delete("/logout", ({ cookie }) => {
        cookie.auth.remove();
        return `Berhasil logout`;
    });

export default userGroup;
