import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../module/prisma/prisma.service";
import {GetUserWorkspaceFilter} from "../../module/sessions/dto/get.userWorkspace.filter.dto";
import {UserWorkspace} from "@prisma/client";

@Injectable()
export class UserWorkspaceDatabase {
    constructor(private prisma: PrismaService) {}

    async getSingleUserWorkspace(filter: GetUserWorkspaceFilter): Promise<UserWorkspace | null> {
        try {
            return await this.prisma.userWorkspace.findFirst({
                where: filter,
            })
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async getUserWorkspaceList(filter: any): Promise<UserWorkspace[] | []> {
        try {
            return await this.prisma.userWorkspace.findMany({
                where: filter,
            })
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    async updateUserWorkspace(id: number, update: any): Promise<UserWorkspace | null> {
        try {
            return await this.prisma.userWorkspace.update({
                where: { id },
                data: update,
            });
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}