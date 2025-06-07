import { kv } from "@vercel/kv";

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const providers = (searchParams.get("providers") || "").split(",");
  const genre = searchParams.get("genre");
  const example = searchParams.get("example_title");
  const lang = searchParams.get("lang") || "en";
  const user = searchParams.get("user") || "anon";

  const seen = (await kv.smembers(`seen:${user}`)) ?? [];

  console.log("TMDB KEY:", process.env.TMDB_KEY);
  const url = `https://api.themoviedb.org/3/discover/movie` +
    `?api_key=${process.env.TMDB_KEY}` +
    `&with_watch_providers=${providers.join("|")}` +
    `&watch_region=NL` +
    (genre ? `&with_genres=${genre}` : "") +
    `&language=${lang}`;

  const data = await fetch(url).then(r => r.json());

  if (!data.results || data.results.length === 0) {
    return new Response(
      JSON.stringify({ error: "Geen resultaten van TMDB." }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const pick = data.results.find(t => !seen.includes(String(t.id)));

  if (!pick) {
    return new Response(
      JSON.stringify({ error: "Geen geschikte suggestie gevonden." }),
      { status: 404, headers: { "content-type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      title: pick.title ?? pick.name,
      overview: pick.overview,
      provider: providers[0],
      link: `https://www.themoviedb.org/${pick.media_type ?? "movie"}/${pick.id}`
    }),
    { headers: { "content-type": "application/json" } }
  );
}
