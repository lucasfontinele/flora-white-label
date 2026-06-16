import { z } from "zod";
import { orderStages } from "@/lib/data";

export const orderSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  number: z.string(),
  status: z.enum(orderStages),
  createdAt: z.string(),
  items: z.number(),
  deliveryType: z.enum(["Retirada na sede", "Envio por correio"]),
});
