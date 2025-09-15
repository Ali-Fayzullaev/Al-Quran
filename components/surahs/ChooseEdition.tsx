"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface Edition {
  identifier: string;
  englishName: string;
  language: string;
  type: string;
}

export default function ChooseEdition({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEdition() {
      try {
        const res = await fetch("https://api.alquran.cloud/v1/edition");
        const data = await res.json();
        setEditions(data.data);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEdition();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center">
        <p className="loaderTwo"></p>
      </div>
    );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Выберите издание" />
      </SelectTrigger>
      <SelectContent>
        {editions.map((item) => (
          <SelectItem key={item.identifier} value={item.identifier}>
            {item.englishName} ({item.language})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
