import axiosClient from "./axiosClient";

export const surplusBagApi = {
  list: () => axiosClient.get("/surplus_bag"),
  listByTags: (tags) => {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append("tags", tags.join(","));
    }
    return axiosClient.get(`/surplus_bag?${params.toString()}`);
  },
  listByBakery: (bakeryId) => axiosClient.get(`/surplus_bag?bakery_id=${bakeryId}`),
  get: (id) => axiosClient.get(`/surplus_bag/${id}`),
  create: (data) => axiosClient.post("/surplus_bag", data),
  update: (id, data) => axiosClient.put(`/surplus_bag/${id}`, data),
  delete: (id) => axiosClient.delete(`/surplus_bag/${id}`),
};
