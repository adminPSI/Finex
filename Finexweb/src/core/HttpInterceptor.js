import axios from "axios";
import { showErrorNotification } from "../components/NotificationHandler/NotificationHandler";
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.method !== "OPTIONS") {
      config.headers["Content-Type"] = "application/json";
      if (JSON.parse(sessionStorage.getItem("user"))) {
        let token = JSON.parse(sessionStorage.getItem("user")).token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error);

    if (error.response && error.response.status == 401) {
      sessionStorage.removeItem("user");
    } else if (error.response && error.response.status == 400) {
      showErrorNotification(
        error.response.data &&
          (error.response.data.title ||
            error.response.data.message ||
            error.response.data) &&
          !(
            error.response.data.title ||
            error.response.data.message ||
            error.response.data
          )
            .toLowerCase()
            .includes("one or more")
          ? error.response.data.title ||
              error.response.data.message ||
              error.response.data
          : "We are having technical issues!" || error.response.data
      );
    } else if (error.response && error.response.status == 500) {
      showErrorNotification(error?.message);
    } else if (error.response && error.response.status == 409) {
      showErrorNotification(error.response.data);
    } else {
      showErrorNotification(error?.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
