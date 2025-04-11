import { z } from "zod";

export const payloadTokenSchema = z.object({
  payload: z.object({
    id: z.number(),
    userName: z.string(),
  }),
});
