import { prisma } from "../app/db";

export default class TodoService {
    static async getIdUser(username: string): Promise<number> {
        const userdata = await prisma.user.findUnique({
            where: { username: username },
            select: { id: true },
        });

        if (!userdata?.id) {
            throw new Error("user tidak ditemukan");
        }
        return userdata?.id;
    }
}
