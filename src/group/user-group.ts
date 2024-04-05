import Elysia, { t } from "elysia";
import { jwtConf } from "../config/jwt";
import UserService from "../service/user-service";
import { prisma } from "../app/db";

const userGroup = new Elysia({ prefix: "/api/v1/user" })
    .use(jwtConf())
    .get("/info", async ({ jwt, cookie: { auth } }) => {
        const userData = await jwt.verify(auth.value);
        if (!userData) {
            return new Response("Login is needed", { status: 401 });
        }

        return "user is authenticated";
    })
    .post(
        "/signup",
        async ({ body }) => {
            await prisma.user.create({ data: body });
            return "berhasil signup";
        },
        {
            body: t.Object({
                fullname: t.String(),
                email: t.String({
                    format: "email",
                    error: "email is not valid",
                }),
                username: t.String({
                    minLength: 6,
                    error: "username length should be more than 5",
                }),
                password: t.String(),
            }),
        }
    )
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
