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
import { Heart, MessageCircle, Send, PlusCircle, Building2, ChevronDown, ChevronUp } from "lucide-react";

export function AlumniGuidance() {
  const { user, alumniPosts, addAlumniPost, likePost, addComment } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", company: "" });
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedPosts, setExpandedPosts] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());

  const handleAddPost = async () => {
    if (!newPost.title || !newPost.content) return;
    try {
      await addAlumniPost({
        authorId: user?.id || "",
        authorName: user?.name || "Anonymous",
        authorCompany: newPost.company || "Not Specified",
        title: newPost.title,
        content: newPost.content,
      });
      setNewPost({ title: "", content: "", company: "" });
      setIsDialogOpen(false);
    } catch {
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
            Alumni Guidance
          </h1>
          <p className="section-subtitle">Learn from the experiences of placed alumni</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Share Experience
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Experience</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="e.g., My Google Interview Experience"
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
                <label className="text-sm font-medium">Your Experience</label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your interview experience, tips, and advice..."
                  rows={6}
                />
              </div>
              <Button onClick={handleAddPost} className="w-full">
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
