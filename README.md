# Valentine Interactive Website 💖

A playful, premium Valentine-themed website with interactive buttons, animated visuals, and persistent data storage via Supabase.

## Features
- **Interactive Buttons**: The "No" button playfully moves away, while the "Yes" button grows with every "No" click.
- **Rich Aesthetics**: Glassmorphism UI, floating background animations, and custom typography.
- **Data Persistence**: Tracks user clicks and messages anonymously using `localStorage` and Supabase.
- **Responsive**: Fully optimized for mobile and desktop.
- **Performance**: GPU-accelerated animations and confetti.

## Tech Stack
- **Frontend**: Vanilla JS, HTML5, CSS3 (Vite)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify ready

## Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `db_schema.sql`.
3. Go to **Project Settings > API** and copy your `Project URL` and `anon public` key.

### 2. Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`) and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Local Development
```bash
npm install
npm run dev
```

### 4. Deployment (Netlify)
1. Push your code to a Git repository (GitHub/GitLab).
2. Connect your repository to Netlify.
3. In Netlify, go to **Site Settings > Build & deploy > Environment variables**.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Netlify will automatically detect the Vite build settings (`npm run build`, `dist` directory).

## SQL Schema Overview
The project uses two tables:
- `interactions`: Stores individual user data (`user_id`, click counts, message).
- `global_stats`: Stores aggregate counters across all users.
- An RPC function `increment_global_stats` handles atomic updates to the global counters.

## RLS Policies
- `interactions`: Allows `INSERT` and `UPDATE`. `SELECT` is disabled for public security.
- `global_stats`: Allows `UPDATE` via RPC. `SELECT` is disabled.
