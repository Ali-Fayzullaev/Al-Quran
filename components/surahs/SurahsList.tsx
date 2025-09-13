import Link from "next/link";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

export default async function SurahsList() {
  const res = await fetch("https://api.alquran.cloud/v1/surah", {
    next: { revalidate: 60 }, // ⚡ кеширование на 60 секунд
  });
  const data = await res.json();
  const surahs: Surah[] = data.data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
      {surahs.map((surah) => (
        <Link key={surah.number} href={`surah/${surah.number}`}>
          <div className="p-4 border rounded-xl shadow bg-white dark:bg-neutral-900">
            <h3 className="font-bold text-lg">
              {surah.number}. {surah.englishName}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{surah.name}</p>
            <p className="text-sm text-gray-500">
              {surah.numberOfAyahs} аятов – {surah.revelationType}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
