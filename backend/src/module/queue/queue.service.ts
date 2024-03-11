import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';
import { WorkerService } from '../worker/worker.service';
import { queueConfig } from 'config/queue';
const amqpUrl = queueConfig.amqp_url;

@Injectable()
export class RabbitMQService {
  private connection: Connection;
  private channel: Channel;
  constructor(private readonly workerService: WorkerService) {}

  async connect() {
    try {
      this.connection = await amqp.connect(amqpUrl);
      this.channel = await this.connection.createChannel();
      return this;
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async publishMessage(queue: string, message: any) {
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
    try {
      if (!this.connection) {
        await this.connect();
      }
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.consume(
        queue,
        async (msg) => {
          if (msg !== null) {
            const payload = JSON.parse(msg.content.toString());
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
