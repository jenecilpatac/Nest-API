import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TodoGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('addTodo')
  handleAddTodo(client: Socket, @MessageBody() payload: string): void {
    this.server.emit('todoAdded', payload);
  }
}
