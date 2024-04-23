import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';
import { WorkerService } from '../worker/worker.service';
import { queueConfig } from 'config/queue';

@Injectable()
export class RabbitMQService {
  private connection: Connection;
  private channel: Channel;
  constructor(private readonly workerService: WorkerService) {}

  async connect() {
    try {
      const url = `amqp://${queueConfig.userName}:${encodeURIComponent(
        queueConfig.password,
      )}@${queueConfig.amqp_url}`;
      this.connection = await amqp.connect(url);

      this.channel = await this.connection.createChannel();
      return this;
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async publishMessage(queue: string, message: any) {
    console.log("🚀 ~ RabbitMQService ~ publishMessage ~ queue:", queue)
    try {
      if (!this.connection) {
        await this.connect();
      }
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async consume(queue: string) {
    console.log('🚀 ~ RabbitMQService ~ consume ~ queue:', queue);
    try {
      if (!this.connection) {
        await this.connect();
      }
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.consume(
        queue,
        async (msg) => {
          console.log('🚀 ~ RabbitMQService ~ msg:', msg);
          if (msg !== null) {
            const payload = JSON.parse(msg.content.toString());
            console.log('🚀 ~ RabbitMQService ~ payload:', payload);
            await this.workerService.queueHandler(payload);
          }
        },
        {
          noAck: true,
        },
      );
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
        await this.connection.close();
      }
    } catch (error: any) {
      console.log(error.message);
    }
  }
}
