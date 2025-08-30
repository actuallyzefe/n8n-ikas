export const ListWebhooksQuery = `
  query ListWebhooks {
    listWebhook {
      id
      endpoint
      scope
      createdAt
      updatedAt
      deleted
    }
  }
`;
