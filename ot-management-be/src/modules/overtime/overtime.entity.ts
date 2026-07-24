import { Prisma } from '@prisma/client';

export const overtimeWithUserInclude = {
  user: {
    select: { id: true, name: true, email: true, avatar: true },
  },
} as const satisfies Prisma.OvertimeInclude;

export type OvertimeEntity = Prisma.OvertimeGetPayload<{ include: typeof overtimeWithUserInclude }>;
