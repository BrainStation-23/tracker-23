import { Server, Socket } from 'socket.io';

import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AuthService } from 'src/module/auth/auth.service';
const CONNECTIONS = new Map<string, Socket>();

const corsOption = {
  origin: `${
    process.env.HOST_URL ? process.env.HOST_URL : 'http://localhost:3001'
  }`,
  methods: ['GET', 'POST'],
  allowedHeaders: ['my-custom-header', 'Cookie_token'],
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
    this.server.use(async (socket, next) => {
      const token = socket.handshake.headers.cookie_token;
      // const token = cookieString;
      if (!token) return next(new Error('Invalid token'));
      else {
        user = await this.authService.getUserFromAccessToken(`${token}`);
        if (!user) {
          return next(new Error('Invalid token'));
        }
        CONNECTIONS.set(user.id.toString(), socket);
        return next();
      }
    });

    this.server.on('connection', async (socket) => {
      console.log('Connected', socket.id);
    });

    this.server.on('disconnect', (socket) => {
      console.log('disconnect', socket.id);
    });

    this.server.on('connected', (cookieValue: string) => {
      console.log(
        '🚀 ~ MyGateway ~ this.server.on ~ cookieValue:',
        cookieValue,
      );
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

  sendNotification(userId: string, data: any) {
    // const not = CONNECTIONS.get(userId)?.emit('onNotification', data);
    const not = CONNECTIONS.get(userId)?.emit(userId, data);
    console.log(
      '🚀 ~ file: socketGateway.ts:63 ~ MyGateway ~ sendNotification ~ not:',
      not,
    );
    return not;
  }
}
