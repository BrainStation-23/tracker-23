import BellIconSvg from "@/assets/svg/BellIconSvg";
import { useAppSelector } from "@/storage/redux";
import {
  Notification,
  markNotificationAsSeen,
} from "@/storage/redux/notificationsSlice";
import { RootState } from "@/storage/redux/store";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Badge, Dropdown, MenuProps, theme } from "antd";
import React from "react";
import { useDispatch } from "react-redux";

const { useToken } = theme;
const NotificationSection = () => {
  const dispatch = useDispatch();
  const notifications: Notification[] = useAppSelector(
    (state: RootState) => state.notificationsSlice.notifications
  );
  const newNotificationNumber = notifications.filter(
    (notification) => !notification.seen
  ).length;
  console.log(
    "🚀 ~ file: notificationSection.tsx:20 ~ NotificationSection ~ notifications:",
    notifications
  );
  const items: MenuProps["items"] = notifications.map((notification) => {
    return {
      label: notification.description,
      key: notification.id,
      icon: <CheckCircleOutlined className="text-green-500" />,
      disabled: notification.seen,
      className: notification.seen ? "bg-gray-100" : "",
      onClick: (item: any) => {
        dispatch(markNotificationAsSeen(item.key));
        console.log("🚀", item);
      },
    };
  });

  const menuProps = {
    items,
    onClick: (item: any) => {
      // console.log(item);
    },
  };
  const dropdownRender = (menu: React.ReactNode) => (
    <div className="float-right">{menu}</div>
  );

  const { token } = useToken();
  const contentStyle = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };
  const menuStyle = {
    boxShadow: "none",
  };
  return (
    <>
      <Dropdown
        menu={menuProps}
        placement="bottomRight"
        // dropdownRender={dropdownRender}
        dropdownRender={(menu) => (
          <div style={contentStyle}>
            {React.cloneElement(menu as React.ReactElement, {
              style: menuStyle,
            })}
          </div>
        )}
        trigger={["click"]}
        className="transition-all delay-1000 duration-1000"
        overlayClassName="duration-1000 delay-1000 transition-all max-w-[300px]"
      >
        <div
          className="flex h-9 w-9 cursor-pointer items-center justify-center"
          style={{
            border: "1px solid #ECECED",
            borderRadius: "8px",
          }}
        >
          <Badge
            count={newNotificationNumber}
            size="small"
            overflowCount={10}
            style={{ backgroundColor: "#52c41a" }}
          >
            <BellIconSvg />
          </Badge>
        </div>
      </Dropdown>
    </>
  );
};

export default NotificationSection;
