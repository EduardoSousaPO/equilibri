interface WebhookEvent {
  data: Record<string, any>;
  object: string;
  type: string;
}

// Adicionando tipos para os eventos específicos do Clerk
interface ClerkUser {
  id: string;
  email_addresses: Array<{email_address: string}>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
}

interface ClerkSession {
  id: string;
  user_id: string;
}

// Exportando os tipos
export { WebhookEvent, ClerkUser, ClerkSession }; 