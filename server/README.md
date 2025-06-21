# Candidate Management Backend

A Node.js/Express.js backend server with WebSocket support for real-time candidate management.

## Features

- **RESTful API** for CRUD operations on candidates
- **WebSocket support** for real-time updates
- **Persistent data storage** using lowdb (JSON file)
- **Async fake data generation** via WebSocket
- **CORS enabled** for frontend integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The server will start on port 3001 by default.

## API Endpoints

### GET /api/candidates
Get all candidates

### POST /api/candidates
Create a new candidate
```json
{
  "name": "John Doe",
  "party": "Democratic Party",
  "description": "A dedicated public servant...",
  "image": "https://example.com/image.jpg"
}
```

### PUT /api/candidates/:id
Update an existing candidate

### DELETE /api/candidates/:id
Delete a candidate

## WebSocket Events

### Client to Server
- `generateFakeData` - Generate fake candidates (optional count parameter)

### Server to Client
- `candidateAdded` - New candidate created
- `candidateUpdated` - Candidate updated
- `candidateDeleted` - Candidate deleted
- `fakeDataGenerationComplete` - Fake data generation finished

## Data Storage

Data is stored in `data.json` in the server directory. The file is automatically created with initial sample data if it doesn't exist.

## Environment Variables

- `PORT` - Server port (default: 3001)

## Development

The server uses nodemon for automatic restarting during development. Any changes to the server files will trigger a restart. 