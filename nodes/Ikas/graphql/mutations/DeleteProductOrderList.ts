export const DeleteProductOrderListMutation = `
  mutation deleteProductOrderList($idList: [String!]!) {
    deleteProductOrderList(idList: $idList)
  }
`