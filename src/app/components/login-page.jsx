import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { GraduationCap, Shield, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("student");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginEmail || !loginPassword) {
      setError("Please fill in all fields");
      return;
    }
    const ok = await login(loginEmail, loginPassword);
    if (!ok) {
      setError("Invalid email or password");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!registerName || !registerEmail || !registerPassword) {
      setError("Please fill in all fields");
      return;
    }
    const ok = await register(registerName, registerEmail, registerPassword, registerRole);
    if (ok) {
      setSuccess("Registration successful! Please login.");
      setIsLogin(true);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
    } else {
      setError("Email already exists");
    }
  };

  return (
    <div className="app-shell flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl mb-4 shadow-[0_18px_30px_-20px_rgba(49,75,212,0.9)]">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">PlaceMate</h1>
          <p className="text-slate-600 mt-2">Your Gateway to Dream Placements</p>
        </div>

        <Card className="glass-panel border border-white/60 shadow-[0_28px_48px_-30px_rgba(15,23,42,0.55)] fade-up delay-1">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Register to start your placement journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-500/40 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Tabs value={registerRole} onValueChange={(v) => setRegisterRole(v)}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="student" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" /> Student
                      </TabsTrigger>
                      <TabsTrigger value="admin" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Admin
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                }}
                className="text-sm text-indigo-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-slate-50/80 border border-slate-200/80 rounded-xl">
              <p className="text-xs text-slate-500 font-medium mb-2">Demo Credentials:</p>
              <div className="text-xs text-slate-600 space-y-1">
                <p><strong>Student:</strong> student@test.com / student123</p>
                <p><strong>Admin:</strong> admin@test.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
