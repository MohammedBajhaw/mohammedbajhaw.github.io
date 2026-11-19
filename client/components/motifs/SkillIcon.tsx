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
  bare?: boolean;
  size?: number;
};

type IconComponent = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

type IconDefinition = {
  Icon: IconComponent;
  color: string;
};

const categoryIcons: Record<string, IconDefinition> = {
  "Autonomy & Navigation": { Icon: Navigation, color: "#176b69" },
  "Perception & AI": { Icon: BrainCircuit, color: "#176b69" },
  "Robotics Middleware": { Icon: Bot, color: "#176b69" },
  "Control & Simulation": { Icon: Gauge, color: "#176b69" },
  "Embedded & Edge AI": { Icon: CircuitBoard, color: "#176b69" },
  "Software & Data": { Icon: Braces, color: "#176b69" },
  "Electronics & PCB": { Icon: Radio, color: "#176b69" },
  "Mechanical Design & CAD": { Icon: Spline, color: "#176b69" },
  "Fabrication & Testing": { Icon: Wrench, color: "#176b69" },
  "Robotics & Autonomy": { Icon: Bot, color: "#176b69" },
  "Embedded Systems & Electronics": { Icon: CircuitBoard, color: "#176b69" },
  "Robots & Platforms": { Icon: Navigation, color: "#176b69" },
  Sensors: { Icon: Radar, color: "#176b69" },
  "AI & Computer Vision": { Icon: BrainCircuit, color: "#176b69" },
  "Mechanical Design & Prototyping": { Icon: Spline, color: "#176b69" },
  "Programming & Tools": { Icon: Braces, color: "#176b69" },
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

export function SkillIcon({ label, iconName, category, bare = false, size }: SkillIconProps) {
  const fromLabel = directIcon(label);
  const fromCategory = categoryIcons[category];
  const iconFallback = iconName === "NVIDIA" ? { Icon: SiNvidia, color: "#76b900" } : null;
  const { Icon, color } = fromLabel ?? iconFallback ?? fromCategory ?? { Icon: CircuitBoard, color: "#176b69" };

  if (bare) {
    return (
      <span className="inline-flex items-center justify-center shrink-0" style={{ color }} aria-hidden="true">
        <Icon size={size ?? 15} strokeWidth={1.85} />
      </span>
    );
  }

  return (
    <span
      className="inline-grid w-[19px] h-[19px] place-items-center shrink-0 rounded-[5px] bg-[color-mix(in_srgb,currentColor_10%,white)]"
      style={{ color }}
      aria-hidden="true"
    >
      <Icon size={size ?? 14} strokeWidth={1.8} />
    </span>
  );
}
