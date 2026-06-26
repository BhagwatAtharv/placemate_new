import React, { useMemo, useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  Code,
  Brain,
  Camera,
  Mic,
  MonitorUp,
  ShieldAlert,
  Eye,
} from "lucide-react";

export function TestInterface({ testId, onComplete }) {
  const {
    user,
    tests,
    submitTestResult,
    startProctoringSession,
    endProctoringSession,
    logProctoringViolation,
  } = useApp();
  const test = tests.find((t) => t.id === testId);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const faceIntervalRef = useRef(null);
  const lastViolationAtRef = useRef({});
  const proctoringSessionIdRef = useRef(null);
  const submittingRef = useRef(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState((test?.duration || 60) * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [result, setResult] = useState(null);
  const [proctoringStarted, setProctoringStarted] = useState(false);
  const [isStartingProctoring, setIsStartingProctoring] = useState(false);
  const [proctoringError, setProctoringError] = useState("");
  const [proctorStatus, setProctorStatus] = useState({
    camera: "pending",
    microphone: "pending",
    screen: "pending",
    face: "pending",
  });
  const [proctorStats, setProctorStats] = useState({ riskScore: 0, totalWarnings: 0 });
  const [proctorNotice, setProctorNotice] = useState("");

  const totalQuestions = test?.questions?.length || 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const flaggedCount = flaggedQuestions.size;
  const progressValue = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isLowTime = timeLeft < 5 * 60;

  const updateProctorStatus = (key, value) => {
    setProctorStatus((prev) => ({ ...prev, [key]: value }));
  };

  const stopProctoringStreams = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    screenStreamRef.current = null;

    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (faceIntervalRef.current) {
      clearInterval(faceIntervalRef.current);
      faceIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const logViolation = async (violationType, severityScore, meta = {}) => {
    const sessionId = proctoringSessionIdRef.current;
    if (!sessionId || submittingRef.current) return;

    const now = Date.now();
    const minGapMs = violationType === "SCREEN_SHARE_STOPPED" ? 0 : 12000;
    if (lastViolationAtRef.current[violationType] && now - lastViolationAtRef.current[violationType] < minGapMs) {
      return;
    }
    lastViolationAtRef.current[violationType] = now;

    try {
      const response = await logProctoringViolation({
        proctoringSessionId: sessionId,
        violationType,
        severityScore,
        meta,
      });
      if (!response) return;

      setProctorStats({
        riskScore: response.riskScore || 0,
        totalWarnings: response.totalWarnings || 0,
      });

      if (response.warnings?.length) {
        setProctorNotice(
          response.shouldAutoSubmit
            ? "Repeated proctoring violations detected. The test is being submitted."
            : "Proctoring warning recorded. Please keep your camera, screen, and focus steady."
        );
      }

      if (response.shouldAutoSubmit) {
        await handleSubmit({ force: true, reason: "proctoring" });
      }
    } catch (err) {
      setProctoringError(err.message || "Unable to log proctoring event.");
    }
  };

  const startAudioMonitoring = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        updateProctorStatus("microphone", "limited");
        return;
      }

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      const data = new Uint8Array(analyser.fftSize);
      source.connect(analyser);
      audioContextRef.current = audioContext;

      audioIntervalRef.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(data);
        const peak = data.reduce((max, value) => Math.max(max, Math.abs(value - 128)), 0);
        if (peak > 45) {
          logViolation("AUDIO_VIOLATION", 8, { peak });
        }
      }, 3000);
    } catch {
      updateProctorStatus("microphone", "limited");
    }
  };

  const startFaceMonitoring = () => {
    if (!("FaceDetector" in window)) {
      updateProctorStatus("face", "limited");
      return;
    }

    const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
    faceIntervalRef.current = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const faces = await detector.detect(video);
        if (faces.length === 0) {
          updateProctorStatus("face", "warning");
          logViolation("NO_FACE", 10, { faceCount: 0 });
        } else if (faces.length > 1) {
          updateProctorStatus("face", "warning");
          logViolation("MULTIPLE_FACES", 20, { faceCount: faces.length });
        } else {
          updateProctorStatus("face", "active");
        }
      } catch {
        updateProctorStatus("face", "limited");
      }
    }, 5000);
  };

  const startProctoring = async () => {
    if (!test || isStartingProctoring) return;
    setIsStartingProctoring(true);
    setProctoringError("");

    try {
      if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.getDisplayMedia) {
        throw new Error("This browser does not support the required proctoring permissions.");
      }

      const session = await startProctoringSession(test.id);
      if (!session?.proctoringSessionId) {
        throw new Error("Unable to start a proctoring session.");
      }
      proctoringSessionIdRef.current = session?.proctoringSessionId;
      setProctorStats({
        riskScore: session?.riskScore || 0,
        totalWarnings: session?.totalWarnings || 0,
      });

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: true,
      });
      mediaStreamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      updateProctorStatus("camera", "active");
      updateProctorStatus("microphone", "active");
      startAudioMonitoring(mediaStream);
      startFaceMonitoring();

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" },
        audio: false,
      });
      screenStreamRef.current = screenStream;
      updateProctorStatus("screen", "active");
      screenStream.getVideoTracks()[0]?.addEventListener("ended", () => {
        updateProctorStatus("screen", "warning");
        logViolation("SCREEN_SHARE_STOPPED", 35, { source: "screen-track-ended" });
      });

      setProctoringStarted(true);
    } catch (err) {
      stopProctoringStreams();
      if (proctoringSessionIdRef.current) {
        await endProctoringSession(proctoringSessionIdRef.current).catch(() => {});
        proctoringSessionIdRef.current = null;
      }
      setProctoringError(err.message || "Camera, microphone, and screen permissions are required.");
    } finally {
      setIsStartingProctoring(false);
    }
  };

  useEffect(() => {
    if (!proctoringStarted || showResultDialog) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [proctoringStarted, showResultDialog, timeLeft]);

  useEffect(() => {
    if (!proctoringStarted) return;
    if (videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("TAB_SWITCH", 15, { source: "visibilitychange" });
      }
    };
    const handleWindowBlur = () => {
      logViolation("TAB_SWITCH", 10, { source: "window-blur" });
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation("LOOKING_AWAY", 8, { source: "fullscreen-exit" });
      }
    };
    const handleBlockedInteraction = (event) => {
      logViolation("LOOKING_AWAY", 6, { source: event.type });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("copy", handleBlockedInteraction);
    window.addEventListener("paste", handleBlockedInteraction);

    document.documentElement.requestFullscreen?.().catch(() => {});

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("copy", handleBlockedInteraction);
      window.removeEventListener("paste", handleBlockedInteraction);
    };
  }, [proctoringStarted]);

  useEffect(() => {
    return () => {
      stopProctoringStreams();
      if (proctoringSessionIdRef.current) {
        endProctoringSession(proctoringSessionIdRef.current).catch(() => {});
      }
    };
  }, []);

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Test not found</p>
      </div>
    );
  }

  if (!totalQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>This test has no questions.</p>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const isFlagged = flaggedQuestions.has(currentQuestion.id);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const statusClass = (status) => {
    if (status === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "warning") return "bg-rose-50 text-rose-700 border-rose-200";
    if (status === "limited") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentQuestion.id)) {
      newFlagged.delete(currentQuestion.id);
    } else {
      newFlagged.add(currentQuestion.id);
    }
    setFlaggedQuestions(newFlagged);
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async ({ force = false } = {}) => {
    if (submittingRef.current && !force) return;
    submittingRef.current = true;

    let score = 0;
    const answerDetails = test.questions.map((q) => {
      const userAnswer = answers[q.id] || "";
      let isCorrect = false;

      if (q.type === "mcq" && q.correctAnswer) {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === "coding") {
        isCorrect = userAnswer.trim().length > 10;
      }

      if (isCorrect) score++;

      return {
        questionId: q.id,
        answer: userAnswer,
        isCorrect,
      };
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    setResult({ score, total: totalQuestions, percentage });

    try {
      await submitTestResult({
        testId: test.id,
        testTitle: test.title,
        userId: user?.id || "",
        score,
        totalQuestions,
        answers: answerDetails,
      });
    } catch {
    }

    if (proctoringSessionIdRef.current) {
      await endProctoringSession(proctoringSessionIdRef.current).catch(() => {});
      proctoringSessionIdRef.current = null;
    }
    stopProctoringStreams();
    document.exitFullscreen?.().catch(() => {});

    setShowSubmitDialog(false);
    setShowResultDialog(true);
  };

  if (!proctoringStarted && !showResultDialog) {
    return (
      <div className="app-shell flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full glass-panel border border-white/70">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Start monitored test</CardTitle>
                <p className="mt-2 text-sm text-slate-600">
                  {test.title} requires camera, microphone, screen sharing, tab focus, and fullscreen monitoring.
                </p>
              </div>
              <ShieldAlert className="h-10 w-10 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { key: "camera", icon: Camera, label: "Camera" },
                { key: "microphone", icon: Mic, label: "Mic" },
                { key: "screen", icon: MonitorUp, label: "Screen" },
                { key: "face", icon: Eye, label: "Face" },
              ].map(({ key, icon: Icon, label }) => (
                <div key={key} className={`rounded-lg border px-3 py-3 ${statusClass(proctorStatus[key])}`}>
                  <Icon className="h-4 w-4 mb-2" />
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs capitalize">{proctorStatus[key]}</p>
                </div>
              ))}
            </div>

            <video ref={videoRef} className="hidden" autoPlay muted playsInline />

            {proctoringError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {proctoringError}
              </div>
            )}

            <Button className="w-full sm:w-auto" onClick={startProctoring} disabled={isStartingProctoring}>
              {isStartingProctoring ? "Starting monitoring..." : "Start Test"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResultDialog && result) {
    return (
      <div className="app-shell flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-panel border border-white/70">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {result.percentage >= 70 ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : result.percentage >= 40 ? (
                <CheckCircle2 className="h-16 w-16 text-yellow-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">Test Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-700 mb-2">{result.percentage}%</p>
              <p className="text-slate-600">
                You scored {result.score} out of {result.total} questions
              </p>
            </div>
            <Progress value={result.percentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="text-2xl font-bold text-emerald-700">{result.score}</p>
                <p className="text-xs text-emerald-700">Correct</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
                <p className="text-2xl font-bold text-rose-700">{result.total - result.score}</p>
                <p className="text-xs text-rose-700">Incorrect</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-2xl font-bold text-blue-700">{result.total}</p>
                <p className="text-xs text-blue-700">Total</p>
              </div>
            </div>
            <Button className="w-full" onClick={onComplete}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="glass-panel border-b border-white/60 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{test.title}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Badge className="rounded-full" variant={test.type === "coding" ? "default" : "secondary"}>
                  {test.type === "coding" ? (
                    <Code className="h-3 w-3 mr-1" />
                  ) : (
                    <Brain className="h-3 w-3 mr-1" />
                  )}
                  {test.type === "coding" ? "Coding" : "Aptitude"}
                </Badge>
                <span>•</span>
                <span>{answeredCount}/{totalQuestions} answered</span>
                {flaggedCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Flag className="h-3.5 w-3.5 text-amber-600" />
                      <span>{flaggedCount} flagged</span>
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={progressValue} className="h-2 flex-1 max-w-md" />
                <span className="text-xs font-semibold tabular-nums text-slate-600 w-10 text-right">
                  {progressValue}%
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-white/70">
                  Risk {proctorStats.riskScore}/100
                </Badge>
                <Badge variant="outline" className="rounded-full bg-white/70">
                  Warnings {proctorStats.totalWarnings}
                </Badge>
                {[
                  ["camera", Camera],
                  ["microphone", Mic],
                  ["screen", MonitorUp],
                  ["face", Eye],
                ].map(([key, Icon]) => (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs capitalize ${statusClass(
                      proctorStatus[key]
                    )}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {key}: {proctorStatus[key]}
                  </span>
                ))}
              </div>
              {proctorNotice && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {proctorNotice}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${
                  isLowTime
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
                aria-label="Time remaining"
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
              <Button onClick={() => setShowSubmitDialog(true)}>Submit Test</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-24 glass-panel border border-white/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
                <video
                  ref={videoRef}
                  className="aspect-video w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              </div>
              <ScrollArea className="max-h-[min(420px,calc(100vh-18rem))] pr-2">
                <div className="grid grid-cols-5 gap-2">
                  {test.questions.map((q, idx) => {
                    const isActive = idx === currentQuestionIndex;
                    const isAnswered = Boolean(answers[q.id]);
                    const isQFlagged = flaggedQuestions.has(q.id);

                    const base =
                      "relative w-10 h-10 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2";
                    const state = isAnswered
                      ? "bg-emerald-500 text-white hover:brightness-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200";
                    const active = isActive ? "ring-2 ring-blue-500 shadow-sm" : "ring-1 ring-slate-200";
                    const flagged = isQFlagged ? "ring-2 ring-amber-400" : "";

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => goToQuestion(idx)}
                        aria-label={`Question ${idx + 1}${isAnswered ? ", answered" : ", not answered"}${
                          isQFlagged ? ", flagged" : ""
                        }`}
                        aria-current={isActive ? "page" : undefined}
                        className={`${base} ${state} ${active} ${flagged}`}
                      >
                        {idx + 1}
                        {isQFlagged && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 rounded-xl bg-white/70 border border-white/70 px-2 py-2">
                  <span className="h-3 w-3 rounded bg-emerald-500" aria-hidden="true" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/70 border border-white/70 px-2 py-2">
                  <span className="h-3 w-3 rounded bg-slate-200" aria-hidden="true" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/70 border border-white/70 px-2 py-2">
                  <span className="h-3 w-3 rounded bg-amber-400" aria-hidden="true" />
                  <span>Flagged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 glass-panel border border-white/70">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Question {currentQuestionIndex + 1} of {totalQuestions}</Badge>
                <Button
                  variant={isFlagged ? "default" : "outline"}
                  size="sm"
                  onClick={toggleFlag}
                >
                  <Flag className={`h-4 w-4 mr-1 ${isFlagged ? "fill-current" : ""}`} />
                  {isFlagged ? "Flagged" : "Flag"}
                </Button>
              </div>
              <CardTitle className="text-xl mt-4 leading-snug">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentQuestion.type === "mcq" ? (
                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {currentQuestion.options?.map((option, idx) => (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleAnswer(option)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleAnswer(option);
                        }
                      }}
                      className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer bg-white/70 ${
                        answers[currentQuestion.id] === option
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <Label>Write your code:</Label>
                  <Textarea
                    value={answers[currentQuestion.id] || ""}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="// Write your solution here..."
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    className="font-mono min-h-[320px] bg-white/70 border-slate-200"
                  />
                  {currentQuestion.testCases && (
                    <div className="mt-4">
                      <Label className="text-sm text-slate-600">Test Cases:</Label>
                      <div className="mt-2 space-y-2">
                        {currentQuestion.testCases.map((tc, idx) => (
                          <div key={idx} className="text-sm bg-white/70 border border-white/70 p-3 rounded-xl font-mono">
                            <span className="text-slate-500">Input:</span> {tc.input} →{" "}
                            <span className="text-slate-500">Output:</span> {tc.output}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-white/70">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button onClick={() => goToQuestion(currentQuestionIndex + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={() => setShowSubmitDialog(true)}>Submit Test</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent className="glass-panel border border-white/70">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="block">
                You have answered <span className="font-semibold text-slate-800">{answeredCount}</span> out of{" "}
                <span className="font-semibold text-slate-800">{totalQuestions}</span> questions.
              </span>
              <span className="block mt-2 text-xs text-slate-500">
                Time remaining: <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
              </span>
              {answeredCount < totalQuestions && (
                <span className="text-amber-700 block mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                  Warning: {totalQuestions - answeredCount} questions are still unanswered!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
