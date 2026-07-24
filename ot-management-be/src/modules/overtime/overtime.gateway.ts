import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OvertimeResponseDto } from './overtime.response';

export type OvertimeEventType = 'created' | 'updated' | 'deleted';

export interface OvertimeEventPayload {
  overtime: OvertimeResponseDto;
  actor: { id: string; name: string };
}

const rawOrigins = process.env.CORS_ORIGINS?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

@Injectable()
@WebSocketGateway({
  // Same HTTP server/port as the REST API; browser connects to `/socket.io`.
  cors: { origin: rawOrigins && rawOrigins.length ? rawOrigins : true, credentials: true },
})
export class OvertimeGateway {
  @WebSocketServer() private readonly server!: Server;

  emit(type: OvertimeEventType, payload: OvertimeEventPayload): void {
    // `server` is undefined until the socket adapter attaches; guard for safety.
    this.server?.emit(`overtime:${type}`, payload);
  }
}
