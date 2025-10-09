import { z } from "zod";

export const InstanceObjectSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  createdAt: z.string(),
});

export type InstanceObject = z.infer<typeof InstanceObjectSchema>;
