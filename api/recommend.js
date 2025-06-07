export default async function handler(req) {
  return new Response(
    JSON.stringify({ message: "✅ Basic function werkt!" }),
    {
      headers: { "Content-Type": "application/json" },
      status: 200
    }
  );
}
