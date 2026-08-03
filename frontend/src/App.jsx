import { useState, useRef, useEffect } from 'react'
import { Upload, Mic, Download, Loader2, CheckCircle, Square, Trash2 } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'

function App() {
  const [file, setFile] = useState(null)
  const [transcribing, setTranscribing] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [detectedLanguage, setDetectedLanguage] = useState('')
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [processingStage, setProcessingStage] = useState('')
  const [history, setHistory] = useState([])
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setTranscription('')
      setTranslation('')
      setDetectedLanguage('')
      setProcessingStage('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setError('')
      setTranscription('')
      setTranslation('')
      setDetectedLanguage('')
      setProcessingStage('')
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })
        setFile(audioFile)
        setError('')
        setTranscription('')
        setTranslation('')
        setDetectedLanguage('')
        setProcessingStage('')
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setError('Failed to access microphone. Please allow microphone access.')
      console.error('Microphone access error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`/api/transcription/${fileId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchHistory()
      }
    } catch (err) {
      console.error('Failed to delete transcription:', err)
    }
  }

  const handleHistoryClick = (item) => {
    setTranscription(item.transcription)
    setTranslation(item.translation || '')
    setDetectedLanguage(item.language)
    setFile(null)
    setError('')
  }

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory()
  }, [])

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select an audio file first')
      return
    }

    setTranscribing(true)
    setError('')
    setProcessingStage('Uploading audio...')

    const formData = new FormData()
    formData.append('file', file)

    try {
      setProcessingStage('Processing audio...')
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || errData.error || 'Transcription failed')
      }

      setProcessingStage('Receiving results...')
      const data = await response.json()
      setTranscription(data.text)
      setTranslation(data.translation || '')
      setDetectedLanguage(data.language)
      setProcessingStage('')
      // Refresh history after successful transcription
      fetchHistory()
    } catch (err) {
      setError(err.message || 'Failed to transcribe audio. Please try again.')
      console.error(err)
    } finally {
      setTranscribing(false)
    }
  }

  const handleDownload = () => {
    if (!transcription) return

    let content = `Twi Transcription:\n${transcription}\n\n`
    if (translation) {
      content += `English Translation:\n${translation}`
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const baseName = file?.name?.replace(/\.[^/.]+$/, '') || 'history'
    a.download = `transcription_${baseName}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mic className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">AI Twi Audio Transcriber</h1>
          </div>
          <p className="text-gray-600 text-lg">Transcribe Twi audio files with automatic English translation</p>
        </div>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Audio File</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Model Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Custom Twi Model:</strong> Using a Whisper model specifically trained on Twi language data for improved accuracy with automatic English translation.
              </p>
            </div>

            {/* Recording Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Or record audio directly:</p>
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={transcribing}
                    variant="outline"
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono text-sm">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* File Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  {file ? file.name : 'Drag and drop an audio file here, or click to select'}
                </p>
                <p className="text-sm text-gray-400">
                  Supports MP3, WAV, OGG, and other audio formats
                </p>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}

            {/* Processing Stage */}
            {processingStage && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">{processingStage}</span>
                </div>
              </div>
            )}

            {/* Transcribe Button */}
            <Button
              onClick={handleTranscribe}
              disabled={!file || transcribing || isRecording}
              className="w-full mt-6"
              size="lg"
            >
              {transcribing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Transcribe Audio
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6"></div>

        {/* Transcription Result */}
        {transcription && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transcription Result</CardTitle>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Detected Language */}
              {detectedLanguage && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md">
                  <span className="text-sm font-medium text-blue-800">
                    Detected Language: {detectedLanguage.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Transcription Text */}
              <div className="mb-4 p-4 bg-gray-50 rounded-md min-h-[200px]">
                <p className="text-sm font-medium text-gray-600 mb-2">Twi Transcription:</p>
                <p className="text-gray-800 whitespace-pre-wrap">{transcription}</p>
              </div>

              {/* Translation Text */}
              {translation && (
                <div className="mb-4 p-4 bg-green-50 rounded-md min-h-[100px]">
                  <p className="text-sm font-medium text-green-700 mb-2">English Translation:</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{translation}</p>
                </div>
              )}

              {/* Download Button */}
              <Button onClick={handleDownload} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Transcription
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-6"></div>

        {/* History Section */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.file_id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.original_filename}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.file_id)
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App
