import {
  WorkspaceMemberDto,
  WorkspaceMemberStatusBGColorEnum,
  WorkspaceMemberStatusBorderColorEnum,
  WorkspaceMemberStatusEnum,
} from "models/user";
import { ColumnsType } from "antd/es/table";
import { Avatar, Table, Typography } from "antd";
const { Text } = Typography;

type Props = {
  memberList: WorkspaceMemberDto[];
};
const MemberList = ({ memberList }: Props) => {
  console.log(memberList);
  const columns: ColumnsType<WorkspaceMemberDto> = [
    {
      title: "Name",
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
                  className="h-[40px] w-[40px]"
                />
              ) : (
                <Avatar
                  src={
                    "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                  }
                  alt="N"
                  className="h-[40px] w-[40px]"
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
    },
    {
      title: "Email",
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
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      width: "200px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => {
        return (
          <div className="flex items-center gap-2">
            <Text
              className="w-[200px] cursor-pointer"
              ellipsis={{ tooltip: `${record?.designation ?? "--"}` }}
            >
              {`${record?.designation ?? "--"}`}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: "150px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => {
        return (
          <div className="flex items-center gap-2">
            <Text
              className="w-[200px] cursor-pointer"
              ellipsis={{ tooltip: `${record.role ?? "--"}` }}
            >
              {`${record.role ?? "--"}`}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "150px",
      render: (text: string, record: WorkspaceMemberDto, index: number) => {
        return (
          <div className="flex items-center gap-2">
            {/* <MemberStatus status={"DELETED"} /> */}
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
