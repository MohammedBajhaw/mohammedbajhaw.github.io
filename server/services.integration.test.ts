import { describe, expect, it } from "vitest";
import { deleteContent, getContent, getPublicPortfolio, saveContent } from "./db";

const describeWithDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeWithDatabase("managed services persistence", () => {
  it("creates, orders, exposes, and cascades deletion of a service area and its services", async () => {
    const token = `services-test-${Date.now()}`;
    const areaTitle = `${token}-area`;
    const serviceTitle = `${token}-service`;
    let areaId: number | undefined;
    let serviceId: number | undefined;

    try {
      await saveContent("serviceAreas", { title: areaTitle, description: "Isolated managed service area", accent: "teal", icon: "robotics", sortOrder: 900001 });
      areaId = (await getContent("serviceAreas")).find((area) => area.title === areaTitle)?.id;
      expect(areaId).toEqual(expect.any(Number));

      await saveContent("services", { areaId: areaId!, title: serviceTitle, summary: "Isolated managed service", deliverables: ["Code package", "Technical notes", "Run instructions"], sortOrder: 900001 });
      serviceId = (await getContent("services")).find((service) => service.title === serviceTitle)?.id;
      expect(serviceId).toEqual(expect.any(Number));

      const publicArea = (await getPublicPortfolio()).serviceAreas.find((area) => area.id === areaId);
      expect(publicArea?.services.map((service) => service.id)).toEqual([serviceId]);
      expect(publicArea?.services[0]?.deliverables).toEqual(["Code package", "Technical notes", "Run instructions"]);

      await deleteContent("serviceAreas", areaId!);
      expect((await getContent("services")).some((service) => service.id === serviceId)).toBe(false);
    } finally {
      if (serviceId) await deleteContent("services", serviceId).catch(() => undefined);
      if (areaId) await deleteContent("serviceAreas", areaId).catch(() => undefined);
    }
  }, 20000);
});
