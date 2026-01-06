import axiosClient from "./axiosClient";

export const authApi = {
  login: (data) => axiosClient.post("/login", data),
  register: (data) => axiosClient.post("/register", data),
  refresh: () => axiosClient.post("/refresh"),
};
