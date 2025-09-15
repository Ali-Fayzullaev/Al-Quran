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
  identifier: string
}

export default function СhooseQari() {
  const [qaris, setQaris] = useState<Qari[]>([]);
  const [loading, setLoading] = useState(true);
  const [slecttedQari, setSelectedQari] = useState("ar.husary")

  useEffect(() => {
    async function loadQari() {
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
            <SelectValue placeholder="Qaris" />
          </SelectTrigger>
          <SelectContent>
            {qaris.map((qari, index) => (
              <SelectItem key={index + 1} value={qari.identifier}>
                {qari.englishName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
