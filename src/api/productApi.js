import axiosClient from "./axiosClient";

export const productApi = {
  listByBakery: (id) => axiosClient.get(/product?bakery_id=),
  listByTags: (tags) => {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append("tags", tags.join(","));
    }
    return axiosClient.get(/product?);
  },
  get: (id) => axiosClient.get(/product/),
  create: (data) => axiosClient.post("/product", data),
  update: (id, data) => axiosClient.put(/product/, data),
  delete: (id) => axiosClient.delete(/product/),
};
