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
    this.server.emit('isSeenForSentMessage', payload.isSeenForSentMessage);
  }

  @SubscribeMessage('userTyping')
  handleUserTyping(@MessageBody() payload: any): void {
    const { chatReference, user } = payload;

    this.server.emit('userTypeToChat', { chatReference, user });
  }

  @SubscribeMessage('userTypingPrivate')
  handleUserTypingPrivate(@MessageBody() payload: any): void {
    const { receiverId, senderId, user } = payload;

    this.server.emit('userTypeToChatPrivate', { receiverId, senderId, user });
  }
}
