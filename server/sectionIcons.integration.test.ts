import { describe, expect, it } from "vitest";

import { deleteContent, getContent, getPublicPortfolio, saveContent } from "./db";

const describeWithDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeWithDatabase("section icon persistence", () => {
  it("removes a saved icon from the public response while retaining the order of the remaining icons", async () => {
    const token = `section-icon-test-${Date.now()}`;
    const firstLabel = `${token}-first`;
    const secondLabel = `${token}-second`;
    let firstId: number | undefined;
    let secondId: number | undefined;

    try {
      await saveContent("icons", {
        sectionKey: "education",
        label: firstLabel,
        url: "/manus-storage/test-icons/first.svg",
        storageKey: "test-icons/first.svg",
        alt: "First isolated test icon",
        sortOrder: 900001,
      });
      await saveContent("icons", {
        sectionKey: "education",
        label: secondLabel,
        url: "/manus-storage/test-icons/second.svg",
        storageKey: "test-icons/second.svg",
        alt: "Second isolated test icon",
        sortOrder: 900002,
      });

      const savedIcons = (await getContent("icons")).filter((icon) => icon.label === firstLabel || icon.label === secondLabel);
      firstId = savedIcons.find((icon) => icon.label === firstLabel)?.id;
      secondId = savedIcons.find((icon) => icon.label === secondLabel)?.id;
      expect([firstId, secondId]).toEqual([expect.any(Number), expect.any(Number)]);

      await deleteContent("icons", firstId!);

      const publicIcons = (await getPublicPortfolio()).sectionIcons.filter((icon) => icon.label === firstLabel || icon.label === secondLabel);
      expect(publicIcons.map((icon) => icon.id)).toEqual([secondId]);
      expect(publicIcons.map((icon) => icon.sortOrder)).toEqual([900002]);
    } finally {
      if (firstId) await deleteContent("icons", firstId);
      if (secondId) await deleteContent("icons", secondId);
    }
  }, 20000);
});
