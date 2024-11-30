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
  handleAddTodo(client: Socket, @MessageBody() todo: string): void {
    console.log(`New Todo added: ${todo}`);
    this.server.emit('todoAdded', todo);
  }

  @SubscribeMessage('removeTodo')
  handleRemoveTodo(client: Socket, @MessageBody() todoId: string): void {
    console.log(`Todo removed: ${todoId}`);
    this.server.emit('todoRemoved', todoId);
  }
}
