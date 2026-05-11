import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { sessions, users } from "../db/schema";

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  await db.insert(users).values({
    name: input.name,
    email: input.email,
    password: hashedPassword,
  });
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<string> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new Error("email atau password salah");
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new Error("email atau password salah");
  }

  const token = Bun.randomUUIDv7();

  await db.insert(sessions).values({ token, userId: user.id });

  return token;
}
