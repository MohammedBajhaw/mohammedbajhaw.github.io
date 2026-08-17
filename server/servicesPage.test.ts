import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { serviceGroups, servicePageCopy } from "../client/src/data/services";

describe("services page content", () => {
  it("defines six clearly scoped engineering service areas", () => {
    expect(serviceGroups).toHaveLength(6);
    expect(serviceGroups.map((group) => group.title)).toEqual([
      "ROS, SLAM & Robot Simulation",
      "Embedded Systems & IoT",
      "Mechanical Design & CAD",
      "Engineering Consulting & Documentation",
      "AI & Computer Vision",
      "Control, Simulation & Industrial Systems",
    ]);
    expect(serviceGroups.flatMap((group) => group.services)).toHaveLength(13);
    expect(servicePageCopy.title).toContain("documented engineering path");
  });

  it("keeps the service offers documented with concrete delivery expectations", () => {
    const services = serviceGroups.flatMap((group) => group.services);
    const titles = services.map((service) => service.title);
    expect(titles).toContain("ROS / ROS 2 Robotics Simulation & Development");
    expect(titles).toContain("Embedded Firmware for Connected Devices");
    expect(titles).toContain("Custom Object Detection & Vision Pipelines");
    expect(services.every((service) => service.deliverables.length >= 3)).toBe(true);
  });

  it("registers the public services route before parameterized project routes", () => {
    const appSource = readFileSync(new URL("../client/src/App.tsx", import.meta.url), "utf8");
    expect(appSource).toContain('path="/services"');
    expect(appSource.indexOf('path="/services"')).toBeLessThan(appSource.indexOf('path="/projects/:slug"'));
  });
});
