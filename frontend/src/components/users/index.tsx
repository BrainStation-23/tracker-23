import { useEffect, useState } from "react";

import { RootState } from "@/storage/redux/store";

import { useAppSelector } from "../../storage/redux/index";
import UserList from "./components/userList";
import { useRouter } from "next/router";
import { userAPI } from "APIs";
import { userDto } from "../../../../backend/dist/src/module/auth/dto/login.dto";

const UsersComponent = () => {
  const router = useRouter();
  const [userList, setUserList] = useState([]);
  const user = useAppSelector((state: RootState) => state.userSlice.user);

  const getUserList = async () => {
    const res = await userAPI.getAllUsers();
    res && setUserList(res);
  };
  const updateUser = (updatedUser: userDto) => {
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
    <>
      <UserList userList={userList} updateUser={updateUser} />
    </>
  );
};

export default UsersComponent;
