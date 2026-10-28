// Health Tracker - v3 (Chart - Show Simple Graph)
// Roll Number: 24MIS0130

let cachedRecords = [];
let chartInstance = null;
let currentChartMode = 'all';

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
  const avgBPEl = document.getElementById('avgBP');
  const overallStatusEl = document.getElementById('overallStatus');

  // Chart chips
  const chips = document.querySelectorAll('.filter-chip');

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

  // Load records and analytics
  async function refreshData() {
    await Promise.all([loadRecords(), loadAnalytics()]);
  }

  async function loadRecords() {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      cachedRecords = Array.isArray(data) ? data : [];
      renderTable(cachedRecords);
    } catch (err) {
      console.error('Failed to load records:', err);
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: #ef4444;">Error connecting to API.</td></tr>`;
    }
  }

  async function loadAnalytics() {
    try {
      const res = await fetch('/api/analytics');
      const analytics = await res.json();

      totalCountEl.textContent = analytics.metrics.totalEntries;
      avgHREl.textContent = `${analytics.metrics.averageHeartRate} bpm`;
      avgBPEl.textContent = `${analytics.metrics.averageBloodPressure} mmHg`;
      overallStatusEl.textContent = analytics.metrics.trend;

      renderChart(analytics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }

  function renderChart(analytics) {
    const ctx = document.getElementById('healthChart');
    if (!ctx) return;

    const labels = analytics.labels || [];
    const datasets = [];

    if (currentChartMode === 'all' || currentChartMode === 'bp') {
      datasets.push({
        label: 'Systolic BP (mmHg)',
        data: analytics.datasets.systolic,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4,
        yAxisID: 'y'
      });
      datasets.push({
        label: 'Diastolic BP (mmHg)',
        data: analytics.datasets.diastolic,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4,
        yAxisID: 'y'
      });
    }

    if (currentChartMode === 'all' || currentChartMode === 'hr') {
      datasets.push({
        label: 'Heart Rate (BPM)',
        data: analytics.datasets.heartRates,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        tension: 0.35,
        borderWidth: 2.5,
        pointRadius: 4,
        yAxisID: 'y'
      });
    }

    if (currentChartMode === 'steps') {
      datasets.push({
        label: 'Daily Steps',
        data: analytics.datasets.steps,
        type: 'bar',
        backgroundColor: '#10b981',
        borderRadius: 6,
        yAxisID: 'y'
      });
    }

    // Check if Chart.js is available
    if (typeof Chart !== 'undefined') {
      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: currentChartMode === 'steps' ? 'bar' : 'line',
        data: {
          labels: labels,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
              }
            },
            tooltip: {
              padding: 10,
              boxPadding: 4,
              usePointStyle: true
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
            },
            y: {
              beginAtZero: false,
              grid: { color: '#f1f5f9' },
              ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } }
            }
          }
        }
      });
    } else {
      // Fallback Canvas Renderer if Chart.js CDN is unavailable
      renderCanvasFallback(ctx, labels, analytics.datasets.heartRates, analytics.datasets.systolic);
    }
  }

  function renderCanvasFallback(canvas, labels, hrData, bpData) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 280;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px Plus Jakarta Sans';
    ctx.fillText('Health Trends (Heart Rate & Systolic BP)', 20, 24);

    if (!hrData || hrData.length < 2) return;

    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(50, 40);
    ctx.lineTo(50, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    // Draw HR line (Indigo)
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const stepX = (width - 80) / (hrData.length - 1);
    hrData.forEach((val, i) => {
      const x = 50 + i * stepX;
      const y = (height - 40) - (val - 50) * 1.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw BP line (Red)
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    bpData.forEach((val, i) => {
      const x = 50 + i * stepX;
      const y = (height - 40) - (val - 50) * 1.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function renderTable(records) {
    if (!records || records.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">No records found.</td></tr>`;
      return;
    }

    // Show newest first in table
    const displayList = [...records].reverse();

    tableBody.innerHTML = displayList.map(r => {
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

  // Filter chips
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentChartMode = chip.getAttribute('data-chart');
      loadAnalytics();
    });
  });

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
        await refreshData();
      } else {
        alert('Failed to save record.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend API.');
    }
  });

  // Search filter
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

  refreshBtn.addEventListener('click', refreshData);

  // Global delete handler
  window.deleteRecord = async function(id) {
    if (!confirm('Are you sure you want to remove this record?')) return;
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Initial load
  refreshData();
});
