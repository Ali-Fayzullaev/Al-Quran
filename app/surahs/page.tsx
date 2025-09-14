// app/surahs/page.tsx
import SurahsList from "@/components/surahs/SurahsList";

export default async function SurahsPage() {
  const res = await fetch("https://api.alquran.cloud/v1/surah", {
    cache: "force-cache",
  });
  const data = await res.json();

  return <SurahsList surahs={data.data} />;
}
