import { associatedDocuments, associatedOrders } from "@/lib/data";

export async function getDashboard(patientId?: string) {
  const orders = patientId
    ? associatedOrders.filter((order) => order.patientId === patientId)
    : associatedOrders;
  const documents = patientId
    ? associatedDocuments.filter((document) => document.patientId === patientId)
    : associatedDocuments;
  const activeOrder = orders.find((order) => order.status !== "Entregue") ?? orders[0];

  return {
    activeOrder,
    recentOrders: orders.slice(0, 3),
    documents,
  };
}
