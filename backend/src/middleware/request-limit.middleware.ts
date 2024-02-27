import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class RequestLimitMiddleware implements NestMiddleware {
  private readonly interval = 1 * 60 * 1000; // 1 minute in milliseconds
  private readonly maxRequestsPerMinute = 10;
  private readonly maxRequestsPerMinuteToBlock = 25;
  private readonly blockDuration = 10 * 60 * 1000; // 10 minutes in milliseconds

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const fingerprint = this.generateFingerprint(req);
      const apiRequestLimitLog = await prisma.apiRequestLimitLog.findUnique({
        where: { fingerprint },
      });

      const currentTime = new Date().getTime();

      if (!apiRequestLimitLog) {
        // Create a new record if it doesn't exist
        await prisma.apiRequestLimitLog.create({
          data: {
            fingerprint,
            count: 1,
            lastRequestTimestamp: new Date(currentTime),
          },
        });
        next();
      } else {
        await this.handleExistingLog(
          apiRequestLimitLog,
          currentTime,
          res,
          next,
        );
      }
    } catch (error) {
      console.error('Error in RequestLimitMiddleware:', error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal Server Error');
    }
  }

  private async handleExistingLog(
    apiRequestLimitLog: any,
    currentTime: number,
    res: Response,
    next: NextFunction,
  ) {
    const lastUpdate = apiRequestLimitLog.lastRequestTimestamp.getTime();
    const timeDifference = currentTime - lastUpdate;
    const blockEndTime = new Date(lastUpdate + this.blockDuration);

    if (
      timeDifference > this.interval &&
      (blockEndTime.getTime() <= currentTime || apiRequestLimitLog.count === 0)
    ) {
      // Reset count if more than 1 minute has passed
      await prisma.apiRequestLimitLog.update({
        where: { fingerprint: apiRequestLimitLog.fingerprint },
        data: { count: 1, lastRequestTimestamp: new Date(currentTime) },
      });
      next();
    } else {
      await this.handleWithinInterval(
        apiRequestLimitLog,
        currentTime,
        blockEndTime,
        res,
        next,
      );
    }
  }

  private async handleWithinInterval(
    apiRequestLimitLog: any,
    currentTime: number,
    blockEndTime: Date,
    res: Response,
    next: NextFunction,
  ) {
    const currentCount = apiRequestLimitLog.count;

    if (currentCount > this.maxRequestsPerMinuteToBlock) {
      await this.handleBlockingUser(
        currentTime,
        blockEndTime,
        apiRequestLimitLog,
        res,
        next,
      );
    } else if (currentCount > this.maxRequestsPerMinute) {
      await this.handleExceedingRateLimit(apiRequestLimitLog, res);
    } else {
      await this.handleNormalRequest(apiRequestLimitLog, next);
    }
  }

  private async handleBlockingUser(
    currentTime: number,
    blockEndTime: Date,
    apiRequestLimitLog: any,
    res: Response,
    next: NextFunction,
  ) {
    if (currentTime < blockEndTime.getTime()) {
      const remainingTime = (blockEndTime.getTime() - currentTime) / 1000; // Convert to seconds
      res
        .status(HttpStatus.TOO_MANY_REQUESTS)
        .send(`Blocked for ${remainingTime} seconds`);
    } else {
      await prisma.apiRequestLimitLog.update({
        where: { fingerprint: apiRequestLimitLog.fingerprint },
        data: { count: 1, lastRequestTimestamp: new Date(currentTime) },
      });
      next();
    }
  }

  private async handleExceedingRateLimit(
    apiRequestLimitLog: any,
    res: Response,
  ) {
    // Increment count if within the 1-minute interval
    await prisma.apiRequestLimitLog.update({
      where: { fingerprint: apiRequestLimitLog.fingerprint },
      data: {
        count: apiRequestLimitLog.count + 1,
        lastRequestTimestamp: apiRequestLimitLog.lastRequestTimestamp,
      },
    });
    // Block the user for 1 minute if hitting more than 15 requests
    res.status(HttpStatus.TOO_MANY_REQUESTS).send('Blocked for 1 minute');
  }

  private async handleNormalRequest(
    apiRequestLimitLog: any,
    next: NextFunction,
  ) {
    // Increment count if within the 1-minute interval
    await prisma.apiRequestLimitLog.update({
      where: { fingerprint: apiRequestLimitLog.fingerprint },
      data: {
        count: apiRequestLimitLog.count + 1,
        lastRequestTimestamp: apiRequestLimitLog.lastRequestTimestamp,
      },
    });
    next();
  }

  private generateFingerprint(req: Request): string {
    const ipAddress = this.getClientIp(req);
    const userAgent = req.get('user-agent');
    const acceptLanguage = req.get('accept-language');
    const referer = req.get('referer');
    const xForwardedFor = req.get('x-forwarded-for');
    const connection = req.get('connection');
    const encoding = req.get('accept-encoding');
    const platform = req.get('x-platform');

    const uniqueProperties = [
      ipAddress,
      userAgent,
      acceptLanguage,
      referer,
      xForwardedFor,
      connection,
      encoding,
      platform,
    ]
      .filter(Boolean)
      .join('-');

    return uniqueProperties;
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string) ||
      req.connection.remoteAddress ||
      req.ip
    );
  }
}
