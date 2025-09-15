"use clint";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface Surah {
  englishName: string;
  identifier: string
  number: string
}

export default function СhooseSurah() {
  const [surahs, setSurah] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQari() {
      try {
        const res = await fetch(
          "https://api.alquran.cloud/v1/surah"
        );
        const data = await res.json();
        setSurah(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    loadQari();
  }, []);

  if (loading) return <div className="flex justify-center items-center"> 
    <p className="loaderTwo"></p>
  </div>;

  return (
    <>
      <div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Choose surah" />
          </SelectTrigger>
          <SelectContent>
            {surahs.map((surah, index) => (
              <SelectItem key={index + 1} value={surah.number}>
                {surah.englishName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
