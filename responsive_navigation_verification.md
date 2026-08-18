# Responsive Navigation and Project Archive Verification

**Verification date:** 18 August 2026  
**Local version under verification:** post-`a4dd9f3a` working tree

## Desktop

The shared header displays **Home**, **About**, **Projects**, and **Services** on the services page. The project archive route renders an editorial archive layout with all available projects; the current portfolio contains five projects, so the home page displays all five while retaining the “View all projects” path for future entries up to six.

## Mobile

At 390 px wide, the header presents a visible menu trigger rather than hidden navigation links. The archive is a single-column card list, and the services page preserves its hierarchy and call-to-action readability. The home source limits cards after the third project at the mobile breakpoint, and the skill-category grid changes to two columns.

## Contact information

The hero now exposes email and LinkedIn from managed profile data. The phone field has been added to the database schema and admin profile editor; it is intentionally not shown until a real number is supplied.
