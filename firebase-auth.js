import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCpy1EZHDy8K9yFTaYiZXgZJV6Cz5t500",
  authDomain: "ckg-auto.firebaseapp.com",
  projectId: "ckg-auto",
  storageBucket: "ckg-auto.firebasestorage.app",
  messagingSenderId: "884592763723",
  appId: "1:884592763723:web:b391988907e9b06b79bece",
  measurementId: "G-660S3V3JE6"
};
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxQI-jusCGenH6z62S2rN5momJaGVBUvXW5MZQ6Shf8TRpfRGRYFLQJO4X_4ndwRmTvAw/exec";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const $ = (id) => document.getElementById(id);
const authScreen = $('authScreen'), appShell = $('appShell');
const loginForm = $('loginForm'), loginBtn = $('loginBtn'), loginError = $('loginError');
const logoutBtn = $('logoutBtn'), backendStatus = $('backendStatus'), userIdentity = $('userIdentity');
const messages = {
  'auth/invalid-email':'Format email tidak valid.', 'auth/invalid-credential':'Email atau password salah.',
  'auth/user-disabled':'Akun ini telah dinonaktifkan. Hubungi administrator.',
  'auth/too-many-requests':'Terlalu banyak percobaan. Coba lagi beberapa saat.',
  'auth/network-request-failed':'Koneksi internet bermasalah. Periksa jaringanmu.',
  'auth/operation-not-allowed':'Login Email/Password belum diaktifkan di Firebase Console.'
};

async function verifyProfile(user) {
  const idToken = await user.getIdToken(true);
  const response = await fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ idToken, action: 'me' }),
    redirect: 'follow'
  });
  if (!response.ok) throw new Error(`Backend HTTP ${response.status}`);
  const result = await response.json();
  if (!result.ok) {
    const reason = result.error || 'UNKNOWN_ERROR';
    if (reason === 'ACCOUNT_NOT_ACTIVE') throw new Error('Akun belum terdaftar, tidak aktif, atau role tidak valid di Sheet Users.');
    if (reason === 'AUTH_REQUIRED') throw new Error('Token login tidak diterima backend.');
    throw new Error(`Verifikasi backend gagal: ${reason}`);
  }
  if (!result.user || !['SUPER_ADMIN','ADMIN','PETUGAS'].includes(result.user.role)) throw new Error('Profil atau role pengguna tidak valid.');
  return result.user;
}


