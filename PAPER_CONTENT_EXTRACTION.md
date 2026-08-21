# Published Paper Content Extraction

## Bibliographic Record

| Field | Verified value |
|---|---|
| Title | Drift-Resilient Indoor 3D Mapping in GPS-Denied Environments Using RKO-LIO with Velodyne–Pixhawk Integration in ROS 2 |
| Venue | 2026 8th International Congress on Human-Computer Interaction, Optimization and Robotic Applications (ICHORA), IEEE |
| DOI | `10.1109/ICHORA69329.2026.11537209` |
| Authors | Anas Mahyoub Naji Saeed Alqadhi; Mohammed Ali Mohammed S. Bajhaw; Munef el Muhammed; Aysegul Ucar |
| Affiliation | Mechatronics Engineering Department, Fırat University, Elazığ, Türkiye |

## Verified Research Content

The paper presents a GPS-denied indoor 3D mapping system that integrates a Velodyne VLP-16 LiDAR and Pixhawk Cube Orange+ IMU on a TurtleBot Waffle Pi operating under ROS 2 Humble. It evaluates RKO-LIO, a LiDAR–inertial odometry method using a physics-based kinematic motion model and adaptive scan-to-map regularisation.

Real-robot validation measured five indoor objects against roll-meter ground truth, reporting **0.026 m RMSE**, **0.022 m MAE**, and **0.69% mean error**. The simulation comparison replayed one sensor bag through RKO-LIO, LIO-SAM, and FAST-LIO across three Gazebo environments. FAST-LIO obtained the lowest trajectory error in the reported scenes, whereas RKO-LIO maintained bounded error across every environment without per-scene parameter tuning. In the challenging bookstore scene, the paper reports RKO-LIO APE at or below **0.494 m**, while LIO-SAM diverges to **21.7 m** and destroys the map.

## Project Framing

The portfolio project should describe the engineering work rather than duplicate the paper. It will focus on sensor integration, ROS 2 data flow, RKO-LIO evaluation, geometric validation, Gazebo replay benchmarking, and reliability trade-offs for GPS-denied autonomy.

## Selected Source Media

| Asset | Use in portfolio |
|---|---|
| `rko-paper-figure-000.jpg` | Hardware platform: VLP-16 LiDAR, NVIDIA Jetson AGX Orin, Pixhawk Cube Orange+, custom housing, and OpenCR card. |
| `rko-paper-figure-002.jpg` | Mapping validation: reconstructed indoor point cloud linked to five measured test objects. |

## Reference

[1] User-provided PDF: *Drift-Resilient Indoor 3D Mapping in GPS-Denied Environments Using RKO-LIO with Velodyne–Pixhawk Integration in ROS 2*, IEEE ICHORA 2026, DOI `10.1109/ICHORA69329.2026.11537209`.
