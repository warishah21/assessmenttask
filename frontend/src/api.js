// Thin fetch wrapper: always sends the session cookie, throws on non-2xx.
async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.details = data.errors;
    throw error;
  }
  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

// Builds ?a=1&b=2 and skips empty values
const qs = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });
  const str = search.toString();
  return str ? `?${str}` : "";
};

export const authApi = {
  me: () => request("/auth/me"),
  login: (body) => request("/auth/login", json("POST", body)),
  register: (body) => request("/auth/register", json("POST", body)),
  logout: () => request("/auth/logout", { method: "POST" }),
};

export const teamsApi = {
  list: () => request("/teams"),
  get: (id) => request(`/teams/${id}`),
   create: async (name) => {
    return await request('/teams', {
      method: 'POST',
      body: JSON.stringify({ name: name })
    });
  },
  remove: (id) => request(`/teams/${id}`, { method: "DELETE" }),
  addMember: (id, email) => request(`/teams/${id}/members`, json("POST", { email })),
};

export const tasksApi = {
  list: (filters) => request(`/tasks${qs(filters)}`),
  create: (body) => request("/tasks", json("POST", body)),
  update: (id, body) => request(`/tasks/${id}`, json("PUT", body)),
  remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};