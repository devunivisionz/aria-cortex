// hooks/useAuthInit.ts
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const useAuthInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have tokens in localStorage
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (accessToken && refreshToken) {
          console.log("Restoring session from localStorage...");

          // Set the session in Supabase client
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Failed to restore session:", error);
            // Clear invalid tokens
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
          } else {
            console.log(
              "Session restored successfully:",
              data.session?.user?.id
            );
          }
        } else {
          // Check if Supabase has a session
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            console.log("Found existing Supabase session");
          } else {
            console.log("No session found");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  return isInitialized;
};
