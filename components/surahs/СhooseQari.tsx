"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface Qari {
  englishName: string;
  identifier: string;
}

export default function ChooseQari({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [qaris, setQaris] = useState<Qari[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQari() {
      try {
        const res = await fetch(
          "https://api.alquran.cloud/v1/edition?format=audio"
        );
        const data = await res.json();
        setQaris(data.data);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQari();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center">
        <p className="loaderTwo"></p>
      </div>
    );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Выберите кари" />
      </SelectTrigger>
      <SelectContent>
        {qaris.map((qari) => (
          <SelectItem key={qari.identifier} value={qari.identifier}>
            {qari.englishName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
