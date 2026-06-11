# 🏏 Cricket Intelligence Analytics Hub

A centralized analytics platform designed for tracking real-time player performance statistics, parsing historical tournament arrays, computing advanced athletic metrics, and generating automated insight reports. Built with a containerized, decoupled architecture, the platform features a lightweight Python Flask backend API and a fast React frontend application powered by Vite.

---

## 🏗️ Repository Architecture & Directory Layout

The workspace is organized as a multi-container monorepo structured for independent development and unified containerized deployment using Docker Compose:

```text
cricket-intelligence-hub/
├── docker-compose.yml                  # Root orchestration for backend and frontend services
├── cricket-intelligence-backend/       # Python Flask REST API backend engine
│   ├── app.py                          # Core application entrypoint and analytical routes
│   ├── Dockerfile                      # Backend container configuration
│   ├── requirements.txt                # Python package dependency manifest
│   ├── package-lock.json               # Package tracking configuration
│   └── uploads/                        # Dedicated image store for player and match imagery
└── cricket-intelligence-frontend/      # React SPA dashboard engineered with Vite
    ├── Dockerfile                      # Frontend build containerization profile
    ├── nginx.conf                      # Production reverse-proxy and staging server map
    ├── index.html                      # DOM entryway asset
    ├── package.json                    # Node ecosystem script definitions
    ├── vite.config.js                  # Vite compilation configurations
    ├── eslint.config.js                # Code linting framework configuration
    ├── public/                         # Static icons and graphic elements
    └── src/
        ├── main.jsx                    # Virtual DOM mounting script[cite: 2]
        ├── App.jsx                     # High-level routing shell and layout structure[cite: 2]
        ├── App.css                     # Primary visual presentation styling[cite: 2]
        ├── api.js                      # Centralized fetch client handling backend API transactions[cite: 2]
        ├── index.css                   # Tailwind baseline styles and root utilities[cite: 2]
        ├── components/                 # Component pool (e.g., Skeleton loaders)[cite: 2]
        ├── context/                    # Shared context objects (Auth, Theme, Toast telemetry)[cite: 2]
        ├── hooks/                      # Custom React hooks (useIntelligence processing hook)[cite: 2]
        └── pages/                      # Dashboard, Player Management, Match Logs, and Performance panels[cite: 2]

🛠️ Technology Stack

Backend Engine

[cite: 2]
Framework: Python Flask (Micro-framework optimized for analytical workflows and JSON processing)[cite: 2].

Image Delivery: Local storage volume routing via the /uploads registry for serving match files[cite: 2].

Frontend Dashboard

[cite: 2]
Build toolchain: React 18+ orchestrated via Vite for near-instant hot module replacement[cite: 2].

State & Telemetry: Component-driven state augmented by Context Providers handling authentication state, UI themes, and pop-up toast alerts[cite: 2].

Dynamic Views: Modular layout pages including Dashboard.jsx, Performance.jsx, Matches.jsx, and DataUpload.jsx[cite: 2].

🚀 Deployment & Installation

Option 1: Unified Microservice Deployment (Recommended)

Deploy the entire environment (Backend API + Frontend Dashboard) with a single command using Docker Compose[cite: 2]:

Bash

# Navigate to the project root and spin up the multi-container stack

docker-compose up --build
Once live, the analytical frontend interface will be accessible at http://localhost:80 (or your mapped proxy port)[cite: 2].

Option 2: Bare-Metal Manual Installation

1. Launch the Backend API
[cite: 2]

cd cricket-intelligence-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

pip install -r requirements.txt
python app.py

2. Launch the Frontend Dev Engine
[cite: 2]

cd cricket-intelligence-frontend
npm install
npm run dev
