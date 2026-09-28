const STORAGE_KEYS = {
  users: 'schoolUsers',
  appointments: 'schoolAppointments',
  loggedInUser: 'schoolLoggedInUser',
};

const defaultUsers = [
  {
    id: 1,
    fullName: 'Admin User',
    studentId: 'ADMIN-001',
    email: 'admin@school.edu',
    password: 'admin123',
    userType: 'admin',
  },
  {
    id: 2,
    fullName: 'Juan Dela Cruz',
    studentId: '2025-001',
    email: 'juan@student.edu',
    password: 'student123',
    userType: 'student',
  },
];

const defaultAppointments = [
  {
    id: 1,
    studentId: '2025-001',
    studentName: 'Juan Dela Cruz',
    office: 'Guidance Office',
    date: '2025-10-05',
    time: '09:00',
    purpose: 'Guidance Counseling',
    notes: 'Academic stress and schedule assistance',
    status: 'Pending',
  },
  {
    id: 2,
    studentId: '2025-001',
    studentName: 'Juan Dela Cruz',
    office: 'Teacher Consultation',
    date: '2025-10-09',
    time: '10:30',
    purpose: 'Teacher Consultation',
    notes: 'Need help with Biology class notes',
    status: 'Approved',
  },
  {
    id: 3,
    studentId: '2025-001',
    studentName: 'Juan Dela Cruz',
    office: 'Academic Office',
    date: '2025-10-11',
    time: '13:00',
    purpose: 'Academic Concern',
    notes: 'Finalizing enrollment forms',
    status: 'Cancelled',
  },
];

const state = {
  users: loadStorage(STORAGE_KEYS.users, defaultUsers),
  appointments: loadStorage(STORAGE_KEYS.appointments, defaultAppointments),
  currentUser: loadStorage(STORAGE_KEYS.loggedInUser, null),
};

function loadStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
  return state.currentUser;
}

function renderUserSummary() {
  const currentUser = getCurrentUser();
  const stats = {
    total: 0,
    pending: 0,
    approved: 0,
    cancelled: 0,
  };

  const userAppointments = state.appointments.filter((item) => item.studentId === currentUser?.studentId);

  userAppointments.forEach((item) => {
    stats.total += 1;
    if (item.status === 'Pending') stats.pending += 1;
    if (item.status === 'Approved') stats.approved += 1;
    if (item.status === 'Cancelled') stats.cancelled += 1;
  });

  document.getElementById('appTotal').textContent = stats.total;
  document.getElementById('pendingTotal').textContent = stats.pending;
  document.getElementById('approvedTotal').textContent = stats.approved;
  document.getElementById('cancelledTotal').textContent = stats.cancelled;

  const list = document.getElementById('studentAppointmentsList');
  list.innerHTML = '';

  if (!userAppointments.length) {
    list.innerHTML = '<div class="list-item"><div><strong>No appointments yet</strong><span>Book your first meeting.</span></div></div>';
    return;
  }

  userAppointments.slice(0, 4).forEach((item) => {
    const row = document.createElement('div');
    row.className = 'list-item';
    row.innerHTML = `
      <div>
        <strong>${item.office}</strong>
        <span>${item.date} • ${item.time}</span>
      </div>
      <span class="status-pill ${statusClass(item.status)}">${item.status}</span>
    `;
    list.appendChild(row);
  });
}

function renderAdminSummary() {
  const stats = {
    total: state.appointments.length,
    pending: 0,
    approved: 0,
    cancelled: 0,
  };

  state.appointments.forEach((item) => {
    if (item.status === 'Pending') stats.pending += 1;
    if (item.status === 'Approved') stats.approved += 1;
    if (item.status === 'Cancelled') stats.cancelled += 1;
  });

  document.getElementById('adminTotal').textContent = stats.total;
  document.getElementById('adminPending').textContent = stats.pending;
  document.getElementById('adminApproved').textContent = stats.approved;
  document.getElementById('adminCancelled').textContent = stats.cancelled;
}

function renderStudentTable() {
  const tbody = document.getElementById('myAppointmentsTable');
  const currentUser = getCurrentUser();

  if (!currentUser) {
    tbody.innerHTML = '<tr><td colspan="3">Please log in to view appointments.</td></tr>';
    return;
  }

  const appointments = state.appointments.filter((item) => item.studentId === currentUser.studentId);

  if (!appointments.length) {
    tbody.innerHTML = '<tr><td colspan="3">No appointments found.</td></tr>';
    return;
  }

  tbody.innerHTML = appointments
    .map(
      (item) => `
      <tr>
        <td>${item.date}</td>
        <td>${item.purpose}</td>
        <td><span class="status-pill ${statusClass(item.status)}">${item.status}</span></td>
      </tr>
    `
    )
    .join('');
}

function renderProfile() {
  const profile = document.getElementById('profileInfo');
  const currentUser = getCurrentUser();

  if (!currentUser) {
    profile.innerHTML = '<div><strong>Not logged in</strong></div>';
    return;
  }

  profile.innerHTML = `
    <div><strong>Full Name:</strong> <span>${currentUser.fullName}</span></div>
    <div><strong>Student ID:</strong> <span>${currentUser.studentId}</span></div>
    <div><strong>Email:</strong> <span>${currentUser.email}</span></div>
    <div><strong>User Type:</strong> <span>${currentUser.userType}</span></div>
  `;
}

