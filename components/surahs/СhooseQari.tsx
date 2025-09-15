"use clint";

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
}

export default function СhooseQari() {
  const [qaris, setQaris] = useState<Qari[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSurah() {
      try {
        const res = await fetch(
          "https://api.alquran.cloud/v1/edition?format=audio"
        );
        const data = await res.json();
        setQaris(data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    loadSurah();
  }, []);

  return (
    <>
      <div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Qaris" />
          </SelectTrigger>
          <SelectContent>
            {qaris.map((qari, index) => (
              <SelectItem key={index + 1} value={qari.englishName}>
                {qari.englishName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
