"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/lib/firebase/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export default function DeliveryMenuAdminPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const q = query(collection(db, "deliveryMenu"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Fetched menus:", menuData.length, menuData); // Debug log
      setMenus(menuData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price.trim() || !category.trim()) {
      setError("Prosim izpolnite vsa polja");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "deliveryMenu"), {
        name: name.trim(),
        description: description.trim(),
        price: price.trim(),
        category: category.trim(),
        createdAt: serverTimestamp(),
      });

      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setSuccess("Meni uspešno dodan!");
    } catch (err) {
      setError("Napaka pri dodajanju menija");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Ali ste prepričani, da želite izbrisati ta meni?")) {
      try {
        await deleteDoc(doc(db, "deliveryMenu", id));
        setSuccess("Meni uspešno izbrisan!");
      } catch (err) {
        setError("Napaka pri brisanju menija");
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Stalni meniji spletna stran</h1>

      {/* Add Menu Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Dodaj nov meni</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ime jedi *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                placeholder="Npr. Pizza Margherita"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorija *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                placeholder="Npr. Pice, Malice, Pijače"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              placeholder="Opis jedi..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cena *
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              placeholder="Npr. 8,50 €"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Dodajam..." : "Dodaj meni"}
          </button>
        </form>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Menu List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Seznam menijev</h2>
        {menus.length === 0 ? (
          <p className="text-gray-500">Ni dodanih menijev.</p>
        ) : (
          <div className="space-y-4">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{menu.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {menu.category}
                    </span>
                  </div>
                  {menu.description && (
                    <p className="text-gray-600 text-sm mb-2">{menu.description}</p>
                  )}
                  <p className="font-bold text-green-600">{menu.price}</p>
                </div>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 ml-4"
                >
                  Izbriši
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 