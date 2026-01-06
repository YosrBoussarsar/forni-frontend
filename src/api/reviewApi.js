import axiosClient from "./axiosClient";

export const reviewApi = {
  listByBakery: (id) => axiosClient.get(`/review?bakery_id=${id}`),

  create: (data) => axiosClient.post("/review", data),
};
