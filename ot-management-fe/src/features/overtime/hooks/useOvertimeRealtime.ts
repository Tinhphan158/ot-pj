'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys, overtimeKeys, type Overtime } from '@/shared/api';
import { getSocket } from '@/lib/socket';
import { notify } from '@/shared/utils/notify';
import { formatDate } from '@/shared/utils/format';
import { useCurrentUser } from '@/features/auth/store/auth.store';

interface OvertimeEvent {
  overtime: Overtime;
  actor: { id: string; name: string };
}

const VERBS = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
} as const;

/**
 * Subscribes to server-side overtime events. Any create/update/delete by anyone
 * refreshes the overtime cache (so the UI updates in realtime) and shows a toast
 * — except for actions the current user performed themselves.
 */
export function useOvertimeRealtime() {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();

  useEffect(() => {
    const socket = getSocket();
    const currentUserId = currentUser?.id;

    const makeHandler = (type: keyof typeof VERBS) => (event: OvertimeEvent) => {
      // Always refresh so every open client stays in sync.
      queryClient.invalidateQueries({ queryKey: overtimeKeys.all, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all, refetchType: 'all' });

      // Don't notify the person who made the change.
      if (event.actor?.id === currentUserId) return;

      const dateLabel = formatDate(event.overtime?.date, 'dd/MM/yyyy');
      notify({
        type: 'info',
        title: 'Overtime updated',
        description: `${event.actor?.name ?? 'Someone'} ${VERBS[type]} overtime on ${dateLabel}`,
      });
    };

    const handlers = {
      'overtime:created': makeHandler('created'),
      'overtime:updated': makeHandler('updated'),
      'overtime:deleted': makeHandler('deleted'),
    };

    for (const [eventName, handler] of Object.entries(handlers)) {
      socket.on(eventName, handler);
    }

    return () => {
      for (const [eventName, handler] of Object.entries(handlers)) {
        socket.off(eventName, handler);
      }
    };
  }, [queryClient, currentUser?.id]);
}
