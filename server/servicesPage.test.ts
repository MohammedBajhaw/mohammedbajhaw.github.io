import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { portfolioSeed } from "./portfolioSeed";
import { hasPublishedServices } from "../client/src/data/servicesState";

describe("services page content", () => {
  it("defines six clearly scoped managed engineering service areas", () => {
    expect(portfolioSeed.serviceAreas).toHaveLength(6);
    expect(portfolioSeed.serviceAreas.map((group) => group.title)).toEqual([
      "ROS, SLAM & Robot Simulation",
      "Embedded Systems & IoT",
      "Mechanical Design & CAD",
      "Engineering Consulting & Documentation",
      "AI & Computer Vision",
      "Control, Simulation & Industrial Systems",
    ]);
    expect(portfolioSeed.services).toHaveLength(13);
  });

  it("keeps the service offers documented with concrete delivery expectations", () => {
    const services = portfolioSeed.services;
    const titles = services.map((service) => service.title);
    expect(titles).toContain("ROS / ROS 2 Robotics Simulation & Development");
    expect(titles).toContain("Embedded Firmware for Connected Devices");
    expect(titles).toContain("Custom Object Detection & Vision Pipelines");
    expect(services.every((service) => service.deliverables.length >= 3)).toBe(true);
  });

  it("registers the public services route before parameterized project routes", () => {
    const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
    const homeSource = readFileSync(new URL("../client/src/pages/Home.tsx", import.meta.url), "utf8");
    const servicesSource = readFileSync(new URL("../client/src/pages/Services.tsx", import.meta.url), "utf8");
    expect(appSource).toContain('path="/services"');
    expect(appSource.indexOf('path="/services"')).toBeLessThan(appSource.indexOf('path="/projects/:slug"'));
    expect(homeSource).toContain('const navItems = [["About", "#about"], ["Projects", "#projects"]]');
    expect(servicesSource).toContain("data?.serviceAreas");
    expect(servicesSource).toContain("services-empty");
  });

  it("uses an explicit fallback state when no managed services are available", () => {
    expect(hasPublishedServices([])).toBe(false);
    expect(hasPublishedServices([{ services: [] }])).toBe(false);
    expect(hasPublishedServices([{ services: [{ id: 1 }] }])).toBe(true);
  });
});
