import axiosClient from "./axiosClient";

export const orderApi = {
  list: () => axiosClient.get("/order"),
  create: (data) => axiosClient.post("/order", data),
  updateStatus: (id, data) => axiosClient.put(`/order/${id}`, data),
};
