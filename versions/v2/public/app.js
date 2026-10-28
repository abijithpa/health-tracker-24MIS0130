// Health Tracker - v2 (View - Display Records)
// Roll Number: 24MIS0130

let cachedRecords = [];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('healthForm');
  const dateInput = document.getElementById('recordDate');
  const timeInput = document.getElementById('recordTime');
  const tableBody = document.getElementById('recordsTableBody');
  const searchInput = document.getElementById('searchInput');
  const refreshBtn = document.getElementById('refreshBtn');

  // Stats elements
  const totalCountEl = document.getElementById('totalRecordsCount');
  const avgHREl = document.getElementById('avgHeartRate');
  const latestBPEl = document.getElementById('latestBP');

  // Default date and time
  const now = new Date();
  dateInput.value = now.toISOString().split('T')[0];
  timeInput.value = now.toTimeString().slice(0, 5);

  function getBPStatus(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', class: 'status-normal' };
    if (systolic <= 129 && diastolic < 80) return { label: 'Elevated', class: 'status-elevated' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'Stage 2 HTN', class: 'status-high' };
    return { label: 'Pre-HTN', class: 'status-elevated' };
  }

  // Fetch & render records
  async function loadRecords() {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      cachedRecords = Array.isArray(data) ? data : [];
      renderTable(cachedRecords);
      updateStats(cachedRecords);
    } catch (err) {
      console.error('Failed to load records:', err);
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: #ef4444;">Error connecting to API.</td></tr>`;
    }
  }

  function renderTable(records) {
    if (!records || records.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">No health records found. Enter a record below to populate!</td></tr>`;
      return;
    }

    tableBody.innerHTML = records.map(r => {
      const bpStatus = getBPStatus(r.systolicBP, r.diastolicBP);
      return `
        <tr>
          <td>
            <strong>${r.date}</strong><br>
            <span style="font-size: 0.75rem; color: #64748b;">${r.time || ''}</span>
          </td>
          <td><strong>${r.patientName || 'Self'}</strong></td>
          <td>${r.systolicBP} / ${r.diastolicBP} <span style="font-size: 0.75rem; color: #64748b;">mmHg</span></td>
          <td><strong>${r.heartRate}</strong> <span style="font-size: 0.75rem; color: #64748b;">bpm</span></td>
          <td>${r.bloodGlucose ? `${r.bloodGlucose} mg/dL` : '—'}</td>
          <td>${r.steps ? Number(r.steps).toLocaleString() : '—'}</td>
          <td><span class="status-pill ${bpStatus.class}">${bpStatus.label}</span></td>
          <td>
            <button class="delete-btn" onclick="deleteRecord(${r.id})">Delete</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateStats(records) {
    totalCountEl.textContent = records.length;
    if (records.length > 0) {
      const sumHR = records.reduce((acc, curr) => acc + (Number(curr.heartRate) || 0), 0);
      const avg = Math.round(sumHR / records.length);
      avgHREl.textContent = `${avg} bpm`;

      const latest = records[0];
      latestBPEl.textContent = `${latest.systolicBP}/${latest.diastolicBP}`;
    } else {
      avgHREl.textContent = '--';
      latestBPEl.textContent = '--';
    }
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
      patientName: formData.get('patientName'),
      date: formData.get('date'),
      time: formData.get('time'),
      heartRate: formData.get('heartRate'),
      systolicBP: formData.get('systolicBP'),
      diastolicBP: formData.get('diastolicBP'),
      bloodGlucose: formData.get('bloodGlucose'),
      steps: formData.get('steps'),
      temperature: formData.get('temperature'),
      notes: formData.get('notes')
    };

    try {
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        form.reset();
        dateInput.value = now.toISOString().split('T')[0];
        timeInput.value = now.toTimeString().slice(0, 5);
        await loadRecords();
      } else {
        alert('Failed to save record.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend API.');
    }
  });

  // Filter / Search
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderTable(cachedRecords);
      return;
    }
    const filtered = cachedRecords.filter(r => 
      (r.patientName && r.patientName.toLowerCase().includes(term)) ||
      (r.date && r.date.includes(term)) ||
      (r.notes && r.notes.toLowerCase().includes(term))
    );
    renderTable(filtered);
  });

  refreshBtn.addEventListener('click', loadRecords);

  // Global delete handler
  window.deleteRecord = async function(id) {
    if (!confirm('Are you sure you want to remove this record?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadRecords();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Initial load
  loadRecords();
});
