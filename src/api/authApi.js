import api from "./axios";

export const loginUser = async (username, password) => {

  const response = await api.post("/auth/login", {
    username: username,
    password: password,
  });

  return response.data;
};