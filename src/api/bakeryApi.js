import axiosClient from "./axiosClient";

export const bakeryApi = {
  list: () => axiosClient.get("/bakery"),
  listByProductTags: (tags) => {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append("product_tags", tags.join(","));
    }
    return axiosClient.get(`/bakery?${params.toString()}`);
  },
  get: (id) => axiosClient.get(`/bakery/${id}`),
  getAll: () => axiosClient.get("/bakery"),
  getMy: () => axiosClient.get("/bakery/my"),
  create: (data) => axiosClient.post("/bakery", data),
  update: (id, data) => axiosClient.put(`/bakery/${id}`, data),
  delete: (id) => axiosClient.delete(`/bakery/${id}`),
};
