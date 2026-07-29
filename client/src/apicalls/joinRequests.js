import { apiRequest } from ".";

export const RequestToJoin = async (data) =>
  apiRequest("post", "/api/join-requests/request-to-join", data);

export const GetJoinRequests = async (projectId) =>
  apiRequest("post", "/api/join-requests/get-join-requests", { projectId });

export const RespondToRequest = async (data) =>
  apiRequest("post", "/api/join-requests/respond-to-request", data);