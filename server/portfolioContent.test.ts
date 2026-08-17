import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mockDb = vi.hoisted(() => ({
  getPublicPortfolio: vi.fn(),
  getContent: vi.fn(),
  saveContent: vi.fn(),
  deleteContent: vi.fn(),
  addProjectMedia: vi.fn(),
  updateProfilePhoto: vi.fn(),
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

  it("saves validated skill and section-icon content and rejects malformed projects", async () => {
    const caller = appRouter.createCaller(context());
    await caller.portfolio.save({ type: "skills", data: { label: "ROS 2", category: "Autonomy", icon: "Radar", sortOrder: 1 } });
    expect(mockDb.saveContent).toHaveBeenCalledWith("skills", expect.objectContaining({ label: "ROS 2" }));
    await caller.portfolio.save({ type: "icons", data: { sectionKey: "education", label: "Robot arm", url: "/manus-storage/robot.svg", storageKey: "portfolio/9/section-icons/robot.svg", alt: "Robot arm", sortOrder: 2 } });
    expect(mockDb.saveContent).toHaveBeenCalledWith("icons", expect.objectContaining({ sectionKey: "education", sortOrder: 2 }));
    await expect(caller.portfolio.save({ type: "projects", data: { slug: "invalid slug", title: "Project", tags: [], tools: [], outcomes: [], featured: false, sortOrder: 0 } as any })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("validates managed service areas and services through the protected content route", async () => {
    const caller = appRouter.createCaller(context());
    await caller.portfolio.save({ type: "serviceAreas", data: { title: "Robotics Services", description: "Managed practice area", accent: "blue", icon: "robotics", sortOrder: 1 } });
    await caller.portfolio.save({ type: "services", data: { areaId: 3, title: "ROS Simulation Support", summary: "Managed service item", deliverables: ["Code", "Notes", "Commands"], sortOrder: 1 } });
    expect(mockDb.saveContent).toHaveBeenCalledWith("serviceAreas", expect.objectContaining({ title: "Robotics Services", accent: "blue" }));
    expect(mockDb.saveContent).toHaveBeenCalledWith("services", expect.objectContaining({ areaId: 3, deliverables: ["Code", "Notes", "Commands"] }));
    await expect(caller.portfolio.save({ type: "services", data: { areaId: 0, title: "Invalid service", summary: "", deliverables: [], sortOrder: 0 } as any })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("uploads a section icon to storage for later ordering and publishing", async () => {
    mockStorage.storagePut.mockResolvedValue({ key: "portfolio/9/section-icons/arm.svg", url: "/manus-storage/arm.svg" });
    const result = await appRouter.createCaller(context()).portfolio.uploadSectionIcon({ filename: "arm.svg", mimeType: "image/svg+xml", base64: Buffer.from("<svg><path d='M0 0'/></svg>").toString("base64") });
    expect(result.url).toBe("/manus-storage/arm.svg");
    expect(mockStorage.storagePut).toHaveBeenCalledWith(expect.stringContaining("portfolio/9/section-icons/arm.svg"), expect.any(Buffer), "image/svg+xml");
  });

  it("removes a section icon through the protected content route and keeps the public icon order intact", async () => {
    const remainingIcons = [
      { id: 4, sectionKey: "education", label: "Robot arm", sortOrder: 1 },
      { id: 8, sectionKey: "education", label: "Microchip", sortOrder: 3 },
    ];
    mockDb.getPublicPortfolio.mockResolvedValue({ profile: { id: 1 }, sectionIcons: remainingIcons });
    const caller = appRouter.createCaller(context());
    await caller.portfolio.remove({ type: "icons", id: 12 });
    expect(mockDb.deleteContent).toHaveBeenCalledWith("icons", 12);
    const publicPortfolio = await caller.portfolio.public();
    expect(publicPortfolio.sectionIcons.map((icon: { id: number }) => icon.id)).toEqual([4, 8]);
    expect(publicPortfolio.sectionIcons.some((icon: { id: number }) => icon.id === 12)).toBe(false);
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

  it("stores a profile photo and returns its S3 path for immediate profile persistence", async () => {
    mockStorage.storagePut.mockResolvedValue({ key: "portfolio/9/profile/photo_hash.jpg", url: "/manus-storage/photo_hash.jpg" });
    const result = await appRouter.createCaller(context()).portfolio.uploadProfilePhoto({ filename: "photo.jpg", mimeType: "image/jpeg", base64: Buffer.from("profile-image").toString("base64") });
    expect(result).toEqual({ key: "portfolio/9/profile/photo_hash.jpg", url: "/manus-storage/photo_hash.jpg" });
    expect(mockStorage.storagePut).toHaveBeenCalledWith(expect.stringContaining("portfolio/9/profile/photo.jpg"), expect.any(Buffer), "image/jpeg");
    expect(mockDb.updateProfilePhoto).toHaveBeenCalledWith("/manus-storage/photo_hash.jpg", "portfolio/9/profile/photo_hash.jpg");
  });

  it("persists an uploaded profile photo and exposes the S3 URL in the public portfolio response", async () => {
    mockStorage.storagePut.mockResolvedValue({ key: "portfolio/9/profile/portrait_hash.jpg", url: "/manus-storage/portrait_hash.jpg" });
    const caller = appRouter.createCaller(context());
    const stored = await caller.portfolio.uploadProfilePhoto({ filename: "portrait.jpg", mimeType: "image/jpeg", base64: Buffer.from("portrait").toString("base64") });
    const profile = { id: 1, name: "Mohammed Bajhaw", professionalTitle: "Mechatronics Researcher", location: "Elazığ", email: "mohammed@example.com", linkedinUrl: "", bio: "Research profile", photoUrl: stored.url, photoKey: stored.key };
    await caller.portfolio.save({ type: "profile", data: profile });
    expect(mockDb.saveContent).toHaveBeenCalledWith("profile", expect.objectContaining({ photoUrl: "/manus-storage/portrait_hash.jpg", photoKey: "portfolio/9/profile/portrait_hash.jpg" }));
    mockDb.getPublicPortfolio.mockResolvedValue({ profile, education: [], publications: [], experiences: [], skills: [], projects: [] });
    const publicData = await caller.portfolio.public();
    expect(publicData.profile.photoUrl).toBe("/manus-storage/portrait_hash.jpg");
  });
});
