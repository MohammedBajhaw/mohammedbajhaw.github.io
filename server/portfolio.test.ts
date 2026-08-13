import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { portfolioSeed } from "./portfolioSeed";
import type { TrpcContext } from "./_core/context";

function createContext(role: "admin" | "user"): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "portfolio-test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("portfolio seed content", () => {
  it("includes the academic profile and the three featured project records", () => {
    expect(portfolioSeed.profile.name).toBe("Mohammed Bajhaw");
    expect(portfolioSeed.education).toHaveLength(1);
    expect(portfolioSeed.publications.length).toBeGreaterThanOrEqual(2);
    expect(portfolioSeed.projects.filter((project) => project.featured)).toHaveLength(3);
    expect(portfolioSeed.projects.map((project) => project.slug)).toContain("advanced-robotics-research");
  });
});

describe("portfolio administration", () => {
  it("rejects a non-admin user before exposing content management", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.portfolio.content({ type: "projects" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
