import { getProjectStatusList } from "@/services/taskActions";
import { useAppSelector } from "@/storage/redux";
import { StatusType } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";
import { Dropdown, MenuProps } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";

type Props = {
  task: TaskDto;
  children: any;
  isDisabled: boolean;
  setLoading: Function;
  selectedStatus: StatusType;
  handleStatusChange: Function;
};

const StatusDropdownComponent = ({
  task,
  children,
  isDisabled,
  selectedStatus,
  handleStatusChange,
}: Props) => {
  const [dropDownOpen, setDropdownOpen] = useState(false);

  const [status, setStatus] = useState(selectedStatus);
  const projects = useAppSelector(
    (state: RootState) => state.projectList.projects
  );

  const statuses: StatusType[] = getProjectStatusList(
    projects,
    task.projectId ? task.projectId : 0
  );
  const statusComponent = (status: StatusType, selectedStatus: StatusType) => {
    return {
      key: `${Math.random()}`,
      label: (
        <div
          className="flex flex-col gap-2"
          onClick={() => {
            updateStatus(status);
          }}
        >
          <div
            className={`${
              status === selectedStatus && "border-r-2 bg-[#ECECED] "
            } p-1`}
          >
            <div
              style={{
                backgroundColor: statusBGColorEnum[status.statusCategoryName],
                border: `1px solid ${
                  statusBorderColorEnum[status.statusCategoryName]
                }`,
                borderRadius: "36px",
              }}
              className="flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    statusBorderColorEnum[status.statusCategoryName],
                }}
              />

              <div>{status.name}</div>
            </div>
          </div>
        </div>
      ),
    };
  };
  const items: MenuProps["items"] = statuses?.map((status) =>
    statusComponent(status, selectedStatus)
  );
  const menuProps = {
    items,
    onClick: () => {},
  };

  const updateStatus = async (value: StatusType) => {
    if (status !== value && value !== selectedStatus) {
      setStatus(value);
      handleStatusChange(task, value);
    }
  };

  const dropdownRender = (menu: React.ReactNode) => (
    <div className="left-[-20px] mt-[18px] w-[230px]">{menu}</div>
  );
  return (
    <Dropdown
      menu={menuProps}
      trigger={["click"]}
      disabled={isDisabled}
      placement="bottomLeft"
      dropdownRender={dropdownRender}
      className="w-max cursor-pointer"
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
          setDropdownOpen(!dropDownOpen);
        }}
        className="relative flex h-10 items-center p-2"
      >
        {children}
      </div>
    </Dropdown>
  );
};

export default StatusDropdownComponent;
