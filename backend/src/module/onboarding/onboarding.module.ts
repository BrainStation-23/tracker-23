import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingDatabase } from 'src/database/onboarding';
@Module({
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingDatabase],
  exports: [OnboardingService],
})
export class OnboardingModule {}
