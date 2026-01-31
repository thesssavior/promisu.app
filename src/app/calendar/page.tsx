"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/src/lib/supabase";

interface TimeBlock {
  id: string;
  duration: number;
  start_time: string;
  end_time: string;
  description: string;
  created_at: string;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs}h ${mins}m`;
  } else if (hrs > 0) {
    return `${hrs}h`;
  } else if (mins > 0) {
    return `${mins}m`;
  }
  return `${seconds}s`;
}

function formatTimeShort(date: Date): string {
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
    .replace(" ", "");
}

function getWeekDays(date: Date): Date[] {
  const week: Date[] = [];
  const current = new Date(date);
  const day = current.getDay();
  const diff = current.getDate() - day;

  for (let i = 0; i < 7; i++) {
    const weekDay = new Date(current);
    weekDay.setDate(diff + i);
    weekDay.setHours(0, 0, 0, 0);
    week.push(weekDay);
  }

  return week;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 6; // 6 AM
const END_HOUR = 24; // 12 AM (midnight)
const TOTAL_HOURS = END_HOUR - START_HOUR;

// Color palette for different descriptions
const COLORS = [
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-800" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-800" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800" },
  { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-800" },
  { bg: "bg-red-100", border: "border-red-300", text: "text-red-800" },
];

function getColorForDescription(description: string, colorMap: Map<string, number>): typeof COLORS[0] {
  if (!colorMap.has(description)) {
    colorMap.set(description, colorMap.size % COLORS.length);
  }
  return COLORS[colorMap.get(description)!];
}

export default function CalendarPage() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const sunday = new Date(today);
    sunday.setDate(diff);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });

  const weekDays = getWeekDays(currentWeekStart);
  const today = new Date();

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

  const goToPreviousWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    const sunday = new Date(today);
    sunday.setDate(diff);
    sunday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(sunday);
  };

  // Build color map for consistent colors
  const colorMap = new Map<string, number>();
  timeBlocks.forEach((block) => {
    const desc = block.description || "Untitled";
    if (!colorMap.has(desc)) {
      colorMap.set(desc, colorMap.size % COLORS.length);
    }
  });

  // Get blocks for a specific day
  const getBlocksForDay = (day: Date): TimeBlock[] => {
    return timeBlocks.filter((block) => {
      const blockDate = new Date(block.start_time);
      return isSameDay(blockDate, day);
    });
  };

  // Calculate position and height for a block
  const getBlockStyle = (block: TimeBlock) => {
    const start = new Date(block.start_time);
    const end = new Date(block.end_time);

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;

    const top = Math.max(0, (startHour - START_HOUR) * HOUR_HEIGHT);
    const height = Math.max(20, (endHour - startHour) * HOUR_HEIGHT);

    return { top, height };
  };

  const weekLabel = `${weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  // Calculate total time for the week
  const weekTotalSeconds = timeBlocks
    .filter((block) => {
      const blockDate = new Date(block.start_time);
      return blockDate >= weekDays[0] && blockDate <= weekDays[6];
    })
    .reduce((acc, block) => acc + block.duration, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">
              {weekTotalSeconds > 0 && `${formatDuration(weekTotalSeconds)} this week`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={goToPreviousWeek}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Previous week"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 border-x border-gray-300 min-w-[200px] text-center">
                {weekLabel}
              </span>
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Next week"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <a
              href="/timer"
              className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
            >
              Timer
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <p>Loading...</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Scrollable container for both header and grid */}
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Day Headers - sticky */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
                <div className="p-2" /> {/* Time column spacer */}
                {weekDays.map((day, index) => {
                  const isToday = isSameDay(day, today);
                  return (
                    <div
                      key={index}
                      className={`p-3 text-center border-l border-gray-200 ${isToday ? "bg-blue-50" : "bg-gray-50"}`}
                    >
                      <div className="text-xs font-medium text-gray-500 uppercase">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </div>
                      <div
                        className={`text-lg font-semibold mt-1 ${
                          isToday
                            ? "bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                            : "text-gray-900"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                {/* Time Labels */}
                <div className="relative">
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR).map((hour) => (
                    <div
                      key={hour}
                      className="pr-2 text-right text-xs text-gray-400 relative"
                      style={{ height: HOUR_HEIGHT }}
                    >
                      <span className="absolute -top-2 right-2">
                        {hour === 0 ? "12am" : hour === 12 ? "12pm" : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const blocks = getBlocksForDay(day);
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={dayIndex}
                      className={`relative border-l border-gray-200 ${isToday ? "bg-blue-50/30" : ""}`}
                    >
                      {/* Hour lines */}
                      {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                        <div
                          key={i}
                          className="border-t border-gray-100"
                          style={{ height: HOUR_HEIGHT }}
                        />
                      ))}

                      {/* Time blocks */}
                      {blocks.map((block) => {
                        const { top, height } = getBlockStyle(block);
                        const color = getColorForDescription(block.description || "Untitled", colorMap);
                        const startTime = new Date(block.start_time);

                        // Skip blocks outside visible hours
                        if (startTime.getHours() < START_HOUR) return null;

                        return (
                          <div
                            key={block.id}
                            onClick={() => setSelectedBlock(block)}
                            className={`absolute left-1 right-1 ${color.bg} ${color.border} border-l-4 rounded-r px-2 py-1 overflow-hidden cursor-pointer hover:shadow-md hover:brightness-95 transition-all`}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              minHeight: "20px",
                            }}
                          >
                            <div className={`text-xs font-medium ${color.text} truncate`}>
                              {block.description || "Untitled"}
                            </div>
                            {height > 35 && (
                              <div className="text-xs text-gray-500 truncate">
                                {formatTimeShort(new Date(block.start_time))} - {formatTimeShort(new Date(block.end_time))}
                              </div>
                            )}
                            {height > 55 && (
                              <div className="text-xs text-gray-400">
                                {formatDuration(block.duration)}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Current time indicator */}
                      {isToday && (
                        <div
                          className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
                          style={{
                            top: `${(today.getHours() + today.getMinutes() / 60 - START_HOUR) * HOUR_HEIGHT}px`,
                          }}
                        >
                          <div className="absolute -left-1 -top-1.5 w-3 h-3 bg-red-500 rounded-full" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedBlock && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBlock(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedBlock.description || "Untitled"}
                </h3>
                <button
                  onClick={() => setSelectedBlock(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDuration(selectedBlock.duration)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(selectedBlock.start_time).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTimeShort(new Date(selectedBlock.start_time))} - {formatTimeShort(new Date(selectedBlock.end_time))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <a
                  href="/timer"
                  className="block w-full text-center px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Continue this task
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
