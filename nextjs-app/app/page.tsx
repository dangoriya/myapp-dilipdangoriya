import React from "react";
import AppGalleryClient from "./components/gallery/AppGalleryClient";
import { INITIAL_APPS, MOCK_USERS } from "@/lib/constants";

/**
 * Server Component Page (Entry Point)
 * Loads initial data on the server side and renders the interactive client gallery container.
 */
export default async function HomePage() {
  // Load server-side data (can be hooked up to FastAPI/database API in future backend phase)
  const initialApps = INITIAL_APPS;
  const initialUser = MOCK_USERS.user;

  return (
    <AppGalleryClient
      initialApps={initialApps}
      initialUser={initialUser}
    />
  );
}
