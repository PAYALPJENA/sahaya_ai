"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type AppState = "IDLE" | "RECORDING_VOICE" | "TYPING" | "CAMERA" | "SUBMITTING" | "SUCCESS";

const WORKFLOW_STEPS = [
  "Emergency Report Received",
  "GPS Captured",
  "Extracting Information",
  "Classifying Incident",
  "Creating Incident Record",
  "Sending to District Control Room",
  "Tracking ID Generated"
];

export default function CitizenSOSPage() {
  const router = useRouter();

  const [appState, setAppState] = useState<AppState>("IDLE");
  const [selectedDisaster, setSelectedDisaster] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ token: string; msg: string } | null>(null);
  const [textContent, setTextContent] = useState("");
  const [pipelineStep, setPipelineStep] = useState(0);

  // GPS State
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number; accuracy: number; timestamp: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Voice Recording State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [transcribedText, setTranscribedText] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const recognitionRef = useRef<any>(null);

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Gallery Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // ──────────────────────────────────────────────
  // GPS: Real navigator.geolocation
  // ──────────────────────────────────────────────
  const captureGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsData({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Auto-capture GPS on mount
  useEffect(() => {
    captureGPS();
  }, [captureGPS]);

  // ──────────────────────────────────────────────
  // VOICE: Real MediaRecorder + Web Speech API
  // ──────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setTranscribedText("");
      setAudioBlob(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAppState("RECORDING_VOICE");

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Web Speech API for live transcription
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-IN";
        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript;
          }
          setTranscribedText(finalTranscript);
        };
        recognition.onerror = () => { /* Graceful fallback — audio still recorded */ };
        recognition.start();
        recognitionRef.current = recognition;
      }
    } catch {
      alert("Microphone access was denied. Please allow microphone access and try again.");
      setAppState("IDLE");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  // ──────────────────────────────────────────────
  // CAMERA: Real getUserMedia
  // ──────────────────────────────────────────────
  const openCamera = async () => {
    setCameraError(null);
    setCapturedImage(null);
    setUploadedImage(null);
    setAppState("CAMERA");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      // Video element will be set once it mounts
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setCameraError("Camera access was denied. Please allow camera access.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(dataUrl);
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setAppState("IDLE");
  };

  // ──────────────────────────────────────────────
  // GALLERY UPLOAD
  // ──────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedImage(ev.target?.result as string);
        setCapturedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // ──────────────────────────────────────────────
  // SUBMIT SOS
  // ──────────────────────────────────────────────
  const submitSOS = async (payloadOverride?: string) => {
    setAppState("SUBMITTING");
    setPipelineStep(0);

    // Close camera stream if open
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Show the live workflow status progressing
    for (let i = 0; i < WORKFLOW_STEPS.length; i++) {
      setPipelineStep(i);
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const rawContent = payloadOverride || transcribedText || textContent || `Emergency: ${selectedDisaster || "General Emergency"}`;
      const locationText = gpsData
        ? `Auto-GPS [${gpsData.lat.toFixed(6)}, ${gpsData.lng.toFixed(6)}] ±${gpsData.accuracy.toFixed(0)}m`
        : "GPS Unavailable";

      const res: { tracking_token: string; message: string } = await api.post("/sos", {
        raw_content: rawContent,
        reporter_name: "Anonymous Citizen",
        reporter_phone: "Not Provided",
        reporter_location_text: locationText,
        latitude: gpsData?.lat || null,
        longitude: gpsData?.lng || null,
        media_url: capturedImage || uploadedImage || null,
        source_type: "WEB",
      });
      setSuccessData({ token: res.tracking_token, msg: res.message });
      setAppState("SUCCESS");
    } catch {
      alert("Failed to submit SOS. Please try again or call 112.");
      setAppState("IDLE");
    }
  };

  const handleAction = (action: string) => {
    if (action === "SOS") {
      submitSOS("IMMEDIATE CRITICAL SOS TRIGGERED");
    } else if (action === "TYPE") {
      setAppState("TYPING");
    } else if (action === "VOICE") {
      startRecording();
    } else if (action === "CAMERA") {
      openCamera();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ──────────────────────────────────────────────
  // RENDER: SUBMITTING STATE (Live Workflow)
  // ──────────────────────────────────────────────
  if (appState === "SUBMITTING") {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-center mb-6">Live Workflow Status</h2>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="space-y-4">
              {WORKFLOW_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full border flex-shrink-0 ${
                    idx < pipelineStep ? "bg-emerald-500 border-emerald-500 text-white" : 
                    idx === pipelineStep ? "border-blue-500 text-blue-500" : 
                    "border-slate-200 text-transparent"
                  }`}>
                    {idx < pipelineStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : idx === pipelineStep ? (
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                    ) : null}
                  </div>
                  <span className={`text-sm md:text-base ${
                    idx < pipelineStep ? "text-slate-400" : 
                    idx === pipelineStep ? "text-slate-900 font-bold" : 
                    "text-slate-400"
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────────
  // RENDER: SUCCESS STATE
  // ──────────────────────────────────────────────
  if (appState === "SUCCESS" && successData) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-center">
          <div className="bg-emerald-600 p-8 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
             </div>
             <h1 className="text-xl font-bold text-white tracking-tight">Emergency Reported</h1>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="text-slate-700 text-left space-y-3 leading-relaxed">
              <p>Your report has been digitally verified.</p>
              <p>It has been forwarded to the District Collector for approval.</p>
              <p>Once approved, rescue resources will be dispatched automatically.</p>
              <p>You can now track the progress using your Tracking ID.</p>
            </div>

            {gpsData && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-left space-y-1">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Location Captured</div>
                <div className="text-sm text-slate-700 font-mono">{gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)}</div>
                <div className="text-xs text-slate-500">Accuracy: ±{gpsData.accuracy.toFixed(0)}m</div>
              </div>
            )}
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tracking ID</div>
              <div className="text-3xl font-mono text-slate-900 font-bold select-all tracking-tight">{successData.token}</div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => router.push(`/sos/${successData.token}`)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Track Rescue Status
              </button>
            </div>
            
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-left">
              <h3 className="text-sm font-bold text-slate-800 mb-4">What happens after you submit?</h3>
              <div className="flex flex-col space-y-2 text-xs text-slate-600 font-medium">
                <div>Citizen Report</div>
                <div className="text-slate-400 ml-1">↓</div>
                <div>Automated Verification</div>
                <div className="text-slate-400 ml-1">↓</div>
                <div>Collector Approval</div>
                <div className="text-slate-400 ml-1">↓</div>
                <div>Dispatch</div>
                <div className="text-slate-400 ml-1">↓</div>
                <div>Field Operations</div>
                <div className="text-slate-400 ml-1">↓</div>
                <div>Hospital Coordination</div>
                <div className="text-slate-400 ml-1">↓</div>
                <div>Citizen Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────────
  // RENDER: MAIN PAGE
  // ──────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* HEADER */}
      <header className="shrink-0 px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
        <div>
          <div className="text-xl font-bold text-slate-900 tracking-tight">Odisha SEOC Portal</div>
          <div className="text-sm text-rose-600 font-semibold tracking-wide uppercase">Emergency Intake System</div>
        </div>
        <div className="flex items-center">
          <select className="bg-slate-100 border border-slate-200 text-slate-700 text-sm py-2 px-3 rounded-lg outline-none font-medium appearance-none cursor-pointer">
            <option>English</option>
            <option>Odia</option>
            <option>Hindi</option>
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* ─── TYPING STATE ─── */}
        {appState === "TYPING" ? (
          <div className="p-6 max-w-xl mx-auto space-y-6 mt-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Describe Situation</h2>
              <button onClick={() => setAppState("IDLE")} className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
            <textarea
              autoFocus
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="What happened? Who is injured? Where are you?"
              className="w-full h-64 bg-white border border-slate-300 rounded-xl p-5 text-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none shadow-sm transition-all"
            />
            {gpsData && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-sm text-slate-700 font-mono">{gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)} <span className="text-slate-400">(±{gpsData.accuracy.toFixed(0)}m)</span></span>
              </div>
            )}
            <button
              onClick={() => submitSOS()}
              disabled={!textContent.trim()}
              className="w-full py-4 bg-rose-600 disabled:bg-slate-300 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              Send Emergency Report
            </button>
          </div>

        /* ─── VOICE RECORDING STATE ─── */
        ) : appState === "RECORDING_VOICE" ? (
          <div className="p-6 flex flex-col items-center justify-center space-y-8 max-w-xl mx-auto mt-12">
            <div className="text-center space-y-4">
              {/* Recording indicator */}
              <div className="w-28 h-28 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                {isRecording && <div className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-40" />}
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              
              {isRecording ? (
                <>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Recording Audio</h2>
                  {/* Timer */}
                  <div className="text-5xl font-mono font-bold text-rose-600">{formatTime(recordingTime)}</div>
                  <p className="text-slate-500 text-lg">Speak clearly into your device.</p>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recording Complete</h2>
                  <p className="text-slate-500">Duration: {formatTime(recordingTime)}</p>
                </>
              )}
            </div>

            {/* Live Transcription */}
            {transcribedText && (
              <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Live Transcription</div>
                <p className="text-slate-800 leading-relaxed">{transcribedText}</p>
              </div>
            )}

            {/* Audio preview after stop */}
            {!isRecording && audioBlob && (
              <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audio Preview</div>
                <audio controls className="w-full" src={URL.createObjectURL(audioBlob)} />
              </div>
            )}

            <div className="w-full space-y-4">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xl rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center space-x-3"
                >
                  <div className="w-4 h-4 bg-rose-500 rounded-sm" />
                  <span>Stop Recording</span>
                </button>
              ) : (
                <button
                  onClick={() => submitSOS(transcribedText || "Voice Recording Attached")}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xl rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Send Emergency Report
                </button>
              )}
              <button
                onClick={() => { stopRecording(); setAppState("IDLE"); }}
                className="w-full py-4 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

        /* ─── CAMERA STATE ─── */
        ) : appState === "CAMERA" ? (
          <div className="p-6 max-w-xl mx-auto space-y-6 mt-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Capture Evidence</h2>
              <button onClick={closeCamera} className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>

            {cameraError ? (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 font-medium">
                {cameraError}
              </div>
            ) : !capturedImage && !uploadedImage ? (
              <>
                {/* Live camera feed */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black aspect-[4/3]">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={capturePhoto}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>Capture Photo</span>
                </button>
              </>
            ) : (
              <>
                {/* Photo preview */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-black aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={capturedImage || uploadedImage || ""} alt="Captured" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setCapturedImage(null); setUploadedImage(null); }}
                    className="py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Retake / Replace
                  </button>
                  <button
                    onClick={() => submitSOS(`Photo evidence attached for ${selectedDisaster || "Emergency"}`)}
                    className="py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    Send Report
                  </button>
                </div>
              </>
            )}

            {/* OR: Upload from gallery */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm font-bold text-slate-400 uppercase">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-700 font-bold text-lg rounded-xl shadow-sm transition-all flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>Upload from Gallery</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <canvas ref={canvasRef} className="hidden" />
          </div>

        /* ─── IDLE STATE (Home) ─── */
        ) : (
          <div className="max-w-2xl mx-auto mt-8 space-y-8">
            {/* HERO */}
            <div className="px-6 text-center space-y-3">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Emergency Assistance</h1>
              <p className="text-slate-600 text-lg leading-relaxed">Submit an emergency report directly to the District Control Room. Automated intake captures your location and details instantly.</p>
            </div>

            {/* GPS Status Bar */}
            <div className="px-6">
              <div className={`flex items-center space-x-3 p-3 rounded-xl border text-sm font-medium ${
                gpsData ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                gpsLoading ? "bg-blue-50 border-blue-200 text-blue-700" :
                "bg-amber-50 border-amber-200 text-amber-700"
              }`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {gpsLoading ? (
                  <span>Acquiring GPS location...</span>
                ) : gpsData ? (
                  <span>GPS: {gpsData.lat.toFixed(6)}, {gpsData.lng.toFixed(6)} <span className="text-emerald-500">(±{gpsData.accuracy.toFixed(0)}m)</span></span>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span>{gpsError || "GPS unavailable"}</span>
                    <button onClick={captureGPS} className="text-amber-800 underline font-bold text-xs ml-2">Retry</button>
                  </div>
                )}
              </div>
            </div>

            {/* PRIMARY ACTIONS */}
            <div className="px-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAction("SOS")}
                className="col-span-2 py-10 bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-2xl shadow-xl shadow-rose-600/20 flex flex-col items-center justify-center space-y-2 transition-all active:scale-[0.98] border border-rose-700/50"
              >
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-3xl font-bold uppercase tracking-widest">SOS</span>
              </button>
              
              <button onClick={() => handleAction("VOICE")} className="py-8 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl shadow-sm flex flex-col items-center space-y-3 text-slate-700 transition-all">
                <div className="bg-blue-50 p-4 rounded-full text-blue-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div>
                <span className="font-bold tracking-wide">Record Voice</span>
              </button>
              
              <button onClick={() => handleAction("CAMERA")} className="py-8 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl shadow-sm flex flex-col items-center space-y-3 text-slate-700 transition-all">
                <div className="bg-blue-50 p-4 rounded-full text-blue-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                <span className="font-bold tracking-wide">Take Photo</span>
              </button>

              <button onClick={() => handleAction("TYPE")} className="col-span-2 py-6 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-2xl shadow-sm flex items-center justify-center space-x-4 text-slate-700 transition-all">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></div>
                <span className="font-bold text-lg tracking-wide">Type Description</span>
              </button>
            </div>

            {/* EMERGENCY TYPES */}
            <div className="px-6 pt-2">
              <h3 className="text-slate-500 font-semibold mb-4 text-sm uppercase tracking-wider text-center">Optional: Specify Emergency Type</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Flood", "Cyclone", "Medical", "Fire", "Road Accident", "Landslide", "Collapse", "Other"].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedDisaster(selectedDisaster === type ? null : type)}
                    className={`py-3 px-2 text-sm font-bold rounded-xl border transition-all ${
                      selectedDisaster === type 
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20" 
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
    </main>
  );
}
