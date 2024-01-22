import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/module/prisma/prisma.service';

@Injectable()
export class OnboardingDatabase {
  constructor(private prisma: PrismaService) {}

  async getOnboarding(query: Record<string, any>) {
    try {
      return await this.prisma.onboarding.findFirst({
        where: query,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getOnboardingStaticContent(query: Record<string, any>) {
    try {
      return await this.prisma.staticContent.findFirst({
        where: query,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async updateOnboardingStaticContent(query: Record<string, any>, data: any) {
    try {
      return await this.prisma.staticContent.update({
        where: query,
        data,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async addOnboardingStaticContent(data: any) {
    try {
      return await this.prisma.staticContent.create({
        data,
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async onboardingUser(data: any) {
    try {
      return await this.prisma.onboarding.create({
        data: {
          userId: data.userId,
          answers: {
            createMany: {
              data: data.answers,
            },
          },
        },
      });
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
