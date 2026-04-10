import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const AuthLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (
      sessionStorage.getItem("user") == "[]" ||
      sessionStorage.getItem("user") == null
    ) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="app-wrapper d-flex justify-content-center align-items-center">
          <Outlet></Outlet>
        </div>
      )}
    </>
  );
};
 
export default AuthLayout;
