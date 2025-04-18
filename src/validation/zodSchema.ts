import { z } from "zod";

export const payloadTokenSchema = z.object({
  payload: z.object({
    id: z.number(),
    userName: z.string(),
  }),
});

export const refreshTokenSchema = z.object({
  token: z.string({ message: "You are not authenticated." }),
});
