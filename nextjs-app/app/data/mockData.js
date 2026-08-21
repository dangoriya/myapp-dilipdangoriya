// Mock Users for testing authentication and roles
export const MOCK_USERS = {
    guest: {
        id: "guest",
        name: "Guest User",
        email: "guest@devhub.com",
        role: "guest",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80",
        siteUrl: "https://example.com"
    },
    user: {
        id: "user-1",
        name: "Dilip Dangoriya",
        email: "dilipdangoriya@gmail.com",
        role: "normal-user",
        avatar: "/images/profile.png",
        siteUrl: "https://iprofile.com"
    },
    admin: {
        id: "admin-1",
        name: "Admin Developer",
        email: "admin@iprofile.com",
        role: "admin-only",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
        siteUrl: "https://admin.iprofile.com"
    }
};

// Initial applications matching reference image
export const INITIAL_APPS = [
    {
        id: "app-1",
        title: "AI Studio",
        description: "Centralized launchpad, emerald and AI studio.",
        link: "https://aistudio.google.com",
        icon: "Bot",
        color: "#10b981", // Emerald Green
        access: "all"
    },
    {
        id: "app-2",
        title: "Source Control",
        description: "Centralized launchpad, source control.",
        link: "https://github.com",
        icon: "GitBranch",
        color: "#a855f7", // Purple
        access: "all"
    },
    {
        id: "app-3",
        title: "Deploy Manager",
        description: "Centralized launchpad, deploy cloud manager.",
        link: "https://vercel.com",
        icon: "Cloud",
        color: "#06b6d4", // Cyan
        access: "all"
    },
    {
        id: "app-4",
        title: "Database Admin",
        description: "Centralized launchpad, database admin.",
        link: "https://supabase.com",
        icon: "Database",
        color: "#f59e0b", // Amber/Yellow
        access: "normal-user"
    },
    {
        id: "app-5",
        title: "Analytics Desk",
        description: "Centralized launchpad, analytics desk - rose.",
        link: "https://analytics.google.com",
        icon: "BarChart3",
        color: "#f43f5e", // Rose/Red
        access: "admin-only"
    }
];

// Available Preset Colors for Card Creation
export const COLOR_PRESETS = [
    { name: "Emerald", hex: "#10b981" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Rose", hex: "#f43f5e" },
    { name: "Indigo", hex: "#6366f1" },
    { name: "Sky", hex: "#0284c7" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Orange", hex: "#f97316" }
];

// Available Icons for Selection
export const ICON_OPTIONS = [
    { id: "Bot", label: "AI Bot" },
    { id: "GitBranch", label: "Git / Source" },
    { id: "Cloud", label: "Cloud" },
    { id: "Database", label: "Database" },
    { id: "BarChart3", label: "Analytics" },
    { id: "Code2", label: "Code" },
    { id: "Terminal", label: "Terminal" },
    { id: "Globe", label: "Web / Site" },
    { id: "ShieldCheck", label: "Security" },
    { id: "Cpu", label: "Hardware / CPU" },
    { id: "Sparkles", label: "AI Sparkles" },
    { id: "Layers", label: "Layers" }
];
