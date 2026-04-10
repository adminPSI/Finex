import { useState } from "react";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";

let setNotifications;

export const showErrorNotification = (message) => {
  const newNotification = { message, type: "error", key: new Date().getTime() };
  setNotifications((prev) => [...prev, newNotification]);

  setTimeout(() => {
    setNotifications((prev) =>
      prev.filter((n) => n.key !== newNotification.key)
    );
  }, 3000);
};
export const showSuccessNotification = (message) => {
  const newNotification = {
    message,
    type: "success",
    key: new Date().getTime(),
  };
  setNotifications((prev) => [...prev, newNotification]);
  setTimeout(() => {
    setNotifications((prev) =>
      prev.filter((n) => n.key !== newNotification.key)
    );
  }, 3000);
};
export const closeErrorNotification = (index) => {
  setNotifications((prev) => prev.filter((_, i) => i !== index));
};
export const NotificationHandler = () => {
  const [notifications, updateNotification] = useState([]);
  setNotifications = updateNotification;

  return (
    <NotificationGroup
      style={{
        top: "50%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "9999999",
      }}
    >
      {notifications.map((notification, index) => {
        return (
          <Notification
            key={index}
            type={{ style: notification.type, icon: true }}
            closable={true}
            onClose={() => closeErrorNotification(index)}
          >
            {notification.message}
          </Notification>
        );
      })}
    </NotificationGroup>
  );
};
