import { api } from "./api";

function asFormData(payload) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "avatar" && value instanceof File) {
      form.append("avatar", value);
      return;
    }
    if (typeof value === "boolean") {
      form.append(key, value ? "true" : "false");
      return;
    }
    form.append(key, String(value));
  });
  return form;
}

const multipart = {
  headers: { "Content-Type": undefined },
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData) {
        delete headers["Content-Type"];
      }
      return data;
    },
  ],
};

export const testimonialAPI = {
  list: async (params = {}) => {
    const { data } = await api.get("/api/admin/testimonials", { params });
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post("/api/admin/testimonials", asFormData(payload), multipart);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/api/admin/testimonials/${id}`, asFormData(payload), multipart);
    return data;
  },
  feature: async (id, is_featured) => {
    const { data } = await api.post(`/api/admin/testimonials/${id}/feature`, { is_featured });
    return data;
  },
  approve: async (id) => {
    const { data } = await api.post(`/api/admin/testimonials/${id}/approve`);
    return data;
  },
  reject: async (id) => {
    const { data } = await api.post(`/api/admin/testimonials/${id}/reject`);
    return data;
  },
  reorder: async (ordered_ids) => {
    const { data } = await api.put("/api/admin/testimonials/reorder", { ordered_ids });
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/api/admin/testimonials/${id}`);
    return data;
  },
};
