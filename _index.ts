import Fastify, { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import { createWriteStream } from "node:fs";
import { pipeline } from "stream/promises";
import { folderExists } from "utils/fileSystemFunc.js";
import { randomUUID } from "crypto";
import parseMatritca from "parse-excel/parseMatritca.js";

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.register(fastifyMultipart);

fastify.post("/api/matritca/", async function handler(request, reply) {
  const data = await request.file();

  if (
    data?.mimetype !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    reply.code(406).send({
      message:
        "Only 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' content types supported.",
    });
  }

  if (data?.file) {
    const fileName = `private_sector${randomUUID()}.xlsx`;
    await folderExists("./upload");
    await pipeline(data.file, createWriteStream(`./upload/${fileName}`));

    // @ts-expect-error некорректный тип, код рабочий
    const balanceGroup = data?.fields.balanceGroup.value as "private" | "legal";
    await parseMatritca(fileName, balanceGroup);
    reply.code(200).send();
  }
});

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
