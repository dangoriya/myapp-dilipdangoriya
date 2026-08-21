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
import AuthModal from "../auth/AuthModal";
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
}

/**
 * Interactive Client Component Container
 * Manages responsive drawer state, role permission filtering, real-time search, and localStorage persistence.
 * Includes add, edit, delete operations for applications (admin only).
 */
export default function AppGalleryClient({
  initialApps = [],
  initialUser = DEFAULT_GUEST_USER,
}: AppGalleryClientProps) {
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>(initialApps);
  const [currentUser, setCurrentUser] = useState<UserProfile>(initialUser);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editApp, setEditApp] = useState<AppItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Sync currentUser whenever initialUser (SSR session) updates
  useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);

  // Load from localStorage or fallback
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

  // Persist changes
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

  // Filter apps based on role and search
  const filteredApps = apps.filter((app) => {
    // Role permission
    let hasAccess = false;
    if (currentUser.role === "admin-only") {
      hasAccess = true;
    } else if (currentUser.role === "normal-user") {
      hasAccess = app.access === "all" || app.access === "normal-user";
    } else {
      hasAccess = app.access === "all";
    }
    if (!hasAccess) return false;
    // Search
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.title.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
    );
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setCurrentUser(DEFAULT_GUEST_USER);
    router.refresh();
  };

  const handleSelectUser = (user: UserProfile) => {
    setCurrentUser(user);
    router.refresh();
  };

  const handleUpdatePortfolio = (newUrl: string) => {
    setCurrentUser((prev) => ({ ...prev, siteUrl: newUrl }));
  };

  const isAdmin = currentUser.role === "admin-only";

  return (
    <div className="flex min-h-screen bg-[#0d1017] relative overflow-hidden">
      <TopProgressBar />
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onUpdatePortfolio={handleUpdatePortfolio}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
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
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={currentUser.role}
        onSelectUser={handleSelectUser}
      />
    </div>
  );
}
