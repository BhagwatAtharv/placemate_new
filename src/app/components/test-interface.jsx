<<<<<<< HEAD
import React, { useMemo, useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
=======
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { ScrollArea } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
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
<<<<<<< HEAD
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, Code, Brain } from "lucide-react";
=======
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Bookmark, CheckCircle2, Clock, Wifi, WifiOff, XCircle } from "lucide-react";

function formatMinutesSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.max(0, totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function sectionLabelForKey(key) {
  return key === "coding" ? "Coding" : "Aptitude";
}

function normalizeSectionKey(questionType) {
  return questionType === "coding" ? "coding" : "mcq";
}

function pillClassForQuestion({ isCurrent, isAnswered, isVisited }) {
  if (isCurrent) return "bg-blue-600 text-white shadow-sm";
  if (isAnswered) return "bg-emerald-600 text-white";
  if (isVisited) return "bg-amber-500 text-white";
  return "bg-slate-100 text-slate-700 hover:bg-slate-200";
}
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a

export function TestInterface({ testId, onComplete }) {
  const { user, tests, submitTestResult } = useApp();
  const test = tests.find((t) => t.id === testId);

<<<<<<< HEAD
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState((test?.duration || 60) * 60);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [result, setResult] = useState(null);

  const totalQuestions = test?.questions?.length || 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const flaggedCount = flaggedQuestions.size;
  const progressValue = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isLowTime = timeLeft < 5 * 60;

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);
=======
  const questions = test?.questions || [];
  const totalQuestions = questions.length;

  const [timeLeft, setTimeLeft] = useState(() => (test?.duration || 60) * 60);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  const [activeSection, setActiveSection] = useState(() => normalizeSectionKey(questions[0]?.type || "mcq"));
  const [activeQuestionId, setActiveQuestionId] = useState(() => questions[0]?.id || "");
  const [answers, setAnswers] = useState({});
  const [visited, setVisited] = useState(() => new Set(questions[0]?.id ? [questions[0].id] : []));
  const [bookmarked, setBookmarked] = useState(() => new Set());
  const [saved, setSaved] = useState(() => new Set());
  const [language, setLanguage] = useState("javascript");

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [result, setResult] = useState(null);

  const autosaveTimeoutRef = useRef(null);

  const sections = useMemo(() => {
    const typeKeys = questions.map((q) => normalizeSectionKey(q.type || "mcq"));
    const unique = Array.from(new Set(typeKeys));
    unique.sort((a, b) => (a === "mcq" ? -1 : 1));

    return unique.map((key) => ({
      key,
      label: sectionLabelForKey(key),
      count: questions.filter((q) => normalizeSectionKey(q.type || "mcq") === key).length,
    }));
  }, [questions]);

  useEffect(() => {
    if (!sections.some((s) => s.key === activeSection)) {
      setActiveSection(sections[0]?.key || "mcq");
    }
  }, [sections, activeSection]);

  const sectionQuestions = useMemo(() => {
    return questions.filter((q) => normalizeSectionKey(q.type || "mcq") === activeSection);
  }, [questions, activeSection]);

  const activeQuestionIndexInSection = useMemo(() => {
    const idx = sectionQuestions.findIndex((q) => q.id === activeQuestionId);
    return idx >= 0 ? idx : 0;
  }, [sectionQuestions, activeQuestionId]);

  const currentQuestion = sectionQuestions[activeQuestionIndexInSection];

  useEffect(() => {
    if (!test) return;
    if (!activeQuestionId) {
      setActiveQuestionId(test.questions?.[0]?.id || "");
      return;
    }

    const existsInSection = sectionQuestions.some((q) => q.id === activeQuestionId);
    if (!existsInSection) {
      const firstId = sectionQuestions[0]?.id || "";
      if (firstId) {
        setActiveQuestionId(firstId);
        setVisited((prev) => new Set(prev).add(firstId));
      }
    }
  }, [test, activeQuestionId, sectionQuestions]);

  // Online/offline status
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!test) return;
    if (timeLeft <= 0) {
      setShowSubmitDialog(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, test]);

  // Faux autosave counter for UI parity (no backend endpoint for per-answer saves yet)
  useEffect(() => {
    if (!currentQuestion?.id) return;
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(() => {
      const value = answers[currentQuestion.id];
      if (value == null || String(value).trim() === "") return;
      setSaved((prev) => new Set(prev).add(currentQuestion.id));
    }, 450);

    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, [answers, currentQuestion?.id]);

  const answeredCount = useMemo(
    () => Object.keys(answers).filter((k) => String(answers[k]).trim() !== "").length,
    [answers],
  );

  const bookmarkedCount = bookmarked.size;
  const skippedCount = useMemo(() => {
    let count = 0;
    for (const q of questions) {
      const isVisited = visited.has(q.id);
      if (!isVisited) continue;
      const ans = answers[q.id];
      const isAnswered = ans != null && String(ans).trim() !== "";
      if (!isAnswered) count++;
    }
    return count;
  }, [questions, visited, answers]);

  const notViewedCount = Math.max(0, totalQuestions - visited.size);
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Test not found</p>
      </div>
    );
  }

