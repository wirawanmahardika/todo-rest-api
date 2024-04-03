import { prisma } from "../app/db";

type bodyType = {
    username: string;
    password: string;
};

export default abstract class UserService {
    static async authenticate(body: bodyType): Promise<Response> {
        const user = await prisma.user.findUnique({
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

        return new Response("berhasil login", { status: 200 });
    }
}
