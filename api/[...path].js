export default async function handler(req, res) {
  let { path } = req.query;

  // Normalize path
  let filePath = "";

  if (!path) {
    filePath = "index.html";
  } else {
    filePath = Array.isArray(path) ? path.join("/") : path;

    // If ends with slash → add index.html
    if (filePath.endsWith("/")) {
      filePath += "index.html";
    }

    // If no extension → try index.html inside folder
    if (!filePath.includes(".")) {
      filePath += "/index.html";
    }
  }

  const githubRawUrl = `https://raw.githubusercontent.com/GLITCHED-OVERRIDE/Stratus-Assets/main/${filePath}`;

  try {
    const response = await fetch(githubRawUrl);

    if (!response.ok) {
      return res.status(404).send("404 Not Found");
    }

    const buffer = await response.arrayBuffer();

    // Detect content type
    let contentType = response.headers.get("content-type");

    if (filePath.endsWith(".html")) contentType = "text/html";
    if (filePath.endsWith(".js")) contentType = "application/javascript";
    if (filePath.endsWith(".css")) contentType = "text/css";
    if (filePath.endsWith(".json")) contentType = "application/json";

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600");

    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).send("Server Error");
  }
}
