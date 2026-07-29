import axios from "axios";

export const apiRequest = async (method, url, payload) => {
  try {
    const response = await axios({
      method,
      url,
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
