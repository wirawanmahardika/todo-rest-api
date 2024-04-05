import { Elysia, t } from "elysia";
import userGroup from "./group/user-group";
import todoGroup from "./group/todo-group";
import corsConf from "./config/cors";
import { cookieConf } from "./config/cookie";
import swagger from "@elysiajs/swagger";

const app = new Elysia({
    cookie: cookieConf(),
})
    .use(swagger())
    .use(corsConf())
    .use(userGroup)
    .use(todoGroup)
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
