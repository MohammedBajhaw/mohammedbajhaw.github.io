import { stripHiddenPublicationUrl } from "./hiddenPublications";

// The DJI UAV project is the subject of a paper that is still under review. Keep the project
// visible, but drop the quantitative results and the validation write-up, and tell the reader that
// further details follow once the paper is published; see lib/hiddenPublications.ts.
const SANITIZED_PROJECT_SLUG = "rko-lio-dji-uav-gps-denied-mapping";

const SANITIZED_OUTCOMES = [
  "Accurate 3D map of a campus area, built entirely onboard the drone",
  "No external IMU needed: lower cost, weight and build complexity",
  "Runs comfortably on a small Jetson Orin NX computer",
  "Validated on site against real building measurements",
];

const PAPER_UNDER_REVIEW_NOTE = "<blockquote><p><strong>Paper under review.</strong> I currently have a research paper under review about this project, so some project details, such as the full results and validation, are not published here yet. They will be added once the paper is published.</p></blockquote>";

const SANITIZED_RICH_CONTENT = `${PAPER_UNDER_REVIEW_NOTE}<h2>What the project is about</h2><p>Drones often rely on GPS to know where they are, but near large buildings the signal degrades or disappears. This project gives a drone another way to understand its surroundings: it scans the environment with a LiDAR and builds a 3D map while it flies, with no help from satellites.</p><figure><img src="https://ntynaiuxqylscazugcdo.supabase.co/storage/v1/object/public/portfolio-media/projects/legacy/figure-005_82c208cf.jpg" alt="Comparison of the surveyed outdoor area and reconstructed coloured point cloud" /><figcaption>The surveyed outdoor area next to the coloured 3D map the drone reconstructed.</figcaption></figure><h2>The payload</h2><p>The payload is built around a Velodyne VLP-16 LiDAR and an NVIDIA Jetson Orin NX computer, mounted on a DJI Matrice M350 RTK. Power and communication circuits were designed so the whole unit runs from the drone and talks to it over its E-Port.</p><figure><img src="https://ntynaiuxqylscazugcdo.supabase.co/storage/v1/object/public/portfolio-media/projects/rko-lio-dji-uav/drone-payload-in-flight.png" alt="The mapping payload mounted on the DJI Matrice M350 RTK during a night flight" /><figcaption>The complete mapping payload mounted on the drone during a test flight.</figcaption></figure><h2>How it works</h2><ul><li><strong>Sensing:</strong> the LiDAR scans the surroundings while the drone's built-in IMU reports how it is moving.</li><li><strong>Computing:</strong> the Jetson Orin NX combines both streams with the RKO-LIO method to track the drone and grow the 3D map in real time.</li><li><strong>Simplicity:</strong> because the drone's own IMU is used, there is no extra sensor to buy, mount or calibrate.</li></ul><h2>Flying and mapping</h2><p>The system was flown around a university building with trees, parked cars and complex facades. The drone climbed, circled and landed while the map was being built onboard.</p><figure><img src="https://ntynaiuxqylscazugcdo.supabase.co/storage/v1/object/public/portfolio-media/projects/rko-lio-dji-uav/onboard-trajectory.png" alt="3D flight path estimated onboard, coloured by altitude" /><figcaption>The flight path estimated onboard, coloured by altitude.</figcaption></figure><figure><img src="https://ntynaiuxqylscazugcdo.supabase.co/storage/v1/object/public/portfolio-media/projects/rko-lio-dji-uav/satellite-vs-point-cloud.png" alt="Satellite view of the university buildings next to the reconstructed 3D point cloud" /><figcaption>Satellite view of the site (left) next to the 3D map built from the flight (right).</figcaption></figure><h2>What the work covers</h2><ul><li>Hardware integration of the drone, computer and LiDAR, including power and communication circuits.</li><li>The ROS 2 software stack that connects the sensors to the mapping method.</li><li>A field flight test and evaluation of how the mapping method behaves on a drone.</li></ul>`;

export function applyPublicProjectOverrides<T extends Record<string, any>>(project: T): T {
  const withPublicationUrl = { ...project, publication_url: stripHiddenPublicationUrl(project.publication_url) };
  if (project.slug !== SANITIZED_PROJECT_SLUG) return withPublicationUrl;
  return { ...withPublicationUrl, status: "Research prototype – paper under review", outcomes: SANITIZED_OUTCOMES, rich_content: SANITIZED_RICH_CONTENT };
}
