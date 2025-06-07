export default async function handler(req) {
  return new Response(
    JSON.stringify({ status: "✅ Function draait", env: process.env.TMDB_KEY ? "✅ KEY aanwezig" : "❌ KEY ontbreekt" }),
    { headers: { "Content-Type": "application/json" } }
  );
}
