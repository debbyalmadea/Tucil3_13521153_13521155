import Head from "next/head";
import dynamic from "next/dynamic";
const ShortestPathView = dynamic(
  () => import("@/components/ShortestPathView"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Shortest Path Finder</title>
        <meta
          name="description"
          content="Shortest path finder with UCS and A* algorithm"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-screen h-screen relative text-black bg-gradient-to-tl from-emerald-900 via-emerald-700 to-emerald-200 flex flex-row justify-between items-center">
        <ShortestPathView />
      </main>
    </>
  );
}
