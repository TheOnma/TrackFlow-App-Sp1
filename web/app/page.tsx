"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

type CategoryType = "Work" | "Personal" | "Urgent" | "Study" | "Health";

interface Task {
  text: string;
  done: boolean;
  category: CategoryType;
}

const CATEGORIES: Record<CategoryType, string> = {
  Work: "from-pink-600 to-pink-700",
  Personal: "from-pink-500 to-pink-600",
  Urgent: "from-pink-700 to-pink-800",
  Study: "from-pink-400 to-pink-500",
  Health: "from-pink-800 to-pink-900"
};

export default function TrackFlow() {
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showProof, setShowProof] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proof, setProof] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("Work");
  const [isProving, setIsProving] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem("trackflow-tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("trackflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Poll for proof results when we have a taskId
  useEffect(() => {
    if (!taskId) return;
    
    console.log("Starting to poll for proof with taskId:", taskId);
    
    const checkProofStatus = async () => {
      try {
        const response = await fetch(`/api/proof-callback?taskId=${taskId}`);
        const data = await response.json();
        console.log("Proof status:", data);
        
        if (data.status === 'completed' && data.proof) {
          console.log("Proof received:", data.proof);
          setProof(data.proof);
          setIsProving(false);
          setTaskId(null);
          setShowProof(true);
          setShowDashboard(false);
        } else if (data.error) {
          console.error("Error in proof generation:", data.error);
          setProofError(data.error);
          setIsProving(false);
          setTaskId(null);
        }
      } catch (error) {
        console.error("Error checking proof status:", error);
      }
    };

    const interval = setInterval(checkProofStatus, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [taskId]);

  const addTask = () => {
    if (taskInput.trim() && taskInput.length <= 280) {
      setTasks([...tasks, { 
        text: taskInput, 
        done: false,
        category: selectedCategory as CategoryType
      }]);
      setTaskInput("");
    }
  };

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const deleteTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleProve = async () => {
    try {
      setIsProving(true);
      setProofError(null);
      
      const response = await fetch("/api/prove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      });

      const data = await response.json();
      console.log("API response:", data);
      
      if (data.success) {
        setTaskId(data.taskId);
        // Now we'll wait for the polling mechanism to update the proof
      } else {
        setProofError(data.error || "Unknown error occurred");
        setIsProving(false);
      }
    } catch (error) {
      console.error("Error generating proof:", error);
      setProofError("Network error occurred");
      setIsProving(false);
    }
  };

  const startNewSession = () => {
    setTasks([]);
    setProof(null);
    setShowProof(false);
    setShowDashboard(false);
    localStorage.removeItem("trackflow-tasks");
  };

  const shareToTwitter = () => {
    const completedTasks = tasks.filter(task => task.done).length;
    const totalTasks = tasks.length;
    const categoryStats = Object.entries(tasks.reduce((acc, task) => {
      if (task.done) {
        acc[task.category] = (acc[task.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>))
      .map(([category, count]) => `${category}: ${count}`)
      .join(", ");

    const proofHash = proof?.proof_hash ? Buffer.from(proof.proof_hash).toString('hex') : '';
    const tweetText = `I just completed ${completedTasks}/${totalTasks} tasks on TrackFlow! 🎯✨\n\nBreakdown: ${categoryStats}\n\nProof: ${proofHash}\n\nTrack your tasks with proof! \n\n@SuccinctLabs`;
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweetText);
    window.open(url, "_blank");
  };

  if (!showDashboard && !showProof) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-pink-900/30 flex items-center justify-center">
        <div className="w-full max-w-md mx-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl shadow-pink-500/20 p-8 border-2 border-pink-300/50 relative before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-gradient-to-br before:from-pink-500/10 before:to-transparent text-center">
          <h1 className="text-4xl font-bold text-center text-white mb-4 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
            TrackFlow
          </h1>
          <p className="text-pink-300 mb-8">Track Your Tasks on SP1 With Proof</p>
          <div className="space-y-4">
            <button
              onClick={() => setShowDashboard(true)}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-300 font-medium shadow-lg shadow-pink-500/20"
            >
              Start Tracking
            </button>
            <button
              className="w-full py-3 bg-gradient-to-r from-black to-pink-950/50 text-white rounded-lg hover:from-pink-950/30 hover:to-black transition-all duration-300 font-medium border-2 border-pink-300/50 shadow-lg shadow-pink-500/10"
              onClick={() => window.open('https://docs.succinct.xyz/docs/sp1/introduction', '_blank')}
            >
              Learn about SP1
            </button>
          </div>
          <div className="mt-8 text-center text-pink-300/70 text-sm">
            Made by <a href="https://twitter.com/PAdekwu" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">@PAdekwu</a>
          </div>
        </div>
      </div>
    );
  }

  if (showProof) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-pink-900/30 flex items-center justify-center">
        <button 
          onClick={() => {
            setShowProof(false);
            setShowDashboard(true);
          }}
          className="fixed top-4 left-4 p-2 text-pink-300 hover:text-pink-400 transition-colors"
          aria-label="Go back to tasks"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="w-full max-w-2xl mx-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl shadow-pink-500/20 p-8 border-2 border-pink-300/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Task Statistics</h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowProof(false);
                  setShowDashboard(true);
                }}
                className="text-pink-300 hover:text-pink-400 transition-colors px-4 py-2 rounded-lg border border-pink-300/50 hover:bg-pink-950/30"
                aria-label="View task list"
              >
                View Tasks
              </button>
              <button
                onClick={startNewSession}
                className="text-pink-300 hover:text-pink-400 transition-colors px-4 py-2 rounded-lg border border-pink-300/50 hover:bg-pink-950/30"
                aria-label="Start new session"
              >
                New Session
              </button>
            </div>
          </div>
          <div className="space-y-6 text-white">
            <div className="bg-pink-950/30 p-6 rounded-lg border border-pink-300/20">
              <h3 className="font-semibold mb-2 text-pink-200">SP1 Proof</h3>
              <pre className="text-sm overflow-auto max-h-60 text-pink-100 bg-black/50 p-4 rounded">
                {JSON.stringify(proof, null, 2)}
              </pre>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-pink-950/30 p-6 rounded-lg border border-pink-300/20">
                <h3 className="font-semibold text-pink-200">Total Tasks</h3>
                <p className="text-3xl font-bold mt-2">{proof?.total_tasks || 0}</p>
              </div>
              <div className="bg-pink-950/30 p-6 rounded-lg border border-pink-300/20">
                <h3 className="font-semibold text-pink-200">Completed Tasks</h3>
                <p className="text-3xl font-bold mt-2">{proof?.completed_tasks || 0}</p>
              </div>
            </div>
            <div className="bg-pink-950/30 p-6 rounded-lg border border-pink-300/20">
              <h3 className="font-semibold mb-2 text-pink-200">Proof Hash</h3>
              <code className="text-sm break-all text-pink-100 block bg-black/50 p-4 rounded">
                {proof?.proof_hash ? Buffer.from(proof.proof_hash).toString('hex') : ''}
              </code>
            </div>
            <button
              onClick={shareToTwitter}
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-300 font-medium shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on Twitter
            </button>
          </div>
          <div className="mt-8 text-center text-pink-300/70 text-sm">
            Made by <a href="https://twitter.com/PAdekwu" target="_blank" rel="noopener noreferrer" className="hover:text-pink-300 transition-colors">@PAdekwu</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-pink-900/30 flex items-center justify-center">
      <button 
        onClick={() => setShowDashboard(false)}
        className="fixed top-4 left-4 p-2 text-pink-300 hover:text-pink-400 transition-colors"
        aria-label="Return to landing page"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div className="w-full max-w-md mx-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl shadow-pink-500/20 p-8 border-2 border-pink-300/50 relative before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-gradient-to-br before:from-pink-500/10 before:to-transparent">
        <h1 className="text-3xl font-bold text-center text-white mb-8 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">TrackFlow</h1>
        
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a task..."
              maxLength={280}
              aria-label="Task input"
              className="flex-1 p-3 border border-pink-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 bg-black/50 text-white placeholder-pink-300/70 shadow-inner shadow-pink-500/5"
            />
            <button
              onClick={addTask}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-300 font-medium shadow-lg shadow-pink-500/20"
              aria-label="Add task"
            >
              Add
            </button>
          </div>
          
          <div className="flex gap-2 mb-6">
            {Object.entries(CATEGORIES).map(([category, gradientClass]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as CategoryType)}
                className={`px-3 py-1.5 text-sm text-white rounded-lg transition-all duration-300 font-medium shadow-lg shadow-pink-500/20 ${
                  selectedCategory === category
                    ? `bg-gradient-to-r ${gradientClass}`
                    : 'bg-black/50 hover:bg-pink-950/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="space-y-3 mb-8">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 border border-pink-300/50 rounded-lg bg-black/50"
              >
                <button
                  onClick={() => toggleTask(index)}
                  className={`w-6 h-6 rounded border-2 transition-colors ${
                    task.done
                      ? 'bg-gradient-to-r from-pink-600 to-pink-700 border-transparent'
                      : 'border-pink-300/50 hover:border-pink-400/70'
                  }`}
                  aria-label={`Mark task "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`}
                  title={`Mark task "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`}
                >
                  {task.done && (
                    <svg
                      className="w-full h-full text-white p-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                
                <span className={`flex-1 text-white ${task.done ? 'line-through opacity-50' : ''}`}>
                  {task.text}
                </span>
                
                <span className={`px-2 py-1 text-xs rounded-md bg-gradient-to-r ${CATEGORIES[task.category]} text-white`}>
                  {task.category}
                </span>
                
                <button
                  onClick={() => deleteTask(index)}
                  className="text-pink-300/70 hover:text-pink-300 transition-colors"
                  aria-label={`Delete task "${task.text}"`}
                  title={`Delete task "${task.text}"`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleProve}
            disabled={isProving || tasks.length === 0}
            className={`w-full py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-300 font-medium shadow-lg shadow-pink-500/20 ${isProving ? 'opacity-70 cursor-not-allowed' : ''}`}
            aria-label="Generate proof for tasks"
          >
            {isProving ? 'Generating Proof...' : 'Prove Tasks'}
          </button>
          
          {proofError && (
            <div className="mt-4 p-3 bg-red-900/30 text-red-200 rounded-lg border border-red-400/30">
              Error: {proofError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 