export const DeleteProductsMutation = `
  mutation deleteProductList($idList: [String!]!) {
    deleteProductList(idList: $idList)
  }
`;