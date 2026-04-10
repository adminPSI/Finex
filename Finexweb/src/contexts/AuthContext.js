import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../core/HttpInterceptor";
import { AuthenticationEndPoints } from "../EndPoints";

const INITAL_STATE = {
  user: {},
  isLoading: false,
  isAuthenticated: false,
  setUser: () => { },
  setIsAuthenticated: () => { },
  checkAuthUser: async () => false,
};

const AuthContext = createContext(INITAL_STATE);

export const useAuthContext = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (
      sessionStorage.getItem("user") == "[]" ||
      sessionStorage.getItem("user") == null
    ) {
      if (location.pathname != '/registration') {
        navigate("/");
      } if (location.pathname == '/resetPassword') {
        navigate(`/resetPassword${location?.search}`);
      }
    }
  }, []);

  const checkAuthUser = async (user) => {
    setIsLoading(true);
    try {
      setUser(user);

      sessionStorage.setItem("user", JSON.stringify(user));
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await axiosInstance({
        method: "POST",
        url: AuthenticationEndPoints.signOut,
        withCredentials: false,
      })
        .then(() => {
          sessionStorage.removeItem("user");
          localStorage.clear()
          setIsAuthenticated(false);
          setUser({});
          window?.location?.reload()
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
