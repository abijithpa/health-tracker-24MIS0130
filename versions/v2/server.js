const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'records.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Seed sample records for v2 View functionality
function getRecords() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = [
        {
          id: 101,
          date: '2026-10-24',
          time: '08:00',
          patientName: 'Alex Morgan',
          heartRate: 70,
          systolicBP: 118,
          diastolicBP: 78,
          bloodGlucose: 92,
          steps: 9100,
          temperature: 98.4,
          notes: 'Morning run completed'
        },
        {
          id: 102,
          date: '2026-10-25',
          time: '08:15',
          patientName: 'Alex Morgan',
          heartRate: 74,
          systolicBP: 122,
          diastolicBP: 82,
          bloodGlucose: 98,
          steps: 8300,
          temperature: 98.6,
          notes: 'Post-breakfast reading'
        },
        {
          id: 103,
          date: '2026-10-26',
          time: '09:00',
          patientName: 'Samira Patel',
          heartRate: 85,
          systolicBP: 135,
          diastolicBP: 88,
          bloodGlucose: 110,
          steps: 6400,
          temperature: 99.1,
          notes: 'Mild fatigue after work'
        },
        {
          id: 104,
          date: '2026-10-27',
          time: '07:45',
          patientName: 'Alex Morgan',
          heartRate: 68,
          systolicBP: 115,
          diastolicBP: 76,
          bloodGlucose: 89,
          steps: 10250,
          temperature: 98.5,
          notes: 'Restful sleep, feeling great'
        },
        {
          id: 105,
          date: '2026-10-28',
          time: '08:30',
          patientName: 'Samira Patel',
          heartRate: 78,
          systolicBP: 124,
          diastolicBP: 80,
          bloodGlucose: 96,
          steps: 7800,
          temperature: 98.6,
          notes: 'Regular checkup vitals'
        }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading records:', err);
    return [];
  }
}

function saveRecords(records) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
  } catch (err) {
    console.error('Error writing records:', err);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: 'v2',
    feature: 'View – Display records',
    rollNumber: '24MIS0130',
    timestamp: new Date().toISOString()
  });
});

// v2 Feature: GET all records (View / Display)
app.get('/api/records', (req, res) => {
  const records = getRecords();
  res.json(records);
});

// v1 Feature: Enter Data (POST)
app.post('/api/records', (req, res) => {
  const {
    patientName,
    heartRate,
    systolicBP,
    diastolicBP,
    bloodGlucose,
    steps,
    temperature,
    notes,
    date,
    time
  } = req.body;

  if (!heartRate || !systolicBP || !diastolicBP) {
    return res.status(400).json({ error: 'Heart Rate, Systolic BP, and Diastolic BP are required.' });
  }

  const records = getRecords();
  const newRecord = {
    id: Date.now(),
    patientName: patientName || 'Self',
    date: date || new Date().toISOString().split('T')[0],
    time: time || new Date().toTimeString().slice(0, 5),
    heartRate: Number(heartRate),
    systolicBP: Number(systolicBP),
    diastolicBP: Number(diastolicBP),
    bloodGlucose: bloodGlucose ? Number(bloodGlucose) : null,
    steps: steps ? Number(steps) : null,
    temperature: temperature ? Number(temperature) : 98.6,
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  records.unshift(newRecord); // Add to beginning for newest first
  saveRecords(records);

  res.status(201).json({
    message: 'Record added successfully!',
    record: newRecord,
    version: 'v2'
  });
});

// Delete record endpoint
app.delete('/api/records/:id', (req, res) => {
  const recordId = Number(req.params.id);
  let records = getRecords();
  const initialLength = records.length;
  records = records.filter(r => r.id !== recordId);

  if (records.length === initialLength) {
    return res.status(404).json({ error: 'Record not found' });
  }

  saveRecords(records);
  res.json({ message: 'Record deleted successfully', id: recordId });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`Health Tracker [v2] - View (Display Records)`);
  console.log(`Student Roll No: 24MIS0130`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
