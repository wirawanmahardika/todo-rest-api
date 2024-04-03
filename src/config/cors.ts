import cors from "@elysiajs/cors";

const corsConf = () => {
    return cors({
        credentials: true,
        maxAge: 3600 * 24,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        origin: ["http://localhost:5500", "http://localhost:3000"],
    });
};
export default corsConf;
