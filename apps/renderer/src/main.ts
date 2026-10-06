import { createApp } from 'vue';
import App from './app/App.vue';
import { authSessionToken } from './app/auth';
import './styles/main.css';
import { applyProductIdentity } from './app/product';

applyProductIdentity();

const nativeFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const isApiRequest = requestUrl.startsWith('/api/')
    || requestUrl.startsWith('http://127.0.0.1:49832/api/')
    || requestUrl.startsWith('http://localhost:49832/api/');
  if (!isApiRequest) return nativeFetch(input, init);
  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
  const token = authSessionToken();
  if (token && !headers.has('x-easymate-session')) headers.set('x-easymate-session', token);
  return nativeFetch(input, { ...init, headers });
};

createApp(App).mount('#app');
