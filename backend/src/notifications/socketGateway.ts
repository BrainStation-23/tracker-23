import { Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

const corsOption = {
  origin: `${
    process.env.HOST_URL ? process.env.HOST_URL : 'http://localhost:3001'
  }`,
  methods: ['GET', 'POST'],
  allowedHeaders: ['my-custom-header'],
  credentials: true,
};
@WebSocketGateway({
  cors: corsOption,
})
export class MyGateway implements OnModuleInit {
  constructor(private authService: AuthService) {}
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    let user;
    this.server.use(async (socket: any, next) => {
      const token = socket.handshake.query.token;
      user = await this.authService.getUserFromAccessToken(`${token}`);

      if (!user) {
        return next(new Error('Invalid token'));
      }

      socket.user = user;
      return next();
    });
    this.server.on('connection', async (socket: any) => {
      console.log('Connected to', socket.user.firstName, 'id', socket.id);
    });
    this.server.on('disconnect', (socket) => {
      console.log('disconnect', socket.id);
    });
  }

  @SubscribeMessage('onNotification')
  onNewNotification(@MessageBody() body: any): void {
    console.log('🚀 ~ file: notification.ts:65 ~ MyGateway ~ Body:', body);
    this.server.emit('onNotification', {
      msg: 'New message',
      content: body,
    });
  }

  sendNotification(eventName: string, data: any) {
    console.log(eventName, data);
    this.server.emit(eventName, data);
  }
}
