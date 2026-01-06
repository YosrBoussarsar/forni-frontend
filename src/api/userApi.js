import axiosClient from "./axiosClient";

export const userApi = {
  getProfile: () => axiosClient.get("/profile"),
  updateProfile: (data) => axiosClient.put("/profile", data),
};
