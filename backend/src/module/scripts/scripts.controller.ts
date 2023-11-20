import { Controller, Patch } from '@nestjs/common';
import { ScriptsService } from './scripts.service';

@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Patch('/priority')
  async updateApprovalUser() {
    return await this.scriptsService.migratePrioritySchema();
  }
}
