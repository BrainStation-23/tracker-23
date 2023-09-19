import { Role } from "@prisma/client";
import { IsNotEmpty } from "class-validator";

export class UpdateRoleRequest {
    @IsNotEmpty()
    role: Role;
}