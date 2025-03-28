"use client";

import { useEffect, useState, useRef } from "react";

export default function Transcriber() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const commands = {
    "open google": () => window.open("https://www.google.com", "_blank"),
  };

  const startTranscription = () => {
    setIsTranscribing(true);
    setTranscriptionText("");
    recognitionRef.current = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setTranscriptionText((prev) => prev + " " + transcript);

      Object.keys(commands).forEach((command) => {
        if (transcript.toLowerCase().includes(command)) {
          commands[command]();
        }
      });
    };

    recognitionRef.current.start();
    setupVisualizer();
  };

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsTranscribing(false);
    cancelAnimationFrame(animationFrameRef.current);
  };

  const setupVisualizer = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      visualize();
    });
  };

  const visualize = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#1f1f1f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 255)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-900 text-white p-2">
      <h1 className="text-5xl font-bold mb-8">Smart Communication for Speech and Hearing Impaired</h1>
      <h2 className="text-4xl font-semibold mb-8">Real Time Speech to Text</h2>
      <div className="w-3/4 max-w-lg bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Voice Transcriber</h1>
        <p className="text-gray-400 mb-6">Click the button below and start speaking.</p>
        <div className="flex justify-center items-center">
          <button
            onClick={isTranscribing ? stopTranscription : startTranscription}
            className={`w-36 h-36 rounded-full text-white flex justify-center items-center transition-all shadow-lg ${isTranscribing ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {isTranscribing ? "Stop" : "Record"}
          </button>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-3/4 max-w h-32 mt-6 bg-gray-700 rounded-lg"></canvas>
      {transcriptionText && (
        <div className="w-3/4 max-w-lg mt-6 p-4 bg-gray-800 shadow-md rounded-lg">
          <h2 className="text-xl font-semibold justify justify-center items-center">Transcription</h2>
          <p className="text-xl font-bold text-gray-300 mt-2">{transcriptionText}</p>
        </div>
      )}
    </div>
  );
}