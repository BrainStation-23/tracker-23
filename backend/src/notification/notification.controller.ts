import { Controller } from '@nestjs/common';
import { MyGateway } from './notification';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: MyGateway) {}
}
