import React from 'react'
import ReactDOM from 'react-dom'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.render(
    <RouterProvider router={router} />,
    rootElement
  )
} else {
  console.error("Root element not found!")
}
