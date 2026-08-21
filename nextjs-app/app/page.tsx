import React from "react";
import { cookies } from "next/headers";
import AppGalleryClient from "./components/gallery/AppGalleryClient";
import { getAppsFromDb, getUsersFromDb } from "@/lib/db";
import { getSession } from "@/lib/session";

/**
 * Server Component Page (Entry Point)
 * Loads initial data and active user session from SQLite database on the server side.
 */
export default async function HomePage() {
  const initialApps = getAppsFromDb();
  const dbUsers = getUsersFromDb();
  
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  let initialUser = dbUsers.guest;
  if (sessionToken) {
    const sessionUser = getSession(sessionToken);
    if (sessionUser) {
      initialUser = sessionUser;
    }
  }

  return (
    <AppGalleryClient
      initialApps={initialApps}
      initialUser={initialUser}
    />
  );
}

