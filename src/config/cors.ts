import cors from "@elysiajs/cors";

const corsConf = () => {
    return cors({
        credentials: true,
        maxAge: 3600 * 24,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        origin: true,
        allowedHeaders: ["Content-Type"],
    });
};
export default corsConf;