// Account management via the free Google Apps Script backend.
let activeProfile = null;
const apiCall = async (action, extra = {}) => {
  const current = auth.currentUser;
  if (!current) throw new Error('Sesi login tidak ditemukan.');
  const idToken = await current.getIdToken();
  const response = await fetch(BACKEND_URL, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ idToken, action, ...extra }), redirect: 'follow'
  });
  if (!response.ok) throw new Error(`Backend HTTP ${response.status}`);
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || 'Permintaan backend gagal.');
  return data;
};
const showUsersNotice = (message, kind = 'success') => {
  const el = $('usersNotice'); if (!el) return;
  el.textContent = message; el.className = `notice ${kind}`; el.hidden = false;
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function loadManagedUsers() {
  const body = $('usersTableBody'); if (!body) return;
  body.innerHTML = '<tr><td colspan="5">Memuat daftar pengguna…</td></tr>';
  try {
    const result = await apiCall('listUsers');
    body.innerHTML = '';
    if (!result.users.length) { body.innerHTML = '<tr><td colspan="5">Belum ada pengguna lain.</td></tr>'; return; }
    result.users.forEach(u => {
      const tr = document.createElement('tr');
      const date = u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '—';
      const roleControl = activeProfile?.role === 'SUPER_ADMIN' && u.role !== 'SUPER_ADMIN'
        ? `<select data-role-uid="${escapeHtml(u.uid)}"><option value="ADMIN" ${u.role==='ADMIN'?'selected':''}>Admin</option><option value="PETUGAS" ${u.role==='PETUGAS'?'selected':''}>Petugas</option></select><button class="btn btn-quiet" data-save-role="${escapeHtml(u.uid)}">Simpan</button>`
        : escapeHtml(u.role);
      const actions = u.role !== 'SUPER_ADMIN'
        ? `<button class="btn btn-quiet" data-toggle-uid="${escapeHtml(u.uid)}" data-status="${escapeHtml(u.status)}">${u.status==='ACTIVE'?'Nonaktifkan':'Aktifkan'}</button><button class="btn btn-quiet" data-delete-uid="${escapeHtml(u.uid)}">Hapus</button>` : '—';
      tr.innerHTML = `<td>${escapeHtml(u.email)}<span class="user-email">${escapeHtml(u.uid)}</span></td><td>${roleControl}</td><td>${escapeHtml(u.status)}</td><td>${escapeHtml(date)}</td><td>${actions}</td>`;
      body.appendChild(tr);
    });
  } catch (err) { body.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message)}</td></tr>`; }
}
function setupUserManagement(profile) {
  activeProfile = profile;
  const nav = $('usersNav'); if (!nav) return;
  nav.hidden = !['SUPER_ADMIN','ADMIN'].includes(profile.role);
  $('adminRoleOption').hidden = profile.role !== 'SUPER_ADMIN';
  if (profile.role === 'ADMIN') $('newUserRole').value = 'PETUGAS';
  $('createUserBtn').onclick = async () => {
    const email = $('newUserEmail').value.trim(), password = $('newUserPassword').value;
    const confirmPassword = $('newUserPassword2').value, role = $('newUserRole').value;
    if (!email) return showUsersNotice('Masukkan email pengguna.', 'error');
    if (password.length < 10) return showUsersNotice('Password minimal 10 karakter.', 'error');
    if (password !== confirmPassword) return showUsersNotice('Konfirmasi password tidak sama.', 'error');
    const btn = $('createUserBtn'); btn.disabled = true; btn.textContent = 'Membuat akun…';
    try {
      await apiCall('createUser', { email, password, role });
      $('newUserEmail').value = ''; $('newUserPassword').value = ''; $('newUserPassword2').value = '';
      showUsersNotice('Akun berhasil dibuat.', 'success'); await loadManagedUsers();
    } catch (err) { showUsersNotice(err.message, 'error'); }
    finally { btn.disabled = false; btn.textContent = '＋ Buat akun'; }
  };
  $('refreshUsersBtn').onclick = loadManagedUsers;
  $('usersTableBody').onclick = async event => {
    const t = event.target;
    try {
      if (t.dataset.saveRole) {
        const uid = t.dataset.saveRole;
        const select = [...document.querySelectorAll('[data-role-uid]')].find(x => x.dataset.roleUid === uid);
        await apiCall('setUserRole', { uid, role: select.value });
        showUsersNotice('Role berhasil diperbarui.'); await loadManagedUsers();
      } else if (t.dataset.toggleUid) {
        const uid = t.dataset.toggleUid, status = t.dataset.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        if (!confirm(`Ubah status akun menjadi ${status}?`)) return;
        await apiCall('setUserStatus', { uid, status }); showUsersNotice('Status akun diperbarui.'); await loadManagedUsers();
      } else if (t.dataset.deleteUid) {
        const uid = t.dataset.deleteUid;
        if (!confirm('Hapus akses akun dari aplikasi? Penghapusan ini bersifat logis.')) return;
        await apiCall('deleteUser', { uid }); showUsersNotice('Akun ditandai DELETED.'); await loadManagedUsers();
      }
    } catch (err) { showUsersNotice(err.message, 'error'); }
  };
  if (!nav.hidden) loadManagedUsers();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); loginError.hidden = true; loginBtn.disabled = true; loginBtn.textContent = 'Memeriksa akun…';
  try {
    await signInWithEmailAndPassword(auth, $('loginEmail').value.trim(), $('loginPassword').value);
    loginForm.reset();
  } catch (error) {
    loginError.textContent = messages[error.code] || error.message || 'Login gagal. Periksa koneksi dan data akun.';
    loginError.hidden = false;
  } finally { loginBtn.disabled = false; loginBtn.textContent = 'Masuk'; }
});
logoutBtn.addEventListener('click', async () => {
  logoutBtn.disabled = true; try { await signOut(auth); } catch { alert('Gagal keluar. Silakan coba lagi.'); } finally { logoutBtn.disabled = false; }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    activeProfile = null;
    if ($('usersNav')) $('usersNav').hidden = true;
    authScreen.hidden = false; appShell.hidden = true; document.body.dataset.authenticated = 'false';
    if (backendStatus) backendStatus.hidden = true;
    return;
  }
  authScreen.hidden = true; appShell.hidden = false; document.body.dataset.authenticated = 'false';
  $('convertView').hidden = true; $('guideView').hidden = true;
  backendStatus.hidden = false; backendStatus.className = 'backend-status pending'; backendStatus.textContent = 'Memverifikasi akun ke backend…';
  try {
    const profile = await verifyProfile(user);
    setupUserManagement(profile);
    document.body.dataset.authenticated = 'true';
    $('convertView').hidden = false;
    userIdentity.textContent = `${profile.email || user.email} · ${profile.role}`;
    backendStatus.className = 'backend-status success'; backendStatus.textContent = `Terverifikasi · ${profile.role}`;
    // Patient data remains local in browser memory; only identity token/profile are sent to backend.
  } catch (error) {
    document.body.dataset.authenticated = 'false';
    $('convertView').hidden = true; $('guideView').hidden = true;
    backendStatus.className = 'backend-status error';
    backendStatus.textContent = `Akses workspace ditahan: ${error.message}`;
    console.error('Backend profile verification failed:', error);
  }
});
