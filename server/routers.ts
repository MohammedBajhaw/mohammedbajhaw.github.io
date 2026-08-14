import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { addProjectMedia, deleteContent, getContent, getPublicPortfolio, saveContent, updateProfilePhoto } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";

const contentType = z.enum(["profile", "education", "publications", "experiences", "skills", "icons", "projects", "media"]);
const optionalId = z.number().int().positive().optional();
const optionalText = z.string().max(5000).nullable().optional();
const stringList = z.array(z.string().trim().min(1).max(300)).max(30);
const saveContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("profile"), data: z.object({ id: z.number().int().optional(), name: z.string().trim().min(2).max(160), professionalTitle: z.string().trim().min(2).max(220), location: optionalText, email: z.string().email().or(z.literal("")).nullable().optional(), linkedinUrl: z.string().url().or(z.literal("")).nullable().optional(), bio: optionalText, photoUrl: z.string().max(1000).nullable().optional(), photoKey: z.string().max(1000).nullable().optional() }) }),
  z.object({ type: z.literal("education"), data: z.object({ id: optionalId, institution: z.string().trim().min(2).max(240), degree: z.string().trim().min(2).max(240), field: optionalText, location: optionalText, startYear: z.string().max(12).nullable().optional(), endYear: z.string().max(12).nullable().optional(), description: optionalText, sortOrder: z.number().int().min(0).max(999) }) }),
  z.object({ type: z.literal("publications"), data: z.object({ id: optionalId, title: z.string().trim().min(5).max(700), venue: optionalText, publicationDate: z.string().max(40).nullable().optional(), status: z.string().max(120).nullable().optional(), authors: optionalText, summary: optionalText, details: optionalText, keywords: stringList, url: z.string().url().or(z.literal("")).nullable().optional(), sortOrder: z.number().int().min(0).max(999) }) }),
  z.object({ type: z.literal("experiences"), data: z.object({ id: optionalId, role: z.string().trim().min(2).max(240), organization: z.string().trim().min(2).max(240), location: optionalText, startDate: z.string().max(40).nullable().optional(), endDate: z.string().max(40).nullable().optional(), isCurrent: z.boolean(), summary: optionalText, highlights: stringList, sortOrder: z.number().int().min(0).max(999) }) }),
  z.object({ type: z.literal("skills"), data: z.object({ id: optionalId, label: z.string().trim().min(2).max(160), category: z.string().trim().min(2).max(160), icon: z.string().max(100).nullable().optional(), sortOrder: z.number().int().min(0).max(999) }) }),
  z.object({ type: z.literal("icons"), data: z.object({ id: optionalId, sectionKey: z.enum(["education", "publications", "experiences", "skills", "projects"]), label: z.string().trim().min(2).max(160), url: z.string().min(1).max(1200), storageKey: z.string().max(1200).nullable().optional(), alt: z.string().max(320).nullable().optional(), sortOrder: z.number().int().min(0).max(999) }) }),
  z.object({ type: z.literal("projects"), data: z.object({ id: optionalId, slug: z.string().trim().min(3).max(240).regex(/^[a-z0-9-]+$/), title: z.string().trim().min(2).max(320), subtitle: z.string().max(400).nullable().optional(), summary: optionalText, description: optionalText, status: z.string().max(120).nullable().optional(), startDate: z.string().max(40).nullable().optional(), endDate: z.string().max(40).nullable().optional(), tags: stringList, tools: stringList, outcomes: stringList, featured: z.boolean(), sortOrder: z.number().int().min(0).max(999) }) }),
  z.object({ type: z.literal("media"), data: z.object({ id: optionalId, projectId: z.number().int().positive(), url: z.string().min(1).max(1200), storageKey: z.string().max(1200).nullable().optional(), alt: z.string().max(320).nullable().optional(), sortOrder: z.number().int().min(0).max(999) }) }),
]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  portfolio: router({
    public: publicProcedure.query(() => getPublicPortfolio()),
    content: adminProcedure.input(z.object({ type: contentType })).query(({ input }) => getContent(input.type)),
    save: adminProcedure.input(saveContentSchema).mutation(({ input }) => saveContent(input.type, input.data as Record<string, unknown>)),
    remove: adminProcedure.input(z.object({ type: z.enum(["education", "publications", "experiences", "skills", "icons", "projects", "media"]), id: z.number().int().positive() })).mutation(({ input }) => deleteContent(input.type, input.id)),
    uploadProjectImage: adminProcedure.input(z.object({ projectId: z.number().int().positive(), filename: z.string().min(1).max(160), mimeType: z.string().regex(/^image\/(jpeg|png|webp|gif)$/), base64: z.string().min(10), alt: z.string().max(320).optional(), sortOrder: z.number().int().min(0).max(100).optional() })).mutation(async ({ input, ctx }) => {
      const rawBase64 = input.base64.includes(",") ? input.base64.split(",")[1] : input.base64;
      const buffer = Buffer.from(rawBase64, "base64");
      if (buffer.byteLength > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller");
      const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const stored = await storagePut(`portfolio/${ctx.user.id}/projects/${input.projectId}/${safeFilename}`, buffer, input.mimeType);
      await addProjectMedia({ projectId: input.projectId, url: stored.url, storageKey: stored.key, alt: input.alt ?? null, sortOrder: input.sortOrder ?? 0 });
      return stored;
    }),
    uploadProfilePhoto: adminProcedure.input(z.object({ filename: z.string().min(1).max(160), mimeType: z.string().regex(/^image\/(jpeg|png|webp)$/), base64: z.string().min(10) })).mutation(async ({ input, ctx }) => {
      const rawBase64 = input.base64.includes(",") ? input.base64.split(",")[1] : input.base64;
      const buffer = Buffer.from(rawBase64, "base64");
      if (buffer.byteLength > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller");
      const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const stored = await storagePut(`portfolio/${ctx.user.id}/profile/${safeFilename}`, buffer, input.mimeType);
      await updateProfilePhoto(stored.url, stored.key);
      return stored;
    }),
    uploadSectionIcon: adminProcedure.input(z.object({ filename: z.string().min(1).max(160), mimeType: z.string().regex(/^image\/(svg\+xml|jpeg|png|webp)$/), base64: z.string().min(10) })).mutation(async ({ input, ctx }) => {
      const rawBase64 = input.base64.includes(",") ? input.base64.split(",")[1] : input.base64;
      const buffer = Buffer.from(rawBase64, "base64");
      if (buffer.byteLength > 1024 * 1024) throw new Error("Icon must be 1 MB or smaller");
      const safeFilename = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storagePut(`portfolio/${ctx.user.id}/section-icons/${safeFilename}`, buffer, input.mimeType);
    }),
  }),
});

export type AppRouter = typeof appRouter;
