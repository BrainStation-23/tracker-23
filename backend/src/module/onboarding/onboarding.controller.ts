import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from 'src/guard';
import { GetUser } from 'src/decorator';
import { User } from '@prisma/client';
import { OnboardingRequestDto } from './dto/onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private onboardingService: OnboardingService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async onboardingUser(
    @GetUser() user: User,
    @Body() reqBody: OnboardingRequestDto,
  ) {
    return this.onboardingService.onboardingUser(user, reqBody.data);
  }
}