function renderAdminTable() {
  const tbody = document.getElementById('adminAppointmentsTable');

  tbody.innerHTML = state.appointments
    .map(
      (item) => `
      <tr>
        <td>${item.studentName}</td>
        <td>${item.date}</td>
        <td>${item.purpose}</td>
        <td><span class="status-pill ${statusClass(item.status)}">${item.status}</span></td>
        <td>
          <button class="action-btn approve" data-id="${item.id}" data-action="approve">Approve</button>
          <button class="action-btn cancel" data-id="${item.id}" data-action="cancel">Cancel</button>
        </td>
      </tr>
    `
    )
    .join('');
}

function statusClass(status) {
  if (status === 'Approved') return 'status-approved';
  if (status === 'Cancelled') return 'status-cancelled';
  return 'status-pending';
}

function addUser(user) {
  state.users.push(user);
  saveStorage(STORAGE_KEYS.users, state.users);
}

function registerUser(event) {
  event.preventDefault();

  const fullName = document.getElementById('regName').value.trim();
  const studentId = document.getElementById('regStudentId').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (!fullName || !studentId || !email || !password) {
    alert('Please complete all register fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  const duplicate = state.users.find(
    (user) => user.email === email || user.studentId.toLowerCase() === studentId.toLowerCase()
  );

  if (duplicate) {
    alert('A student with this email or student ID already exists.');
    return;
  }

  const user = {
    id: Date.now(),
    fullName,
    studentId,
    email,
    password,
    userType: 'student',
  };

  addUser(user);
  state.currentUser = user;
  saveStorage(STORAGE_KEYS.loggedInUser, user);

  document.getElementById('registrationForm').reset();
  renderAll();
  alert('Registration successful! You are now logged in.');
}

function loginUser(event, type) {
  event.preventDefault();

  const emailOrId = document.getElementById(type === 'student' ? 'studentLoginEmail' : 'adminUsername').value.trim();
  const password = document.getElementById(type === 'student' ? 'studentLoginPassword' : 'adminPassword').value;

  const matchedUser = state.users.find((user) => {
    const matchesType = type === 'student' ? user.userType === 'student' : user.userType === 'admin';
    const matchesIdentity = user.email === emailOrId || user.studentId === emailOrId || user.fullName === emailOrId;
    return matchesType && matchesIdentity && user.password === password;
  });

  if (!matchedUser) {
    alert('Invalid login credentials.');
    return;
  }

  state.currentUser = matchedUser;
  saveStorage(STORAGE_KEYS.loggedInUser, matchedUser);
  renderAll();
  alert(`${matchedUser.fullName} logged in successfully.`);
}

function createAppointment(event) {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.userType !== 'student') {
    alert('Please log in as a student to book an appointment.');
    return;
  }

  const office = document.getElementById('appointmentOffice').value;
  const date = document.getElementById('appointmentDate').value;
  const time = document.getElementById('appointmentTime').value;
  const purpose = document.getElementById('appointmentPurpose').value;
  const notes = document.getElementById('appointmentNotes').value.trim();

  if (!office || !date || !time || !purpose) {
    alert('Please fill in all required booking fields.');
    return;
  }

  const appointment = {
    id: Date.now(),
    studentId: currentUser.studentId,
    studentName: currentUser.fullName,
    office,
    date,
    time,
    purpose,
    notes,
    status: 'Pending',
  };

  state.appointments.unshift(appointment);
  saveStorage(STORAGE_KEYS.appointments, state.appointments);

  document.getElementById('bookAppointmentForm').reset();
  renderAll();
  alert('Appointment requested successfully.');
}

function updateAppointmentStatus(id, newStatus) {
  state.appointments = state.appointments.map((appointment) =>
    appointment.id === Number(id) ? { ...appointment, status: newStatus } : appointment
  );
  saveStorage(STORAGE_KEYS.appointments, state.appointments);
  renderAll();
}

function renderAll() {
  renderUserSummary();
  renderAdminSummary();
  renderStudentTable();
  renderProfile();
  renderAdminTable();
}

function init() {
  document.getElementById('registrationForm').addEventListener('submit', registerUser);
  document.getElementById('studentLoginForm').addEventListener('submit', (event) => loginUser(event, 'student'));
  document.getElementById('adminLoginForm').addEventListener('submit', (event) => loginUser(event, 'admin'));
  document.getElementById('bookAppointmentForm').addEventListener('submit', createAppointment);

  document.getElementById('adminAppointmentsTable').addEventListener('click', (event) => {
    const target = event.target;
    if (!target.classList.contains('action-btn')) return;

    const id = target.dataset.id;
    const action = target.dataset.action;
    updateAppointmentStatus(id, action === 'approve' ? 'Approved' : 'Cancelled');
  });

  renderAll();
}

window.addEventListener('DOMContentLoaded', init);
