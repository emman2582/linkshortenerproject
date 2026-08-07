import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { links, type Link, type NewLink } from "@/db/schema";

export async function getUserLinks(userId: string): Promise<Link[]> {
  return db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.updatedAt));
}

function generateShortCode(length = 6): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export async function createLinkForUser(
  userId: string,
  input: { url: string; customSlug?: string },
): Promise<Link> {
  const shortCode = input.customSlug ?? generateShortCode();
  const newLink: NewLink = { url: input.url, shortCode, userId };
  const [link] = await db.insert(links).values(newLink).returning();
  return link;
}

export async function updateLinkForUser(
  userId: string,
  id: number,
  input: { url: string; shortCode: string },
): Promise<Link | null> {
  const [link] = await db
    .update(links)
    .set({ url: input.url, shortCode: input.shortCode, updatedAt: new Date() })
    .where(and(eq(links.id, id), eq(links.userId, userId)))
    .returning();
  return link ?? null;
}

export async function deleteLinkForUser(
  userId: string,
  id: number,
): Promise<void> {
  await db.delete(links).where(and(eq(links.id, id), eq(links.userId, userId)));
}

export async function getLinkByShortCode(
  shortCode: string,
): Promise<Link | null> {
  const [link] = await db
    .select()
    .from(links)
    .where(eq(links.shortCode, shortCode))
    .limit(1);
  return link ?? null;
}
