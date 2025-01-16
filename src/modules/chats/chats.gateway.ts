import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  handleSendMessage(@MessageBody() payload: any): void {
    this.server.emit('sentMessage', payload.toRefresh);
    this.server.emit('receiverId', payload.receiverId);
  }
}
