import React from "react";
import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";

export default function Toaster(props) {
  const [notificationState, setNotificationState] = React.useState({
    none: false,
    success: false,
    error: false,
    warning: false,
    info: false,
    notificationMessage: "",
  });
  const onToggle = (flag, notificationMessage) => {
    setNotificationState({
      ...notificationState,
      [flag]: !notificationState[flag],
      notificationMessage: notificationMessage,
    });
    stopNotification(flag);
  };

  const stopNotification = (flag) => {
    setTimeout(
      () =>
        setNotificationState({
          ...notificationState,
          [flag]: false,
          notificationMessage: "",
        }),
      3000
    );
  };
  const { success, error, notificationMessage } =
    notificationState;

  return (
    <>
      <center>
        <NotificationGroup
          style={{
            top: "50%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: "9999999",
          }}
        >
          {success && (
            <Notification
              type={{
                style: "success",
                icon: true,
              }}
              closable={true}
              onClose={() =>
                setNotificationState({
                  ...notificationState,
                  success: false,
                  notificationMessage: "",
                })
              }
            >
              {notificationMessage}
            </Notification>
          )}
          {error && (
            <Notification
              type={{
                style: "error",
                icon: true,
              }}
              closable={true}
              onClose={() =>
                setNotificationState({
                  ...notificationState,
                  success: false,
                  notificationMessage: "",
                })
              }
            >
              {notificationMessage}
            </Notification>
          )}
        </NotificationGroup>
      </center>
    </>
  );
}
