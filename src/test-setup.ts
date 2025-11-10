import { vi } from 'vitest'

// Mock de Firebase
vi.mock('@/components/firebase/index', () => ({
  app: {},
  messaging: {},
}))

// Mock de Firebase messaging
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn().mockResolvedValue('mock-token'),
  onMessage: vi.fn(),
}))

// Mock de Firebase app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}))

// Mock de Firebase authentication
vi.mock('@/components/firebase/authentication', () => ({
  getCurrentUserToken: vi.fn().mockResolvedValue('mock-token'),
  checkLogin: vi.fn().mockResolvedValue(true),
}))

// Asegurar que window.location esté definido para axios
if (typeof window !== 'undefined' && !window.location) {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      hostname: 'localhost',
      port: '3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  })
}

// Mock de navigator.serviceWorker para Firebase
if (typeof window !== 'undefined' && !window.navigator.serviceWorker) {
  Object.defineProperty(window.navigator, 'serviceWorker', {
    value: {
      register: vi.fn().mockResolvedValue({}),
      ready: Promise.resolve({
        active: {},
      }),
    },
    writable: true,
  })
}
