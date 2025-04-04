import '@testing-library/jest-dom'
import { vi, expect, afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Make sure we're clean between tests
afterEach(() => {
  cleanup()
})

// Setup local storage mock for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

// Add matchers to expect
expect.extend(matchers)

// Mock window objects and browser APIs
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock })

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: []
}))

// Mock fetch
global.fetch = vi.fn()

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear()
  vi.resetAllMocks()
})

// Mock document functions used in components
document.createRange = () => {
  const range = new Range()
  range.getBoundingClientRect = vi.fn()
  
  // Create a properly shaped DOMRectList
  const domRectList = {
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {
      yield* []
    }
  }
  
  range.getClientRects = vi.fn(() => domRectList as unknown as DOMRectList)
  return range
}

// Optional: Mock console methods to reduce test noise
// Uncomment if needed
/*
console.error = vi.fn()
console.warn = vi.fn()
console.info = vi.fn()
*/
