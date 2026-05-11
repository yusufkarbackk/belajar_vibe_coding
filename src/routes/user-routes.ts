import { Elysia, t } from "elysia";
import { registerUser } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/api" }).post(
  "/users",
  async ({ body, set }) => {
    try {
      await registerUser(body);
      return { data: "ok" };
    } catch (err) {
      set.status = 400;
      return { error: (err as Error).message };
    }
  },
  {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      password: t.String(),
    }),
  }
);
