export const DeleteProductListMutation = `mutation DeleteProductList($idList: [String!]!) {
  deleteProductList(idList: $idList)
}`;
