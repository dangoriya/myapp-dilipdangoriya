"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppItem, UserProfile, UserRole } from "@/types";
import Sidebar from "../sidebar/Sidebar";
import GalleryHeader from "./GalleryHeader";
import AppCard from "./AppCard";
import AddAppModal from "./AddAppModal";
import EditAppModal from "./EditAppModal";
import TopProgressBar from "../ui/TopProgressBar";
import { SafeIcon } from "../ui/SafeIcon";

const GradientWaves = dynamic(() => import("../ui/GradientWaves"), {
  ssr: false,
});

const DEFAULT_GUEST_USER: UserProfile = {
  id: "guest",
  name: "Dilip Dangoriya",
  email: "dilipdangoriya@gmail.com",
  role: "guest",
  avatar: "/images/profile.png",
  siteUrl: "https://iprofile.com"
};

interface AppGalleryClientProps {
  initialApps?: AppItem[];
  initialUser?: UserProfile;
  authFlow?: "local" | "oidc";
  authError?: string;
}

export default function AppGalleryClient({
  initialApps = [],
  initialUser = DEFAULT_GUEST_USER,
  authFlow = "oidc",
  authError,
}: AppGalleryClientProps) {
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>(initialApps);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUser);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editApp, setEditApp] = useState<AppItem | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [authErrorState, setAuthErrorState] = useState<string | undefined>(authError);

  useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    setAuthErrorState(authError);
  }, [authError]);

  useEffect(() => {
    const saved = localStorage.getItem("devhub_apps");
    if (saved) {
      try {
        setApps(JSON.parse(saved));
      } catch {
        setApps(initialApps);
      }
    } else {
      setApps(initialApps);
    }
  }, [initialApps]);

  const persist = (newApps: AppItem[]) => {
    setApps(newApps);
    localStorage.setItem("devhub_apps", JSON.stringify(newApps));
  };

  const handleAddApp = (newApp: AppItem) => {
    const updated = [...apps, newApp];
    persist(updated);
  };

  const handleEditApp = (updatedApp: AppItem) => {
    const updated = apps.map((a) => (a.id === updatedApp.id ? updatedApp : a));
    persist(updated);
    setEditApp(null);
  };

  const handleDeleteApp = (appId: string) => {
    const updated = apps.filter((a) => a.id !== appId);
    persist(updated);
  };

  const filteredApps = apps.filter((app) => {
    let hasAccess = false;
    if (currentUser.role === "admin-only") {
      hasAccess = true;
    } else if (currentUser.role === "normal-user") {
      hasAccess = app.access === "all" || app.access === "normal-user";
    } else {
      hasAccess = app.access === "all";
    }
    if (!hasAccess) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.title.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
    );
  });

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const handleUpdatePortfolio = (newUrl: string) => {
    setCurrentUser((prev) => ({ ...prev, siteUrl: newUrl }));
  };

  const isAdmin = currentUser.role === "admin-only";

  return (
    <div className="flex min-h-screen bg-[#0d1017] relative overflow-hidden">
      <TopProgressBar />
      {authErrorState && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-lg">
            <SafeIcon name="AlertCircle" size={18} style={{ color: "#f87171" }} />
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Login failed</div>
              <div className="text-xs text-rose-300 break-words">{authErrorState}</div>
            </div>
            <button
              onClick={() => setAuthErrorState(undefined)}
              className="text-rose-400 hover:text-rose-200 ml-2"
            >
              <SafeIcon name="X" size={14} />
            </button>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        onOpenAuthModal={() => { 
          if (authFlow === "local") {
            window.location.href = "/auth/local-login";
          } else {
            window.location.href = "/api/auth/login";
          }
        }}
        onLogout={handleLogout}
        onUpdatePortfolio={handleUpdatePortfolio}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        authFlow={authFlow}
      />

      {/* Main Content Workspace with Animated Gradient Waves Background */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto w-full relative z-10">
        {/* Animated Background Canvas */}
        <div className="absolute inset-0 -z-10 opacity-35 pointer-events-none overflow-hidden">
          <GradientWaves
            horizonColor="#0c1714"
            waveColor="#103a2e"
            crestColor="#6ee7b7"
            speed={0.4}
            amplitude={2.5}
            waveScale={0.6}
            waveRatio={0.9}
            swell={35}
            turbulence={20}
            tilt={1.11}
            zoom={1.0}
            height={5.5}
            fogDepth={15}
            detail="medium"
            brightness={1.0}
            opacity={0.6}
            mouseInteraction={true}
            parallaxStrength={0.5}
            grain={true}
            grainIntensity={0.04}
          />
        </div>

        <GalleryHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6 mt-6">
          {filteredApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              userRole={currentUser.role as UserRole}
              onEdit={isAdmin ? (a) => setEditApp(a) : undefined}
              onDelete={isAdmin ? handleDeleteApp : undefined}
            />
          ))}

          {/* Add New App Tile (admin only) */}
          {isAdmin && (
            <div
              onClick={() => setIsAddModalOpen(true)}
              className="border-2 border-dashed border-white/20 hover:border-white/45 rounded-2xl min-h-[160px] sm:min-h-[210px] p-4 flex flex-col items-center justify-center gap-2 sm:gap-3 cursor-pointer bg-white/[0.01] hover:bg-white/[0.04] text-white/60 hover:text-white transition-all duration-250 hover:-translate-y-1"
            >
              <SafeIcon name="Plus" size={28} />
              <span className="text-xs sm:text-sm font-semibold text-center">Add New App</span>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddAppModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddApp={handleAddApp} />
      {editApp && (
        <EditAppModal
          isOpen={!!editApp}
          app={editApp}
          onClose={() => setEditApp(null)}
          onSave={handleEditApp}
        />
      )}
    </div>
  );
}