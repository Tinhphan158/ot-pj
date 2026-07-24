export type OvertimeUserSummary = {
  id: string;
  name: string;
  email: string;
};

export type OvertimeResponseDto = {
  id: string;
  userId: string;
  user: OvertimeUserSummary | null;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  createdAt: Date;
  updatedAt: Date;
};
