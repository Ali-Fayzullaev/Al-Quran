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

export default function ChooseEdition() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEdition, setSelectedEdition] = useState("ru.kuliev"); // 🟢 дефолт

  // Загружаем список изданий
  useEffect(() => {
    async function loadEdition() {
      try {
        const res = await fetch("https://api.alquran.cloud/v1/edition");
        const data = await res.json();
        setEditions(data.data);

        // 🟢 Проверяем localStorage
        const savedEdition = localStorage.getItem("edition");
        if (savedEdition) {
          setSelectedEdition(savedEdition);
        } else {
          localStorage.setItem("edition", "ru.kuliev");
        }
      } catch (error) {
        console.error("Ошибка загрузки:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEdition();
  }, []);

  // Обработчик выбора
  const handleEditionChange = (value: string) => {
    setSelectedEdition(value);
    localStorage.setItem("edition", value); // 🟢 сохраняем выбор
  };

  if (loading)
    return (
      <div className="flex justify-center items-center">
        <p className="loaderTwo"></p>
      </div>
    );

  return (
    <div>
      <Select value={selectedEdition} onValueChange={handleEditionChange}>
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
    </div>
  );
}
