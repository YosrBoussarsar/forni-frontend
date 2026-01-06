import axiosClient from "./axiosClient";

export const recommendationsApi = {
  list: () => axiosClient.get("/recommendation"),
};
