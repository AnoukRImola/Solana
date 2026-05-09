export interface Notification {
  contractId: string;
  type: string;
  title: string;
  message: string;
  entities: string[];
  read?: boolean; // Deprecated: Use readBy instead
  readBy?: string[]; // Array of wallet addresses that have read this notification
  createdAt?: Date;
  metadata?: Record<string, any>; // Optional metadata for additional context
}
