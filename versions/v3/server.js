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

// Seed historical biometric data for v3 Graph & Analytics visualization
function getRecords() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initialData = [
        {
          id: 201,
          date: '2026-10-22',
          time: '08:00',
          patientName: 'Alex Morgan',
          heartRate: 75,
          systolicBP: 125,
          diastolicBP: 82,
          bloodGlucose: 99,
          steps: 7200,
          temperature: 98.6,
          notes: 'Baseline Monday recording'
        },
        {
          id: 202,
          date: '2026-10-23',
          time: '08:15',
          patientName: 'Alex Morgan',
          heartRate: 72,
          systolicBP: 120,
          diastolicBP: 80,
          bloodGlucose: 94,
          steps: 8600,
          temperature: 98.4,
          notes: 'Morning brisk walk'
        },
        {
          id: 203,
          date: '2026-10-24',
          time: '08:00',
          patientName: 'Alex Morgan',
          heartRate: 70,
          systolicBP: 118,
          diastolicBP: 78,
          bloodGlucose: 92,
          steps: 9400,
          temperature: 98.4,
          notes: 'Cardio training completed'
        },
        {
          id: 204,
          date: '2026-10-25',
          time: '08:30',
          patientName: 'Alex Morgan',
          heartRate: 74,
          systolicBP: 122,
          diastolicBP: 81,
          bloodGlucose: 95,
          steps: 8100,
          temperature: 98.6,
          notes: 'Standard checkup'
        },
        {
          id: 205,
          date: '2026-10-26',
          time: '07:50',
          patientName: 'Alex Morgan',
          heartRate: 78,
          systolicBP: 128,
          diastolicBP: 84,
          bloodGlucose: 104,
          steps: 6700,
          temperature: 98.8,
          notes: 'Stressful workday'
        },
        {
          id: 206,
          date: '2026-10-27',
          time: '08:10',
          patientName: 'Alex Morgan',
          heartRate: 69,
          systolicBP: 117,
          diastolicBP: 77,
          bloodGlucose: 91,
          steps: 10500,
          temperature: 98.5,
          notes: 'Hydrated, 10k steps achieved'
        },
        {
          id: 207,
          date: '2026-10-28',
          time: '08:25',
          patientName: 'Alex Morgan',
          heartRate: 71,
          systolicBP: 119,
          diastolicBP: 79,
          bloodGlucose: 93,
          steps: 9200,
          temperature: 98.6,
          notes: 'Healthy vitals maintained'
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
    version: 'v3',
    feature: 'Chart – Show simple graph',
    rollNumber: '24MIS0130',
    timestamp: new Date().toISOString()
  });
});

// GET all records
app.get('/api/records', (req, res) => {
  const records = getRecords();
  res.json(records);
});

// v3 Feature: GET time-series chart analytics
app.get('/api/analytics', (req, res) => {
  const records = getRecords();
  // Sort chronologically for chart
  const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = sorted.map(r => r.date);
  const heartRates = sorted.map(r => r.heartRate);
  const systolic = sorted.map(r => r.systolicBP);
  const diastolic = sorted.map(r => r.diastolicBP);
  const steps = sorted.map(r => r.steps || 0);

  const avgHR = heartRates.length ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length) : 0;
  const avgSys = systolic.length ? Math.round(systolic.reduce((a, b) => a + b, 0) / systolic.length) : 0;
  const avgDia = diastolic.length ? Math.round(diastolic.reduce((a, b) => a + b, 0) / diastolic.length) : 0;

  res.json({
    labels,
    datasets: {
      heartRates,
      systolic,
      diastolic,
      steps
    },
    metrics: {
      averageHeartRate: avgHR,
      averageBloodPressure: `${avgSys}/${avgDia}`,
      totalEntries: records.length,
      trend: avgSys < 125 ? 'Normal / Healthy' : 'Monitor Regularly'
    }
  });
});

// POST new record
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
    message: 'Health record logged and graphed successfully!',
    record: newRecord,
    version: 'v3'
  });
});

// DELETE record
app.delete('/api/records/:id', (req, res) => {
  const recordId = Number(req.params.id);
  let records = getRecords();
  const initialLength = records.length;
  records = records.filter(r => r.id !== recordId);

  if (records.length === initialLength) {
    return res.status(404).json({ error: 'Record not found' });
  }

  saveRecords(records);
  res.json({ message: 'Record removed successfully', id: recordId });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`Health Tracker [v3] - Chart (Show Simple Graph)`);
  console.log(`Student Roll No: 24MIS0130`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
