import { createClient } from "@supabase/supabase-js";
import { writeFile } from "node:fs/promises";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !publishableKey) throw new Error("Supabase public environment variables are required.");

const oldBase = "https://engportfolio-zhkmdjuy.manus.space";
const assets = [
  ["profile", `${oldBase}/manus-storage/portfolio/1/profile/1000818023_eb3d5e00.jpg`, "migration/profile/1000818023_eb3d5e00.jpg"],
  ["publication_pdf", `${oldBase}/manus-storage/research-paper-preview_3b27fa0b.pdf`, "migration/publications/research-paper-preview_3b27fa0b.pdf"],
  ["project_1_primary", `${oldBase}/manus-storage/portfolio/1/projects/1/1000474982_02879e38.jpg`, "migration/projects/1000474982_02879e38.jpg"],
  ["project_1_lidar", `${oldBase}/manus-storage/lidar-uav-mapping_483e4614.jpg`, "migration/projects/lidar-uav-mapping_483e4614.jpg"],
  ["project_2_rescue", `${oldBase}/manus-storage/search-rescue-robot_b4ab7cbe.jpg`, "migration/projects/search-rescue-robot_b4ab7cbe.jpg"],
  ["project_3_arm", `${oldBase}/manus-storage/robotic-arm-control_7d96276c.jpg`, "migration/projects/robotic-arm-control_7d96276c.jpg"],
  ["project_4_coffee", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS70hxsxG_HxVFnF3GXbj58qfSdpqzgCwViCGJ2ZNK0mBSRVyxKLAXtrDQQ&s=10", "migration/projects/smart-coffee-brewing.jpg"],
  ["icon_microchip_board", `${oldBase}/manus-storage/microchip-board_2c4bfdd2.svg`, "migration/icons/microchip-board_2c4bfdd2.svg"],
  ["icon_gear", `${oldBase}/manus-storage/mdi-gear-outline_87e8d0e0.svg`, "migration/icons/mdi-gear-outline_87e8d0e0.svg"],
  ["icon_robotic_arm", `${oldBase}/manus-storage/portfolio/1/section-icons/pngegg_75888db2.png`, "migration/icons/pngegg_75888db2.png"],
  ["icon_chip", `${oldBase}/manus-storage/mdi-chip_3050709c.svg`, "migration/icons/mdi-chip_3050709c.svg"],
];

const supabase = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
const mapping = {};
for (const [name, sourceUrl, destination] of assets) {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Could not download ${name}: ${response.status}`);
  const bytes = await response.arrayBuffer();
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
  const { error } = await supabase.storage.from("portfolio-media").upload(destination, bytes, { contentType, upsert: true });
  if (error) throw new Error(`Could not upload ${name}: ${error.message}`);
  mapping[name] = destination;
  console.log(`Migrated ${name}`);
}

await writeFile("/tmp/supabase-media-mapping.json", `${JSON.stringify(mapping, null, 2)}\n`, "utf8");
console.log("Media migration mapping written to /tmp/supabase-media-mapping.json");
