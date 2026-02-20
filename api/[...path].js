export default async function handler(req, res) {
  let { path } = req.query;
  const branch = "main"; // Change if your branch is different

  // Normalize path
  let segments = [];
  if (!path) segments = ["index.html"];
  else segments = Array.isArray(path) ? path : [path];

  let joinedPath = segments.join("/");

  // If path ends with / or has no extension, try index.html
  if (joinedPath.endsWith("/")) joinedPath += "index.html";
  if (!joinedPath.includes(".")) joinedPath += "/index.html";

  const githubRawUrl = `https://raw.githubusercontent.com/GLITCHED-OVERRIDE/Stratus-Assets/${branch}/${joinedPath}`;

  try {
    const response = await fetch(githubRawUrl);
    if (!response.ok) return res.status(404).send("404 Not Found");

    const buffer = await response.arrayBuffer();
    let contentType = response.headers.get("content-type") || "application/octet-stream";

    // Determine type by file extension
    if (joinedPath.endsWith(".html")) contentType = "text/html";
    else if (joinedPath.endsWith(".js")) contentType = "application/javascript";
    else if (joinedPath.endsWith(".css")) contentType = "text/css";
    else if (joinedPath.endsWith(".json")) contentType = "application/json";
    else if (joinedPath.endsWith(".png")) contentType = "image/png";
    else if (joinedPath.endsWith(".jpg") || joinedPath.endsWith(".jpeg")) contentType = "image/jpeg";
    else if (joinedPath.endsWith(".glb")) contentType = "model/gltf-binary";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");

    // If HTML → rewrite relative URLs to go through API
    if (joinedPath.endsWith(".html")) {
      let html = Buffer.from(buffer).toString("utf-8");

      // Rewrite relative src, href, fetch URLs
      html = html.replace(
        /(src|href|data-src)=["']([^"'\/][^"']*)["']/g,
        (match, attr, url) => {
          // Make relative URLs go through this API
          return `${attr}="/${url}"`;
        }
      );

      html = html.replace(
        /fetch\(["']([^"'\/][^"']*)["']\)/g,
        (match, url) => `fetch("/${url}")`
      );

      return res.status(200).send(html);
    }

    // Otherwise return raw buffer
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).send("Server Error: " + err.message);
  }
}
