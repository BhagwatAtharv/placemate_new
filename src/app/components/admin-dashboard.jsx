import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  PlusCircle,
  Trash2,
  FileText,
  Users,
  Trophy,
  BookOpen,
  LogOut,
  BarChart3,
  Calendar,
  Search,
  Sparkles,
} from "lucide-react";

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
    testResults,
    allTestResults,
    allUsers,
  } = useApp();

  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [isContestDialogOpen, setIsContestDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeSection, setActiveSection] = useState("tests");
  const [resultsSearch, setResultsSearch] = useState("");

  // New Test Form State
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    type: "aptitude",
    duration: 60,
    company: "",
  });
  const [newQuestions, setNewQuestions] = useState([]);

  // New Material Form State
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    company: "",
    type: "pdf",
    url: "",
    description: "",
  });

  // New Contest Form State
  const [newContest, setNewContest] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    selectedTests: [],
  });

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(),
      text: "",
      type: "mcq",
      options: ["", "", "", ""],
      correctAnswer: "",
    };
    setNewQuestions([...newQuestions, newQuestion]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...newQuestions];
    updated[index][field] = value;
    setNewQuestions(updated);
  };

  const removeQuestion = (index) => {
    setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };

  const handleAddTest = async () => {
    if (!newTest.title || newQuestions.length === 0) return;
    await addTest({
      ...newTest,
      questions: newQuestions,
    });
    setNewTest({ title: "", description: "", type: "aptitude", duration: 60, company: "" });
    setNewQuestions([]);
    setIsTestDialogOpen(false);
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title || !newMaterial.company) return;
    await addStudyMaterial(newMaterial);
    setNewMaterial({ title: "", company: "", type: "pdf", url: "", description: "" });
    setIsMaterialDialogOpen(false);
  };

  const handleAddContest = async () => {
    if (!newContest.title || !newContest.startDate || !newContest.endDate) return;
    await addContest({
      title: newContest.title,
      description: newContest.description,
      startDate: newContest.startDate,
      endDate: newContest.endDate,
      tests: newContest.selectedTests,
    });
    setNewContest({ title: "", description: "", startDate: "", endDate: "", selectedTests: [] });
    setIsContestDialogOpen(false);
  };

  // Statistics
  const totalTests = tests.length;
  const totalMaterials = studyMaterials.length;
  const totalContests = contests.length;
  const studentsWithResults = new Set(allTestResults.map((r) => r.userId)).size;

  const students = allUsers.filter((u) => u.role === "student");
  const normalizedResultsSearch = resultsSearch.trim().toLowerCase();
  const visibleTests = normalizedResultsSearch
    ? tests.filter((t) =>
        [t.title, t.description, t.company, t.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedResultsSearch)
      )
    : tests;

  const initialsForName = (name) => {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "?";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + second).toUpperCase();
  };

  const percentForResult = (result) => {
    if (!result?.totalQuestions) return 0;
    return Math.round((result.score / result.totalQuestions) * 100);
  };

  const scoreTone = (percent) => {
    if (percent >= 80) return "border-emerald-200/80 bg-emerald-50 text-emerald-700";
    if (percent >= 60) return "border-blue-200/80 bg-blue-50 text-blue-700";
    if (percent >= 40) return "border-amber-200/80 bg-amber-50 text-amber-700";
    return "border-rose-200/80 bg-rose-50 text-rose-700";
  };

  return (
    <div className="app-shell flex">
      <aside className="hidden lg:flex w-72 border-r border-slate-200/80 bg-white/70 backdrop-blur-xl p-6 flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">Admin DashBoard</p>
            <p className="text-xs text-slate-500">Control Center</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { id: "tests", label: "Manage Tests", icon: FileText },
            { id: "materials", label: "Study Materials", icon: BookOpen },
            { id: "contests", label: "Contests", icon: Trophy },
            { id: "results", label: "Student Results", icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full px-4 py-3 rounded-xl text-left flex items-center gap-3 transition ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_14px_26px_-16px_rgba(45,68,195,0.95)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-auto">
          <Button variant="outline" onClick={logout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="glass-panel border-b border-white/60 sticky top-0 z-20">
          <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="section-title">{user?.name}</h1>
              <p className="section-subtitle">Welcome, Build tests and run contests.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  aria-label="Search"
                  placeholder="Search tests or materials..."
                  className="h-11 w-80 rounded-2xl border border-slate-300/70 bg-white/90 pl-10 pr-4 text-sm text-slate-700 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.8)]"
                />
              </div>
              <div className="lg:hidden">
                <Button variant="outline" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </div>
            </div>
          </div>
          <div className="lg:hidden overflow-x-auto px-4 md:px-8 pb-3">
            <div className="flex items-center gap-2 min-w-max">
              <button
                onClick={() => setActiveSection("tests")}
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${activeSection === "tests" ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
              >
                Tests
              </button>
              <button
                onClick={() => setActiveSection("materials")}
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${activeSection === "materials" ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveSection("contests")}
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${activeSection === "contests" ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
              >
                Contests
              </button>
              <button
                onClick={() => setActiveSection("results")}
                className={`px-3 py-2 rounded-xl text-sm font-semibold ${activeSection === "results" ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
              >
                Results
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 fade-up">
          <Card className="hover-rise border-0 metric-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-100" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Total Tests</p>
                  <p className="text-2xl font-bold">{totalTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-rise border-0 text-white bg-gradient-to-br from-emerald-500 to-teal-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <BookOpen className="h-6 w-6 text-emerald-100" />
                </div>
                <div>
                  <p className="text-sm text-emerald-100">Study Materials</p>
                  <p className="text-2xl font-bold">{totalMaterials}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-rise border-0 text-white bg-gradient-to-br from-violet-500 to-fuchsia-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Trophy className="h-6 w-6 text-violet-100" />
                </div>
                <div>
                  <p className="text-sm text-violet-100">Active Contests</p>
                  <p className="text-2xl font-bold">{totalContests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-rise border-0 text-white bg-gradient-to-br from-amber-500 to-orange-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-orange-100" />
                </div>
                <div>
                  <p className="text-sm text-orange-100">Student Results</p>
                  <p className="text-2xl font-bold">{studentsWithResults}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6 fade-up delay-1">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="contests">Contests</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Manage Tests</h2>
              <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Test</DialogTitle>
                    <DialogDescription>Add a new assessment test</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Test Title</Label>
                        <Input
                          value={newTest.title}
                          onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                          placeholder="Enter test title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={newTest.company}
                          onChange={(e) => setNewTest({ ...newTest, company: e.target.value })}
                          placeholder="e.g., TCS, Infosys"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newTest.type}
                          onValueChange={(v) => setNewTest({ ...newTest, type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aptitude">Aptitude</SelectItem>
                            <SelectItem value="coding">Coding</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          value={newTest.duration}
                          onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newTest.description}
                        onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                        placeholder="Test description"
                      />
                    </div>

                    {/* Questions Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-lg">Questions ({newQuestions.length})</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                      </div>
                      {newQuestions.map((q, idx) => (
                        <Card key={q.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <Label>Question {idx + 1}</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeQuestion(idx)}
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Textarea
                              value={q.text}
                              onChange={(e) => updateQuestion(idx, "text", e.target.value)}
                              placeholder="Enter question"
                            />
                            <Select
                              value={q.type}
                              onValueChange={(v) => updateQuestion(idx, "type", v)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="coding">Coding</SelectItem>
                              </SelectContent>
                            </Select>
                            {q.type === "mcq" && (
                              <div className="space-y-2">
                                {q.options?.map((opt, optIdx) => (
                                  <Input
                                    key={optIdx}
                                    value={opt}
                                    onChange={(e) => {
                                      const newOpts = [...(q.options || [])];
                                      newOpts[optIdx] = e.target.value;
                                      updateQuestion(idx, "options", newOpts);
                                    }}
                                    placeholder={`Option ${optIdx + 1}`}
                                  />
                                ))}
                                <Input
                                  value={q.correctAnswer}
                                  onChange={(e) => updateQuestion(idx, "correctAnswer", e.target.value)}
                                  placeholder="Correct Answer"
                                  className="border-green-300"
                                />
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>

                    <Button onClick={handleAddTest} className="w-full">
                      Create Test
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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
                  {tests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell className="font-medium">{test.title}</TableCell>
                      <TableCell>{test.company || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={test.type === "coding" ? "default" : test.type === "aptitude" ? "secondary" : "outline"}>
                          {test.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{test.duration} min</TableCell>
                      <TableCell>{test.questions.length}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await deleteTest(test.id);
                            } catch {
                            }
                          }}
                          className="text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Study Materials</h2>
              <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> Add Material
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Study Material</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                        placeholder="Material title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={newMaterial.company}
                        onChange={(e) => setNewMaterial({ ...newMaterial, company: e.target.value })}
                        placeholder="Company name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newMaterial.type}
                        onValueChange={(v) => setNewMaterial({ ...newMaterial, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                        value={newMaterial.url}
                        onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                        placeholder="Resource URL"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                        placeholder="Description"
                      />
                    </div>
                    <Button onClick={handleAddMaterial} className="w-full">
                      Add Material
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyMaterials.map((material) => (
                <Card key={material.id} className="hover-rise">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge>{material.type}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStudyMaterial(material.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg">{material.title}</CardTitle>
                    <CardDescription>{material.company}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{material.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Contests Tab */}
          <TabsContent value="contests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Contests</h2>
              <Dialog open={isContestDialogOpen} onOpenChange={setIsContestDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" /> Create Contest
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Contest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={newContest.title}
                        onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
                        placeholder="Contest title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newContest.description}
                        onChange={(e) => setNewContest({ ...newContest, description: e.target.value })}
                        placeholder="Contest description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={newContest.startDate}
                          onChange={(e) => setNewContest({ ...newContest, startDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={newContest.endDate}
                          onChange={(e) => setNewContest({ ...newContest, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddContest} className="w-full">
                      Create Contest
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contests.map((contest) => (
                <Card key={contest.id} className="hover-rise">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <CardTitle>{contest.title}</CardTitle>
                    </div>
                    <CardDescription>{contest.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(contest.startDate).toLocaleDateString()} - {new Date(contest.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {contest.participants.length} participants
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Student Profile Dialog */}
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="glass-panel border border-white/60 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Student Profile</DialogTitle>
                <DialogDescription>Profile and test history for the selected student.</DialogDescription>
              </DialogHeader>
              {selectedStudent && (
                <div className="space-y-5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-white/70 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-violet-600 text-white font-semibold">
                        {initialsForName(selectedStudent.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xl font-semibold text-slate-900 truncate">{selectedStudent.name}</p>
                      <p className="text-sm text-slate-600 truncate">{selectedStudent.email}</p>
                    </div>
                    <div className="sm:ml-auto flex items-center gap-2">
                      <Badge variant="secondary">{selectedStudent.role}</Badge>
                      <Badge variant="outline">
                        Joined {new Date(selectedStudent.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>

                  <Card className="shadow-none bg-white/80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Test History</CardTitle>
                      <CardDescription>Scores for tests attempted by this student.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {allTestResults.filter((r) => r.userId === selectedStudent.id).length > 0 ? (
                        <div className="rounded-xl border border-slate-200/70 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/70">
                                <TableHead>Test</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Completed</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allTestResults
                                .filter((r) => r.userId === selectedStudent.id)
                                .slice()
                                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                                .map((result) => {
                                  const percent = percentForResult(result);
                                  return (
                                    <TableRow key={result.id}>
                                      <TableCell className="font-medium text-slate-900">
                                        {result.testTitle}
                                      </TableCell>
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
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-600">
                          No test results yet.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 fade-up">
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
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={resultsSearch}
                    onChange={(e) => setResultsSearch(e.target.value)}
                    placeholder="Search tests..."
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResultsSearch("")}
                  disabled={!resultsSearch.trim()}
                >
                  Clear
                </Button>
              </div>
            </div>

            <Card className="glass-panel border border-white/60 fade-up delay-1">
              <CardHeader>
                <CardTitle>Test-wise Performance</CardTitle>
                <CardDescription>
                  Expand a test to see who attempted it, who is pending, and individual scores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visibleTests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center">
                    <p className="text-sm font-semibold text-slate-900">No tests match your search.</p>
                    <p className="text-sm text-slate-600">Try a different keyword.</p>
                  </div>
                ) : (
                  <Accordion type="multiple" className="w-full">
                    {visibleTests.map((test) => {
                      const testResultsForTest = allTestResults
                        .filter((r) => r.testId === test.id)
                        .slice()
                        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

                      const takenIds = new Set(testResultsForTest.map((r) => r.userId));
                      const studentsNotTaken = students
                        .filter((u) => !takenIds.has(u.id))
                        .slice()
                        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

                      const averagePercent =
                        testResultsForTest.length > 0
                          ? Math.round(
                              testResultsForTest.reduce((sum, r) => sum + percentForResult(r), 0) /
                                testResultsForTest.length
                            )
                          : 0;

                      return (
                        <AccordionItem key={test.id} value={String(test.id)} className="border-slate-200/70">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex w-full items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-950 truncate">{test.title}</p>
                                <p className="text-xs text-slate-600 md:max-w-[44rem] truncate">
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
                                    {testResultsForTest.length} attempted
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="border-slate-200 bg-white/70 text-slate-700"
                                  >
                                    {studentsNotTaken.length} pending
                                  </Badge>
                                  <Badge variant="outline" className={scoreTone(averagePercent)}>
                                    Avg {averagePercent}%
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500">
                                  {testResultsForTest.length > 0 ? "Latest attempt shown first" : "No attempts yet"}
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>

                          <AccordionContent className="pt-2">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <Card className="shadow-none bg-white/80">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                      <Users className="h-4 w-4" />
                                    </span>
                                    Attempted ({testResultsForTest.length})
                                  </CardTitle>
                                  <CardDescription>Students who submitted this test.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {testResultsForTest.length > 0 ? (
                                    <div className="rounded-xl border border-slate-200/70 overflow-hidden bg-white/70">
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
                                            {testResultsForTest.map((result) => {
                                              const student = allUsers.find((u) => u.id === result.userId);
                                              const percent = percentForResult(result);
                                              return (
                                                <TableRow key={result.id}>
                                                  <TableCell>
                                                    <div className="flex items-center gap-3">
                                                      <Avatar className="h-9 w-9">
                                                        <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">
                                                          {initialsForName(student?.name)}
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
                                                        <p className="text-xs text-slate-600 truncate">
                                                          {student?.email || "—"}
                                                        </p>
                                                      </div>
                                                    </div>
                                                  </TableCell>
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
                                      </ScrollArea>
                                    </div>
                                  ) : (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-600">
                                      No students have taken this test yet.
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              <Card className="shadow-none bg-white/80">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                                      <Users className="h-4 w-4" />
                                    </span>
                                    Pending ({studentsNotTaken.length})
                                  </CardTitle>
                                  <CardDescription>Students who have not attempted this test yet.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {studentsNotTaken.length > 0 ? (
                                    <div className="rounded-xl border border-slate-200/70 overflow-hidden bg-white/70">
                                      <ScrollArea className="h-[340px]">
                                        <Table>
                                          <TableHeader>
                                            <TableRow className="bg-slate-50/70">
                                              <TableHead>Student</TableHead>
                                              <TableHead>Status</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {studentsNotTaken.map((student) => (
                                              <TableRow key={student.id}>
                                                <TableCell>
                                                  <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                      <AvatarFallback className="bg-slate-100 text-slate-700 font-semibold text-xs">
                                                        {initialsForName(student.name)}
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
                                                      <p className="text-xs text-slate-600 truncate">{student.email}</p>
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
                                  ) : (
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-sm text-slate-600">
                                      All students have taken this test.
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
        </Tabs>
        </main>
      </div>
    </div>
  );
}
