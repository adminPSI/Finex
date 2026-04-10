import { useEffect, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { useAuthContext } from "../../contexts/AuthContext";

const InactivityModal = () => {
  const LOGOUT_TIME = 1 * 60 * 1000;
  const INACTIVITY_LIMIT = 10 * 60 * 1000;
  const REFRESH_TOKEN_TIME = 25 * 60 * 1000;

  const [showPopup, setShowPopup] = useState(false);
  const [countdown, setCountdown] = useState(LOGOUT_TIME);
  const { logOut } = useAuthContext();

  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      const user = JSON.parse(sessionStorage.getItem("user"));
      let token = null;
      if (user && user.token) token = user.token;

      if (!token) return;

      clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(() => {
        setShowPopup(true);
        setCountdown(LOGOUT_TIME);
      }, INACTIVITY_LIMIT);
    };

    const activityEvents = ["click", "keydown"];

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimeout(inactivityTimer);
    };
  }, [INACTIVITY_LIMIT, LOGOUT_TIME]);

  useEffect(() => {
    if (showPopup && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1000);
      }, 1000);

      return () => clearInterval(timer);
    }

    if (countdown == 0) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup, countdown]);

  useEffect(() => {
    const interval = setInterval(() => {
    }, REFRESH_TOKEN_TIME);

    return () => clearInterval(interval);
  }, [REFRESH_TOKEN_TIME]);

  const logout = () => {
    logOut();
  };

  const continueLogin = () => {
    setShowPopup(false);
  };

  return (
    showPopup && (
      <Dialog
        height={300}
        width={500}
        title={"Please Confirm"}
        closeIcon={false}
      >
        <h2 className="mt-5 text-center">Do you want to continue ?</h2>
        <DialogActionsBar>
          <Button type="button" onClick={continueLogin}>
            Yes
          </Button>
          <Button type="button" onClick={logout}>
            No
          </Button>
        </DialogActionsBar>
      </Dialog>
    )
  );
};

export default InactivityModal;
