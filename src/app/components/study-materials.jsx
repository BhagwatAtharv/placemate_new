import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { FileText, Video, BookOpen, ExternalLink, Building2 } from "lucide-react";

export function StudyMaterials({ searchQuery = "" }) {
  const { studyMaterials } = useApp();
  const [selectedCompany, setSelectedCompany] = useState("all");

  // Get unique companies
  const companies = useMemo(() => ["all", ...new Set(studyMaterials.map((m) => m.company))], [studyMaterials]);

  // Filter materials
  const filteredMaterials = studyMaterials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = selectedCompany === "all" || m.company === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "video":
        return <Video className="h-5 w-5 text-blue-500" />;
      case "article":
        return <BookOpen className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-700";
      case "video":
        return "bg-blue-100 text-blue-700";
      case "article":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Study Materials</h1>
          <p className="section-subtitle">Company-specific resources to ace your interviews</p>
        </div>
      </div>

      {/* Company Filter Tabs */}
      <Tabs value={selectedCompany} onValueChange={setSelectedCompany} className="mb-6">
        <TabsList className="flex-wrap h-auto gap-2">
          {companies.map((company) => (
            <TabsTrigger key={company} value={company} className="capitalize">
              {company === "all" ? "All Companies" : company}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card className="glass-panel">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No Materials Found</h2>
            <p className="text-gray-600">Try adjusting the top search bar or company filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover-rise group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${getTypeColor(material.type)}`}>
                    {getTypeIcon(material.type)}
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {material.company}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3 group-hover:text-blue-600 transition-colors">
                  {material.title}
                </CardTitle>
                <CardDescription>{material.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {material.type}
                  </Badge>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    {/* here add link to that resource */}
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <Card className="mt-8 glass-panel">
        <CardHeader>
          <CardTitle>Quick Resources</CardTitle>
          <CardDescription>Popular external resources for placement preparation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <span className="text-2xl">📚</span>
              <span>GeeksforGeeks</span>
              <span className="text-xs text-gray-500">DSA & Interview Prep</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <span className="text-2xl">💻</span>
              <span>LeetCode</span>
              <span className="text-xs text-gray-500">Coding Practice</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>InterviewBit</span>
              <span className="text-xs text-gray-500">Interview Questions</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
