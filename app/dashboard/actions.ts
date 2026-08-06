"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

import { createLinkForUser, updateLinkForUser, deleteLinkForUser } from "@/data/links";

const createLinkSchema = z.object({
    url: z.string().url("Please enter a valid URL"),
    customSlug: z
        .string()
        .min(3, "Custom slug must be at least 3 characters")
        .max(20, "Custom slug must be at most 20 characters")
        .regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, hyphens, and underscores are allowed")
        .optional()
        .or(z.literal("")),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export async function createLink(input: unknown) {
    const { userId } = await auth();
    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const validated = createLinkSchema.parse(input);
        const slug = validated.customSlug === "" ? undefined : validated.customSlug;
        const link = await createLinkForUser(userId, { url: validated.url, customSlug: slug });
        revalidatePath("/dashboard");
        return { success: true, data: link };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message };
        }
        if (error instanceof Error && error.message.includes("unique")) {
            return { error: "That custom slug is already taken. Please choose another." };
        }
        return { error: "Failed to create link. Please try again." };
    }
}

const updateLinkSchema = z.object({
    id: z.number().int().positive(),
    url: z.string().url("Please enter a valid URL"),
    shortCode: z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(20, "Slug must be at most 20 characters")
        .regex(/^[a-zA-Z0-9-_]+$/, "Only letters, numbers, hyphens, and underscores are allowed"),
});

export async function updateLink(input: unknown) {
    const { userId } = await auth();
    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const validated = updateLinkSchema.parse(input);
        const link = await updateLinkForUser(userId, validated.id, {
            url: validated.url,
            shortCode: validated.shortCode,
        });
        if (!link) {
            return { error: "Link not found" };
        }
        revalidatePath("/dashboard");
        return { success: true, data: link };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message };
        }
        if (error instanceof Error && error.message.includes("unique")) {
            return { error: "That slug is already taken. Please choose another." };
        }
        return { error: "Failed to update link. Please try again." };
    }
}

const deleteLinkSchema = z.object({
    id: z.number().int().positive(),
});

export async function deleteLink(input: unknown) {
    const { userId } = await auth();
    if (!userId) {
        return { error: "Unauthorized" };
    }

    try {
        const validated = deleteLinkSchema.parse(input);
        await deleteLinkForUser(userId, validated.id);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message };
        }
        return { error: "Failed to delete link. Please try again." };
    }
}
