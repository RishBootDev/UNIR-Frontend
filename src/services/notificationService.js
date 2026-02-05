import { get } from "../api";

export const getNotifications = async (userId) => {
  return await get(`/unir/notifications/${userId}`);
};
