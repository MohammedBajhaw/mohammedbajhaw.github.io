import type { ComponentType } from "react";
import {
  Bot,
  BrainCircuit,
  Braces,
  CircuitBoard,
  Crosshair,
  Gauge,
  MapPinned,
  Move3D,
  Navigation,
  Orbit,
  Radio,
  Radar,
  ScanLine,
  Spline,
  TestTube2,
  Wrench,
} from "lucide-react";
import {
  SiArduino,
  SiCplusplus,
  SiDocker,
  SiGit,
  SiGithub,
  SiKicad,
  SiLinux,
  SiNvidia,
  SiOpencv,
  SiPostgresql,
  SiPython,
  SiRaspberrypi,
  SiRos,
  SiSiemens,
  SiStmicroelectronics,
} from "react-icons/si";

type SkillIconProps = {
  label: string;
  iconName?: string | null;
  category: string;
};

type IconComponent = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

type IconDefinition = {
  Icon: IconComponent;
  color: string;
};

const categoryIcons: Record<string, IconDefinition> = {
  "Autonomy & Navigation": { Icon: Navigation, color: "#237987" },
  "Control & Simulation": { Icon: Gauge, color: "#9a5a2e" },
  "Electronics & PCB": { Icon: CircuitBoard, color: "#9e3d65" },
  "Embedded & Edge AI": { Icon: BrainCircuit, color: "#467d45" },
  "Fabrication & Testing": { Icon: Wrench, color: "#9b6b25" },
  "Mechanical Design & CAD": { Icon: Spline, color: "#5c57a6" },
  "Perception & AI": { Icon: ScanLine, color: "#b54838" },
  "Robotics Middleware": { Icon: Bot, color: "#147a70" },
  "Software & Data": { Icon: Braces, color: "#3b68a3" },
};

function directIcon(label: string): IconDefinition | null {
  const text = label.toLowerCase();
  if (text.includes("nvidia")) return { Icon: SiNvidia, color: "#76b900" };
  if (text.includes("stm32")) return { Icon: SiStmicroelectronics, color: "#03234b" };
  if (text.includes("arduino")) return { Icon: SiArduino, color: "#00979d" };
  if (text.includes("raspberry")) return { Icon: SiRaspberrypi, color: "#c51a4a" };
  if (text.includes("kicad")) return { Icon: SiKicad, color: "#314cb6" };
  if (text.includes("siemens")) return { Icon: SiSiemens, color: "#009999" };
  if (text.includes("opencv") || text.includes("yolo")) return { Icon: SiOpencv, color: "#5c3ee8" };
  if (text.includes("ros")) return { Icon: SiRos, color: "#22314e" };
  if (text.includes("python")) return { Icon: SiPython, color: "#3776ab" };
  if (text === "c++" || text.includes("c and c++")) return { Icon: SiCplusplus, color: "#00599c" };
  if (text === "c") return { Icon: Braces, color: "#6d7a87" };
  if (text.includes("git / github")) return { Icon: SiGithub, color: "#171515" };
  if (text.includes("git")) return { Icon: SiGit, color: "#f05032" };
  if (text.includes("docker")) return { Icon: SiDocker, color: "#2496ed" };
  if (text.includes("linux")) return { Icon: SiLinux, color: "#171717" };
  if (text.includes("sql")) return { Icon: SiPostgresql, color: "#4169e1" };
  if (text.includes("lidar")) return { Icon: Radar, color: "#237987" };
  if (text.includes("visual") || text.includes("thermal") || text.includes("realsense")) return { Icon: ScanLine, color: "#b54838" };
  if (text.includes("gnss") || text.includes("path") || text.includes("motion")) return { Icon: MapPinned, color: "#237987" };
  if (text.includes("kinematic") || text.includes("dynamics")) return { Icon: Orbit, color: "#9a5a2e" };
  if (text.includes("pid") || text.includes("state-space") || text.includes("simulink")) return { Icon: Gauge, color: "#9a5a2e" };
  if (text.includes("pixhawk") || text.includes("can") || text.includes("uart") || text.includes("spi") || text.includes("i²c")) return { Icon: Radio, color: "#467d45" };
  if (text.includes("solidworks") || text.includes("fusion") || text.includes("onshape") || text.includes("cad")) return { Icon: Spline, color: "#5c57a6" };
  if (text.includes("cnc") || text.includes("3d printing") || text.includes("laser") || text.includes("soldering")) return { Icon: Wrench, color: "#9b6b25" };
  if (text.includes("test") || text.includes("validation")) return { Icon: TestTube2, color: "#9b6b25" };
  if (text.includes("gazebo") || text.includes("moveit") || text.includes("rviz") || text.includes("mavlink")) return { Icon: Move3D, color: "#147a70" };
  if (text.includes("machine learning") || text.includes("detection") || text.includes("pose")) return { Icon: Crosshair, color: "#b54838" };
  return null;
}

export function SkillIcon({ label, iconName, category }: SkillIconProps) {
  const fromLabel = directIcon(label);
  const fromCategory = categoryIcons[category];
  const iconFallback = iconName === "NVIDIA" ? { Icon: SiNvidia, color: "#76b900" } : null;
  const { Icon, color } = fromLabel ?? iconFallback ?? fromCategory ?? { Icon: CircuitBoard, color: "#176b69" };

  return <span className="skill-icon" style={{ color }} aria-hidden="true"><Icon size={14} strokeWidth={1.8} /></span>;
}

export function SkillGroupIcon({ category }: Pick<SkillIconProps, "category">) {
  const { Icon, color } = categoryIcons[category] ?? { Icon: CircuitBoard, color: "#176b69" };

  return <span className="skill-group-icon" style={{ color }} aria-hidden="true"><Icon size={32} strokeWidth={1.55} /></span>;
}
