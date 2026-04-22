import React, { Suspense, lazy, useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  BookOpen,
  Code,
  Brain,
  Trophy,
  MessageSquare,
  BarChart3,
  LogOut,
  Clock,
  CheckCircle2,
  Play,
  Users,
  Calendar,
  Bot,
  Search,
  LayoutDashboard,
  FileText,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { TestInterface } from "./test-interface";

const VisualReports = lazy(() => import("./visual-reports").then((m) => ({ default: m.VisualReports })));
const StudyMaterials = lazy(() => import("./study-materials").then((m) => ({ default: m.StudyMaterials })));
const AlumniGuidance = lazy(() => import("./alumni-guidance").then((m) => ({ default: m.AlumniGuidance })));
const AIChatbot = lazy(() => import("./ai-chatbot").then((m) => ({ default: m.AIChatbot })));

function SectionLoader() {
  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="h-9 w-64 rounded-xl bg-slate-200/80 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-40 rounded-2xl bg-slate-200/70 animate-pulse" />
        <div className="h-40 rounded-2xl bg-slate-200/70 animate-pulse" />
        <div className="h-40 rounded-2xl bg-slate-200/70 animate-pulse" />
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { user, logout, tests, testResults, contests, joinContest } = useApp();
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userResults = testResults.filter((r) => r.userId === user?.id);
  const completedTestIds = userResults.map((r) => r.testId);
  const availableTests = tests.filter((t) => !completedTestIds.includes(t.id));
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredAvailableTests = normalizedSearchQuery
    ? availableTests.filter((test) =>
        [test.title, test.description, test.company, test.type]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
    : availableTests;
  const filteredCompletedResults = normalizedSearchQuery
    ? userResults.filter((result) =>
        [result.testTitle, result.score, result.totalQuestions, result.completedAt]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
    : userResults;
  const filteredContests = normalizedSearchQuery
    ? contests.filter((contest) =>
        [contest.title, contest.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
    : contests;

  const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = userResults.reduce((sum, r) => sum + r.totalQuestions, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const navItems = useMemo(
    () => [
      { id: "dashboard", label: "Test Portal", icon: LayoutDashboard },
      { id: "reports", label: "My Reports", icon: BarChart3 },
      { id: "materials", label: "Study Material", icon: FileText },
      { id: "alumni", label: "Student Feedback", icon: MessageSquare },
      { id: "chatbot", label: "AI Assistant", icon: Bot },
    ],
    [],
  );

  const startTest = (testId) => {
    setSelectedTestId(testId);
    setActiveView("test");
  };

  const handleTestComplete = () => {
    setSelectedTestId(null);
    setActiveView("dashboard");
  };

  const handleNavSelect = (viewId) => {
    setActiveView(viewId);
  };

  const searchPlaceholder =
    activeView === "materials"
      ? "Search study materials..."
      : activeView === "alumni"
      ? "Search student feedback..."
      : activeView === "dashboard"
      ? "Search tests or contests..."
      : "Search...";

  if (activeView === "test" && selectedTestId) {
    return <TestInterface testId={selectedTestId} onComplete={handleTestComplete} />;
  }

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
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">PlaceMate</p>
              <p className="text-xs text-slate-500">Placement Suite</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="hidden lg:flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">PlaceMate</p>
            <p className="text-xs text-slate-500">Placement Suite</p>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_14px_26px_-16px_rgba(45,68,195,0.95)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                onClick={() => handleNavSelect(item.id)}
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
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className={`flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : ""}`}>
        <header className="glass-panel sticky top-0 z-20 border-b border-white/60">
          <div className="px-4 md:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="fade-up flex items-start gap-3">
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
                <h1 className="section-title">Welcome back, {user?.name}</h1>
                <p className="section-subtitle">Ready to continue your placement preparation?</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  aria-label="Search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavSelect(item.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                      active
                        ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="px-4 md:px-8 py-8">
          {activeView === "dashboard" && (
            <div className="fade-up">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <Card className="metric-card hover-rise border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Aptitude Solved</p>
                        <p className="text-3xl font-bold">{userResults.length}</p>
                      </div>
                      <CheckCircle2 className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover-rise border-0 text-white bg-gradient-to-br from-emerald-500 to-teal-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Average Score</p>
                        <p className="text-3xl font-bold">{averageScore}%</p>
                      </div>
                      <BarChart3 className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover-rise border-0 text-white bg-gradient-to-br from-violet-500 to-fuchsia-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Coding Solved</p>
                        <p className="text-3xl font-bold">{availableTests.length}</p>
                      </div>
                      <Brain className="h-12 w-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover-rise border-0 text-white bg-gradient-to-br from-amber-500 to-orange-600">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Active Contests</p>
                        <p className="text-3xl font-bold">{contests.length}</p>
                      </div>
                      <Trophy className="h-12 w-12 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="tests" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="tests">Available Tests</TabsTrigger>
                  <TabsTrigger value="completed">Completed Tests</TabsTrigger>
                  <TabsTrigger value="contests">Contests</TabsTrigger>
                </TabsList>

                <TabsContent value="tests" className="space-y-4">
                  <h2 className="text-xl font-semibold">Available Tests</h2>
                  {filteredAvailableTests.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-slate-500">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>
                          {normalizedSearchQuery
                            ? "No available tests match your search."
                            : "You've completed all available tests! Check back later for more."}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredAvailableTests.map((test) => (
                        <Card key={test.id} className="hover-rise">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <Badge
                                variant={
                                  test.type === "coding"
                                    ? "default"
                                    : test.type === "aptitude"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {test.type === "coding" && <Code className="h-3 w-3 mr-1" />}
                                {test.type === "aptitude" && <Brain className="h-3 w-3 mr-1" />}
                                {test.type}
                              </Badge>
                              {test.company && <Badge variant="outline">{test.company}</Badge>}
                            </div>
                            <CardTitle className="text-lg">{test.title}</CardTitle>
                            <CardDescription>{test.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" /> {test.duration} min
                              </span>
                              <span>{test.questions.length} questions</span>
                            </div>
                            <Button className="w-full" onClick={() => startTest(test.id)}>
                              <Play className="h-4 w-4 mr-2" /> Start Test
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <h2 className="text-xl font-semibold">Completed Tests</h2>
                  {filteredCompletedResults.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-slate-500">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p>
                          {normalizedSearchQuery
                            ? "No completed tests match your search."
                            : "No tests completed yet. Start a test to see your results here!"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredCompletedResults.map((result) => {
                        const percentage = Math.round((result.score / result.totalQuestions) * 100);
                        return (
                          <Card key={result.id} className="hover-rise">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h3 className="font-semibold">{result.testTitle}</h3>
                                  <p className="text-sm text-slate-500">
                                    Completed on {new Date(result.completedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-blue-600">{percentage}%</p>
                                  <p className="text-sm text-slate-500">
                                    {result.score}/{result.totalQuestions} correct
                                  </p>
                                </div>
                              </div>
                              <Progress value={percentage} />
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="contests" className="space-y-4">
                  <h2 className="text-xl font-semibold">Active Contests</h2>
                  {filteredContests.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-slate-500">
                        <Trophy className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p>{normalizedSearchQuery ? "No contests match your search." : "No active contests at the moment."}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {filteredContests.map((contest) => {
                        const isJoined = contest.participants.includes(user?.id || "");
                        const isActive =
                          new Date() >= new Date(contest.startDate) && new Date() <= new Date(contest.endDate);
                        return (
                          <Card key={contest.id} className="hover-rise">
                            <CardHeader>
                              <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                <CardTitle>{contest.title}</CardTitle>
                              </div>
                              <CardDescription>{contest.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(contest.startDate).toLocaleDateString()} -{" "}
                                    {new Date(contest.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                  <Users className="h-4 w-4" />
                                  {contest.participants.length} participants
                                </div>
                                {isJoined ? (
                                  <Badge variant="secondary" className="w-full justify-center py-2">
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Already Joined
                                  </Badge>
                                ) : (
                                  <Button
                                    className="w-full"
                                    onClick={async () => {
                                      try {
                                        await joinContest(contest.id);
                                      } catch {
                                      }
                                    }}
                                    disabled={!isActive}
                                  >
                                    {isActive ? "Join Contest" : "Contest Not Active"}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeView !== "dashboard" && (
            <Suspense fallback={<SectionLoader />}>
              {activeView === "reports" && <VisualReports />}
              {activeView === "materials" && <StudyMaterials searchQuery={searchQuery} />}
              {activeView === "alumni" && <AlumniGuidance searchQuery={searchQuery} />}
              {activeView === "chatbot" && <AIChatbot />}
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
