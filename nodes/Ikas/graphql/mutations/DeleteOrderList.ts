export const DeleteOrderListMutation = `mutation DeleteOrderList($idList: [String!]!) {
  deleteOrderList(idList: $idList)
}`;
