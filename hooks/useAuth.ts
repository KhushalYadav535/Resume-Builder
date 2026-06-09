import { useContext } from "react";
import { AuthContext } from "@/components/AuthProvider";

/**
 * Reusable React Hook to access the global authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
