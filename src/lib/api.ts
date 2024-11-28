import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    college: string;
  }) => api.post("/auth/register", data),
  me: () => api.get("/auth/me"),
};

export const plans = {
  getAll: () => api.get("/plans"),
  getPendingInvitations: () => api.get("/plans/invitations"),
  get: (id: string) => api.get(`/plans/${id}`),
  create: (
    data: Omit<
      StudyPlan,
      "id" | "createdBy" | "createdAt" | "members" | "invitations"
    >
  ) => api.post("/plans", data),
  update: (id: string, data: Partial<StudyPlan>) =>
    api.patch(`/plans/${id}`, data),
  delete: (id: string) => api.delete(`/plans/${id}`),
  invite: (id: string, email: string) =>
    api.post(`/plans/${id}/invite`, { email }),
  respondToInvitation: (
    planId: string,
    invitationId: string,
    status: "accepted" | "rejected"
  ) => api.post(`/plans/${planId}/invitations/${invitationId}`, { status }),
};

export const tasks = {
  create: (planId: string, data: Omit<Task, "id" | "createdAt">) =>
    api.post(`/plans/${planId}/tasks`, data),
  update: (planId: string, taskId: string, data: Partial<Task>) =>
    api.patch(`/plans/${planId}/tasks/${taskId}`, data),
  delete: (planId: string, taskId: string) =>
    api.delete(`/plans/${planId}/tasks/${taskId}`),
  assign: (planId: string, taskId: string, userId: string) =>
    api.post(`/plans/${planId}/tasks/${taskId}/assign`, { userId }),
};
