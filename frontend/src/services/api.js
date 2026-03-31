// Базовый URL для API
const API_URL = 'http://localhost:8000/api';

// Временный токен (пока без авторизации)
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return authToken || localStorage.getItem('token');
};

// Базовый fetch с обработкой ошибок
async function request(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }
  
  return response.json();
}

// API методы для зон
export const zonesApi = {
  // Получить все зоны
  getAll: () => request('/zones'),
  
  // Создать зону
  create: (data) => request('/zones', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Обновить зону
  update: (id, data) => request(`/zones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Удалить зону
  delete: (id) => request(`/zones/${id}`, {
    method: 'DELETE',
  }),
};

// API методы для станков
export const machinesApi = {
  // Получить станки зоны
  getByZone: (zoneId) => request(`/zones/${zoneId}/machines`),
  
  // Создать станок
  create: (zoneId, data) => request(`/zones/${zoneId}/machines`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Обновить станок
  update: (id, data) => request(`/machines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Удалить станок
  delete: (id) => request(`/machines/${id}`, {
    method: 'DELETE',
  }),
  
  // Изменить статус с фото
  changeStatus: (id, status, comment, photos) => {
    const formData = new FormData();
    formData.append('new_status', status);
    if (comment) formData.append('comment', comment);
    photos.forEach((photo, index) => {
      formData.append(`photos`, photo);
    });
    
    return fetch(`${API_URL}/machines/${id}/status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }).then(res => res.json());
  },
};

// API методы для истории
export const historyApi = {
  // Добавить комментарий к истории
  addComment: (historyId, text, photos) => {
    const formData = new FormData();
    formData.append('text', text);
    photos.forEach((photo, index) => {
      formData.append(`photos`, photo);
    });
    
    return fetch(`${API_URL}/history/${historyId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    }).then(res => res.json());
  },
};

// API методы для аутентификации
export const authApi = {
  // Регистрация по приглашению
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Вход
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  // Получить текущего пользователя
  getMe: () => request('/auth/me'),
};

// WebSocket соединение
export let ws = null;
let wsReconnectTimer = null;

export const connectWebSocket = (userId, onMessage) => {
  const token = getAuthToken();
  if (!token) return;
  
  const wsUrl = `ws://localhost:8000/ws/${userId}?token=${token}`;
  ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected, reconnecting...');
    // Переподключение через 3 секунды
    wsReconnectTimer = setTimeout(() => {
      connectWebSocket(userId, onMessage);
    }, 3000);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
};

export const disconnectWebSocket = () => {
  if (wsReconnectTimer) {
    clearTimeout(wsReconnectTimer);
  }
  if (ws) {
    ws.close();
    ws = null;
  }
};

// Отправить сообщение через WebSocket
export const sendWSMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};