import { getOperatorOrder, operatorOrders } from "@/lib/data";

export async function getOperatorOrders() {
  return operatorOrders;
}

export async function getOperatorOrderById(id: string) {
  return getOperatorOrder(id);
}
