import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("landing", "routes/landing.tsx"),
    route("group/:groupId", "routes/group.tsx"),
    route("drive", "routes/drive.tsx"),
    route("set-name", "routes/set-name.tsx"),
] satisfies RouteConfig;