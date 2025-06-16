"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AdminAuthContextType {
  admin: User | null;
  loading: boolean;
  signOutAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is in admins collection
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          setAdmin(user);
        } else {
          setAdmin(null);
          await signOut(auth);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOutAdmin = async () => {
    await signOut(auth);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signOutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
} 