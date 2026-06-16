import { associatedOrders } from "@/lib/data";

export async function getOrders(patientId?: string) {
  if (!patientId) return associatedOrders;

  return associatedOrders.filter((order) => order.patientId === patientId);
}
