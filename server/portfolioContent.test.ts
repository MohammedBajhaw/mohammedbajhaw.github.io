import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mockDb = vi.hoisted(() => ({
  getPublicPortfolio: vi.fn(),
  getContent: vi.fn(),
  saveContent: vi.fn(),
  deleteContent: vi.fn(),
  addProjectMedia: vi.fn(),
}));
const mockStorage = vi.hoisted(() => ({ storagePut: vi.fn() }));

vi.mock("./db", () => mockDb);
vi.mock("./storage", () => mockStorage);

import { appRouter } from "./routers";

function context(): TrpcContext {
  return {
    user: { id: 9, openId: "admin-test", name: "Admin", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("portfolio content procedures", () => {
  it("returns public portfolio content", async () => {
    mockDb.getPublicPortfolio.mockResolvedValue({ profile: { id: 1, name: "Mohammed" }, projects: [] });
    const result = await appRouter.createCaller(context()).portfolio.public();
    expect(result.profile.name).toBe("Mohammed");
    expect(mockDb.getPublicPortfolio).toHaveBeenCalledTimes(1);
  });

  it("saves validated skill content and rejects malformed projects", async () => {
    const caller = appRouter.createCaller(context());
    await caller.portfolio.save({ type: "skills", data: { label: "ROS 2", category: "Autonomy", icon: "Radar", sortOrder: 1 } });
    expect(mockDb.saveContent).toHaveBeenCalledWith("skills", expect.objectContaining({ label: "ROS 2" }));
    await expect(caller.portfolio.save({ type: "projects", data: { slug: "invalid slug", title: "Project", tags: [], tools: [], outcomes: [], featured: false, sortOrder: 0 } as any })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("removes content and stores a project image through the storage layer", async () => {
    mockStorage.storagePut.mockResolvedValue({ key: "portfolio/9/projects/3/demo_hash.jpg", url: "/manus-storage/demo_hash.jpg" });
    const caller = appRouter.createCaller(context());
    await caller.portfolio.remove({ type: "skills", id: 4 });
    expect(mockDb.deleteContent).toHaveBeenCalledWith("skills", 4);
    const result = await caller.portfolio.uploadProjectImage({ projectId: 3, filename: "demo.jpg", mimeType: "image/jpeg", base64: Buffer.from("sample-image").toString("base64"), alt: "Demo", sortOrder: 2 });
    expect(result.url).toBe("/manus-storage/demo_hash.jpg");
    expect(mockDb.addProjectMedia).toHaveBeenCalledWith(expect.objectContaining({ projectId: 3, url: "/manus-storage/demo_hash.jpg", sortOrder: 2 }));
  });
});
