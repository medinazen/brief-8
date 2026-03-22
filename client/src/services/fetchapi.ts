const BASE_URL = "http://localhost:3310/api";

type ApiResponse<T> = Promise<T>;

export const api = {
  get: async <T>(url: string): ApiResponse<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error(`Error GET ${url}`);
    return res.json();
  },

  post: async <T>(url: string, data: unknown): ApiResponse<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Error POST ${url}`);
    return res.json();
  },

  put: async <T>(url: string, data: unknown): ApiResponse<T> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`Error PUT ${url}`);
    return res.json();
  },
};