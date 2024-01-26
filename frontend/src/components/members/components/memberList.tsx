import {
  WorkspaceMemberDto,
  WorkspaceMemberRoleBorderColorEnum,
  WorkspaceMemberRoleEnum,
  WorkspaceMemberStatusBGColorEnum,
  WorkspaceMemberStatusBorderColorEnum,
  WorkspaceMemberStatusEnum,
} from "models/user";
import { ColumnsType } from "antd/es/table";
import { Avatar, Table, Typography } from "antd";
import {
  LuBadgeCheck,
  LuCheckCircle,
  LuMail,
  LuUser,
  LuUserCog,
} from "react-icons/lu";
import MoreFunctionMembersPageComponent from "./moreFunctionmMembersPage";

const { Text } = Typography;

type Props = {
  memberList: WorkspaceMemberDto[];
  updateMember: Function;
};
const MemberList = ({ memberList, updateMember }: Props) => {
  console.log(memberList);
  const columns: ColumnsType<WorkspaceMemberDto> = [
    {
      title: (
        <div className="flex items-center gap-2">
          <LuUser size={20} />
          Name
        </div>
      ),
      dataIndex: "firstName",
      key: "firstName",
      width: "300px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => {
        return (
          <div className="flex items-center gap-2">
            <div className=" ">
              {record?.picture ? (
                <Avatar
                  src={record.picture}
                  alt="N"
                  className="h-[24px] w-[24px]"
                />
              ) : (
                <Avatar
                  src={
                    "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                  }
                  alt="N"
                  className="h-[24px] w-[24px]"
                />
              )}
            </div>
            <Text
              className="w-[200px] cursor-pointer"
              ellipsis={{ tooltip: `${record.firstName} ${record.lastName}` }}
            >
              {`${record.firstName} ${record.lastName}`}
            </Text>
          </div>
        );
      },
      align: "left",
    },
    {
      title: (
        <div className="flex w-full items-center justify-start gap-2">
          <LuMail size={20} />
          Email
        </div>
      ),
      dataIndex: "email",
      key: "email",
      width: "300px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => {
        return (
          <div className="flex  items-center gap-2">
            <Text
              className="w-[200px] cursor-pointer"
              ellipsis={{ tooltip: `${record.email ?? "--"}` }}
            >
              {`${record.email ?? "--"}`}
            </Text>
          </div>
        );
      },
      align: "left",
    },
    {
      title: (
        <div className="flex w-full items-center justify-center gap-2">
          <LuBadgeCheck size={20} />
          Designation
        </div>
      ),
      dataIndex: "designation",
      key: "designation",
      width: "200px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => {
        return (
          <div className="flex w-full items-center justify-center gap-2">
            <Text
              className="w-[200px] cursor-pointer"
              ellipsis={{ tooltip: `${record?.designation ?? "--"}` }}
            >
              {`${record?.designation ?? "--"}`}
            </Text>
          </div>
        );
      },
      align: "center",
    },
    {
      title: (
        <div className="flex w-full items-center justify-center gap-2">
          <LuUserCog size={20} />
          Role
        </div>
      ),
      dataIndex: "role",
      key: "role",
      width: "150px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => (
        <div className="flex w-full items-center justify-center gap-2">
          <div
            style={{
              border: `1px solid ${
                WorkspaceMemberRoleBorderColorEnum[record.role]
              }`,
              borderRadius: "8px",
            }}
            className="relative flex w-max items-center gap-1 rounded-[10px] border px-4 py-1 text-xs font-medium text-black"
          >
            <div>
              {WorkspaceMemberRoleEnum[record.role] ===
              WorkspaceMemberRoleEnum.ADMIN ? (
                <LuUserCog
                  size={16}
                  color={WorkspaceMemberRoleBorderColorEnum[record.role]}
                />
              ) : (
                <LuUser
                  size={16}
                  color={WorkspaceMemberRoleBorderColorEnum[record.role]}
                />
              )}
            </div>

            <div>{WorkspaceMemberRoleEnum[record.role]}</div>
          </div>
        </div>
      ),
      align: "center",
    },
    {
      title: (
        <div className="flex w-full items-center justify-center gap-2">
          <LuCheckCircle size={20} />
          Satus
        </div>
      ),
      dataIndex: "status",
      key: "status",
      width: "150px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => {
        return (
          <div className="flex w-full items-center justify-center gap-2">
            <div
              style={{
                backgroundColor:
                  WorkspaceMemberStatusBGColorEnum[record.status],
                border: `1px solid ${
                  WorkspaceMemberStatusBorderColorEnum[record.status]
                }`,
                borderRadius: "36px",
              }}
              className="relative flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    WorkspaceMemberStatusBorderColorEnum[record.status],
                }}
              />

              <div>{WorkspaceMemberStatusEnum[record.status]}</div>
            </div>
          </div>
        );
      },
      align: "center",
    },
    {
      title: <>Actions</>,
      dataIndex: "",
      key: "",
      width: "1px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => (
        <div className="bgs-red-300 flex justify-center gap-2">
          <MoreFunctionMembersPageComponent
            {...{ member: record, updateMember }}
          />
        </div>
      ),
      align: "center",
    },
  ];

  return (
    <div className="my-5 flex w-full gap-4">
      <Table
        columns={columns}
        dataSource={memberList}
        className="w-full"
        // onChange={onChange}
        rowKey={"id"}
        bordered
        pagination={{
          current: 1,
          pageSize: 500,
          showSizeChanger: false,
          showLessItems: true,
          position: ["bottomRight", "bottomLeft"],
          // total: 100,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default MemberList;
