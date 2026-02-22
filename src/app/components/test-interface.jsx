import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
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
  const totalQuestions = test.questions.length;
  const answeredCount = Object.keys(answers).length;

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
        <Card className="max-w-md w-full glass-panel">
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
            <CardTitle className="text-2xl">Test Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-600 mb-2">{result.percentage}%</p>
              <p className="text-gray-600">
                You scored {result.score} out of {result.total} questions
              </p>
            </div>
            <Progress value={result.percentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{result.score}</p>
                <p className="text-xs text-green-700">Correct</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{result.total - result.score}</p>
                <p className="text-xs text-red-700">Incorrect</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{result.total}</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">{test.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant={test.type === "coding" ? "default" : "secondary"}>
                  {test.type === "coding" ? <Code className="h-3 w-3 mr-1" /> : <Brain className="h-3 w-3 mr-1" />}
                  {test.type}
                </Badge>
                <span>•</span>
                <span>{answeredCount}/{totalQuestions} answered</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
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
          <Card className="lg:col-span-1 h-fit sticky top-24 glass-panel">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Question Navigator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {test.questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={`
                      w-10 h-10 rounded-lg text-sm font-medium transition-colors
                      ${idx === currentQuestionIndex ? "ring-2 ring-blue-500" : ""}
                      ${answers[q.id] ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"}
                      ${flaggedQuestions.has(q.id) ? "ring-2 ring-yellow-500" : ""}
                    `}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded ring-2 ring-yellow-500"></div>
                  <span>Flagged</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Content */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="outline">Question {currentQuestionIndex + 1} of {totalQuestions}</Badge>
                <Button
                  variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "outline"}
                  size="sm"
                  onClick={toggleFlag}
                >
                  <Flag className={`h-4 w-4 mr-1 ${flaggedQuestions.has(currentQuestion.id) ? "fill-current" : ""}`} />
                  {flaggedQuestions.has(currentQuestion.id) ? "Flagged" : "Flag"}
                </Button>
              </div>
              <CardTitle className="text-xl mt-4">{currentQuestion.text}</CardTitle>
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
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer
                        ${answers[currentQuestion.id] === option ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}
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
                    className="font-mono min-h-[300px]"
                  />
                  {currentQuestion.testCases && (
                    <div className="mt-4">
                      <Label className="text-sm text-gray-600">Test Cases:</Label>
                      <div className="mt-2 space-y-2">
                        {currentQuestion.testCases.map((tc, idx) => (
                          <div key={idx} className="text-sm bg-gray-50 p-2 rounded font-mono">
                            <span className="text-gray-500">Input:</span> {tc.input} →{" "}
                            <span className="text-gray-500">Output:</span> {tc.output}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {answeredCount < totalQuestions && (
                <span className="text-yellow-600 block mt-2">
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
