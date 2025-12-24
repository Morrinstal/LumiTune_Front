// axios инстанс с базовым URL из .env
import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ||
  'http://localhost:8000/api';

export const api = axios.create({
  baseURL,
  withCredentials: false, // для JWT на куках можно true; для публичных ручек — false
});

// Опционально: лог реального URL запроса (временно, для отладки)
api.interceptors.request.use((cfg) => {
  // console.log('[API]', cfg.baseURL, cfg.url);
  return cfg;
});

// Хелпер: безопасный GET с 404→null
export async function safeGet<T>(url: string, config?: any): Promise<T | null> {
  try {
    const { data } = await api.get<T>(url, config);
    return data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

// // axios инстанс с базовым URL на продакшене Render
// import axios from 'axios';

// const baseURL = 'https://lumitumeback3-1.onrender.com/api';

// export const api = axios.create({
//   baseURL,
//   withCredentials: false, // JWT токены не через cookie
// });

// // (необязательно) лог для отладки
// api.interceptors.request.use((cfg) => {
//   // console.log('[API]', cfg.baseURL, cfg.url);
//   return cfg;
// });

// // Хелпер: безопасный GET с 404→null
// export async function safeGet<T>(url: string, config?: any): Promise<T | null> {
//   try {
//     const { data } = await api.get<T>(url, config);
//     return data;
//   } catch (e: any) {
//     if (e?.response?.status === 404) return null;
//     throw e;
//   }
// }
