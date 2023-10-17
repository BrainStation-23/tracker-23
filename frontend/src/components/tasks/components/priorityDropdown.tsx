import { getPriorityList, getProjectStatusList } from "@/services/taskActions";
import { useAppSelector } from "@/storage/redux";
import { StatusType } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";
import { userAPI } from "APIs";
import { Dropdown, MenuProps } from "antd";
import { PriorityDto, StatusDto, TaskDto } from "models/tasks";
import { useState } from "react";
import {
    PriorityBGColorEnum,
    PriorityBorderColorEnum,
    statusBGColorEnum,
    statusBorderColorEnum,
    taskPriorityEnum,
    taskStatusEnum,
} from "utils/constants";

type Props = {
    task: TaskDto;
    children: any;
    selectedPriority: string;
    setLoading: Function;
    handleStatusChange: Function;
};

const PriorityDropdownComponent = ({
    task,
    children,
    selectedPriority,
    handleStatusChange,
}: Props) => {
    const [dropDownOpen, setDropdownOpen] = useState(false);

    const [priority, setPriority] = useState(selectedPriority);
    const projects = useAppSelector((state: RootState) => state.projectList.projects);

    const Priorities: PriorityDto[] = getPriorityList(projects, task.projectId);
    console.log("🚀 ~ file: priorityDropdown.tsx:38 ~ Priorities:", Priorities);
    const priorityComponent = (prio: PriorityDto, selectedPriority: any) => {
        return {
            key: `${Math.random()}`,
            label: (
                <div
                    className="flex flex-col gap-2"
                    // onClick={() => {
                    //     updateStatus(status);
                    // }}
                >
                    <div
                        style={{
                            backgroundColor: PriorityBGColorEnum[prio],
                            border: `1px solid ${PriorityBorderColorEnum[prio]}`,
                        }}
                        className="w-min rounded px-2 text-black"
                    >
                        {/* {taskPriorityEnum[prio]} */}
                        {prio.name}
                    </div>
                </div>
            ),
        };
    };
    const items: MenuProps["items"] = Priorities?.map((pp) =>
        priorityComponent(pp, selectedPriority)
    );
    const menuProps = {
        items,
        onClick: () => {},
    };

    const updateStatus = async (value: StatusType) => {
        // if (status !== value && value !== selectedPriority) {
        //     setPriority(value);
        //     handleStatusChange(task, value);
        // }
    };

    const dropdownRender = (menu: React.ReactNode) => (
        <div className="left-[-20px] mt-[18px] w-[230px]">{menu}</div>
    );
    return (
        <Dropdown
            menu={menuProps}
            dropdownRender={dropdownRender}
            trigger={["click"]}
            className="w-max cursor-pointer"
            // overlayClassName="absolute left-[-200px]"
            placement="bottomLeft"
        >
            <div
                className="relative flex h-10 items-center p-2"
                onClick={() => setDropdownOpen(!dropDownOpen)}
            >
                {/* <DeleteFilled
className="w-6 text-red-600"
style={{ fontSize: "24px" }}
onClick={() => {
  // deleteTask(task.id);
}}
/> */}
                {children}
            </div>
        </Dropdown>
    );
};

export default PriorityDropdownComponent;
