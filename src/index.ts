import { Elysia, t } from "elysia";
import { prisma } from "./app/db";
import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import { todo } from "./types/todo";
import jwt from "@elysiajs/jwt";

const app = new Elysia({
    cookie: {
        secrets: "this is secret cookie",
        sign: ["auth"],
    },
})
    .use(jwt({ name: "jwt", secret: "this is secret jwt okeee!!", exp: "7d" }))
    .use(staticPlugin({ prefix: "/" }))
    .use(
        cors({
            credentials: true,
            maxAge: 3600 * 24,
            methods: ["GET", "POST", "PATCH", "DELETE"],
            origin: ["http://localhost:5500", "http://localhost:3000"],
        })
    )
    .group("/api/v1/todo", (app) =>
        app
            .onBeforeHandle(async ({ jwt, cookie: { auth } }) => {
                const userData = await jwt.verify(auth.value);
                if (!userData) {
                    return new Response("you are not allowed", { status: 401 });
                }
            })
            .post(
                "/",
                async ({ body, set }) => {
                    const response = await prisma.todo.create({ data: body });

                    set.status = 201;
                    return {
                        message: "Berhasil membuat todo baru",
                        data: response,
                    };
                },
                {
                    body: t.Object({
                        activity: t.String(),
                        id_user: t.Number(),
                    }),
                }
            )
            .get("/", async () => {
                const data = await prisma.todo.findMany();
                return data;
            })
    )
    .group("/api/v1/user", (app) =>
        app
            .post(
                "/login",
                async ({ jwt, body, cookie }) => {
                    const user = await prisma.user.findFirst({
                        where: { username: body.username },
                    });

                    if (!user) {
                        return new Response("username tidak pernah terdaftar", {
                            status: 401,
                        });
                    }

                    if (body.password !== user.password) {
                        return new Response("password salah", {
                            status: 401,
                        });
                    }

                    cookie.auth.set({
                        value: await jwt.sign({ username: body.username }),
                        maxAge: 3600 * 24 * 7,
                        path: "/",
                        httpOnly: true,
                        sameSite: "strict",
                    });

                    return `sign in successfully`;
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
                return `berhasil logout`;
            })
    )
    .onError(({ code, set }) => {
        if (code === "NOT_FOUND") {
            return new Response("Resource Not Found", { status: 404 });
        }

        if (code === "VALIDATION") {
            set.status = 422;
            return {
                message: "invalid body request",
                code: 422,
            };
        }

        set.status = 500;
        return {
            message: "INTERNAL SERVER ERROR",
            code: 500,
        };
    });

app.listen(3000, (app) =>
    console.log(`🦊 Elysia is running at ${app?.hostname}:${app?.port}`)
);
