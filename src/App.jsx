import React from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import AIVoiceAssistant from './components/AIVoiceAssistant'
import './App.css'

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <AIVoiceAssistant />
      </ErrorBoundary>
    </div>
  )
}

export default App
