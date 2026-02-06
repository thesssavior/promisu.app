"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/src/lib/supabase";

interface TimeBlock {
  id: string;
  duration: number;
  start_time: string;
  end_time: string;
  description: string;
  created_at: string;
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
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
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
  const [targetInput, setTargetInput] = useState("25");
  const [currentDescription, setCurrentDescription] = useState("");
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCountdown, setIsCountdown] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const targetSeconds = targetMinutes * 60;

  const fetchTimeBlocks = useCallback(async () => {
    const { data, error } = await supabase
      .from("time_blocks")
      .select("*")
      .order("start_time", { ascending: false });

    if (error) {
      console.error("Error fetching time blocks:", error);
    } else {
      setTimeBlocks(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTimeBlocks();
  }, [fetchTimeBlocks]);

  // Update tab title with timer
  useEffect(() => {
    if (elapsedSeconds > 0 || isRunning) {
      const displaySeconds = isCountdown
        ? Math.max(targetSeconds - elapsedSeconds, 0)
        : elapsedSeconds;
      const timeStr = formatTime(displaySeconds);
      const prefix = isCountdown && elapsedSeconds > targetSeconds ? "+" : "";
      const overtime = isCountdown && elapsedSeconds > targetSeconds
        ? formatTime(elapsedSeconds - targetSeconds)
        : "";
      document.title = isCountdown && elapsedSeconds > targetSeconds
        ? `+${overtime} | Timer`
        : `${prefix}${timeStr} | Timer`;
    } else {
      document.title = "Timer";
    }

    return () => {
      document.title = "Timer";
    };
  }, [elapsedSeconds, isRunning, isCountdown, targetSeconds]);

  useEffect(() => {
    if (isRunning) {
      sessionStartRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const sessionElapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        setElapsedSeconds(accumulatedRef.current + sessionElapsed);
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
    accumulatedRef.current = elapsedSeconds;
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedRef.current = 0;
    sessionStartRef.current = 0;
    setStartTime(null);
    setCurrentDescription("");
  };

  const handleComplete = async () => {
    if (startTime && elapsedSeconds > 0) {
      const endTime = new Date();

      const { data, error } = await supabase
        .from("time_blocks")
        .insert({
          duration: elapsedSeconds,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          description: currentDescription.trim() || "",
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving time block:", error);
        return;
      }

      if (data) {
        setTimeBlocks((prev) => [data, ...prev]);
      }
      handleReset();
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Are you sure you want to delete this time block?")) {
      return;
    }

    const { error } = await supabase.from("time_blocks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting time block:", error);
      return;
    }

    setTimeBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const handleContinue = (description: string) => {
    if (isRunning || elapsedSeconds > 0) {
      if (!confirm("A timer is already running. Reset and start a new one?")) {
        return;
      }
    }
    setIsRunning(false);
    setElapsedSeconds(0);
    accumulatedRef.current = 0;
    sessionStartRef.current = 0;
    setIsCountdown(false);
    setCurrentDescription(description);
    setStartTime(new Date());
    setIsRunning(true);
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  const handleEditBlock = (id: string, description: string) => {
    setEditingId(id);
    setEditingDescription(description);
  };

  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase
      .from("time_blocks")
      .update({ description: editingDescription })
      .eq("id", id);

    if (error) {
      console.error("Error updating time block:", error);
      return;
    }

    setTimeBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, description: editingDescription } : block
      )
    );
    setEditingId(null);
    setEditingDescription("");
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all time blocks?")) {
      const { error } = await supabase.from("time_blocks").delete().neq("id", "");

      if (error) {
        console.error("Error clearing time blocks:", error);
        return;
      }

      setTimeBlocks([]);
    }
  };

  const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  const isOvertime = elapsedSeconds > targetSeconds;

  // Group time blocks by description
  const groupedByDescription = timeBlocks.reduce(
    (acc, block) => {
      const key = block.description || "Untitled session";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(block);
      return acc;
    },
    {} as Record<string, TimeBlock[]>
  );

  // Sort groups by most recent block
  const sortedGroups = Object.entries(groupedByDescription).sort((a, b) => {
    const aLatest = new Date(a[1][0].start_time).getTime();
    const bLatest = new Date(b[1][0].start_time).getTime();
    return bLatest - aLatest;
  });

  const totalTodaySeconds = timeBlocks
    .filter((block) => {
      const today = new Date();
      const blockDate = new Date(block.start_time);
      return blockDate.toDateString() === today.toDateString();
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
          <a
            href="/calendar"
            className="inline-flex items-center gap-2 mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            View Calendar
          </a>
        </div>

        {/* Timer Section */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-8">
          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={() => setIsCountdown(false)}
              disabled={isRunning || elapsedSeconds > 0}
              className={`px-4 py-2 rounded-l-full text-sm font-medium transition-colors ${
                !isCountdown
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Count Up
            </button>
            <button
              onClick={() => setIsCountdown(true)}
              disabled={isRunning || elapsedSeconds > 0}
              className={`px-4 py-2 rounded-r-full text-sm font-medium transition-colors ${
                isCountdown
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Countdown
            </button>
          </div>

          {/* Target Time Input */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <label className="text-gray-500">{isCountdown ? "Duration:" : "Target:"}</label>
            <input
              type="text"
              inputMode="numeric"
              value={targetInput}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setTargetInput(val);
                  if (val !== "") {
                    const num = Math.min(Math.max(Number(val), 1), 180);
                    setTargetMinutes(num);
                  }
                }
              }}
              onBlur={() => {
                if (targetInput === "" || Number(targetInput) < 1) {
                  setTargetInput("1");
                  setTargetMinutes(1);
                } else if (Number(targetInput) > 180) {
                  setTargetInput("180");
                  setTargetMinutes(180);
                } else {
                  setTargetInput(String(targetMinutes));
                }
              }}
              disabled={isRunning || elapsedSeconds > 0}
              className="text-gray-500 w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100"
            />
            <span className="text-gray-500">minutes</span>
          </div>

          {/* Timer Display */}
          <div className="text-center mb-8">
            {isCountdown ? (
              <>
                <div
                  className={`text-7xl font-mono font-bold ${
                    isOvertime ? "text-red-500" : "text-gray-900"
                  }`}
                >
                  {isOvertime
                    ? `+${formatTime(elapsedSeconds - targetSeconds)}`
                    : formatTime(targetSeconds - elapsedSeconds)}
                </div>
                {isOvertime && (
                  <p className="text-red-500 mt-2">Time&apos;s up! Overtime</p>
                )}
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                isOvertime ? "bg-red-500" : "bg-green-500"
              }`}
              style={{
                width: isCountdown
                  ? `${Math.max(100 - progress, 0)}%`
                  : `${Math.min(progress, 100)}%`,
              }}
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

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading...</p>
            </div>
          ) : sortedGroups.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No time blocks yet. Start tracking your time!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(() => {
                let lastDate = "";
                return sortedGroups.map(([description, blocks]) => {
                  const isExpanded = expandedGroups.has(description);
                  const totalDuration = blocks.reduce((acc, b) => acc + b.duration, 0);
                  const blockDate = new Date(blocks[0].start_time).toDateString();
                  const showDateHeader = blockDate !== lastDate;
                  lastDate = blockDate;

                  const today = new Date().toDateString();
                  const yesterday = new Date(Date.now() - 86400000).toDateString();
                  const dateLabel = blockDate === today
                    ? "Today"
                    : blockDate === yesterday
                    ? "Yesterday"
                    : new Date(blocks[0].start_time).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      });

                  return (
                    <div key={description}>
                      {showDateHeader && (
                        <p className="text-sm font-medium text-gray-500 mt-6 mb-2 first:mt-0">
                          {dateLabel}
                        </p>
                      )}
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Group Header */}
                    <div
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleGroup(description)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate ${description === "Untitled session" ? "text-gray-400 italic" : "text-gray-900"}`}>
                            {description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{formatDuration(totalDuration)}</span>
                            <span>·</span>
                            <span>{blocks.length} {blocks.length === 1 ? "session" : "sessions"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleContinue(description === "Untitled session" ? "" : description)}
                          className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                          aria-label="Continue timing"
                          title="Continue"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Blocks */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50">
                        {blocks.map((block) => (
                          <div
                            key={block.id}
                            className="p-4 border-b border-gray-200 last:border-b-0 flex items-center justify-between gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
                                  {formatDuration(block.duration)}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatTimeOfDay(new Date(block.start_time))} -{" "}
                                  {formatTimeOfDay(new Date(block.end_time))}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {new Date(block.start_time).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {/* <button
                                onClick={() => handleContinue(block.description)}
                                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                                aria-label="Continue timing"
                                title="Continue"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button> */}
                              <button
                                onClick={() => handleDeleteBlock(block.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Delete time block"
                                title="Delete"
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
                    )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Clear All Button */}
        {timeBlocks.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button onClick={handleClearAll} className="text-red-500 hover:text-red-700 text-sm font-medium">
              Clear all time blocks
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
