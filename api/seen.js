// Slaat een titel op in de 'gezien'-lijst
import { kv } from "@vercel/kv";
export const config = { runtime: "edge" };

export default async req => {
  const { imdb_id, user = "anon" } = await req.json();
  await kv.sadd(`seen:${user}`, imdb_id);
  return new Response("OK");
};
