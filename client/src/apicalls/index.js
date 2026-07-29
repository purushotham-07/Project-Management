import axios from "axios";

const apiBaseUrl = process.env.REACT_APP_API_URL || "";

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
