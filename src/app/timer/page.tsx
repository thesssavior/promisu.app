"use client";

import { useState, useEffect, useRef } from "react";

interface TimeBlock {
  id: string;
  duration: number; // in seconds
  startTime: Date;
  endTime: Date;
  description: string;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatTimeOfDay(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}min`;
  } else if (hrs > 0) {
    return `${hrs}h`;
  } else if (mins > 0) {
    return `${mins}min`;
  }
  return `${seconds}s`;
}

export default function TimerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [currentDescription, setCurrentDescription] = useState("");
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetSeconds = targetMinutes * 60;

  useEffect(() => {
    // Load time blocks from localStorage
    const saved = localStorage.getItem("timeBlocks");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTimeBlocks(
        parsed.map((block: TimeBlock) => ({
          ...block,
          startTime: new Date(block.startTime),
          endTime: new Date(block.endTime),
        }))
      );
    }
  }, []);

  useEffect(() => {
    // Save time blocks to localStorage
    if (timeBlocks.length > 0) {
      localStorage.setItem("timeBlocks", JSON.stringify(timeBlocks));
    }
  }, [timeBlocks]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    if (!isRunning && elapsedSeconds === 0) {
      setStartTime(new Date());
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    setStartTime(null);
    setCurrentDescription("");
  };

  const handleComplete = () => {
    if (startTime && elapsedSeconds > 0) {
      const endTime = new Date();
      const newBlock: TimeBlock = {
        id: Date.now().toString(),
        duration: elapsedSeconds,
        startTime,
        endTime,
        description: currentDescription.trim() || "",
      };
      setTimeBlocks((prev) => [newBlock, ...prev]);
      handleReset();
    }
  };

  const handleDeleteBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const handleEditBlock = (id: string, description: string) => {
    setEditingId(id);
    setEditingDescription(description);
  };

  const handleSaveEdit = (id: string) => {
    setTimeBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, description: editingDescription } : block
      )
    );
    setEditingId(null);
    setEditingDescription("");
  };

  const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  const isOvertime = elapsedSeconds > targetSeconds;

  // Group time blocks by date
  const groupedBlocks = timeBlocks.reduce((acc, block) => {
    const dateKey = block.startTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(block);
    return acc;
  }, {} as Record<string, TimeBlock[]>);

  const totalTodaySeconds = timeBlocks
    .filter((block) => {
      const today = new Date();
      return block.startTime.toDateString() === today.toDateString();
    })
    .reduce((acc, block) => acc + block.duration, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:py-24 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Time Tracker
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Track your time blocks and stay focused
          </p>
        </div>

        {/* Timer Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          {/* Target Time Input */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <label className="text-gray-500">Target:</label>
            <input
              type="number"
              min="1"
              max="180"
              value={targetMinutes}
              onChange={(e) => setTargetMinutes(Number(e.target.value))}
              disabled={isRunning}
              className="text-gray-500 w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
            <span className="text-gray-500">minutes</span>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-8">
            <div
              className={`text-7xl font-mono font-bold ${
                isOvertime ? "text-red-500" : "text-gray-900"
              }`}
            >
              {formatTime(elapsedSeconds)}
            </div>
            {isOvertime && (
              <p className="text-red-500 mt-2">
                +{formatTime(elapsedSeconds - targetSeconds)} overtime
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isOvertime ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="What are you working on?"
              value={currentDescription}
              onChange={(e) => setCurrentDescription(e.target.value)}
              className="text-gray-500 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                {elapsedSeconds === 0 ? "Start" : "Resume"}
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-8 py-3 bg-yellow-500 text-white rounded-full font-semibold hover:bg-yellow-600 transition-colors"
              >
                Pause
              </button>
            )}
            {elapsedSeconds > 0 && (
              <>
                <button
                  onClick={handleComplete}
                  className="px-8 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                >
                  Complete
                </button>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-400 transition-colors"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Today's Summary */}
        {totalTodaySeconds > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-medium">Total today</span>
              <span className="text-2xl font-bold text-green-700">
                {formatDuration(totalTodaySeconds)}
              </span>
            </div>
          </div>
        )}

        {/* Time Blocks History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Time Blocks</h2>

          {Object.keys(groupedBlocks).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No time blocks yet. Start tracking your time!</p>
            </div>
          ) : (
            Object.entries(groupedBlocks).map(([date, blocks]) => (
              <div key={date} className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  {date}
                </h3>
                <div className="space-y-3">
                  {blocks.map((block) => (
                    <div
                      key={block.id}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              {formatDuration(block.duration)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatTimeOfDay(block.startTime)} - {formatTimeOfDay(block.endTime)}
                            </span>
                          </div>
                          {editingId === block.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                className="text-gray-500 flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveEdit(block.id);
                                  } else if (e.key === "Escape") {
                                    setEditingId(null);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleSaveEdit(block.id)}
                                className="px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <p
                              className={`cursor-pointer hover:text-gray-600 ${
                                block.description ? "text-gray-900" : "text-gray-400 italic"
                              }`}
                              onClick={() => handleEditBlock(block.id, block.description)}
                            >
                              {block.description || "Untitled session"}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete time block"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Clear All Button */}
        {timeBlocks.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all time blocks?")) {
                  setTimeBlocks([]);
                  localStorage.removeItem("timeBlocks");
                }
              }}
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Clear all time blocks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
