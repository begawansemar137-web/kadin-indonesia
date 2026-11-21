export type ServiceStatus = 'active' | 'inactive';

export interface Service {
  id: string;
  code: string;
  title: string;
  description: string;
  status: ServiceStatus;
  organizationId: string;
  ownerId: string;
  eligibilitySummary: string;
}
