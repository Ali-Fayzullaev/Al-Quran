"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Surah {
  englishName: string;
  number: number;
}

export default function ChooseSurah() {
  const params = useParams();
  const id = params.id;
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurah, setSelectedSurah] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function loadSurahs() {
      try {
        const res = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await res.json();
        setSurahs(data.data);

        // когда загрузились — выставляем выбранную суру по id
        if (id) {
          setSelectedSurah(String(id));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadSurahs();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center">
        <p className="loaderTwo"></p>
      </div>
    );

  return (
    <div>
      <Select value={selectedSurah} onValueChange={(value) => setSelectedSurah(value)}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Choose surah" />
        </SelectTrigger>
        <SelectContent>
          {surahs.map((surah) => (
            <SelectItem key={surah.number} value={String(surah.number)}>
                 {surah.englishName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
