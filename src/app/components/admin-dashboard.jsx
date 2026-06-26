import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  BookOpen,
  Calendar,
  Activity,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trophy,
  Trash2,
  Users,
  X,
} from "lucide-react";

function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}

function scorePercent(result) {
  if (!result?.totalQuestions) return 0;
  return Math.round((result.score / result.totalQuestions) * 100);
}

function scoreTone(percent) {
  if (percent >= 80) return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
  if (percent >= 60) return "border-blue-200/80 bg-blue-50 text-blue-700";
  if (percent >= 40) return "border-amber-200/80 bg-amber-50 text-amber-700";
  return "border-rose-200/80 bg-rose-50 text-rose-700";
}

function riskTone(score) {
  if (score >= 70) return "border-rose-200/80 bg-rose-50 text-rose-700";
  if (score >= 35) return "border-amber-200/80 bg-amber-50 text-amber-700";
  return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
}

function statusTone(status) {
  if (status === "ACTIVE") return "border-blue-200/80 bg-blue-50 text-blue-700";
  if (status === "ENDED") return "border-slate-200/80 bg-slate-50 text-slate-700";
  return "border-slate-200/80 bg-white text-slate-500";
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}

export function AdminDashboard() {
  const {
    user,
    logout,
    tests,
    addTest,
    deleteTest,
    studyMaterials,
    addStudyMaterial,
    deleteStudyMaterial,
    contests,
    addContest,
    allTestResults,
    allUsers,
    proctoringReports,
    refreshProctoringReports,
  } = useApp();

  const [activeView, setActiveView] = useState("tests");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [isContestDialogOpen, setIsContestDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isRefreshingProctoring, setIsRefreshingProctoring] = useState(false);

  const [testForm, setTestForm] = useState({
    title: "",
    description: "",
    type: "aptitude",
    duration: 60,
    company: "",
  });
  const [questions, setQuestions] = useState([]);

  const [materialForm, setMaterialForm] = useState({
    title: "",
    company: "",
    type: "pdf",
    url: "",
    description: "",
  });

  const [contestForm, setContestForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    selectedTests: [],
  });

  const students = useMemo(
    () => allUsers.filter((entry) => entry.role === "student"),
    [allUsers],
  );

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredTests = normalizedSearch
    ? tests.filter((test) =>
        [test.title, test.description, test.company, test.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : tests;

  const filteredMaterials = normalizedSearch
    ? studyMaterials.filter((material) =>
        [material.title, material.company, material.type, material.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : studyMaterials;

  const filteredContests = normalizedSearch
    ? contests.filter((contest) =>
        [contest.title, contest.description, contest.startDate, contest.endDate]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : contests;

  const filteredResultTests = normalizedSearch
    ? tests.filter((test) =>
        [test.title, test.description, test.company, test.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : tests;

  const filteredProctoringReports = normalizedSearch
    ? proctoringReports.filter((report) =>
        [
          report.name,
          report.email,
          report.assessmentTitle,
          report.status,
          report.recommendation?.label,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch),
      )
    : proctoringReports;

  const activeProctoringCount = proctoringReports.filter((report) => report.status === "ACTIVE").length;
  const highRiskProctoringCount = proctoringReports.filter((report) => Number(report.riskScore || 0) >= 70).length;

  const handleRefreshProctoring = async () => {
    setIsRefreshingProctoring(true);
    try {
      await refreshProctoringReports?.();
    } finally {
      setIsRefreshingProctoring(false);
    }
  };

  const searchPlaceholder =
    activeView === "materials"
      ? "Search materials..."
      : activeView === "contests"
      ? "Search contests..."
      : activeView === "results"
      ? "Search test results..."
      : activeView === "proctoring"
      ? "Search proctoring..."
      : "Search tests...";

  const navItems = [
    { id: "tests", label: "Manage Tests", icon: LayoutDashboard },
    { id: "materials", label: "Study Materials", icon: BookOpen },
    { id: "contests", label: "Contests", icon: Trophy },
    { id: "results", label: "Student Results", icon: FileText },
    { id: "proctoring", label: "Proctoring", icon: ShieldAlert },
  ];

  const addQuestion = () => {
    setQuestions((current) => [
      ...current,
      {
        id: Date.now().toString(),
        text: "",
        type: "mcq",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    setQuestions((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeQuestion = (index) => {
    setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleCreateTest = async () => {
    if (!testForm.title.trim() || questions.length === 0) return;
    await addTest({ ...testForm, questions });
    setTestForm({
      title: "",
      description: "",
      type: "aptitude",
      duration: 60,
      company: "",
    });
    setQuestions([]);
    setIsTestDialogOpen(false);
  };

  const handleCreateMaterial = async () => {
    if (!materialForm.title.trim() || !materialForm.company.trim()) return;
    await addStudyMaterial(materialForm);
    setMaterialForm({
      title: "",
      company: "",
      type: "pdf",
      url: "",
      description: "",
    });
    setIsMaterialDialogOpen(false);
  };

  const handleCreateContest = async () => {
    if (!contestForm.title.trim() || !contestForm.startDate || !contestForm.endDate) return;
    await addContest({
      title: contestForm.title,
      description: contestForm.description,
      startDate: contestForm.startDate,
      endDate: contestForm.endDate,
      tests: contestForm.selectedTests,
    });
    setContestForm({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      selectedTests: [],
    });
    setIsContestDialogOpen(false);
  };

  const toggleContestTest = (testId) => {
    setContestForm((current) => ({
      ...current,
      selectedTests: current.selectedTests.includes(testId)
        ? current.selectedTests.filter((id) => id !== testId)
        : [...current.selectedTests, testId],
    }));
  };

  const selectedStudentResults = selectedStudent
    ? allTestResults
        .filter((result) => result.userId === selectedStudent.id)
        .slice()
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    : [];

  return (
    <div className="app-shell flex">
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)] transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Admin Dashboard</p>
              <p className="text-xs text-slate-500">Control Center</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-8 hidden items-center gap-3 lg:flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">Admin Dashboard</p>
            <p className="text-xs text-slate-500">Control Center</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-left transition ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_14px_26px_-16px_rgba(45,68,195,0.95)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } flex items-center gap-3`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSidebarOpen(false);
              logout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className={`min-w-0 flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : ""}`}>
        <header className="glass-panel sticky top-0 z-20 border-b border-white/60">
          <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex items-start gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSidebarOpen((open) => !open)}
                className="shrink-0"
                aria-label={isSidebarOpen ? "Hide side panel" : "Open side panel"}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="section-title">{user?.name}</h1>
                <p className="section-subtitle">Welcome, build tests and manage placement prep.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 w-80 rounded-2xl border border-slate-300/70 bg-white/90 pl-10 pr-4 text-sm text-slate-700 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.8)]"
                />
              </div>
              <div className="lg:hidden">
                <Button variant="outline" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-4 pb-3 md:px-8 lg:hidden">
            <div className="flex min-w-max items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    activeView === item.id
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {item.label.replace("Manage ", "")}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="px-4 py-8 md:px-8">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card className="metric-card border-0 hover-rise">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3">
                    <LayoutDashboard className="h-6 w-6 text-blue-100" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Total Tests</p>
                    <p className="text-3xl font-bold text-white">{tests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card border-0 hover-rise">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3">
                    <BookOpen className="h-6 w-6 text-blue-100" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Study Materials</p>
                    <p className="text-3xl font-bold text-white">{studyMaterials.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card border-0 hover-rise">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3">
                    <Trophy className="h-6 w-6 text-blue-100" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">Contests</p>
                    <p className="text-3xl font-bold text-white">{contests.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="metric-card border-0 hover-rise">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3">
                    <ShieldAlert className="h-6 w-6 text-blue-100" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-100">High Risk</p>
                    <p className="text-3xl font-bold text-white">{highRiskProctoringCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeView} className="space-y-6">
            <TabsContent value="tests" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Manage Tests</h2>
                  <p className="text-sm text-slate-600">Create, review, and remove placement tests.</p>
                </div>
                <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Test
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Create Test</DialogTitle>
                      <DialogDescription>Build a new aptitude or coding assessment.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={testForm.title}
                            onChange={(event) => setTestForm((current) => ({ ...current, title: event.target.value }))}
                            placeholder="Test title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input
                            value={testForm.company}
                            onChange={(event) => setTestForm((current) => ({ ...current, company: event.target.value }))}
                            placeholder="Company name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={testForm.description}
                          onChange={(event) =>
                            setTestForm((current) => ({ ...current, description: event.target.value }))
                          }
                          placeholder="What does this test cover?"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={testForm.type}
                            onValueChange={(value) => setTestForm((current) => ({ ...current, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose test type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="aptitude">Aptitude</SelectItem>
                              <SelectItem value="technical">Technical</SelectItem>
                              <SelectItem value="coding">Coding</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Duration (minutes)</Label>
                          <Input
                            type="number"
                            value={testForm.duration}
                            onChange={(event) =>
                              setTestForm((current) => ({
                                ...current,
                                duration: Number(event.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Questions</Label>
                            <p className="text-xs text-slate-500">Add at least one question before saving.</p>
                          </div>
                          <Button type="button" variant="outline" onClick={addQuestion}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {questions.map((question, index) => (
                            <Card key={question.id} className="border border-slate-200/80">
                              <CardContent className="space-y-4 p-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-slate-900">Question {index + 1}</p>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-600"
                                    onClick={() => removeQuestion(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  <Label>Question Text</Label>
                                  <Textarea
                                    value={question.text}
                                    onChange={(event) => updateQuestion(index, "text", event.target.value)}
                                    placeholder="Enter the question"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Question Type</Label>
                                  <Select
                                    value={question.type}
                                    onValueChange={(value) => updateQuestion(index, "type", value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose question type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                                      <SelectItem value="coding">Coding</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {question.type === "mcq" ? (
                                  <div className="space-y-3">
                                    <Label>Options</Label>
                                    {question.options?.map((option, optionIndex) => (
                                      <Input
                                        key={`${question.id}-${optionIndex}`}
                                        value={option}
                                        onChange={(event) => {
                                          const nextOptions = [...(question.options || [])];
                                          nextOptions[optionIndex] = event.target.value;
                                          updateQuestion(index, "options", nextOptions);
                                        }}
                                        placeholder={`Option ${optionIndex + 1}`}
                                      />
                                    ))}
                                    <Input
                                      value={question.correctAnswer}
                                      onChange={(event) => updateQuestion(index, "correctAnswer", event.target.value)}
                                      placeholder="Correct Answer"
                                      className="border-green-300"
                                    />
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <Label>Expected Answer</Label>
                                    <Textarea
                                      value={question.correctAnswer}
                                      onChange={(event) => updateQuestion(index, "correctAnswer", event.target.value)}
                                      placeholder="Reference solution or expected output"
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <Button onClick={handleCreateTest} className="w-full">
                        Create Test
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredTests.length === 0 ? (
                <EmptyState title="No tests found" description="Create a test or change your search keyword." />
              ) : (
                <Card className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTests.map((test) => (
                        <TableRow key={test.id}>
                          <TableCell className="font-medium">{test.title}</TableCell>
                          <TableCell>{test.company || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={test.type === "coding" ? "default" : test.type === "aptitude" ? "secondary" : "outline"}>
                              {test.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{test.duration} min</TableCell>
                          <TableCell>{test.questions?.length ?? 0}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600"
                              onClick={async () => {
                                try {
                                  await deleteTest(test.id);
                                } catch {}
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Study Materials</h2>
                  <p className="text-sm text-slate-600">Curate practice PDFs, videos, and articles.</p>
                </div>
                <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Study Material</DialogTitle>
                      <DialogDescription>Upload a learning resource for students.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={materialForm.title}
                          onChange={(event) =>
                            setMaterialForm((current) => ({ ...current, title: event.target.value }))
                          }
                          placeholder="Material title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={materialForm.company}
                          onChange={(event) =>
                            setMaterialForm((current) => ({ ...current, company: event.target.value }))
                          }
                          placeholder="Company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={materialForm.type}
                          onValueChange={(value) => setMaterialForm((current) => ({ ...current, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose material type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={materialForm.url}
                          onChange={(event) =>
                            setMaterialForm((current) => ({ ...current, url: event.target.value }))
                          }
                          placeholder="Resource URL"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={materialForm.description}
                          onChange={(event) =>
                            setMaterialForm((current) => ({ ...current, description: event.target.value }))
                          }
                          placeholder="Description"
                        />
                      </div>
                      <Button onClick={handleCreateMaterial} className="w-full">
                        Add Material
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredMaterials.length === 0 ? (
                <EmptyState title="No study materials found" description="Add a resource or adjust your search." />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMaterials.map((material) => (
                    <Card key={material.id} className="hover-rise">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-3">
                          <Badge>{material.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600"
                            onClick={() => deleteStudyMaterial(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        <CardDescription>{material.company}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600">{material.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contests" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Contests</h2>
                  <p className="text-sm text-slate-600">Launch events that bundle tests into practice challenges.</p>
                </div>
                <Dialog open={isContestDialogOpen} onOpenChange={setIsContestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create Contest
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Contest</DialogTitle>
                      <DialogDescription>Set dates and choose which tests are included.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={contestForm.title}
                          onChange={(event) => setContestForm((current) => ({ ...current, title: event.target.value }))}
                          placeholder="Contest title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={contestForm.description}
                          onChange={(event) =>
                            setContestForm((current) => ({ ...current, description: event.target.value }))
                          }
                          placeholder="Contest description"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={contestForm.startDate}
                            onChange={(event) =>
                              setContestForm((current) => ({ ...current, startDate: event.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={contestForm.endDate}
                            onChange={(event) =>
                              setContestForm((current) => ({ ...current, endDate: event.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Included Tests</Label>
                        <ScrollArea className="h-52 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                          <div className="space-y-3">
                            {tests.length === 0 ? (
                              <p className="text-sm text-slate-500">Create tests first to attach them to a contest.</p>
                            ) : (
                              tests.map((test) => (
                                <label key={test.id} className="flex items-start gap-3 rounded-xl bg-white p-3">
                                  <input
                                    type="checkbox"
                                    checked={contestForm.selectedTests.includes(test.id)}
                                    onChange={() => toggleContestTest(test.id)}
                                    className="mt-1 h-4 w-4 rounded border-slate-300"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900">{test.title}</p>
                                    <p className="text-xs text-slate-500">
                                      {test.company || "General"} {test.duration ? `• ${test.duration} min` : ""}
                                    </p>
                                  </div>
                                </label>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </div>

                      <Button onClick={handleCreateContest} className="w-full">
                        Create Contest
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {filteredContests.length === 0 ? (
                <EmptyState title="No contests found" description="Create a contest or adjust your search." />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredContests.map((contest) => (
                    <Card key={contest.id} className="hover-rise">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <CardTitle>{contest.title}</CardTitle>
                        </div>
                        <CardDescription>{contest.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(contest.startDate).toLocaleDateString()} - {new Date(contest.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {contest.participants?.length ?? 0} participants
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Student Results</h2>
                <p className="text-sm text-slate-600">
                  Test-wise attempts and scores. Click any student to open their profile.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="secondary">{students.length} students</Badge>
                  <Badge variant="secondary">{tests.length} tests</Badge>
                  <Badge variant="outline">{allTestResults.length} total attempts</Badge>
                </div>
              </div>

              <Card className="glass-panel border border-white/60">
                <CardHeader>
                  <CardTitle>Test-wise Performance</CardTitle>
                  <CardDescription>
                    Expand a test to see who attempted it, who is pending, and individual scores.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredResultTests.length === 0 ? (
                    <EmptyState title="No tests match your search" description="Try a different keyword." />
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {filteredResultTests.map((test) => {
                        const attempts = allTestResults
                          .filter((result) => result.testId === test.id)
                          .slice()
                          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
                        const attemptedStudentIds = new Set(attempts.map((result) => result.userId));
                        const pendingStudents = students
                          .filter((student) => !attemptedStudentIds.has(student.id))
                          .slice()
                          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                        const averagePercent =
                          attempts.length > 0
                            ? Math.round(
                                attempts.reduce((total, result) => total + scorePercent(result), 0) / attempts.length,
                              )
                            : 0;

                        return (
                          <AccordionItem key={test.id} value={String(test.id)} className="border-slate-200/70">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex w-full items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-950">{test.title}</p>
                                  <p className="truncate text-xs text-slate-600 md:max-w-[44rem]">
                                    {test.description || "No description provided."}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 pt-2">
                                    {test.company ? <Badge variant="secondary">{test.company}</Badge> : null}
                                    {test.type ? <Badge variant="outline">{test.type}</Badge> : null}
                                    {test.duration ? <Badge variant="outline">{test.duration} min</Badge> : null}
                                  </div>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-2">
                                  <div className="flex flex-wrap items-center justify-end gap-2">
                                    <Badge variant="outline" className="border-slate-200 bg-white/70 text-slate-700">
                                      {attempts.length} attempted
                                    </Badge>
                                    <Badge variant="outline" className="border-slate-200 bg-white/70 text-slate-700">
                                      {pendingStudents.length} pending
                                    </Badge>
                                    <Badge variant="outline" className={scoreTone(averagePercent)}>
                                      Avg {averagePercent}%
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {attempts.length > 0 ? "Latest attempt shown first" : "No attempts yet"}
                                  </p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <Card className="bg-white/80 shadow-none">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Attempted ({attempts.length})</CardTitle>
                                    <CardDescription>Students who submitted this test.</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    {attempts.length === 0 ? (
                                      <EmptyState
                                        title="No students have taken this test yet"
                                        description="Attempts will appear here after submissions."
                                      />
                                    ) : (
                                      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/70">
                                        <ScrollArea className="h-[340px]">
                                          <Table>
                                            <TableHeader>
                                              <TableRow className="bg-slate-50/70">
                                                <TableHead>Student</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead>Completed</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {attempts.map((attempt) => {
                                                const student = allUsers.find((entry) => entry.id === attempt.userId);
                                                const percent = scorePercent(attempt);
                                                return (
                                                  <TableRow key={attempt.id}>
                                                    <TableCell>
                                                      <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                          <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                                                            {initials(student?.name)}
                                                          </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                          <Button
                                                            variant="link"
                                                            size="sm"
                                                            onClick={() => setSelectedStudent(student)}
                                                            className="h-auto p-0 font-semibold text-slate-900"
                                                          >
                                                            {student?.name || "Unknown"}
                                                          </Button>
                                                          <p className="truncate text-xs text-slate-600">
                                                            {student?.email || "-"}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell>
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-900">
                                                          {attempt.score}/{attempt.totalQuestions}
                                                        </span>
                                                        <Badge variant="outline" className={scoreTone(percent)}>
                                                          {percent}%
                                                        </Badge>
                                                      </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                      {new Date(attempt.completedAt).toLocaleDateString()}
                                                    </TableCell>
                                                  </TableRow>
                                                );
                                              })}
                                            </TableBody>
                                          </Table>
                                        </ScrollArea>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                <Card className="bg-white/80 shadow-none">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Pending ({pendingStudents.length})</CardTitle>
                                    <CardDescription>Students who have not attempted this test yet.</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    {pendingStudents.length === 0 ? (
                                      <EmptyState
                                        title="All students have taken this test"
                                        description="There are no pending attempts for this test."
                                      />
                                    ) : (
                                      <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/70">
                                        <ScrollArea className="h-[340px]">
                                          <Table>
                                            <TableHeader>
                                              <TableRow className="bg-slate-50/70">
                                                <TableHead>Student</TableHead>
                                                <TableHead>Status</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {pendingStudents.map((student) => (
                                                <TableRow key={student.id}>
                                                  <TableCell>
                                                    <div className="flex items-center gap-3">
                                                      <Avatar className="h-9 w-9">
                                                        <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                                                          {initials(student.name)}
                                                        </AvatarFallback>
                                                      </Avatar>
                                                      <div className="min-w-0">
                                                        <Button
                                                          variant="link"
                                                          size="sm"
                                                          onClick={() => setSelectedStudent(student)}
                                                          className="h-auto p-0 font-semibold text-slate-900"
                                                        >
                                                          {student.name}
                                                        </Button>
                                                        <p className="truncate text-xs text-slate-600">{student.email}</p>
                                                      </div>
                                                    </div>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge
                                                      variant="outline"
                                                      className="border-rose-200/80 bg-rose-50 text-rose-700"
                                                    >
                                                      Not Taken
                                                    </Badge>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </ScrollArea>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="proctoring" className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Proctoring Monitor</h2>
                  <p className="text-sm text-slate-600">
                    Review active sessions, warnings, risk levels, and candidate violation history.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="secondary">{proctoringReports.length} candidates</Badge>
                    <Badge variant="outline">{activeProctoringCount} active</Badge>
                    <Badge variant="outline" className={riskTone(80)}>
                      {highRiskProctoringCount} high risk
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={handleRefreshProctoring} disabled={isRefreshingProctoring}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshingProctoring ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              <Card className="glass-panel border border-white/60">
                <CardHeader>
                  <CardTitle>Candidate Proctoring Reports</CardTitle>
                  <CardDescription>
                    Latest proctored session per candidate, sorted by most recent activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredProctoringReports.length === 0 ? (
                    <EmptyState
                      title="No proctoring reports found"
                      description="Reports appear after students start monitored tests."
                    />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/70">
                      <ScrollArea className="h-[560px]">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50/70">
                              <TableHead>Candidate</TableHead>
                              <TableHead>Assessment</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Risk</TableHead>
                              <TableHead>Warnings</TableHead>
                              <TableHead>Violations</TableHead>
                              <TableHead>Last Activity</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProctoringReports.map((report) => (
                              <TableRow key={`${report.candidateId}-${report.proctoringSessionId || "none"}`}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-700">
                                        {initials(report.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                      <p className="truncate font-semibold text-slate-900">{report.name}</p>
                                      <p className="truncate text-xs text-slate-600">{report.email}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[16rem]">
                                    <p className="truncate font-medium text-slate-900">{report.assessmentTitle}</p>
                                    {report.startedAt ? (
                                      <p className="text-xs text-slate-500">
                                        Started {new Date(report.startedAt).toLocaleString()}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-slate-500">No monitored session</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={statusTone(report.status)}>
                                    {report.status === "NOT_STARTED" ? "Not Started" : report.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={riskTone(Number(report.riskScore || 0))}>
                                      {report.riskScore}/100
                                    </Badge>
                                    <span className="hidden text-xs text-slate-500 xl:inline">
                                      {report.recommendation?.label}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                                    <ShieldAlert className="h-4 w-4 text-amber-600" />
                                    {report.totalWarnings}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-slate-800">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    {report.totalViolations}
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {report.lastViolationAt
                                    ? new Date(report.lastViolationAt).toLocaleString()
                                    : report.endedAt
                                    ? new Date(report.endedAt).toLocaleString()
                                    : report.startedAt
                                    ? new Date(report.startedAt).toLocaleString()
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl glass-panel border border-white/60">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
            <DialogDescription>Profile and test history for the selected student.</DialogDescription>
          </DialogHeader>

          {selectedStudent ? (
            <div className="space-y-5 pt-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-12 w-12 ring-2 ring-white/70 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 font-semibold text-white">
                    {initials(selectedStudent.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold text-slate-900">{selectedStudent.name}</p>
                  <p className="truncate text-sm text-slate-600">{selectedStudent.email}</p>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Badge variant="secondary">{selectedStudent.role}</Badge>
                  <Badge variant="outline">Joined {new Date(selectedStudent.createdAt).toLocaleDateString()}</Badge>
                </div>
              </div>

              <Card className="bg-white/80 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Test History</CardTitle>
                  <CardDescription>Scores for tests attempted by this student.</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStudentResults.length === 0 ? (
                    <EmptyState title="No test results yet" description="This student has not submitted any tests." />
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200/70">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/70">
                            <TableHead>Test</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Completed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedStudentResults.map((result) => {
                            const percent = scorePercent(result);
                            return (
                              <TableRow key={result.id}>
                                <TableCell className="font-medium text-slate-900">{result.testTitle}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900">
                                      {result.score}/{result.totalQuestions}
                                    </span>
                                    <Badge variant="outline" className={scoreTone(percent)}>
                                      {percent}%
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-slate-600">
                                  {new Date(result.completedAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
