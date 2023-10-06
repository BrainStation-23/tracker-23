import {
    Avatar,
    Divider,
    Dropdown,
    MenuProps,
    message,
    Radio,
    theme,
    Typography,
} from "antd";
import { userAPI } from "APIs";
import { WorkspaceDto } from "models/workspaces";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import SyncButtonComponent from "@/components/common/buttons/syncButton";
import LogOutButton from "@/components/logout/logOutButton";
import GlobalMOdal from "@/components/modals/globalModal";
import { getActiveUserWorSpace } from "@/services/globalFunctions";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import { changeWorkspaceReloadStatusSlice } from "@/storage/redux/workspacesSlice";
import { DownOutlined, UpOutlined } from "@ant-design/icons";

import AddNewWorkspace from "./addNewWorkspace";
import DeleteWorkspaceWarning from "./deleteWorkSpaceWarning";
import EditWorkspace from "./editWorkspace";

const { Text } = Typography;
const WorkspaceNav = () => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [mode, setMode] = useState(0);
    // const workspacesList = tmp;
    const workspacesList = useAppSelector(
        (state: RootState) => state.workspacesSlice.workspaces
    );
    const userInfo = useAppSelector((state: RootState) => state.userSlice.user);

    const [selectedWorkspace, setSelectedWorkspace] =
        useState<WorkspaceDto | null>();
    const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceDto | null>(
        workspacesList?.length > 0 &&
            workspacesList?.find((workspace: WorkspaceDto) => workspace.active)
    );
    const activeUserWorkspace = getActiveUserWorSpace(workspacesList, userInfo);

    const handleChangeWorkspaceClick = async (workspace: WorkspaceDto) => {
        if (activeWorkspace?.id != workspace.id) {
            const res = await userAPI.changeWorkspace(workspace.id);
            console.log(
                "🚀 ~ file: workspaceSection.tsx:25 ~ handleChangeWorkspaceClick ~ res:",
                res
            );
            message.success("Active Workspace Changed");
            dispatch(changeWorkspaceReloadStatusSlice());
        }
        setDropdownOpen(false);
    };
    const handleWorkspaceDeleteClick = async (workspace: WorkspaceDto) => {
        setMode(2);
        // const res = await userAPI.deleteWorkspace(workspace.id);
        // console.log(
        //     "🚀 ~ file: workspaceSection.tsx:25 ~ handleChangeWorkspaceClick ~ res:",
        //     res
        // );
        setSelectedWorkspace(workspace);
        setIsModalOpen(true);
    };
    const handleWorkspaceEditClick = async (workspace: WorkspaceDto) => {
        setSelectedWorkspace({ ...workspace });
        setMode(1);
        setIsModalOpen(true);
    };

    const filteredWorkspaces = workspacesList.filter(
        (workspace) => workspace !== activeWorkspace
    );
    const items: MenuProps["items"] = [];
    const syncFunction = async () => {
        dispatch(setSyncRunning(true));
        const res = await userAPI.syncTasks();
        res && dispatch(setSyncStatus(res));
    };
    console.log("🚀 ~ file: workspaceSection.tsx:30 ~  ~ items:", items);
    const { useToken } = theme;

    const { token } = useToken();

    const contentStyle = {
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary,
    };
    const dropdownRender = (menu: React.ReactNode) => (
        <div style={contentStyle} className="py-4 font-semibold">
            <div className="mx-4">
                <Radio.Group
                    // onChange={(onChange)} value={value}
                    className="w-full"
                    defaultValue={activeWorkspace?.id}
                    value={activeWorkspace?.id}
                >
                    <div className="flex w-full flex-col gap-0 ">
                        {workspacesList
                            // ?.filter((workspace) => activeWorkspace?.id != workspace.id)
                            ?.map((workspace) => (
                                <div
                                    className={`flex items-center justify-between rounded p-1 pr-0 hover:bg-neutral-100 ${
                                        activeWorkspace?.id === workspace.id
                                            ? "bg-neutral-100"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleChangeWorkspaceClick(workspace)
                                    }
                                >
                                    <div className="flex w-full cursor-pointer items-center gap-2 rounded ">
                                        <Avatar
                                            className="col-span-3 flex h-[40px] w-[40px] flex-col justify-center rounded font-medium text-primary"
                                            size={"large"}
                                        >
                                            {workspace?.name[0]}
                                        </Avatar>
                                        <Text
                                            className="w-[150px] "
                                            ellipsis={{
                                                tooltip: workspace.name,
                                            }}
                                        >
                                            {workspace.name}
                                        </Text>
                                    </div>
                                    <Radio
                                        value={workspace.id}
                                        className="text-primary"
                                    ></Radio>
                                </div>
                            ))}
                    </div>
                </Radio.Group>
            </div>
            <div style={{ padding: 8 }}></div>
            <div
                onClick={() => {
                    setMode(0);
                    setIsModalOpen(true);
                    setDropdownOpen(false);
                }}
                className="mx-4 flex w-auto cursor-pointer items-center justify-start gap-4 rounded py-3 pl-2 hover:bg-neutral-100"
            >
                <PlusIconSvg stroke={"black"} />
                <div> Add new workspace</div>
            </div>
            <div style={{ padding: 8 }}></div>
            <Divider style={{ margin: 0 }} />
            <div style={{ padding: 8 }}></div>
            <div className="flex w-full ">
                <SyncButtonComponent
                    type="ghost"
                    className="mx-4 w-full gap-3 rounded p-0 py-2 pl-4"
                    text="Sync"
                    onClick={() => {
                        syncFunction();
                    }}
                />
            </div>
            <div style={{ padding: 2 }}></div>
            <div className="flex w-full" onClick={() => setDropdownOpen(false)}>
                <LogOutButton className="mx-4 py-2 pl-3 hover:bg-neutral-100" />
            </div>
        </div>
    );

    return (
        <>
            <Dropdown
                menu={{ items }}
                trigger={["click"]}
                placement="topRight"
                arrow
                dropdownRender={dropdownRender}
                className=" w-[250px]"
                open={isDropdownOpen}
                onOpenChange={(v) => {
                    setDropdownOpen(v);
                }}
            >
                <div className="h-max w-[240px] rounded-lg border-2 p-1">
                    <div className="grid grid-cols-12 gap-2">
                        <Avatar
                            className="col-span-3 flex h-[48px] w-[48px] flex-col justify-center rounded font-medium text-primary"
                            size={"large"}
                        >
                            {activeWorkspace?.name?.length > 0
                                ? activeWorkspace?.name[0]
                                : ""}
                        </Avatar>
                        <div className="col-span-7">
                            <div className="flex flex-col text-left">
                                <Text
                                    className="text-left font-medium"
                                    ellipsis={{
                                        tooltip: activeWorkspace?.name,
                                    }}
                                >
                                    {activeWorkspace?.name}
                                </Text>
                                <Text
                                    className="text-left text-[13px]"
                                    ellipsis={{
                                        tooltip:
                                            activeUserWorkspace?.designation,
                                    }}
                                >
                                    {activeUserWorkspace?.designation}
                                </Text>
                            </div>
                        </div>
                        <div className="col-span-1 flex flex-col justify-center">
                            {isDropdownOpen ? <UpOutlined /> : <DownOutlined />}
                        </div>
                    </div>
                </div>
            </Dropdown>
            <GlobalMOdal
                {...{ isModalOpen, setIsModalOpen, title: "Create Workspace" }}
            >
                {mode === 1 ? (
                    <EditWorkspace
                        workspace={selectedWorkspace}
                        setSelectedWorkspace={setSelectedWorkspace}
                        setIsModalOpen={setIsModalOpen}
                    />
                ) : mode === 2 ? (
                    <DeleteWorkspaceWarning
                        workspace={selectedWorkspace}
                        setSelectedWorkspace={setSelectedWorkspace}
                        setIsModalOpen={setIsModalOpen}
                    />
                ) : (
                    <AddNewWorkspace setIsModalOpen={setIsModalOpen} />
                )}
            </GlobalMOdal>
        </>
    );
};

export default WorkspaceNav;
