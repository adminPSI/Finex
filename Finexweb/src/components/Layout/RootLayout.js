import React, { lazy } from "react";
import { Outlet } from "react-router-dom";
import InactivityModal from "../modal/InactivityModal";
const TopBar = lazy(() => import("./TopBar"));
const SideBar = lazy(() => import("./SideBar"));

const RootLayout = () => {
  return (
    <div className="app-wrapper">
      <InactivityModal />
      <TopBar></TopBar>
      <div className="row">
        <div className="app-content-wrapper">
          <SideBar></SideBar>
          <div className="app-content">
            <Outlet></Outlet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
