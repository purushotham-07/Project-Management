import axios from "axios";

// For Vercel deployment, default to Render backend
// In development, the proxy (package.json) handles it
const apiBaseUrl = process.env.REACT_APP_API_URL || "https://project-management-321v.onrender.com";

export const apiRequest = async (method, url, payload) => {
  try {
    const response = await axios({
      method,
      url: `${apiBaseUrl}${url}`,
      data: payload,
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : { success: false, message: error.message };
  }
};
