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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Heart, MessageCircle, Send, PlusCircle, Building2, ChevronDown, ChevronUp, Clock, Brain, Code } from "lucide-react";

export function AlumniGuidance() {
  const { user, alumniPosts, addAlumniPost, likePost, addComment } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    company: "",
    testDurationMins: "",
    aptitudeQuestions: "",
    aptitudeDifficulty: "Medium",
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Student Feedback
          </h1>
          <p className="section-subtitle">Learn from the experiences of Placed Student</p>
        </div>
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
          <DialogContent className="glass-panel border border-white/70 max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 pt-6 pb-4 shrink-0">
              <DialogHeader>
                <DialogTitle className="pr-10">Share Your Experience</DialogTitle>
              </DialogHeader>
            </div>

            <div className="px-6 pb-6 overflow-y-auto flex-1">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      placeholder="e.g., My Google Online Assessment Experience"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input
                      value={newPost.company}
                      onChange={(e) => setNewPost({ ...newPost, company: e.target.value })}
                      placeholder="e.g., Google, Microsoft, TCS"
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
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <Card className="bg-white/70 border border-white/70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Test Snapshot (Optional)</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      />
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500">Aptitude Difficulty</label>
                        <Select
                          value={newPost.aptitudeDifficulty}
                          onValueChange={(value) => setNewPost({ ...newPost, aptitudeDifficulty: value })}
                        >
                          <SelectTrigger className="rounded-xl border-slate-300/80 bg-white/90">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                      />
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-500">Coding Difficulty</label>
                        <Select
                          value={newPost.codingDifficulty}
                          onValueChange={(value) => setNewPost({ ...newPost, codingDifficulty: value })}
                        >
                          <SelectTrigger className="rounded-xl border-slate-300/80 bg-white/90">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Easy">Easy</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Experience</label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your experience, preparation tips, what to focus on, and common mistakes..."
                    rows={6}
                    className="bg-white/70 border-slate-200"
                  />
                </div>
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

      {/* Posts */}
      <div className="space-y-6">
        {alumniPosts.length === 0 ? (
          <Card className="glass-panel">
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">No Posts Yet</h2>
              <p className="text-gray-600">Be the first to share your experience!</p>
            </CardContent>
          </Card>
        ) : (
          alumniPosts.map((post) => {
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
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3 text-gray-800">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {(post.testDurationMins != null ||
                    post.aptitudeQuestions != null ||
                    post.codingQuestions != null ||
                    post.aptitudeDifficulty ||
                    post.codingDifficulty) && (
                    <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                        {post.testDurationMins != null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-200">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            <span className="font-semibold tabular-nums">{post.testDurationMins}</span>
                            <span className="text-slate-500">mins</span>
                          </span>
                        )}
                        {post.aptitudeQuestions != null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-200">
                            <Brain className="h-3.5 w-3.5 text-blue-600" />
                            <span className="font-semibold tabular-nums">{post.aptitudeQuestions}</span>
                            <span className="text-slate-500">aptitude</span>
                            {post.aptitudeDifficulty && (
                              <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                                {post.aptitudeDifficulty}
                              </span>
                            )}
                          </span>
                        )}
                        {post.codingQuestions != null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-slate-200">
                            <Code className="h-3.5 w-3.5 text-violet-600" />
                            <span className="font-semibold tabular-nums">{post.codingQuestions}</span>
                            <span className="text-slate-500">coding</span>
                            {post.codingDifficulty && (
                              <span className="ml-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 border border-violet-100">
                                {post.codingDifficulty}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Actions */}
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

                  {/* Comments Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Existing Comments */}
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

                      {/* Add Comment */}
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
