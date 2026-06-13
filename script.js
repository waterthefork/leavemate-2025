const dateList = document.getElementById('date-list');
const subjectResultsDiv = document.getElementById('subject-results');
let absentDates = [];

// Set default values
document.addEventListener('DOMContentLoaded', () => {
  // Set default values for subject fields
  const subjects = {
    'chem': 38,
    'maths': 22,
    'ipr': 21,
    'fch': 23,
    'dm': 30,
    'c': 36,
    'itw': 14
  };
  
  for (const [subjectCode, defaultValue] of Object.entries(subjects)) {
    const input = document.getElementById(`${subjectCode}-total`);
    if (input) input.value = defaultValue;
  }
});

function addDate() {
  const datePicker = document.getElementById('datePicker');
  const subjectSelect = document.getElementById('subject-select');
  const dateValue = datePicker.value;
  const selectedSubject = subjectSelect.value;
  
  if (!dateValue) {
    alert('Please select a valid date!');
    return;
  }
  
  const dateSubjectKey = `${dateValue}-${selectedSubject}`;
  
  if (absentDates.some(item => item.key === dateSubjectKey)) {
    alert('This date for this subject is already added!');
    return;
  }
  
  const newAbsence = {
    key: dateSubjectKey,
    date: dateValue,
    subject: selectedSubject
  };
  
  absentDates.push(newAbsence);
  
  const li = document.createElement('li');
  li.textContent = `${dateValue} (${selectedSubject.toUpperCase()})`;
  
  const removeBtn = document.createElement('button');
  removeBtn.textContent = '❌';
  removeBtn.classList.add('remove-btn');
  removeBtn.onclick = () => {
    absentDates = absentDates.filter(item => item.key !== dateSubjectKey);
    li.remove();
  };
  
  li.appendChild(removeBtn);
  dateList.appendChild(li);
  datePicker.value = '';
}

function calculateAttendance() {
  // Calculate attendance for each subject
  calculateSubjectAttendance();
}

function getCurrentAttendance(subjectCode) {
  // Get current attendance value from input
  const attendanceType = document.querySelector(`input[name="${subjectCode}-attendance-type"]:checked`).value;
  const attendanceInput = document.getElementById(`${subjectCode}-current-attendance`);
  const attendanceValue = parseFloat(attendanceInput.value);
  
  if (isNaN(attendanceValue) || attendanceValue < 0) {
    return null;
  }
  
  return {
    type: attendanceType,
    value: attendanceValue
  };
}

function calculateSubjectAttendance() {
  subjectResultsDiv.innerHTML = ''; // Clear previous results
  
  const subjects = [
    { code: 'chem', name: 'Chemistry', total: document.getElementById('chem-total').value },
    { code: 'maths', name: 'Mathematics', total: document.getElementById('maths-total').value },
    { code: 'ipr', name: 'IPR', total: document.getElementById('ipr-total').value },
    { code: 'fch', name: 'FCH', total: document.getElementById('fch-total').value },
    { code: 'dm', name: 'Discrete Mathematics', total: document.getElementById('dm-total').value },
    { code: 'c', name: 'C Programming', total: document.getElementById('c-total').value },
    { code: 'itw', name: 'IT Workshop', total: document.getElementById('itw-total').value }
  ];
  
  const resultsTable = document.createElement('table');
  resultsTable.innerHTML = `
    <thead>
      <tr>
        <th>Subject</th>
        <th>Total Classes</th>
        <th>Classes Attended</th>
        <th>Current %</th>
        <th>New Absences</th>
        <th>Final %</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody id="subject-table-body">
    </tbody>
  `;
  
  const tableBody = resultsTable.querySelector('#subject-table-body');
  
  // Calculate overall stats
  let totalClasses = 0;
  let totalAttended = 0;
  let totalNewAbsences = 0;
  
  subjects.forEach(subject => {
    const classes = parseInt(subject.total);
    if (!classes || classes <= 0) return;
    
    // Get current attendance data
    const currentAttendance = getCurrentAttendance(subject.code);
    if (!currentAttendance) return;
    
    let classesAttended = 0;
    if (currentAttendance.type === 'percentage') {
      // If user entered a percentage
      classesAttended = Math.round((currentAttendance.value / 100) * classes);
    } else {
      // If user entered number of classes
      classesAttended = Math.min(currentAttendance.value, classes);
    }
    
    const subjectNewAbsences = absentDates.filter(item => item.subject === subject.code).length;
    
    // Final attendance after new absences
    const finalAttendance = ((classesAttended - subjectNewAbsences) / classes) * 100;
    
    // Add to totals for overall calculation
    totalClasses += classes;
    totalAttended += classesAttended;
    totalNewAbsences += subjectNewAbsences;
    
    const row = document.createElement('tr');
    
    let statusMessage = '';
    let statusClass = '';
    
    if (finalAttendance < 75) {
      const totalPresent = classesAttended - subjectNewAbsences;
      const neededClasses = Math.ceil((75 * classes - totalPresent * 100) / (100 - 75));
      statusMessage = `Need ${neededClasses} more`;
      statusClass = 'danger';
    } else {
      statusMessage = 'Safe ✅';
      statusClass = 'success';
    }
    
    const currentAttendancePercentage = (classesAttended / classes) * 100;
    
    row.innerHTML = `
      <td>${subject.name}</td>
      <td>${classes}</td>
      <td>${classesAttended}</td>
      <td>${currentAttendancePercentage.toFixed(2)}%</td>
      <td>${subjectNewAbsences}</td>
      <td>${finalAttendance.toFixed(2)}%</td>
      <td class="${statusClass}">${statusMessage}</td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add overall row
  const overallAttendance = (totalAttended / totalClasses) * 100;
  const overallFinalAttendance = ((totalAttended - totalNewAbsences) / totalClasses) * 100;
  
  let overallStatusMessage = '';
  let overallStatusClass = '';
  
  if (overallFinalAttendance < 75) {
    const totalPresent = totalAttended - totalNewAbsences;
    const overallNeededClasses = Math.ceil((75 * totalClasses - totalPresent * 100) / (100 - 75));
    overallStatusMessage = `Need ${overallNeededClasses} more`;
    overallStatusClass = 'danger';
  } else {
    overallStatusMessage = 'Safe ✅';
    overallStatusClass = 'success';
  }
  
  const overallRow = document.createElement('tr');
  overallRow.classList.add('overall-row');
  overallRow.innerHTML = `
    <td><strong>OVERALL</strong></td>
    <td><strong>${totalClasses}</strong></td>
    <td><strong>${totalAttended}</strong></td>
    <td><strong>${overallAttendance.toFixed(2)}%</strong></td>
    <td><strong>${totalNewAbsences}</strong></td>
    <td><strong>${overallFinalAttendance.toFixed(2)}%</strong></td>
    <td class="${overallStatusClass}"><strong>${overallStatusMessage}</strong></td>
  `;
  
  tableBody.appendChild(overallRow);
  subjectResultsDiv.appendChild(resultsTable);
}