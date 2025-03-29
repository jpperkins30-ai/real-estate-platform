import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'

// Get the root element
const rootElement = document.getElementById('root')

// Render the app
if (rootElement) {
  ReactDOM.render(<App />, rootElement)
} else {
  console.error("Could not find root element")
} 