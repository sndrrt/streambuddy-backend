import { kv } from "@vercel/kv";

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const providers = (searchParams.get("providers") || "").split(",");
    const genre = searchParams.get("genre");
    const lang = searchParams.get("lang") || "en";
    const user = searchParams.get("user") || "anon";

    const seen = (await kv.smembers(`seen:${user}`)) ?? [];

    const apiKey = process.env.TMDB_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "TMDB_KEY is undefined" }), { status: 500 });
    }

    const url = `https://api.themoviedb.org/3/discover/movie` +
      `?api_key=${apiKey}` +
      `&with_watch_providers=${providers.join("|")}` +
      `&watch_region=NL` +
      (genre ? `&with_genres=${genre}` : "") +
      `&language=${lang}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.results) {
      return new Response(JSON.stringify({ error: "Geen results ontvangen", tmdb: data }), { status: 500 });
    }

    const pick = data.results.find(t => !seen.includes(String(t.id)));

    if (!pick) {
      return new Response(JSON.stringify({ error: "Geen geschikte suggestie gevonden" }), { status: 404 });
    }

    return new Response(
      JSON.stringify({
        title: pick.title ?? pick.name,
        overview: pick.overview,
        provider: providers[0],
        link: `https://www.themoviedb.org/movie/${pick.id}`
      }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Crash", details: err.message }), { status: 500 });
  }
}
