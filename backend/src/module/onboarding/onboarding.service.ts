import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { APIException } from '../exception/api.exception';
import { OnboardingDatabase } from 'src/database/onboarding';

@Injectable()
export class OnboardingService {
  constructor(private onboardingDatabase: OnboardingDatabase) {}

  async onboardingUser(
    user: User,
    data: { question: string; answer: string; options: string[] }[],
  ) {
    const alreadyOnboardingDone = await this.onboardingDatabase.getOnboarding({
      userId: user.id,
    });
    if (alreadyOnboardingDone)
      throw new APIException(
        'You have already onboarded on this system.',
        HttpStatus.BAD_REQUEST,
      );

    const onboarding = await this.onboardingDatabase.onboardingUser({
      userId: user.id,
      answers: data.map((onboarding) => {
        return {
          question: onboarding.question,
          answer: onboarding.answer,
        };
      }),
    });
    if (!onboarding)
      throw new APIException(
        'Failed to onboard this user.',
        HttpStatus.BAD_REQUEST,
      );

    this.saveStaticContentData(data);
    return onboarding;
  }

  private async saveStaticContentData(
    data: { question: string; answer: string; options: string[] }[],
  ) {
    const onboardingStaticContent =
      await this.onboardingDatabase.getOnboardingStaticContent({
        type: 'ONBOARDING',
      });

    const newDataMap = new Map(
      data.map(({ question, options }) => [question, { question, options }]),
    );

    if (!onboardingStaticContent) {
      await this.onboardingDatabase.addOnboardingStaticContent({
        type: 'ONBOARDING',
        contents: data.map(({ question, options }) => ({ question, options })),
      });
    } else {
      const mergedContent = onboardingStaticContent.contents.map(
        (content: any) => {
          const onboarding = newDataMap.get(content.question);

          return {
            question: content.question,
            options: onboarding
              ? [...new Set([...onboarding.options, ...content.options])]
              : content.options,
          };
        },
      );

      await this.onboardingDatabase.updateOnboardingStaticContent(
        { id: onboardingStaticContent.id },
        { contents: mergedContent },
      );
    }
  }
}
