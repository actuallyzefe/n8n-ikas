export const DeleteProductListMutation = `
  mutation deleteProductList($idList: [String!]!) {
    deleteProductList(idList: $idList)
  }
`;