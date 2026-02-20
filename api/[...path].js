export default async function handler(req, res) {
  let { path } = req.query;

  // Normalize path
  let segments = [];
  if (!path) segments = ["index.html"];
  else segments = Array.isArray(path) ? path : [path];

  // Attempt paths in order:
  // 1. Exact path
  // 2. path + "/index.html" if folder
  const tryPaths = [];
  const joined = segments.join("/");

  tryPaths.push(joined);

  // If no extension, try as folder → add index.html
  if (!joined.includes(".")) {
    tryPaths.push(`${joined}/index.html`);
  }

  // If ends with /, also try index.html
  if (joined.endsWith("/")) {
    tryPaths.push(`${joined}index.html`);
  }

  let finalBuffer = null;
  let contentType = "application/octet-stream";

  for (const p of tryPaths) {
    const githubUrl = `https://raw.githubusercontent.com/GLITCHED-OVERRIDE/Stratus-Assets/main/${p}`;
    try {
      const response = await fetch(githubUrl);
      if (!response.ok) continue;

      const buffer = await response.arrayBuffer();

      // Detect content type based on extension
      if (p.endsWith(".html")) contentType = "text/html";
      else if (p.endsWith(".js")) contentType = "application/javascript";
      else if (p.endsWith(".css")) contentType = "text/css";
      else if (p.endsWith(".json")) contentType = "application/json";
      else if (p.endsWith(".png")) contentType = "image/png";
      else if (p.endsWith(".jpg") || p.endsWith(".jpeg")) contentType = "image/jpeg";
      else if (p.endsWith(".glb")) contentType = "model/gltf-binary";

      finalBuffer = Buffer.from(buffer);
      break; // stop on first found
    } catch (err) {
      continue; // try next path
    }
  }

  if (!finalBuffer) {
    return res.status(404).send("404 Not Found");
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.status(200).send(finalBuffer);
}
