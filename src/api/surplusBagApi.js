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
  get: (id) => axiosClient.get(`/surplus_bag/${id}`),
  create: (data) => axiosClient.post("/surplus_bag", data),
};
