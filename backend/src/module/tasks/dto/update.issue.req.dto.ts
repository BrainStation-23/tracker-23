import { IsEnum, IsNotEmpty } from 'class-validator';
import {PriorityEnum} from "./getTask.dto";

export class UpdateIssuePriorityReqBodyDto {
    @IsNotEmpty()
    @IsEnum(PriorityEnum)
    priority: PriorityEnum;
}