# Candidate Management System

A full-stack candidate management application with real-time updates and persistent data storage.

## Project info

**URL**: https://lovable.dev/projects/1e29fd88-d68e-4e51-bd3e-22435db6faa5

## Features

- **Real-time updates** via WebSocket connections
- **Persistent data storage** using Express.js backend
- **Async fake data generation** through WebSocket
- **Modern UI** built with React, TypeScript, and shadcn/ui
- **Responsive design** with Tailwind CSS

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Socket.io
- **Database**: JSON file storage (lowdb)
- **Real-time**: WebSocket communication

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/1e29fd88-d68e-4e51-bd3e-22435db6faa5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install frontend dependencies.
npm i

# Step 4: Install backend dependencies.
cd server
npm i
cd ..

# Step 5: Start the backend server (in one terminal).
cd server
npm run dev

# Step 6: Start the frontend development server (in another terminal).
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Socket.io Client
- React Query

### Backend
- Express.js
- Socket.io
- lowdb (JSON database)
- CORS
- UUID generation

## API Endpoints

- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create a new candidate
- `PUT /api/candidates/:id` - Update a candidate
- `DELETE /api/candidates/:id` - Delete a candidate

## WebSocket Events

- `generateFakeData` - Generate fake candidates
- `candidateAdded` - New candidate created
- `candidateUpdated` - Candidate updated
- `candidateDeleted` - Candidate deleted
- `fakeDataGenerationComplete` - Fake data generation finished

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1e29fd88-d68e-4e51-bd3e-22435db6faa5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
