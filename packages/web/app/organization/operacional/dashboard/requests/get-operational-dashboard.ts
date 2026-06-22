import { lowStock, metrics, operatorOrders } from "@/lib/data";

export async function getOperationalDashboard() {
  return { metrics, lowStock, orders: operatorOrders };
}
