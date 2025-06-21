
import { Candidate } from "@/types/candidate";

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

const imageIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export const generateFakeCandidate = (): Omit<Candidate, 'id'> => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const party = parties[Math.floor(Math.random() * parties.length)];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  const imageId = imageIds[Math.floor(Math.random() * imageIds.length)];
  
  return {
    name: `${firstName} ${lastName}`,
    party,
    description,
    image: `https://picsum.photos/300/300?random=${imageId}`
  };
};

export const generateFakeCandidates = (count: number): Omit<Candidate, 'id'>[] => {
  return Array.from({ length: count }, () => generateFakeCandidate());
};
