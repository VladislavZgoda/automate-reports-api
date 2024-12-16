import Fastify, { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import fs from "fs";
import { pipeline } from "stream/promises";

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.register(fastifyMultipart);

fastify.post("/api/matritca/", async function handler(request, reply) {
  return { hello: "world" };
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
