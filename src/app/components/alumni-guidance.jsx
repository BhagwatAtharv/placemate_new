import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Heart, MessageCircle, Send, PlusCircle, Building2, ChevronDown, ChevronUp, Clock, Brain, Code, Search } from "lucide-react";

export function AlumniGuidance({ searchQuery = "" }) {
  const { user, alumniPosts, addAlumniPost, likePost, addComment } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    company: "",
    testDurationMins: "",
    aptitudeQuestions: "",
    aptitudeDifficulty: "Medium",
    technicalMcq: "",
    codingQuestions: "",
    codingDifficulty: "Medium",
  });
  const [postError, setPostError] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());

  const toOptionalNumber = (value) => {
    if (value === "" || value == null) return undefined;
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const handleAddPost = async () => {
    if (!newPost.title || !newPost.content) return;
    setPostError("");
    try {
      await addAlumniPost({
        authorId: user?.id || "",
        authorName: user?.name || "Anonymous",
        authorCompany: newPost.company || "Not Specified",
        title: newPost.title,
        content: newPost.content,
        testDurationMins: toOptionalNumber(newPost.testDurationMins),
        aptitudeQuestions: toOptionalNumber(newPost.aptitudeQuestions),
        aptitudeDifficulty: newPost.aptitudeDifficulty || undefined,
        technicalMcq: toOptionalNumber(newPost.technicalMcq),
        codingQuestions: toOptionalNumber(newPost.codingQuestions),
        codingDifficulty: newPost.codingDifficulty || undefined,
      });
      setNewPost({
        title: "",
        content: "",
        company: "",
        testDurationMins: "",
        aptitudeQuestions: "",
        aptitudeDifficulty: "Medium",
        technicalMcq: "",
        codingQuestions: "",
        codingDifficulty: "Medium",
      });
      setIsDialogOpen(false);
    } catch {
      setPostError("Unable to post right now. Please try again.");
    }
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    try {
      await addComment(postId, content);
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch {
    }
  };

  const handleLike = async (postId) => {
    if (!likedPosts.has(postId)) {
      try {
        await likePost(postId);
        setLikedPosts(new Set([...likedPosts, postId]));
      } catch {
      }
    }
  };

  const toggleExpanded = (postId) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const getCompanyColor = (company) => {
    const colors = {
      Google: "bg-blue-100 text-blue-700 border-blue-200",
      Microsoft: "bg-green-100 text-green-700 border-green-200",
      Amazon: "bg-orange-100 text-orange-700 border-orange-200",
      Meta: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Apple: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[company] || "bg-purple-100 text-purple-700 border-purple-200";
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredPosts = normalizedQuery
    ? alumniPosts.filter((post) =>
        [
          post.title,
          post.content,
          post.authorName,
          post.authorCompany,
          post.aptitudeDifficulty,
          post.codingDifficulty,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
      )
    : alumniPosts;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-up">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="section-title bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Student Feedback
          </h1>
          <p className="section-subtitle">Student experiences and interview feedback</p>
        </div>
        <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[220px]">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open) setPostError("");
            }}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Share Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-panel border border-white/70 max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 pt-6 pb-4 shrink-0 border-b border-white/70 bg-white/70">
                <DialogHeader>
                  <DialogTitle className="pr-10">Share Your Experience</DialogTitle>
                </DialogHeader>
              </div>

              <div className="px-6 pb-6 overflow-y-auto flex-1">
                <div className="space-y-6 pt-6">
                  <Card className="border border-slate-200/80 bg-white/80 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={newPost.title}
                          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                          placeholder="e.g., My Google Online Assessment Experience"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Company</label>
                        <Input
                          value={newPost.company}
                          onChange={(e) => setNewPost({ ...newPost, company: e.target.value })}
                          placeholder="e.g., Google, Microsoft, TCS"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Test Duration (mins)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            type="number"
                            min={1}
                            max={600}
                            value={newPost.testDurationMins}
                            onChange={(e) => setNewPost({ ...newPost, testDurationMins: e.target.value })}
                            placeholder="e.g., 90"
                            className="bg-white pl-9"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 border border-white/70 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Round Snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium inline-flex items-center gap-2">
                          <Brain className="h-4 w-4 text-blue-600" /> Aptitude Questions
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={500}
                          value={newPost.aptitudeQuestions}
                          onChange={(e) => setNewPost({ ...newPost, aptitudeQuestions: e.target.value })}
                          placeholder="e.g., 30"
                          className="bg-white"
                        />
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-500">Aptitude Difficulty</label>
                          <select
                            value={newPost.aptitudeDifficulty}
                            onChange={(e) => setNewPost({ ...newPost, aptitudeDifficulty: e.target.value })}
                            className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium inline-flex items-center gap-2">
                          <Code className="h-4 w-4 text-emerald-600" /> Technical MQC
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={500}
                          value={newPost.technicalMcq}
                          onChange={(e) => setNewPost({ ...newPost, technicalMcq: e.target.value })}
                          placeholder="e.g., 25"
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium inline-flex items-center gap-2">
                          <Code className="h-4 w-4 text-violet-600" /> Coding Questions
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={200}
                          value={newPost.codingQuestions}
                          onChange={(e) => setNewPost({ ...newPost, codingQuestions: e.target.value })}
                          placeholder="e.g., 2"
                          className="bg-white"
                        />
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-500">Coding Difficulty</label>
                          <select
                            value={newPost.codingDifficulty}
                            onChange={(e) => setNewPost({ ...newPost, codingDifficulty: e.target.value })}
                            className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200/80 bg-white/80 shadow-none">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Experience Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <label className="text-sm font-medium">Your Experience</label>
                      <Textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Share your experience, preparation tips, what to focus on, and common mistakes..."
                        rows={7}
                        className="bg-white border-slate-200"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-white/70 bg-white/80 backdrop-blur shrink-0">
                {postError && <p className="mb-3 text-sm text-rose-700">{postError}</p>}
                <Button onClick={handleAddPost} className="w-full" disabled={!newPost.title || !newPost.content}>
                  Post Experience
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-6">
        {alumniPosts.length === 0 ? (
          <Card className="glass-panel">
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No Posts Yet</h2>
              <p className="text-gray-600">Be the first to share your experience.</p>
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card className="glass-panel">
            <CardContent className="p-12 text-center">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No matching posts</h2>
              <p className="text-gray-600">Try a different term in the top search bar.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const isExpanded = expandedPosts.has(post.id);
            const isLiked = likedPosts.has(post.id);

            return (
              <Card key={post.id} className="overflow-hidden hover-rise">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-purple-200">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold">
                        {post.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-900">{post.authorName}</h4>
                        <Badge className={`text-xs ${getCompanyColor(post.authorCompany)}`}>
                          <Building2 className="h-3 w-3 mr-1" />
                          {post.authorCompany}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3 text-gray-800">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {(post.testDurationMins != null ||
                    post.aptitudeQuestions != null ||
                    post.technicalMcq != null ||
                    post.codingQuestions != null ||
                    post.aptitudeDifficulty ||
                    post.codingDifficulty) && (
                    <div className="mb-4 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 md:grid-cols-2 xl:grid-cols-4">
                      {post.testDurationMins != null && (
                        <div className="rounded-2xl border border-white bg-white p-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            Test Duration
                          </div>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{post.testDurationMins} mins</p>
                        </div>
                      )}
                      {post.aptitudeQuestions != null && (
                        <div className="rounded-2xl border border-white bg-white p-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            <Brain className="h-3.5 w-3.5 text-blue-600" />
                            Aptitude
                          </div>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{post.aptitudeQuestions} questions</p>
                          {post.aptitudeDifficulty && (
                            <span className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                              {post.aptitudeDifficulty}
                            </span>
                          )}
                        </div>
                      )}
                      {post.technicalMcq != null && (
                        <div className="rounded-2xl border border-white bg-white p-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            <Code className="h-3.5 w-3.5 text-emerald-600" />
                            Technical MQC
                          </div>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{post.technicalMcq} questions</p>
                        </div>
                      )}
                      {post.codingQuestions != null && (
                        <div className="rounded-2xl border border-white bg-white p-3">
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            <Code className="h-3.5 w-3.5 text-violet-600" />
                            Coding
                          </div>
                          <p className="mt-2 text-lg font-semibold text-slate-900">{post.codingQuestions} questions</p>
                          {post.codingDifficulty && (
                            <span className="mt-2 inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 border border-violet-100">
                              {post.codingDifficulty}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 h-9 ${isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                      {post.likes} {post.likes === 1 ? "Like" : "Likes"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 h-9 text-gray-600 hover:text-blue-500"
                      onClick={() => toggleExpanded(post.id)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {post.comments.length > 0 && (
                        <div className="space-y-3">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                  {comment.authorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{comment.authorName}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          placeholder="Write a comment..."
                          className="flex-1"
                          onKeyPress={(e) => e.key === "Enter" && handleAddComment(post.id)}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className=""
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
