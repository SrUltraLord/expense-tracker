import axios from "axios";

export const googleSheetsClient = axios.create({
  baseURL: "https://sheets.googleapis.com/v4/spreadsheets",
  headers: { "Content-Type": "application/json" },
});

export const googleOAuthClient = axios.create({
  baseURL: "https://oauth2.googleapis.com",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});

export const telegramClient = axios.create({
  baseURL: "https://api.telegram.org",
});
