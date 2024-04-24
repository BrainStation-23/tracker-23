import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';
import { WorkerService } from '../worker/worker.service';
import { queueConfig } from 'config/queue';

@Injectable()
export class RabbitMQService {
  private connection: Connection;
  private channel: Channel;
  private environment: string;
  constructor(private readonly workerService: WorkerService) {
    this.environment = process.env.NODE_ENV || 'DEVELOPMENT';
  }

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

  private getQueueName(queue: string): string {
    return `${this.environment}_${queue}`;
  }
  async publishMessage(queue: string, message: any) {
    try {
      if (!this.connection) {
        await this.connect();
      }
      const queueName = this.getQueueName(queue);
      await this.channel.assertQueue(queueName, { durable: true });
      this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async consume(queue: string) {
    try {
      if (!this.connection) {
        await this.connect();
      }
      const queueName = this.getQueueName(queue);
      await this.channel.assertQueue(queueName, { durable: true });
      await this.channel.consume(
        queueName,
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
