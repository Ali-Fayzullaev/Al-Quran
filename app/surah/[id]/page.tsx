"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Ayah {
  number: number;
  text: string;
}

export default function Surah() {
  const params = useParams();
  const id = params.id;
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSurah() {
      try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${id}`);
        const data = await res.json();
        setAyahs(data.data.ayahs); // ⚡ правильный путь
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSurah();
  }, [id]);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="p-6 space-y-4">
      {ayahs.map((a) => (
        <div className="flex gap-4" key={a.number}>
          <span className="font-bold">{a.number}.</span>
          <span>{a.text}</span>
        </div>
      ))}
    </div>
  );
}
