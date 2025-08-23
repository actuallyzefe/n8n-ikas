export const DeleteWebhookMutation = `
  mutation DeleteWebhook($scopes: [String!]!) {
    deleteWebhook(scopes: $scopes)
  }
`;
