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
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, Code, Brain } from "lucide-react";

export function TestInterface({ testId, onComplete }) {
  const { user, tests, submitTestResult } = useApp();
  const test = tests.find((t) => t.id === testId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState((test?.duration || 60) * 60); // Convert to seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [result, setResult] = useState(null);

  const totalQuestions = test?.questions?.length || 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const flaggedCount = flaggedQuestions.size;
  const progressValue = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const isLowTime = timeLeft < 5 * 60;

  // Timer
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

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Test not found</p>
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

  const handleSubmit = async () => {
    // Calculate score
    let score = 0;
    const answerDetails = test.questions.map((q) => {
      const userAnswer = answers[q.id] || "";
      let isCorrect = false;
      
      if (q.type === "mcq" && q.correctAnswer) {
        isCorrect = userAnswer === q.correctAnswer;
      } else if (q.type === "coding") {
        // For coding, we'll do a simple check (in real app, you'd run test cases)
        isCorrect = userAnswer.trim().length > 10; // Basic check that something was written
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

    // Submit result
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
      {/* Header */}
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
          {/* Question Navigator */}
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

          {/* Question Content */}
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
                      className={`flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer bg-white/70
                        ${
                          answers[currentQuestion.id] === option
                            ? "border-blue-500 ring-2 ring-blue-500/20"
                            : "border-slate-200 hover:bg-slate-50"
                        }
                      `}
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

              {/* Navigation */}
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

      {/* Submit Confirmation Dialog */}
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
