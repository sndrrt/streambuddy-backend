export default async function handler(req) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconden max

    const url = "https://api.themoviedb.org/3/movie/550?api_key=" + process.env.TMDB_KEY;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const data = await res.json();

    return new Response(
      JSON.stringify({
        message: "✅ API-call gelukt",
        movie: data.title,
        status: res.status
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "❌ Fout tijdens fetch", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
