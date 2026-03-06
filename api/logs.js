module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const gasUrl = process.env.GASS_URL;
  if (!gasUrl) {
    return res
      .status(500)
      .json({ success: false, message: "Missing GASS_URL environment variable" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const name = payload && typeof payload.name === "string" ? payload.name.trim() : "";
    const email = payload && typeof payload.email === "string" ? payload.email.trim() : "";
    const log = payload ? payload.log : null;

    if (!name || !email || !log) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields: name, email, log" });
    }

    const upstreamResponse = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, log }),
    });

    const upstreamText = await upstreamResponse.text();
    let upstreamJson = null;
    try {
      upstreamJson = JSON.parse(upstreamText);
    } catch (_) {
      upstreamJson = { raw: upstreamText };
    }

    if (!upstreamResponse.ok) {
      return res.status(502).json({
        success: false,
        message: "Failed to forward logs to GAS",
        upstream: upstreamJson,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logs forwarded to GAS",
      upstream: upstreamJson,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error && error.message ? error.message : "Unexpected server error",
    });
  }
};
