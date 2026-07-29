import { apiRequest } from ".";

export const AddComment = async (data) =>
  apiRequest("post", "/api/comments/add-comment", data);

export const GetComments = async (taskId) =>
  apiRequest("post", "/api/comments/get-comments", { task: taskId });