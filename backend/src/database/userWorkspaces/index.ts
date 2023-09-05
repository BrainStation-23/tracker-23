import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../module/prisma/prisma.service";
import {GetUserWorkspaceFilter} from "../../module/sessions/dto/get.userWorkspace.filter.dto";
import {UserWorkspace} from "@prisma/client";

@Injectable()
export class UserWorkspaceDatabase {
    constructor(private prisma: PrismaService) {}

    async getUserWorkspace(filter: GetUserWorkspaceFilter): Promise<UserWorkspace | null> {
        try {
            return await this.prisma.userWorkspace.findFirst({
                where: filter,
            })
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}