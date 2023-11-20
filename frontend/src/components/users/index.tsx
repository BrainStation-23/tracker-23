import { userAPI } from "APIs";
import { UserDto } from "models/user";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { RootState } from "@/storage/redux/store";

import { useAppSelector } from "../../storage/redux/index";
import UserList from "./components/userList";
import { Spin } from "antd";

const UsersComponent = () => {
  const router = useRouter();
  const [userList, setUserList] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const user = useAppSelector((state: RootState) => state.userSlice.user);

  const getUserList = async () => {
    const res = await userAPI.getAllUsers();
    res && setUserList(res);
  };
  const updateUser = (updatedUser: UserDto) => {
    const newList = userList.map((tmpUser) =>
      tmpUser.id === updatedUser.id ? updatedUser : tmpUser
    );
    setUserList([...newList]);
  };

  useEffect(() => {
    if (user.email === "seefathimel1@gmail.com") {
      getUserList();
    } else router.push("/");
  }, [user]);
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-2xl font-bold">User Approval</h2>
      </div>
      <div className="text-lg font-semibold">User List</div>
      <Spin spinning={spinning}>
        <UserList {...{ userList, updateUser, setSpinning }} />
      </Spin>
    </div>
  );
};

export default UsersComponent;
