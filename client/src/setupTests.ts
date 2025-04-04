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
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

// Setup session storage mock
const sessionStorageMock = (() => {
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
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

// Add matchers to expect
expect.extend(matchers)

// Setup global mocks
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
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
