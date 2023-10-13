import {
  Badge,
  Button,
  Divider,
  Dropdown,
  Empty,
  MenuProps,
  theme,
} from "antd";
import { userAPI } from "APIs";
import React from "react";
import { useDispatch } from "react-redux";

import BellIconSvg from "@/assets/svg/BellIconSvg";
import { getElapsedTime, getPassedTime } from "@/services/timeActions";
import { useAppSelector } from "@/storage/redux";
import {
  markAllNotificationsAsSeen,
  markNotificationAsSeen,
  Notification,
  removeAllNotifications,
} from "@/storage/redux/notificationsSlice";
import { RootState } from "@/storage/redux/store";
import { CheckCircleOutlined } from "@ant-design/icons";

const { useToken } = theme;
const NotificationSection = () => {
  const dispatch = useDispatch();
  const notifications: Notification[] = useAppSelector(
    (state: RootState) => state.notificationsSlice.notifications
  );
  const sortedNOtifications = [...notifications].sort(
    (a: Notification, b: Notification) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const newNotificationNumber = notifications.filter(
    (notification) => !notification.seen
  ).length;
  const handleClickNotification = async (notification: any) => {
    console.log(
      "🚀 ~ file: notificationSection.tsx:34 ~ handleClickNotification ~ notification:",
      notification
    );
    const res = await userAPI.markNotificationSeen(notification.key);
    res && dispatch(markNotificationAsSeen(notification.key));
  };

  const handleMarkAllSeen = async () => {
    const res = await userAPI.markAllNotificationsSeen();
    res && dispatch(markAllNotificationsAsSeen());
  };
  const handleMarkAllCleared = async () => {
    const res = await userAPI.markAllNotificationsCleared();
    res && dispatch(removeAllNotifications());
  };

  const items: MenuProps["items"] = sortedNOtifications.map((notification) => {
    const elapsedTime = getElapsedTime(notification.createdAt);
    return {
      label: (
        <div className=" py-1">
          <div className="max-w-[150px]">{notification.description}</div>
          <div className=" right-0 top-0 text-xs">{elapsedTime}</div>
        </div>
      ),
      key: notification.id,
      icon: <CheckCircleOutlined className="text-green-500" />,
      disabled: notification.seen,
      className: notification.seen ? "bg-gray-100" : "",
      onClick: (item: any) => {
        handleClickNotification(item);
      },
    };
  });

  const menuProps = {
    items,
    onClick: (item: any) => {},
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
        onOpenChange={(open) => {
          !open && handleMarkAllSeen();
        }}
        dropdownRender={(menu) => (
          <div style={contentStyle}>
            <div className="max-h-[500px] overflow-y-auto">
              {React.cloneElement(menu as React.ReactElement, {
                style: menuStyle,
              })}
            </div>
            {notifications.length > 0 ? (
              <>
                <Divider style={{ margin: 0 }} />
                <Button
                  className="w-full"
                  onClick={() => handleMarkAllCleared()}
                >
                  Clear All
                </Button>
              </>
            ) : (
              <Empty
                description="No new Notifications"
                className="py-2"
              ></Empty>
            )}
          </div>
        )}
        trigger={["click"]}
        className="transition-all delay-1000 duration-1000"
        overlayClassName="duration-1000 delay-1000 transition-all w-[300px]"
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
