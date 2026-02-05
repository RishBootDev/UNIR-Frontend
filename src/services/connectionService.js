import { get, post } from "../api";

export const getFirstDegreeConnections = async () => {
  return await get("/unir/connections/first-degree");
};

export const getIncomingConnectionRequests = async () => {
  return await get("/unir/connections/requests");
};

export const sendConnectionRequest = async (userId) => {
  return await post(`/unir/connections/request/${userId}`);
};

export const acceptConnectionRequest = async (userId) => {
  return await post(`/unir/connections/accept/${userId}`);
};

export const rejectConnectionRequest = async (userId) => {
  return await post(`/unir/connections/reject/${userId}`);
};
