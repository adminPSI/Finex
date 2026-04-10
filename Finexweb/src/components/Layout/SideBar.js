import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";
import { Tooltip } from "@progress/kendo-react-tooltip";
import { lockIcon } from "@progress/kendo-svg-icons";
import { SvgIcon } from "@progress/kendo-react-common";
import axiosInstance from "../../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../../EndPoints";
import ChangePassword from "../modal/ChangePassword";

export default function SideBar() {
  const { logOut } = useAuthContext();
  const [userInfo, setUserInfo] = useState(null);
  const [showResetPass, setShowResetPass] = useState(false);

  useEffect(() => {
    getUserInfo();
  }, []);
  const getUserInfo = () => {
    axiosInstance({
      method: "GET",
      url: AuthenticationEndPoints.GetUserInfo,
      withCredentials: false,
    })
      .then((response) => {
        setUserInfo(response.data.info);
      })
      .catch(() => { });
  };

  const handleLogoout = () => {
    logOut();
  };

  const handleResetPassword = () => {
    console.log("handleResetPassword");
  };

  return (
    <>
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white k-bg-primary shadow-lg p-3 SideBar">
      <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
          </li>
        </ul>
        <div
          style={{
            margin: "5px 0",
            width: "100%",
            display: "flex !important",
            justifyContent: " space-evenly",
            cursor: "pointer",
          }}
          onClick={() => setShowResetPass(true)}
          className="d-flex align-items-center text-white text-decoration-none"
        >
          <Tooltip anchorElement="target" parentTitle={true}>
            <div
              onClick={handleResetPassword}
              className="d-flex align-items-center text-white text-decoration-none"
              id="dropdownUser3"
              title={"Change Password"}
            >
              <SvgIcon icon={lockIcon} />
            </div>
          </Tooltip>
        </div>
        <hr />

        <div
          style={{
            cursor: "pointer",
          }}
        >
          <Tooltip anchorElement="target" parentTitle={true}>
            <div
              onClick={handleLogoout}
              className="text-white text-decoration-none d-flex flex-column gap-3 align-items-center"
              id="dropdownUser3"
              title={"Logout"}
            >
              <div
                style={{
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  whiteSpace: "nowrap",
                }}
              >
                {userInfo}
              </div>
              <img
                alt="olivia"
                src="https://github.com/mdo.png"
                width="32"
                height="32"
                className="rounded-circle me-2"
              />
            </div>
          </Tooltip>
        </div>
      </div>

      {showResetPass && <ChangePassword setShowResetPass={setShowResetPass} />}
    </>
  );
}
