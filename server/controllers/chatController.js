import app from "../llm_application.js";

function chatController() {
  return async function (req, res) {
    try {
      console.log("inside");
      const userMessage = req.body?.message;
      if (!userMessage) {
        return res.status(400).json({ error: "message is required" });
      }

      const result = await app.invoke(
        { messages: [{ role: "user", content: userMessage }] },
        { configurable: { thread_id: "1" } }
      );

      const last = result.messages[result.messages.length - 1];
      return res.json({ AI: last?.content ?? "No Content found" });
    } catch (err) {
      console.error("chatController error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

export { chatController };
