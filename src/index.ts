import { Elysia } from "elysia";

const app = new Elysia()
  .get("/health", () => ({ status: "ok" }))
  .listen(3000);

console.log(`Server running at http://localhost:${app.server?.port}`);
