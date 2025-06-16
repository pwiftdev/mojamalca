"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase/firebase";
import { useAdminAuth } from "@/app/lib/contexts/AdminAuthContext";
import {
  collection,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  where,
} from "firebase/firestore";

export default function BazaMenijevPage() {
  const { admin } = useAdminAuth();
  
  // Category state
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  // Menu state
  const [menuName, setMenuName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [menuSuccess, setMenuSuccess] = useState(false);

  // Menus list
  const [menus, setMenus] = useState<any[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);

  // Fetch categories live
  useEffect(() => {
    if (!admin) return;
    
    const q = query(
      collection(db, "menuCategories"),
      where("companyId", "==", admin.uid),
      orderBy("name")
    );
    const unsub = onSnapshot(q, (snap) => {
      setCategories(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [admin]);

  // Fetch menus live
  useEffect(() => {
    if (!admin) return;
    
    const q = query(
      collection(db, "menuBase"),
      where("companyId", "==", admin.uid),
      orderBy("name")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMenus(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setMenusLoading(false);
    });
    return () => unsub();
  }, [admin]);

  // Set default selected category
  useEffect(() => {
    if (categories.length && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) {
      setCatError("Niste prijavljeni kot administrator.");
      return;
    }
    
    setCatError("");
    if (!newCategory.trim()) {
      setCatError("Vnesite ime kategorije.");
      return;
    }
    setCatLoading(true);
    try {
      const docRef = await addDoc(collection(db, "menuCategories"), {
        name: newCategory.trim(),
        companyId: admin.uid,
        createdAt: serverTimestamp(),
      });
      setNewCategory("");
    } catch (err) {
      setCatError(`Napaka pri shranjevanju kategorije: ${err instanceof Error ? err.message : 'Neznana napaka'}`);
    }
    setCatLoading(false);
  };

  // Add menu
  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) {
      setMenuError("Niste prijavljeni kot administrator.");
      return;
    }
    
    setMenuError("");
    setMenuSuccess(false);
    if (!menuName.trim()) {
      setMenuError("Vnesite ime menija.");
      return;
    }
    if (!selectedCategory) {
      setMenuError("Izberite kategorijo.");
      return;
    }
    setMenuLoading(true);
    try {
      await addDoc(collection(db, "menuBase"), {
        name: menuName.trim(),
        description: menuDescription.trim(),
        categoryId: selectedCategory,
        companyId: admin.uid,
        createdAt: serverTimestamp(),
      });
      setMenuName("");
      setMenuDescription("");
      setMenuSuccess(true);
    } catch (err) {
      setMenuError(`Napaka pri shranjevanju menija: ${err instanceof Error ? err.message : 'Neznana napaka'}`);
    }
    setMenuLoading(false);
  };

  if (!admin) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <p className="text-red-600">Za dostop do te strani morate biti prijavljeni kot administrator.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Baza menijev</h1>
      {/* Add Category */}
      <form onSubmit={handleAddCategory} className="mb-8 bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold mb-2 text-gray-800">Dodaj kategorijo</h2>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ime kategorije"
            className="border border-gray-300 rounded px-3 py-2 w-full text-black placeholder-black bg-white"
            disabled={catLoading}
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
            disabled={catLoading}
          >
            Dodaj
          </button>
        </div>
        {catError && <p className="text-red-600 mt-2 text-sm">{catError}</p>}
      </form>

      {/* Add Menu */}
      <form onSubmit={handleAddMenu} className="mb-8 bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold mb-2 text-gray-800">Dodaj meni</h2>
        <div className="mb-2">
          <input
            type="text"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            placeholder="Ime menija"
            className="border border-gray-300 rounded px-3 py-2 w-full text-black placeholder-black bg-white"
            disabled={menuLoading}
          />
        </div>
        <div className="mb-2">
          <textarea
            value={menuDescription}
            onChange={(e) => setMenuDescription(e.target.value)}
            placeholder="Opis menija (neobvezno)"
            className="border border-gray-300 rounded px-3 py-2 w-full text-black placeholder-black bg-white"
            rows={2}
            disabled={menuLoading}
          />
        </div>
        <div className="mb-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-black bg-white"
            disabled={menuLoading || !categories.length}
          >
            {categories.length === 0 && <option value="">Najprej dodajte kategorijo</option>}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
          disabled={menuLoading || !categories.length}
        >
          Shrani meni
        </button>
        {menuError && <p className="text-red-600 mt-2 text-sm">{menuError}</p>}
        {menuSuccess && <p className="text-green-700 mt-2 text-sm">Meni uspešno shranjen!</p>}
      </form>

      {/* List Categories */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold mb-2 text-gray-800">Kategorije</h2>
        <ul className="list-disc pl-5 text-gray-700">
          {categories.map((cat) => (
            <li key={cat.id}>{cat.name}</li>
          ))}
        </ul>
      </div>

      {/* List Menus */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold mb-2 text-gray-800">Shranjeni meniji</h2>
        {menusLoading ? (
          <p className="text-gray-500">Nalaganje ...</p>
        ) : menus.length === 0 ? (
          <p className="text-gray-500">Ni shranjenih menijev.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {menus.map((menu) => (
              <li key={menu.id} className="py-2">
                <span className="font-medium text-gray-900">{menu.name}</span>
                {menu.description && <span className="text-gray-600 ml-2">– {menu.description}</span>}
                {menu.categoryId && (
                  <span className="ml-2 text-xs text-gray-500">
                    (
                    {categories.find((cat) => cat.id === menu.categoryId)?.name || "Brez kategorije"}
                    )
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 