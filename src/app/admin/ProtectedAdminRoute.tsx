"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/lib/contexts/AdminAuthContext";

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/admin/login");
    }
  }, [admin, loading, router]);

  if (loading || !admin) {
    // Optionally, show a spinner here
    return null;
  }

  return <>{children}</>;
} 