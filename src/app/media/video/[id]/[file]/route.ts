/**
 * Same-origin passthrough for the stock videos listed in media.ts, so visitors
 * receive no third-party cookies from the video host. Only numeric Pexels ids
 * and .mp4 file names are accepted. Range requests are forwarded so videos can
 * stream and seek. Replace with the client’s own video hosting before launch.
 */
const UPSTREAM = "https://videos.pexels.com/video-files";
const PASS = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  if (!/^\d{4,12}$/.test(id) || !/^[\w.-]{1,80}\.mp4$/.test(file)) return new Response("Not found", { status: 404 });

  const range = request.headers.get("range");
  const upstream = await fetch(`${UPSTREAM}/${id}/${file}`, { headers: range ? { range } : {} });
  if (!upstream.ok && upstream.status !== 206) return new Response("Not found", { status: upstream.status === 416 ? 416 : 404 });

  const headers = new Headers();
  for (const h of PASS) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  headers.set("cache-control", "public, max-age=604800, immutable");
  return new Response(upstream.body, { status: upstream.status, headers });
}
