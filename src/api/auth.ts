// src/api/auth.ts
export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

type Json = Record<string, any>;
type Tokens = { access: string; refresh: string };

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function fetchJSON<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    // Базовое сообщение
    let msg =
      (data && (data.detail || data.error || data.message)) ||
      `${res.status} ${res.statusText}`;

    // Собрать ошибки по полям в удобную строку
    if (data && typeof data === "object" && !("detail" in data)) {
      const parts: string[] = [];
      for (const [k, v] of Object.entries<any>(data)) {
        if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
        else if (typeof v === "string") parts.push(`${k}: ${v}`);
      }
      if (parts.length) msg = parts.join(" | ");
    }

    // Бросаем расширенную ошибку
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

export function saveTokens(t: Tokens) {
  localStorage.setItem("access", t.access);
  localStorage.setItem("refresh", t.refresh || "");
}
export function getAccessToken(): string | null {
  return localStorage.getItem("access");
}

export async function registerUser(payload: Json): Promise<Json> {
  return fetchJSON(`${API_BASE}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function loginJWT(email: string, password: string): Promise<Tokens> {
  const tokens = await fetchJSON<Tokens>(`${API_BASE}/auth/jwt/create/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  saveTokens(tokens);
  return tokens;
}

export async function authFetchJSON<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const access = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (access) headers.set("Authorization", `Bearer ${access}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  return fetchJSON<T>(url, { ...init, headers });
}

export async function updateMe(patch: Json): Promise<Json> {
  return authFetchJSON(`${API_BASE}/auth/me/`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
export function setCurrentUserId(id: string) {
  localStorage.setItem("user_id", String(id));
}
export function getCurrentUserId(): string | null {
  return localStorage.getItem("user_id");
}

// --- профиль текущего пользователя ---
export async function fetchMe(): Promise<any> {
  return authFetchJSON(`${API_BASE}/auth/me/`, { method: "GET" });
}

// продакшн-бэкэнд Render
// продакшн-бэкэнд Render
// export const API_BASE = "https://lumitumeback3-1.onrender.com/api";

// type Json = Record<string, any>;
// type Tokens = { access: string; refresh: string };

// export class ApiError extends Error {
//   status: number;
//   data: any;
//   constructor(status: number, message: string, data?: any) {
//     super(message);
//     this.name = "ApiError";
//     this.status = status;
//     this.data = data;
//   }
// }

// async function fetchJSON<T = any>(url: string, init: RequestInit = {}): Promise<T> {
//   const res = await fetch(url, init);
//   const ct = res.headers.get("content-type") || "";
//   const data = ct.includes("application/json") ? await res.json() : await res.text();

//   if (!res.ok) {
//     let msg =
//       (data && (data.detail || data.error || data.message)) ||
//       `${res.status} ${res.statusText}`;

//     if (data && typeof data === "object" && !("detail" in data)) {
//       const parts: string[] = [];
//       for (const [k, v] of Object.entries<any>(data)) {
//         if (Array.isArray(v)) parts.push(`${k}: ${v.join(", ")}`);
//         else if (typeof v === "string") parts.push(`${k}: ${v}`);
//       }
//       if (parts.length) msg = parts.join(" | ");
//     }

//     throw new ApiError(res.status, msg, data);
//   }
//   return data as T;
// }

// export function saveTokens(t: Tokens) {
//   localStorage.setItem("access", t.access);
//   localStorage.setItem("refresh", t.refresh || "");
// }
// export function getAccessToken(): string | null {
//   return localStorage.getItem("access");
// }

// export async function registerUser(payload: Json): Promise<Json> {
//   return fetchJSON(`${API_BASE}/auth/register/`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });
// }

// export async function loginJWT(email: string, password: string): Promise<Tokens> {
//   const tokens = await fetchJSON<Tokens>(`${API_BASE}/auth/jwt/create/`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });
//   saveTokens(tokens);
//   return tokens;
// }

// export async function authFetchJSON<T = any>(url: string, init: RequestInit = {}): Promise<T> {
//   const access = getAccessToken();
//   const headers = new Headers(init.headers || {});
//   if (access) headers.set("Authorization", `Bearer ${access}`);
//   if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

//   return fetchJSON<T>(url, { ...init, headers });
// }

// export async function updateMe(patch: Json): Promise<Json> {
//   return authFetchJSON(`${API_BASE}/auth/me/`, {
//     method: "PATCH",
//     body: JSON.stringify(patch),
//   });
// }

// export function setCurrentUserId(id: string) {
//   localStorage.setItem("user_id", String(id));
// }
// export function getCurrentUserId(): string | null {
//   return localStorage.getItem("user_id");
// }

// export async function fetchMe(): Promise<any> {
//   return authFetchJSON(`${API_BASE}/auth/me/`, { method: "GET" });
// }

