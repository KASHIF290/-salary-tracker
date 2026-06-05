/**
 * format.js — Shared utility functions for Salary Tracker
 * Import what you need: import { formatINR, getDaysLeft } from "../utils/format";
 */

/**
 * Format a number as Indian Rupees.
 * formatINR(75000) → "₹75,000"
 * formatINR(1234567.89) → "₹12,34,568"
 */
export function formatINR(number) {
  const n = Number(number) || 0;
  return (
    "₹" +
    n.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })
  );
}

/**
 * Format a date string as a readable Indian date.
 * formatDate("2025-01-15") → "15 Jan 2025"
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString + "T12:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a date string as a short label.
 * formatShortDate("2025-01-15") → "15 Jan"
 */
export function formatShortDate(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString + "T12:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateString;
  }
}

/**
 * Get the number of days remaining until the next salary credit date.
 * getDaysLeft(1)  → days until the 1st of next month (or this month if not passed)
 * @param {number} creditDay - Day of month salary is credited (1–28)
 * @returns {number} - Days remaining (always >= 0)
 */
export function getDaysLeft(creditDay) {
  const now = new Date();
  const day = Number(creditDay) || 1;

  let nextCredit = new Date(now.getFullYear(), now.getMonth(), day);

  // If today is on or past the credit day, next credit is next month
  if (nextCredit <= now) {
    nextCredit = new Date(now.getFullYear(), now.getMonth() + 1, day);
  }

  const msLeft = nextCredit.getTime() - now.getTime();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

/**
 * Return the current month key in YYYY-MM format.
 * getMonthKey() → "2025-01"
 * getMonthKey(new Date("2024-06-15")) → "2024-06"
 * @param {Date} [date] - Optional date to derive key from (defaults to now)
 * @returns {string}
 */
export function getMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Get today's date as a YYYY-MM-DD string (local time, not UTC).
 * today() → "2025-01-15"
 */
export function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Calculate the daily budget remaining.
 * dailyBudget(50000, 32000, 8) → 2250
 * @param {number} salary
 * @param {number} totalSpent
 * @param {number} daysLeft
 * @returns {number}
 */
export function dailyBudget(salary, totalSpent, daysLeft) {
  if (daysLeft <= 0) return 0;
  return Math.max(0, Math.round((salary - totalSpent) / daysLeft));
}

/**
 * Download a string as a file in the browser.
 * @param {string} content - File content
 * @param {string} filename - e.g. "expenses.csv"
 * @param {string} [mimeType] - e.g. "text/csv"
 */
export function downloadFile(content, filename, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Convert an array of expense objects to CSV string.
 * @param {Array} expenses
 * @returns {string}
 */
export function expensesToCSV(expenses) {
  const headers = ["Date", "Category", "Amount (₹)", "Note", "Payment", "Recurring"];
  const rows = expenses.map((e) => [
    e.date || "",
    e.category || "",
    e.amount || 0,
    (e.note || "").replace(/,/g, ";"),
    e.payment || "digital",
    e.isRecurring ? "Yes" : "No",
  ]);
  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}