<<<<<<< HEAD
  const currentQuestion = test.questions[currentQuestionIndex];
  const isFlagged = flaggedQuestions.has(currentQuestion.id);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
=======
  if (result) {
    const Icon = result.percentage >= 70 ? CheckCircle2 : result.percentage >= 40 ? CheckCircle2 : XCircle;
    const iconColor =
      result.percentage >= 70 ? "text-emerald-600" : result.percentage >= 40 ? "text-amber-500" : "text-rose-600";

    return (
      <div className="app-shell flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-panel border border-white/70">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Icon className={`h-16 w-16 ${iconColor}`} />
            </div>
            <CardTitle className="text-2xl">Test Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl bg-white/70 border border-white/70 p-4 text-center">
              <p className="text-sm text-slate-500">Your Score</p>
              <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                {result.score}/{result.total}
              </p>
              <p className="mt-1 text-sm font-semibold text-blue-700">{result.percentage}%</p>
            </div>
            <Button className="w-full" onClick={onComplete}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rollNumber = user?.id ? String(user.id).slice(-8) : "—";

  const activeSectionIndex = Math.max(0, sections.findIndex((s) => s.key === activeSection));
  const sectionTitle = sections[activeSectionIndex]
    ? `Section ${activeSectionIndex + 1}/${sections.length} | ${sections[activeSectionIndex].label} (${sections[activeSectionIndex].count})`
    : "Section 1/1 | Aptitude (0)";

  const setCurrentQuestion = (questionId) => {
    if (!questionId) return;
    setActiveQuestionId(questionId);
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  };

  const toggleBookmark = () => {
    if (!currentQuestion?.id) return;
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const handleAnswer = (value) => {
    if (!currentQuestion?.id) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const clearAnswer = () => {
    if (!currentQuestion?.id) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
    setSaved((prev) => {
      const next = new Set(prev);
      next.delete(currentQuestion.id);
      return next;
    });
  };

  const goNext = () => {
    const next = sectionQuestions[activeQuestionIndexInSection + 1];
    if (next) setCurrentQuestion(next.id);
    else setShowSubmitDialog(true);
  };

  const goPrev = () => {
    const prev = sectionQuestions[activeQuestionIndexInSection - 1];
    if (prev) setCurrentQuestion(prev.id);
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
  };

  const handleSubmit = async () => {
    let score = 0;
<<<<<<< HEAD
    const answerDetails = test.questions.map((q) => {
=======
    const answerDetails = questions.map((q) => {
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
      const userAnswer = answers[q.id] || "";
      let isCorrect = false;

      if (q.type === "mcq" && q.correctAnswer) {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === "coding") {
<<<<<<< HEAD
        isCorrect = userAnswer.trim().length > 10;
=======
        isCorrect = String(userAnswer).trim().length > 10;
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
      }

      if (isCorrect) score++;

      return {
        questionId: q.id,
        answer: userAnswer,
        isCorrect,
      };
    });

<<<<<<< HEAD
    const percentage = Math.round((score / totalQuestions) * 100);
    setResult({ score, total: totalQuestions, percentage });
=======
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a

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
<<<<<<< HEAD
    }

    setShowSubmitDialog(false);
    setShowResultDialog(true);
  };

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
=======
      // best-effort submit
    }

    setShowSubmitDialog(false);
    setResult({ score, total: totalQuestions, percentage });
  };

  const isCurrentBookmarked = currentQuestion?.id ? bookmarked.has(currentQuestion.id) : false;
  const currentAnswer = currentQuestion?.id ? answers[currentQuestion.id] || "" : "";
  const isLastInSection = activeQuestionIndexInSection >= sectionQuestions.length - 1;
  const isFirstInSection = activeQuestionIndexInSection <= 0;
  const isLowTime = timeLeft < 5 * 60;

  return (
    <div className="app-shell flex flex-col min-h-screen">
      <div className={`h-10 flex items-center justify-center text-sm ${isOnline ? "bg-emerald-200" : "bg-rose-200"}`}>
        <span className="flex items-center gap-2 text-slate-800">
          {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          Internet Status: <span className="font-semibold">{isOnline ? "Online" : "Offline"}</span>
        </span>
      </div>

      <header className="glass-panel border-b border-white/60 sticky top-0 z-20">
        <div className="px-3 md:px-6 py-3 flex items-center gap-3">
          <div className="min-w-0 flex items-center gap-3 flex-1">
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{test.title}</p>
                <p className="text-xs text-slate-500 truncate">{test.company || "Assessment"}</p>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Select value={activeSection} onValueChange={setActiveSection}>
                <SelectTrigger className="h-10 bg-white/80 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((s, idx) => (
                    <SelectItem key={s.key} value={s.key}>
                      {`Section ${idx + 1}/${sections.length} | ${s.label} (${s.count})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-700 shrink-0">
              <span className="text-slate-500">Name :</span>
              <span className="font-semibold">{user?.name || "Candidate"}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">Roll Number :</span>
              <span className="font-semibold">{rollNumber}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-2 px-3 h-10 rounded-xl border ${
                isLowTime ? "bg-rose-50 border-rose-200" : "bg-white/80 border-slate-200"
              }`}
            >
              <Clock className={`h-4 w-4 ${isLowTime ? "text-rose-600" : "text-slate-600"}`} />
              <span className={`font-mono text-sm ${isLowTime ? "text-rose-700" : "text-slate-700"}`}>
                {formatMinutesSeconds(timeLeft)}
              </span>
            </div>

            <Button className="h-10 rounded-xl" onClick={() => setShowSubmitDialog(true)}>
              Submit Test
            </Button>
          </div>
        </div>

        <div className="px-3 md:px-6 pb-3">
          <p className="text-xs text-slate-500">{sectionTitle}</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        <aside className="w-[84px] sm:w-[96px] border-r border-white/60 bg-white/60 backdrop-blur-xl">
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {sectionQuestions.map((q, idx) => {
                  const isCurrent = q.id === currentQuestion?.id;
                  const isVisited = visited.has(q.id);
                  const ans = answers[q.id];
                  const isAnswered = ans != null && String(ans).trim() !== "";
                  const isMarked = bookmarked.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(q.id)}
                      className={`relative w-full h-10 rounded-xl text-sm font-semibold transition ${pillClassForQuestion({
                        isCurrent,
                        isAnswered,
                        isVisited,
                      })}`}
                      title={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                      {isMarked && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-600 ring-2 ring-white/80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-2 border-t border-white/60 text-xs text-slate-600 space-y-2">
              <div className="rounded-xl bg-white/70 border border-white/70 p-2">
                <p className="text-[11px] text-slate-500">Answered</p>
                <p className="font-semibold text-emerald-700">
                  {answeredCount}/{totalQuestions}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 border border-white/70 p-2">
                <p className="text-[11px] text-slate-500">Bookmarked</p>
                <p className="font-semibold text-blue-700">
                  {bookmarkedCount}/{totalQuestions}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 border border-white/70 p-2">
                <p className="text-[11px] text-slate-500">Skipped</p>
                <p className="font-semibold text-amber-700">
                  {skippedCount}/{totalQuestions}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 border border-white/70 p-2">
                <p className="text-[11px] text-slate-500">Not Viewed</p>
                <p className="font-semibold text-slate-700">
                  {notViewedCount}/{totalQuestions}
                </p>
              </div>
              <div className="rounded-xl bg-white/70 border border-white/70 p-2">
                <p className="text-[11px] text-slate-500">Saved in Server</p>
                <p className="font-semibold text-slate-700">
                  {saved.size}/{totalQuestions}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={48} minSize={30}>
              <div className="h-full min-h-0 flex flex-col">
                <div className="h-12 px-4 border-b border-white/60 bg-white/40 flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">Question No : </span>
                    <span className="font-semibold">{activeQuestionIndexInSection + 1}</span>
                    <span className="text-slate-500">{` / ${sectionQuestions.length}`}</span>
                  </div>
                  <Button
                    variant="outline"
                    className={`h-9 rounded-xl bg-white/80 border-slate-200 px-3 ${
                      isCurrentBookmarked ? "text-blue-700" : "text-slate-700"
                    }`}
                    onClick={toggleBookmark}
                    title={isCurrentBookmarked ? "Remove bookmark" : "Bookmark this question"}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    <span className="text-sm font-semibold">{isCurrentBookmarked ? "Bookmarked" : "Bookmark"}</span>
                  </Button>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-5">
                    <div className="rounded-2xl bg-white/75 border border-white/70 p-5 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.35)]">
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                        {currentQuestion?.type === "coding" ? "Coding Question" : "Multi Choice Type Question"}
                      </h2>
                      <p className="mt-3 text-slate-700 whitespace-pre-wrap">{currentQuestion?.text || ""}</p>
                    </div>
                  </div>
                </ScrollArea>

                <div className="h-14 px-5 border-t border-white/60 bg-white/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <span>Marks : 1</span>
                    <span className="text-slate-300">|</span>
                    <span>Negative Marks : 0</span>
                    {saved.has(currentQuestion?.id) && (
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        Saved
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={goPrev} disabled={isFirstInSection}>
                      Previous
                    </Button>
                    <Button className="rounded-xl" onClick={goNext}>
                      {isLastInSection ? "Submit" : "Next"}
                    </Button>
                  </div>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={52} minSize={30}>
              <div className="h-full min-h-0 flex flex-col">
                <div className="h-12 px-4 border-b border-white/60 bg-white/40 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Answer here</p>
                  {currentQuestion?.type === "coding" && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-slate-500">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="h-9 w-[160px] rounded-xl bg-white/80 border-slate-200">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-5">
                    {currentQuestion?.type !== "coding" ? (
                      <RadioGroup value={String(currentAnswer || "")} onValueChange={handleAnswer} className="space-y-3">
                        {(currentQuestion?.options || []).map((option, idx) => {
                          const selected = String(currentAnswer) === String(option);
                          return (
                            <div
                              key={`${currentQuestion.id}-opt-${idx}`}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleAnswer(option)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleAnswer(option);
                                }
                              }}
                              className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition cursor-pointer bg-white/70 ${
                                selected
                                  ? "border-blue-500 ring-2 ring-blue-500/20"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <RadioGroupItem value={String(option)} id={`${currentQuestion.id}-r-${idx}`} />
                              <Label
                                htmlFor={`${currentQuestion.id}-r-${idx}`}
                                className="flex-1 cursor-pointer text-slate-800"
                              >
                                {String(option)}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          value={String(currentAnswer || "")}
                          onChange={(e) => handleAnswer(e.target.value)}
                          placeholder={`// ${language} solution...`}
                          spellCheck={false}
                          autoCapitalize="off"
                          autoCorrect="off"
                          className="font-mono min-h-[420px] bg-white/70 border-slate-200 rounded-2xl"
                        />

                        {currentQuestion?.testCases?.length ? (
                          <div className="rounded-2xl bg-white/70 border border-white/70 p-4">
                            <p className="text-sm font-semibold text-slate-800">Test Cases</p>
                            <div className="mt-3 space-y-2">
                              {currentQuestion.testCases.map((tc, idx) => (
                                <div
                                  key={idx}
                                  className="text-sm bg-white/80 border border-slate-200 p-3 rounded-xl font-mono"
                                >
                                  <span className="text-slate-500">Input:</span> {tc.input} →{" "}
                                  <span className="text-slate-500">Output:</span> {tc.output}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="h-14 px-5 border-t border-white/60 bg-white/40 flex items-center justify-between">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={clearAnswer}
                    disabled={!String(currentAnswer).trim()}
                  >
                    Clear
                  </Button>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="hidden sm:inline">Autosave:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {saved.has(currentQuestion?.id) ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
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
<<<<<<< HEAD
                Time remaining: <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
=======
                Time remaining: <span className="font-mono font-semibold">{formatMinutesSeconds(timeLeft)}</span>
>>>>>>> af17aa1382c0eb6822643264a6bab73b6ebfa76a
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
