import Elysia, { t } from "elysia";
import { prisma } from "../app/db";
import { jwtConf } from "../config/jwt";
import TodoService from "../service/todo-service";

const todoGroup = new Elysia({ prefix: "/api/v1/todo" })
    .use(jwtConf())
    .state({ username: "" })
    .onBeforeHandle(async ({ jwt, store, cookie: { auth } }) => {
        const userData = await jwt.verify(auth.value);
        if (!userData)
            return new Response("you are not allowed", { status: 401 });

        store.username = String(userData.username);
    })
    .post(
        "/",
        async ({ body, set, store }) => {
            const idUser = await TodoService.getIdUser(store.username);
            const response = await prisma.todo.create({
                data: { id_user: idUser, activity: body.activity },
            });

            set.status = 201;
            return {
                message: "Berhasil membuat todo baru",
                data: response,
            };
        },
        {
            body: t.Object({
                activity: t.String(),
            }),
        }
    )
    .get("/", async ({ store }) => {
        const idUser = await TodoService.getIdUser(store.username);
        const data = await prisma.todo.findMany({ where: { id_user: idUser } });
        return data;
    })
    .delete(
        "/:id",
        async ({ params, store }) => {
            const idUser = await TodoService.getIdUser(store.username);

            await prisma.$transaction(async (p) => {
                const countTodo = await p.todo.count({
                    where: { id: params.id, id_user: idUser },
                });

                if (countTodo === 0) return;

                await p.todo.delete({
                    where: { id: params.id, id_user: idUser },
                });
            });

            return new Response("Berhasil menghapus todo", { status: 200 });
        },

        { params: t.Object({ id: t.Numeric() }) }
    )
    .patch(
        "/:id",
        async ({ params, body, store }) => {
            const idUser = await TodoService.getIdUser(store.username);
            await prisma.$transaction(async (p) => {
                const countTodo = await p.todo.count({
                    where: { id: params.id, id_user: idUser },
                });

                if (countTodo === 0) return;

                await prisma.todo.update({
                    where: { id: params.id, id_user: idUser },
                    data: body,
                });
            });

            return "Berhasil mengubah todo";
        },
        {
            body: t.Object({
                activity: t.String(),
                finished: t.Boolean(),
            }),
            params: t.Object({
                id: t.Numeric(),
            }),
        }
    );

export default todoGroup;
