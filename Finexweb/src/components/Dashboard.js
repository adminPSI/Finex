import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../EndPoints";
import Loading from "./Loading";

export default function Dashboard() {
  const [status, setStatus] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  useEffect(() => {
    getUserInfo();
    setStatus(true);
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
      .catch(() => {});
  };
  return (
    <>
      {status ? (
        <>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Library
              </li>
            </ol>
          </nav>

          <div className="row p-3">
            <div className="col-sm-9">
              <h3>Welcome back, {userInfo}</h3>
            </div>
          </div>
        </>
      ) : (
        <div className="loaderTop">
          <Loading />
        </div>
      )}
    </>
  );
}
