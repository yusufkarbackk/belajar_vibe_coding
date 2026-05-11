import { Elysia } from "elysia";
import { userRoutes } from "./routes/user-routes";

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .use(userRoutes)
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
