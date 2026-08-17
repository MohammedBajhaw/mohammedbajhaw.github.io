export type ServiceItem = {
  title: string;
  summary: string;
  deliverables: string[];
};

export type ServiceGroup = {
  code: string;
  title: string;
  description: string;
  accent: "blue" | "teal" | "orange" | "ink" | "violet" | "green";
  icon: "robotics" | "embedded" | "mechanical" | "consulting" | "vision" | "control";
  services: ServiceItem[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    code: "01",
    title: "ROS, SLAM & Robot Simulation",
    description: "Simulation-first robotics support for reproducible testing, integration, and prototype autonomy.",
    accent: "blue",
    icon: "robotics",
    services: [
      {
        title: "ROS / ROS 2 Robotics Simulation & Development",
        summary: "Develop ROS or ROS 2 robot simulations in Gazebo or Webots, including URDF models, virtual sensors, Python or C++ behavior nodes, and custom test environments.",
        deliverables: ["Source code", "Setup instructions", "Reproducible run commands"],
      },
      {
        title: "UAV Simulation in ROS–Gazebo",
        summary: "Integrate a UAV model into a realistic simulation environment and evaluate multiple flight scenarios before physical testing.",
        deliverables: ["Simulation workspace", "Scenario definitions", "Test summary"],
      },
      {
        title: "CAD-to-URDF Robot Models",
        summary: "Convert SolidWorks CAD assemblies into simulation-ready URDF packages with joints, collision geometry, Gazebo components, and inertial-property tuning.",
        deliverables: ["URDF package", "Simulator configuration", "Integration notes"],
      },
      {
        title: "AI-Assisted Navigation & Obstacle Avoidance",
        summary: "Develop prototype AI or machine-learning modules that support navigation, autonomy, and obstacle avoidance in ROS-based systems.",
        deliverables: ["Integration-ready modules", "Evaluation scenarios", "Technical documentation"],
      },
    ],
  },
  {
    code: "02",
    title: "Embedded Systems & IoT",
    description: "Connected-device engineering from firmware foundations to reliable communication interfaces.",
    accent: "teal",
    icon: "embedded",
    services: [
      {
        title: "Embedded Firmware for Connected Devices",
        summary: "Develop firmware for STM32, ESP32, Arduino, or Raspberry Pi projects, including Wi-Fi, BLE, and MQTT communication.",
        deliverables: ["Documented source code", "Connection guidance", "Build instructions"],
      },
      {
        title: "PCB Design & Communication Interfaces",
        summary: "Create PCB designs in Altium, KiCad, or EasyEDA and develop reusable interfaces for I²C, SPI, CAN, Modbus, or LoRa.",
        deliverables: ["Gerber files", "Interface libraries", "Manufacturing package"],
      },
    ],
  },
  {
    code: "03",
    title: "Mechanical Design & CAD",
    description: "Manufacturing-aware 3D modelling for components, enclosures, and machine assemblies.",
    accent: "orange",
    icon: "mechanical",
    services: [
      {
        title: "3D CAD & Machine-Part Design",
        summary: "Model precise mechanical parts, enclosures, and machine components in SolidWorks or Fusion 360 from client drawings or requirements.",
        deliverables: ["Editable CAD files", "STEP exports", "Prototype-ready geometry"],
      },
    ],
  },
  {
    code: "04",
    title: "Engineering Consulting & Documentation",
    description: "Focused engineering review that turns technical uncertainty into practical next steps.",
    accent: "ink",
    icon: "consulting",
    services: [
      {
        title: "Mechatronics Design Review & Technical Consulting",
        summary: "Review system concepts, technical drawings, and prototype architectures for robotics and mechatronics projects through a written report or remote consultation.",
        deliverables: ["Technical recommendations", "Review report", "Scope discussion"],
      },
      {
        title: "Robotics Research & Technical Review",
        summary: "Provide structured technical and methodological review for robotics and autonomous-systems research materials, including system design and experimental setup.",
        deliverables: ["Structured feedback", "Methodology notes", "Documentation review"],
      },
    ],
  },
  {
    code: "05",
    title: "AI & Computer Vision",
    description: "Applied perception workflows that move from client data to deployable technical artefacts.",
    accent: "violet",
    icon: "vision",
    services: [
      {
        title: "Custom Object Detection & Vision Pipelines",
        summary: "Train custom YOLO object-detection models and build OpenCV image or video-processing pipelines around client data.",
        deliverables: ["Trained weights", "Evaluation results", "Integration-ready code"],
      },
      {
        title: "On-Device Local LLM Integration",
        summary: "Prepare compact local language-model deployments that operate without an internet connection on suitable embedded or edge hardware.",
        deliverables: ["Deployment package", "Runtime setup", "Device instructions"],
      },
    ],
  },
  {
    code: "06",
    title: "Control, Simulation & Industrial Systems",
    description: "Model-based control and end-to-end IoT prototypes designed around measurable system behavior.",
    accent: "green",
    icon: "control",
    services: [
      {
        title: "Control-System Modelling, Simulation & PLC Logic",
        summary: "Model and evaluate control systems in MATLAB/Simulink, including PID loops and robotic-arm kinematic studies, with test-oriented PLC logic review.",
        deliverables: ["Simulation files", "Digital results report", "Control-logic review"],
      },
      {
        title: "End-to-End IoT Applications",
        summary: "Develop integrated IoT prototypes from sensor acquisition to a cloud-connected dashboard, with a documented data path and deployment guidance.",
        deliverables: ["Device-side code", "Data-path documentation", "Deployment guidance"],
      },
    ],
  },
];

export const servicePageCopy = {
  eyebrow: "Engineering services · scoped for delivery",
  title: "From technical uncertainty to a documented engineering path.",
  intro: "Practical support for robotics, embedded systems, intelligent prototypes, and industrial control. Each engagement is built around a defined technical scope, agreed deliverables, and documentation that makes the work reproducible.",
  process: ["Share the objective", "Confirm scope & deliverables", "Build, test & document"],
};
