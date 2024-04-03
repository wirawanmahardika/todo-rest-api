import Elysia, { t } from "elysia";
import { prisma } from "../app/db";
import { jwtConf } from "../config/jwt";

const todoGroup = new Elysia({ prefix: "/api/v1/todo" })
    .use(jwtConf())
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
    });

export default todoGroup;