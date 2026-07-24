export interface OvertimeUserSummary {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
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
