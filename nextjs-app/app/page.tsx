import React from "react";
import { cookies } from "next/headers";
import AppGalleryClient from "./components/gallery/AppGalleryClient";
import { getAppsFromDb, getUsersFromDb } from "@/lib/db";
import { getSession } from "@/lib/session";
import { getAuthFlow } from "@/lib/auth-config";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ auth_error?: string }> }) {
  const initialApps = getAppsFromDb();
  const dbUsers = getUsersFromDb();
  const authFlow = getAuthFlow();
  
  const params = await searchParams;
  const authError = params.auth_error;
  
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
      authFlow={authFlow}
      authError={authError}
    />
  );
}