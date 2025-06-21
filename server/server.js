import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const allowedOrigins = ["https://frontend-ntcz.onrender.com"];
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Log all REST API calls
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  if (req.method !== 'GET') {
    console.log('Payload:', req.body);
  }
  next();
});

// Database setup
const dbFile = join(__dirname, 'data.json');
const adapter = new JSONFile(dbFile);
const db = new Low(adapter);

// Initialize database with default data
await db.read();
db.data ||= { candidates: [] };

// If no candidates exist, load initial data
if (db.data.candidates.length === 0) {
  const initialCandidates = [
    {
      id: "1",
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face",
      party: "Progressive Party",
      description: "Sarah Johnson is a dedicated public servant with over 15 years of experience in local government. She has championed environmental initiatives, affordable housing programs, and educational reform. Her background includes a Master's degree in Public Policy from Harvard University and previous roles as City Council member and Deputy Mayor. Sarah is known for her collaborative approach to governance and her commitment to transparency in government operations."
    },
    {
      id: "2",
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop&crop=face",
      party: "Citizens Alliance",
      description: "Michael Chen brings a unique perspective to politics with his background as a successful entrepreneur and community organizer. Having founded three tech startups and served on multiple nonprofit boards, he understands both the private sector and community needs. Michael holds an MBA from Stanford and has been instrumental in bringing high-tech jobs to the region. His platform focuses on economic development, digital infrastructure, and supporting small businesses."
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      image: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=400&fit=crop&crop=face",
      party: "Healthcare First",
      description: "Dr. Emily Rodriguez is a practicing physician and healthcare policy expert who has dedicated her career to improving public health outcomes. With 20 years of experience in emergency medicine and public health administration, she has led initiatives to expand healthcare access in underserved communities. Dr. Rodriguez earned her MD from Johns Hopkins and her MPH from the CDC. She is passionate about preventive care, mental health services, and addressing health disparities."
    }
  ];
  db.data.candidates = initialCandidates;
  await db.write();
}

// Fake data generator
const firstNames = [
  "Alexander", "Elizabeth", "Michael", "Sarah", "David", "Jennifer", "Robert", "Jessica", 
  "William", "Emily", "James", "Ashley", "John", "Amanda", "Christopher", "Stephanie",
  "Daniel", "Melissa", "Matthew", "Nicole", "Anthony", "Samantha", "Mark", "Rachel",
  "Donald", "Catherine", "Steven", "Deborah", "Paul", "Sharon", "Andrew", "Cynthia"
];

const lastNames = [
  "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
  "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor",
  "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris",
  "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen"
];

const parties = [
  "Democratic Party", "Republican Party", "Green Party", "Libertarian Party", 
  "Independent", "Progressive Party", "Constitution Party"
];

const descriptions = [
  "A dedicated public servant committed to transparent governance and community development.",
  "An experienced leader focused on economic growth and fiscal responsibility.",
  "A passionate advocate for environmental protection and sustainable policies.",
  "A champion of individual rights and limited government intervention.",
  "A pragmatic problem-solver bringing fresh perspectives to traditional challenges.",
  "An accomplished professional with a track record of bipartisan cooperation.",
  "A grassroots organizer dedicated to social justice and equality.",
  "A business leader committed to innovation and job creation."
];

const generateFakeCandidate = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const party = parties[Math.floor(Math.random() * parties.length)];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  const imageId = Math.floor(Math.random() * 20) + 1;
  
  return {
    id: uuidv4(),
    name: `${firstName} ${lastName}`,
    party,
    description,
    image: `https://picsum.photos/300/300?random=${imageId}`
  };
};

// REST API Routes
app.get('/api/candidates', async (req, res) => {
  try {
    await db.read();
    res.json(db.data.candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const newCandidate = {
      id: uuidv4(),
      ...req.body
    };
    
    await db.read();
    db.data.candidates.push(newCandidate);
    await db.write();
    
    // Emit to all connected clients
    io.emit('candidateAdded', newCandidate);
    
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

app.put('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.read();
    
    const candidateIndex = db.data.candidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    db.data.candidates[candidateIndex] = { ...db.data.candidates[candidateIndex], ...req.body };
    await db.write();
    
    // Emit to all connected clients
    io.emit('candidateUpdated', db.data.candidates[candidateIndex]);
    
    res.json(db.data.candidates[candidateIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

app.delete('/api/candidates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.read();
    
    const candidateIndex = db.data.candidates.findIndex(c => c.id === id);
    if (candidateIndex === -1) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    const deletedCandidate = db.data.candidates.splice(candidateIndex, 1)[0];
    await db.write();
    
    // Emit to all connected clients
    io.emit('candidateDeleted', { id });
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  
  // Log all WebSocket events received from this client
  socket.onAny((event, ...args) => {
    console.log(`[WS] Event: ${event}`, ...args);
  });
  
  // Handle fake data generation request
  socket.on('generateFakeData', async (count = 1) => {
    console.log(`Generating ${count} fake candidates...`);
    
    for (let i = 0; i < count; i++) {
      const newCandidate = generateFakeCandidate();
      
      // Add to database
      await db.read();
      db.data.candidates.push(newCandidate);
      await db.write();
      
      // Emit to all clients with a delay for visual effect
      setTimeout(() => {
        io.emit('candidateAdded', newCandidate);
      }, i * 500); // 500ms delay between each candidate
    }
    
    socket.emit('fakeDataGenerationComplete', { count });
  });
  
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Accessible at http://10.220.16.244:${PORT}`);
}); 