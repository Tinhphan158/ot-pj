'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatHours } from '@/shared/utils/format';
import type { TrendPoint } from '@/features/dashboard/utils/trend';

interface DashboardTrendChartProps {
  title: string;
  description: string;
  data: TrendPoint[];
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { payload: TrendPoint }[] }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{point.label}</p>
      <p className="mt-1 text-muted-foreground">
        {formatHours(point.hours)} · {point.entries} đơn
      </p>
    </div>
  );
}

export function DashboardTrendChart({ title, description, data }: DashboardTrendChartProps) {
  const hasData = data.some((point) => point.hours > 0);
  // Long day-grained series would overlap; thin the ticks out instead.
  const tickInterval = data.length > 12 ? Math.ceil(data.length / 10) - 1 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                interval={tickInterval}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(value: number) => `${value}h`}
              />
              <Tooltip cursor={{ fill: 'var(--muted)' }} content={<TrendTooltip />} />
              <Bar dataKey="hours" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-70 items-center justify-center text-sm text-muted-foreground">
            Không có OT nào trong kỳ này.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
