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

// Helper to read data
function getRecords() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = [
        {
          id: 1,
          date: '2026-10-25',
          time: '08:30',
          patientName: 'Alex Morgan',
          heartRate: 72,
          systolicBP: 120,
          diastolicBP: 80,
          bloodGlucose: 95,
          steps: 8200,
          temperature: 98.6,
          notes: 'Morning routine checkup'
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

// Helper to save data
function saveRecords(records) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
  } catch (err) {
    console.error('Error writing records:', err);
  }
}

// Health check endpoint for Docker & K8s
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    version: 'v1',
    feature: 'Enter Data – Input health values',
    rollNumber: '24MIS0130',
    timestamp: new Date().toISOString()
  });
});

// v1 Primary Feature: Enter Data (POST)
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

  records.push(newRecord);
  saveRecords(records);

  res.status(201).json({
    message: 'Health record entered and saved successfully!',
    record: newRecord,
    version: 'v1'
  });
});

// Simple API endpoint to fetch record count
app.get('/api/records/count', (req, res) => {
  const records = getRecords();
  res.json({ count: records.length, version: 'v1' });
});

// Simple test endpoint
app.get('/api/records', (req, res) => {
  const records = getRecords();
  res.json(records);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`Health Tracker [v1] - Enter Data (Input Health Values)`);
  console.log(`Student Roll No: 24MIS0130`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
