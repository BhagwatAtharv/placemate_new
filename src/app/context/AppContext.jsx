import React, { createContext, useContext, useState } from "react";
import { useEffect } from "react";
import { apiRequest } from "../lib/apiClient";

const AppContext = createContext(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

export function AppProvider({ children }) {
  const tokenKey = "placeprep_token";
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || "");
  const [isInitializing, setIsInitializing] = useState(true);

  const [user, setUser] = useState(null);
  const [tests, setTests] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [allTestResults, setAllTestResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [contests, setContests] = useState([]);
  const [alumniPosts, setAlumniPosts] = useState([]);

  const loadTests = async (t) => {
    const data = await apiRequest("/api/tests", { token: t });
    setTests(data.tests || []);
  };

  const loadMaterials = async (t) => {
    const data = await apiRequest("/api/materials", { token: t });
    setStudyMaterials(data.materials || []);
  };

  const loadContests = async (t) => {
    const data = await apiRequest("/api/contests", { token: t });
    setContests(data.contests || []);
  };

  const loadResults = async (t) => {
    const data = await apiRequest("/api/results/me", { token: t });
    setTestResults(data.results || []);
  };

  const loadAllResults = async (t) => {
    const data = await apiRequest("/api/results/all", { token: t });
    setAllTestResults(data.results || []);
    setAllUsers(data.users || []);
  };

  const loadAlumniPosts = async (t) => {
    const data = await apiRequest("/api/alumni/posts", { token: t });
    setAlumniPosts(data.posts || []);
  };

  const loadAll = async (t, isAdmin = false) => {
    await Promise.all([
      loadTests(t),
      loadMaterials(t),
      loadContests(t),
      loadResults(t),
      loadAlumniPosts(t),
      ...(isAdmin ? [loadAllResults(t)] : []),
    ]);
  };

  useEffect(() => {
    const t = localStorage.getItem(tokenKey) || "";
    if (!t) {
      setIsInitializing(false);
      return;
    }

    (async () => {
      try {
        const me = await apiRequest("/api/auth/me", { token: t });
        setToken(t);
        setUser(me.user || null);
        await loadAll(t, me.user?.role === "admin");
      } catch {
        localStorage.removeItem(tokenKey);
        setToken("");
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      localStorage.setItem(tokenKey, data.token);
      setToken(data.token);
      setUser(data.user);
      await loadAll(data.token, data.user.role === "admin");
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: { name, email, password, role },
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    setToken("");
    setUser(null);
    setTests([]);
    setTestResults([]);
    setAllTestResults([]);
    setAllUsers([]);
    setStudyMaterials([]);
    setContests([]);
    setAlumniPosts([]);
  };

  const submitTestResult = async (result) => {
    if (!token) return;

    await apiRequest("/api/results", {
      method: "POST",
      token,
      body: {
        testId: result.testId,
        testTitle: result.testTitle,
        score: result.score,
        totalQuestions: result.totalQuestions,
        answers: result.answers,
      },
    });

    await loadResults(token);
  };

  const addTest = async (test) => {
    if (!token) return;

    await apiRequest("/api/tests", {
      method: "POST",
      token,
      body: {
        title: test.title,
        description: test.description,
        type: test.type,
        duration: Number(test.duration),
        company: test.company,
        questions: test.questions,
      },
    });

    await loadTests(token);
  };

  const deleteTest = async (testId) => {
    if (!token) return;
    await apiRequest(`/api/tests/${testId}`, { method: "DELETE", token });
    await loadTests(token);
  };

  const addStudyMaterial = async (material) => {
    if (!token) return;

    await apiRequest("/api/materials", {
      method: "POST",
      token,
      body: {
        title: material.title,
        company: material.company,
        type: material.type,
        url: material.url,
        description: material.description,
      },
    });

    await loadMaterials(token);
  };

  const deleteStudyMaterial = async (materialId) => {
    if (!token) return;
    await apiRequest(`/api/materials/${materialId}`, { method: "DELETE", token });
    await loadMaterials(token);
  };

  const addContest = async (contest) => {
    if (!token) return;

    await apiRequest("/api/contests", {
      method: "POST",
      token,
      body: {
        title: contest.title,
        description: contest.description,
        startDate: contest.startDate,
        endDate: contest.endDate,
        testIds: contest.tests || [],
      },
    });

    await loadContests(token);
  };

  const joinContest = async (contestId) => {
    if (!token) return;
    await apiRequest(`/api/contests/${contestId}/join`, { method: "POST", token });
    await loadContests(token);
  };

  const addAlumniPost = async (post) => {
    if (!token) return;
    await apiRequest("/api/alumni/posts", {
      method: "POST",
      token,
      body: {
        title: post.title,
        content: post.content,
        company: post.authorCompany,
      },
    });
    await loadAlumniPosts(token);
  };

  const likePost = async (postId) => {
    if (!token) return;
    await apiRequest(`/api/alumni/posts/${postId}/like`, { method: "POST", token });
    await loadAlumniPosts(token);
  };

  const addComment = async (postId, content) => {
    if (!token) return;
    await apiRequest(`/api/alumni/posts/${postId}/comments`, {
      method: "POST",
      token,
      body: { content },
    });
    await loadAlumniPosts(token);
  };

  return (
    <AppContext.Provider value={{
      isInitializing,
      user,
      login,
      logout,
      register,
      tests,
      testResults,
      allTestResults,
      allUsers,
      studyMaterials,
      contests,
      alumniPosts,
      submitTestResult,
      addTest,
      deleteTest,
      addStudyMaterial,
      deleteStudyMaterial,
      addContest,
      joinContest,
      addAlumniPost,
      likePost,
      addComment,
    }}>
      {children}
    </AppContext.Provider>
  );
}
