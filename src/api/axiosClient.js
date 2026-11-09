import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8085',
    withCredentials: true,   // обязательно для работы Cookie + CORS
});

// Глобальный перехватчик ответов
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Если сессия истекла или нет прав — сообщаем приложению
        if (error.response?.status === 401) {
            window.dispatchEvent(new Event('unauthorized'));
        }
        return Promise.reject(error);
    }
);

export default axiosClient;