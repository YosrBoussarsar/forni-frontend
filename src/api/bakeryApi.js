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
  create: (data) => axiosClient.post("/bakery", data),
};
