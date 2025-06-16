"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/app/lib/firebase/firebase";
import { collection, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // Check if user is in admins collection
      const adminDoc = await getDoc(doc(collection(db, "admins"), cred.user.uid));
      if (!adminDoc.exists()) {
        setError("Nimate pravic za dostop do administratorske plošče.");
        await signOut(auth);
        setLoading(false);
        return;
      }
      // Success: redirect to /admin
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Napaka pri prijavi.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white border border-gray-200 rounded-lg p-8 w-full max-w-md shadow"
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-900 text-center">Prijava za administratorje</h1>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-black bg-white placeholder-black"
            placeholder="admin@mojamalca.si"
            required
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Geslo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-black bg-white placeholder-black"
            placeholder="Vaše geslo"
            required
            disabled={loading}
          />
        </div>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded w-full hover:bg-gray-800 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Prijavljam ..." : "Prijava"}
        </button>
      </form>
    </div>
  );
} 