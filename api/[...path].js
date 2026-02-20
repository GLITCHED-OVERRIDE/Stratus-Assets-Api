export default async function handler(req, res) {
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "No path provided" });
  }

  const filePath = Array.isArray(path) ? path.join("/") : path;

  const githubRawUrl = `https://raw.githubusercontent.com/GLITCHED-OVERRIDE/Stratus-Assets/main/${filePath}`;

  try {
    const response = await fetch(githubRawUrl);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "File not found",
        githubUrl: githubRawUrl
      });
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600");

    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.status(500).json({
      error: "Failed to fetch from GitHub",
      details: err.message
    });
  }
}
