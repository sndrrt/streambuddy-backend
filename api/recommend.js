export default async function handler(req) {
  try {
    const url = "https://api.themoviedb.org/3/movie/550?api_key=" + process.env.TMDB_KEY;
    const res = await fetch(url);
    const data = await res.json();

    return new Response(JSON.stringify({
      message: "✅ API werkt",
      movie: data.title,
      status: res.status
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
