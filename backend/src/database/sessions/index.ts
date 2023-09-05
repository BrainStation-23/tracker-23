import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../module/prisma/prisma.service";
import {Session} from "@prisma/client";

@Injectable()
export class SessionDatabase {
    constructor(private prisma: PrismaService) {}

    async getSessions(filter: any) {
        try {
            return await this.prisma.session.findMany({
                where: filter,
                include: {
                    task: true,
                }
            })
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}