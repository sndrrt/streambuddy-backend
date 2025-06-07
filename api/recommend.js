// Geeft 1 on-gezien streamingtip terug
import { kv } from "@vercel/kv";

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const providers = (searchParams.get("providers") || "").split(",");
  const genre = searchParams.get("genre");
  const example = searchParams.get("example_title");
  const lang = searchParams.get("lang") || "en";
  const user = searchParams.get("user") || "anon";

  // 1. lijst met al-gezien titels
  const seen = (await kv.smembers(`seen:${user}`)) ?? [];

  // 2. TMDB-zoek-url samenstellen
  console.log("TMDB KEY:", process.env.TMDB_KEY);
  const url = `https://api.themoviedb.org/3/discover/movie` +
    `?api_key=${process.env.TMDB_KEY}` +
    `&with_watch_providers=${providers.join("|")}` +
    `&watch_region=NL` +
    (genre ? `&with_genres=${genre}` : "") +
    `&language=${lang}`;

  const data = await fetch(url).then(r => r.json());

  // 3. eerste resultaat dat nog niet gezien is
  const pick = data.results.find(t => !seen.includes(String(t.id)));

  return new Response(
    JSON.stringify({
      title: pick.title ?? pick.name,
      overview: pick.overview,
      provider: providers[0],
      link: `https://www.themoviedb.org/${pick.media_type}/${pick.id}`
    }),
    { headers: { "content-type": "application/json" } }
  );
}
