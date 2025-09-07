import {
  Activity,
  Home,
  Package2,
  Settings,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import type { Route } from "@/components/layout/dashboard/nav-main";
import React from "react";

/**
 * Factory function to create dashboard navigation routes
 * Moved outside component to prevent recreation on every render
 */
export const createDashboardRoutes = (): Route[] => [
  {
    id: "spotlight",
    title: "Spotlight",
    icon: React.createElement(Home, { className: "size-4" }),
    link: "/dashboard",
  },
  {
    id: "deep-work",
    title: "Deep Work",
    icon: React.createElement(Activity, { className: "size-4" }),
    link: "/dashboard/deep-work",
  },
  {
    id: "plan",
    title: "Plan",
    icon: React.createElement(Sparkles, { className: "size-4" }),
    link: "/dashboard/plan",
  },
  {
    id: "tasks",
    title: "Tasks",
    icon: React.createElement(Package2, { className: "size-4" }),
    link: "/dashboard/tasks",
  },
  {
    id: "settings",
    title: "Settings",
    icon: React.createElement(Settings, { className: "size-4" }),
    link: "/dashboard/settings",
  },
];

// Memoized routes to prevent recreation
export const DASHBOARD_ROUTES = createDashboardRoutes();

/**
 * Sample notifications data
 * Moved outside component to prevent recreation on every render
 */
export const SAMPLE_NOTIFICATIONS = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
  {
    id: "2",
    avatar: "/avatars/02.png",
    fallback: "JL",
    text: "Server upgrade completed.",
    time: "1h ago",
  },
  {
    id: "3",
    avatar: "/avatars/03.png",
    fallback: "HH",
    text: "New user signed up.",
    time: "2h ago",
  },
];

/**
 * Team data for team switcher
 * Moved outside component to prevent recreation on every render
 */
export const TEAMS = [
  { id: "1", name: "Alpha Inc.", logo: Logo, plan: "Free" },
  { id: "2", name: "Beta Corp.", logo: Logo, plan: "Free" },
  { id: "3", name: "Gamma Tech", logo: Logo, plan: "Free" },
];

/**
 * Performance constants for dashboard components
 */
export const DASHBOARD_PERFORMANCE = {
  ANIMATION_DURATION: 0.8,
  RENDER_THRESHOLD_MS: 16, // 60fps target
  MEMOIZATION_ENABLED: true,
} as const;