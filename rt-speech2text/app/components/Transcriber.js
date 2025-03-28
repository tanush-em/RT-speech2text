"use client";

import { useEffect, useState, useRef } from "react";

export default function Transcriber() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const recognitionRef = useRef(null);

  const commands = {
    "hello": () => alert("Hello!"),
    "open google": () => window.open("https://www.google.com", "_blank")
  };

  const startTranscription = () => {
    setIsTranscribing(true);
    recognitionRef.current = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setTranscriptionText(transcript);

      Object.keys(commands).forEach((command) => {
        if (transcript.toLowerCase().includes(command)) {
          commands[command]();
        }
      });
    };

    recognitionRef.current.start();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const stopTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setTranscriptionComplete(true);
    }
  };

  const handleToggleTranscription = () => {
    if (!isTranscribing) {
      startTranscription();
    } else {
      stopTranscription();
    }
    setIsTranscribing(!isTranscribing);
  };

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="w-full">
        {(isTranscribing || transcriptionText) && (
          <div className="w-1/4 m-auto rounded-md border p-4 bg-white">
            <div className="flex-1 flex w-full justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {transcriptionComplete ? "Transcription Complete" : "Transcribing"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {transcriptionComplete ? "Thanks for speaking." : "Speak now..."}
                </p>
              </div>
              {isTranscribing && (
                <div className="rounded-full w-4 h-4 bg-red-400 animate-pulse" />
              )}
            </div>
            {transcriptionText && (
              <div className="border rounded-md p-2 h-full mt-4">
                <p className="mb-0">{transcriptionText}</p>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center w-full">
          <button
            onClick={handleToggleTranscription}
            className={`mt-10 m-auto flex items-center justify-center rounded-full w-20 h-20 focus:outline-none ${isTranscribing ? "bg-red-400 hover:bg-red-500" : "bg-blue-400 hover:bg-blue-500"}`}
          >
            {isTranscribing ? (
              <svg className="h-12 w-12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white">
                <path
                  fill="currentColor"
                  d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}