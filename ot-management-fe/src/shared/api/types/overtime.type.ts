export interface OvertimeUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface Overtime {
  id: string;
  userId: string;
  user: OvertimeUserSummary | null;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  createdAt: string;
  updatedAt: string;
}
