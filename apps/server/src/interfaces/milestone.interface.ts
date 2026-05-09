export interface Milestone {
  description: string;
  status: string;
  evidence: string;
  approved_flag?: boolean;
  approvedAt?: Date;
  completedAt?: Date;
}
