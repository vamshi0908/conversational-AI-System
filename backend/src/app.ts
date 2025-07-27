import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import pino from "pino";
import { handleTurn } from "./orchestrator.js";

const app = Fastify({
  logger: pino({
    level: "info",
    redact: { paths: ["req.headers.authorization"], censor: "[redacted]" }
  }),
  bodyLimit: 128 * 1024 // prevent giant payloads
});

// CORS: allow your frontend origin
await app.register(cors, {
  origin: [process.env.FRONTEND_ORIGIN ?? "http://localhost:3001"],
  methods: ["POST", "OPTIONS"]
});

// Per‑IP rate limit
await app.register(rateLimit, { max: 30, timeWindow: "1 minute" });

type ChatIn = { conversationId?: string; text?: string; role?: "customer" | "agent" | "admin" };
const isSafeText = (s: unknown): s is string => typeof s === "string" && s.length > 0 && s.length <= 1000;

app.post("/chat", async (req, reply) => {
  const body = (req.body ?? {}) as ChatIn;
  if (!isSafeText(body.text)) return reply.code(400).send({ error: "Bad request" });

  const conversationId = body.conversationId ?? "demo-1";
  const role = body.role ?? "customer";

  try {
    const out = await handleTurn(conversationId, role, body.text);
    return reply.send({ conversationId, response: out.text, memory: out.memory });
  } catch (e: any) {
    req.log.error({ err: e?.message }, "chat_error");
    return reply.code(500).send({ conversationId, response: "Sorry, something went wrong.", memory: {} });
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app
  .listen({ port: PORT, host: "0.0.0.0" })
  .then(() => app.log.info(`Backend running on http://localhost:${PORT}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
