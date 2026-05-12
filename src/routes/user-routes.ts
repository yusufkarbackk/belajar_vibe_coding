import { Elysia, t } from "elysia";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/api" })
  .post(
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
  )
  .post(
    "/users/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body);
        return { data: token };
      } catch (err) {
        set.status = 401;
        return { error: (err as Error).message };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
    }
  )
  .get("/users/current", async ({ headers, set }) => {
    const authorization = headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "unauthorized" };
    }

    const token = authorization.slice(7);

    try {
      const user = await getCurrentUser(token);
      return { data: user };
    } catch {
      set.status = 401;
      return { error: "unauthorized" };
    }
  })
  .delete("/users/logout", async ({ headers, set }) => {
    const authorization = headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "unauthorized" };
    }

    const token = authorization.slice(7);

    try {
      await logoutUser(token);
      return { data: "ok" };
    } catch {
      set.status = 401;
      return { error: "unauthorized" };
    }
  });
