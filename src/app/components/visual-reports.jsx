import React from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Target, Award } from "lucide-react";

export function VisualReports() {
  const { user, testResults, tests } = useApp();
  const userResults = testResults.filter((r) => r.userId === user?.id);

  // Calculate statistics
  const totalTests = userResults.length;
  const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
  const totalQuestions = userResults.reduce((sum, r) => sum + r.totalQuestions, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  // Performance over time
  const performanceData = userResults.map((r, idx) => ({
    name: `Test ${idx + 1}`,
    score: Math.round((r.score / r.totalQuestions) * 100),
    date: new Date(r.completedAt).toLocaleDateString(),
  }));

  // Performance by test type
  const typePerformance = tests.reduce((acc, test) => {
    const result = userResults.find((r) => r.testId === test.id);
    if (result) {
      if (!acc[test.type]) {
        acc[test.type] = { total: 0, score: 0, count: 0 };
      }
      acc[test.type].total += result.totalQuestions;
      acc[test.type].score += result.score;
      acc[test.type].count++;
    }
    return acc;
  }, {});

  const typeChartData = Object.entries(typePerformance).map(([type, data]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    score: Math.round((data.score / data.total) * 100),
    tests: data.count,
  }));

  // Company-wise performance
  const companyPerformance = tests.reduce((acc, test) => {
    const result = userResults.find((r) => r.testId === test.id);
    if (result && test.company) {
      if (!acc[test.company]) {
        acc[test.company] = { total: 0, score: 0 };
      }
      acc[test.company].total += result.totalQuestions;
      acc[test.company].score += result.score;
    }
    return acc;
  }, {});

  const companyChartData = Object.entries(companyPerformance).map(([company, data]) => ({
    name: company,
    score: Math.round((data.score / data.total) * 100),
  }));

  // Pie chart data
  const pieData = [
    { name: "Correct", value: totalScore, color: "#22c55e" },
    { name: "Incorrect", value: totalQuestions - totalScore, color: "#ef4444" },
  ];

  // Calculate trend
  const recentResults = userResults.slice(-5);
  const olderResults = userResults.slice(-10, -5);
  const recentAvg = recentResults.length > 0
    ? recentResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / recentResults.length
    : 0;
  const olderAvg = olderResults.length > 0
    ? olderResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) / olderResults.length
    : 0;
  const trend = recentAvg - olderAvg;

  if (totalTests === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="glass-panel">
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Test Data Yet</h2>
            <p className="text-gray-600">Complete some tests to see your performance analytics here!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 fade-up">
      <h1 className="section-title mb-6">Performance Analytics</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover-rise">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="text-3xl font-bold text-blue-600">{averageScore}%</p>
              </div>
              <div className={`p-2 rounded-full ${trend >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                {trend >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% from previous tests
            </p>
          </CardContent>
        </Card>
        <Card className="hover-rise">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Tests Completed</p>
            <p className="text-3xl font-bold">{totalTests}</p>
            <Progress value={(totalTests / tests.length) * 100} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">{tests.length - totalTests} remaining</p>
          </CardContent>
        </Card>
        <Card className="hover-rise">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Questions Answered</p>
            <p className="text-3xl font-bold">{totalQuestions}</p>
            <p className="text-xs text-gray-500 mt-2">
              {totalScore} correct • {totalQuestions - totalScore} incorrect
            </p>
          </CardContent>
        </Card>
        <Card className="hover-rise">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500">Best Performance</p>
            <p className="text-3xl font-bold text-green-600">
              {Math.max(...userResults.map((r) => Math.round((r.score / r.totalQuestions) * 100)))}%
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <p className="text-xs text-gray-500">Personal Best</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Over Time */}
        <Card className="hover-rise">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your scores across different tests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Accuracy Breakdown */}
        <Card className="hover-rise">
          <CardHeader>
            <CardTitle>Accuracy Breakdown</CardTitle>
            <CardDescription>Correct vs Incorrect answers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Type */}
        {typeChartData.length > 0 && (
          <Card className="hover-rise">
            <CardHeader>
              <CardTitle>Performance by Test Type</CardTitle>
              <CardDescription>Compare your scores across different test types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Company-wise Performance */}
        {companyChartData.length > 0 && (
          <Card className="hover-rise">
            <CardHeader>
              <CardTitle>Company-wise Performance</CardTitle>
              <CardDescription>Your readiness for different companies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companyChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Test Results */}
      <Card className="mt-6 glass-panel">
        <CardHeader>
          <CardTitle>Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userResults.slice(-5).reverse().map((result) => {
              const percentage = Math.round((result.score / result.totalQuestions) * 100);
              return (
                <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{result.testTitle}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(result.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg">{percentage}%</p>
                      <p className="text-xs text-gray-500">{result.score}/{result.totalQuestions}</p>
                    </div>
                    <Badge variant={percentage >= 70 ? "default" : percentage >= 40 ? "secondary" : "destructive"}>
                      {percentage >= 70 ? "Excellent" : percentage >= 40 ? "Good" : "Needs Work"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
