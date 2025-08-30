export const SaveWebhookMutation = `
  mutation SaveWebhook($input: WebhookInput!) {
    saveWebhook(input: $input) {
      id
      endpoint
      scope
      createdAt
      updatedAt
      deleted
    }
  }
`;
