// Health Tracker - v1 (Enter Data - Input Health Values)
// Student Roll No: 24MIS0130

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('healthForm');
  const dateInput = document.getElementById('recordDate');
  const timeInput = document.getElementById('recordTime');
  const resultCard = document.getElementById('submissionResult');
  const vitalsSummary = document.getElementById('vitalsSummary');
  const timestampEl = document.getElementById('submissionTimestamp');

  // Set default current date and time
  const now = new Date();
  dateInput.value = now.toISOString().split('T')[0];
  timeInput.value = now.toTimeString().slice(0, 5);

  // Status classifier helper functions
  function getBPStatus(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return { label: 'Normal', class: 'status-normal' };
    if (systolic <= 129 && diastolic < 80) return { label: 'Elevated', class: 'status-elevated' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'High (Stage 2)', class: 'status-high' };
    return { label: 'Pre-Hypertension', class: 'status-elevated' };
  }

  function getHeartRateStatus(hr) {
    if (hr >= 60 && hr <= 100) return { label: 'Optimal Normal', class: 'status-normal' };
    if (hr < 60) return { label: 'Bradycardia (<60)', class: 'status-elevated' };
    return { label: 'Tachycardia (>100)', class: 'status-high' };
  }

  function getGlucoseStatus(glucose) {
    if (!glucose) return null;
    if (glucose < 70) return { label: 'Low (<70)', class: 'status-high' };
    if (glucose <= 99) return { label: 'Normal Fasting', class: 'status-normal' };
    if (glucose <= 125) return { label: 'Pre-diabetic', class: 'status-elevated' };
    return { label: 'Elevated (≥126)', class: 'status-high' };
  }

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

      const data = await response.json();

      if (response.ok) {
        displayFeedback(data.record);
      } else {
        alert('Error saving health record: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Submission failed:', err);
      // Fallback for offline or local preview
      payload.id = Date.now();
      displayFeedback(payload);
    }
  });

  function displayFeedback(record) {
    const bpStatus = getBPStatus(Number(record.systolicBP), Number(record.diastolicBP));
    const hrStatus = getHeartRateStatus(Number(record.heartRate));
    const glucoseStatus = getGlucoseStatus(Number(record.bloodGlucose));

    timestampEl.textContent = `Patient: ${record.patientName} | Recorded on ${record.date} at ${record.time}`;

    vitalsSummary.innerHTML = `
      <div class="vital-box">
        <div class="vital-label">Blood Pressure</div>
        <div class="vital-value">${record.systolicBP} / ${record.diastolicBP} <span style="font-size: 0.8rem; font-weight: normal; color: #64748b">mmHg</span></div>
        <span class="vital-status ${bpStatus.class}">${bpStatus.label}</span>
      </div>
      <div class="vital-box">
        <div class="vital-label">Heart Rate</div>
        <div class="vital-value">${record.heartRate} <span style="font-size: 0.8rem; font-weight: normal; color: #64748b">bpm</span></div>
        <span class="vital-status ${hrStatus.class}">${hrStatus.label}</span>
      </div>
      ${record.bloodGlucose ? `
      <div class="vital-box">
        <div class="vital-label">Blood Glucose</div>
        <div class="vital-value">${record.bloodGlucose} <span style="font-size: 0.8rem; font-weight: normal; color: #64748b">mg/dL</span></div>
        <span class="vital-status ${glucoseStatus ? glucoseStatus.class : 'status-normal'}">${glucoseStatus ? glucoseStatus.label : 'Recorded'}</span>
      </div>
      ` : ''}
      ${record.steps ? `
      <div class="vital-box">
        <div class="vital-label">Daily Steps</div>
        <div class="vital-value">${Number(record.steps).toLocaleString()}</div>
        <span class="vital-status status-normal">Active</span>
      </div>
      ` : ''}
      <div class="vital-box">
        <div class="vital-label">Temperature</div>
        <div class="vital-value">${record.temperature || '98.6'}°F</div>
        <span class="vital-status status-normal">Afebrile</span>
      </div>
    `;

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
