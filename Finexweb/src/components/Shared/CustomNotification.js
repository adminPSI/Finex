import {
  Notification,
  NotificationGroup,
} from "@progress/kendo-react-notification";
import React from "react";

function CustomNotification({ setNotificationState, notificationState }) {
  return (
    <NotificationGroup
      style={{
        top: "50%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: "9999999",
      }}
    >
      {notificationState.success && (
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
          {notificationState.notificationMessage}
        </Notification>
      )}
      {notificationState.error && (
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
          {notificationState.notificationMessage}
        </Notification>
      )}
    </NotificationGroup>
  );
}

export default CustomNotification;
