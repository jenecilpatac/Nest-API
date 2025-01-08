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
export class ChatGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  handleSendMessage(client: Socket, @MessageBody() payload: string): void {
    this.server.emit('sentMessage', payload);
  }
}
