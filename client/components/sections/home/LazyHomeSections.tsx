"use client";

import dynamic from "next/dynamic";

/**
 * Below-the-fold interactive sections, split into their own chunks. Server Components cannot code-split a
 * Client Component, so the split lives in this Client Component and HomeView imports from here.
 * They are still rendered to HTML on the server (no layout shift); only their JavaScript loads later.
 */
export const LazyHomeGallery = dynamic(() => import("./GallerySection").then((module) => module.HomeGallery));
export const LazyHomeSkillsSection = dynamic(() => import("./SkillsSection").then((module) => module.HomeSkillsSection));
