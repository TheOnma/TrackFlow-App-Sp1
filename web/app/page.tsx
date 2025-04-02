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
  const [taskInput, setTaskInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [proofResult, setProofResult] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("Work");

  useEffect(() => {
    const savedTasks = localStorage.getItem("trackflow-tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("trackflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

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

  const proveTasks = async () => {
    try {
      const res = await fetch("/api/prove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      setProofResult(data.result);
    } catch (error) {
      console.error("Error generating proof:", error);
      setProofResult("Error generating proof. Please try again.");
    }
  };

  const startNewSession = () => {
    setTasks([]);
    setProofResult(null);
    localStorage.removeItem("trackflow-tasks");
  };

  const shareToTwitter = () => {
    const completedTasks = tasks.filter(task => task.done).length;
    const totalTasks = tasks.length;
    const categoryCounts = tasks.reduce((acc, task) => {
      if (task.done) {
        acc[task.category] = (acc[task.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const categoryStats = Object.entries(categoryCounts)
      .map(([category, count]) => `${category}: ${count}`)
      .join(", ");

    const tweetText = `I just completed ${completedTasks}/${totalTasks} tasks on TrackFlow! 🎯✨\n\nBreakdown: ${categoryStats}\n\n${proofResult}\n\nTrack your tasks with proof! \n\n@SuccinctLabs @0xCRASHOUT @nair_advaith @PAdekwu`;
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(tweetText);
    window.open(url, "_blank");
  };

  const goBack = () => {
    if (showDashboard) {
      setShowDashboard(false);
    }
  };

  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-black to-pink-900/30 flex items-center justify-center">
        <div className="w-full max-w-md mx-4 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl shadow-pink-500/20 p-8 border-2 border-pink-300/50 relative before:absolute before:inset-0 before:-z-10 before:rounded-lg before:bg-gradient-to-br before:from-pink-500/10 before:to-transparent text-center">
          <h1 className="text-4xl font-bold text-center text-white mb-4 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300 bg-clip-text text-transparent drop-shadow-lg">
            TrackFlow
          </h1>
          <p className="text-pink-300 mb-8">Track your tasks with zero-knowledge proof generation using SP1</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-pink-900/30 flex items-center justify-center">
      {showDashboard && (
        <button 
          onClick={goBack}
          className="fixed top-4 left-4 p-2 text-pink-300 hover:text-pink-400 transition-colors"
          aria-label="Go back"
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
      )}
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
          
          <div className="flex gap-2 flex-wrap mb-2">
            {Object.entries(CATEGORIES).map(([category, gradientClass]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as CategoryType)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category as CategoryType
                    ? `bg-gradient-to-r ${gradientClass} text-white ring-2 ring-white shadow-lg`
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/70'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-2 mb-6">
          {tasks.map((task, index) => (
            <li
              key={index}
              className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-pink-950/30 hover:to-pink-900/20 rounded-lg transition-all duration-300 border border-transparent hover:border-pink-500/20 group"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(index)}
                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 focus:ring-offset-0 bg-black border-pink-300/50 transition-colors checked:bg-pink-500 checked:hover:bg-pink-600"
                aria-label={`Mark "${task.text}" as ${task.done ? "incomplete" : "complete"}`}
              />
              <span
                className={`flex-1 ${
                  task.done ? "line-through text-pink-400/70" : "text-white"
                } transition-colors`}
              >
                {task.text}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${CATEGORIES[task.category]} text-white shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:shadow-pink-500/10`}>
                {task.category}
              </span>
              <button
                onClick={() => deleteTask(index)}
                className="p-1.5 text-pink-300/70 hover:text-pink-300 hover:bg-pink-950/30 rounded-lg transition-all duration-300"
                aria-label="Delete task"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        {!proofResult ? (
          <button
            onClick={proveTasks}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-lg hover:from-pink-700 hover:to-pink-800 transition-all duration-300 font-medium shadow-lg shadow-pink-500/20"
            aria-label="Generate proof for tasks"
          >
            Prove Tasks
          </button>
        ) : (
          <button
            onClick={startNewSession}
            className="w-full py-3 bg-gradient-to-r from-black to-pink-950/50 text-white rounded-lg hover:from-pink-950/30 hover:to-black transition-all duration-300 font-medium border-2 border-pink-300/50 shadow-lg shadow-pink-500/10"
            aria-label="Start new session"
          >
            New Session
          </button>
        )}

        {proofResult && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gradient-to-br from-pink-950/40 to-black/60 text-pink-200 rounded-lg border border-pink-300/50 shadow-inner shadow-pink-500/10">
              {proofResult}
              <div className="mt-2 pt-2 border-t border-pink-300/20">
                <p className="text-sm font-medium">Category Completion:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(CATEGORIES).map(([category, gradientClass]) => {
                    const categoryTasks = tasks.filter(t => t.category === category as CategoryType);
                    const completedCount = categoryTasks.filter(t => t.done).length;
                    return (
                      <div key={category} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradientClass} shadow-sm`}></span>
                        <span className="text-xs">
                          {category}: {completedCount}/{categoryTasks.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={shareToTwitter}
              className="w-full py-3 bg-gradient-to-r from-black to-pink-950/50 text-white rounded-lg hover:from-pink-950/30 hover:to-black transition-all duration-300 font-medium flex items-center justify-center gap-2 border-2 border-pink-300/50 shadow-lg shadow-pink-500/10"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share to X
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 