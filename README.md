# 🌍 Personal Carbon Footprint Tracker

A **full-stack web application** that helps individuals track, analyze, and reduce their **carbon footprint** through data-driven insights, gamification, and personalized recommendations.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/junaid-mustafa-006/carbon-footprint-tracker-2k)

---

## Features

- **Carbon Tracking**: Calculate transport & lifestyle footprints using Uber and Weather APIs  
- **AI-Powered Insights**: ML models (Multi-Armed Bandits, LightGBM, Clustering) for personalized recommendations  
- **Gamification**: Progress tracking, badges, and community leaderboard  
- **Push Notifications**: Firebase integration for real-time reminders & tips  
- **Scalable Performance**: Handles 1.5k+ concurrent users, 5k req/sec with <200ms p95 latency (tested with k6)  

---

## Tech Stack

**Frontend**: React, Tailwind CSS  
**Backend**: Node.js, Express  
**Database**: MongoDB  
**ML Models**: Multi-Armed Bandits, LightGBM, Clustering  
**APIs**: Uber API, Weather API  
**Other Tools**: Firebase, Docker, k6 (load testing)  

---

## System Architecture

```mermaid
flowchart TD
  A[Frontend - React] -->|REST API| B[Backend - Node.js/Express]
  B --> C[Database - MongoDB]
  B --> D[Machine Learning Models]
  B --> E[External APIs - Uber/Weather]
  B --> F[Firebase Notifications]
