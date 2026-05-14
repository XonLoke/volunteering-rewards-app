// ─── Sidebar toggle ───
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');

function toggleSidebar(){
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}
if(menuToggle){
  menuToggle.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);
}

// ─── Nav active state (highlight current page) ───
document.querySelectorAll('.nav-item[data-nav]').forEach(item => {
  const nav = item.dataset.nav;
  const path = location.pathname.split('/').pop() || 'index.html';
  const page = path.replace('.html','');
  if(nav === page || (page === 'index' && nav === 'dashboard')){
    item.classList.add('active');
  }
});

// ─── Modals ───
function openModal(name){
  const el = document.getElementById(`modal-${name}`);
  if(el) el.classList.add('open');
}
function closeModal(name){
  const el = document.getElementById(`modal-${name}`);
  if(el) el.classList.remove('open');
}
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e){
    if(e.target === this) this.classList.remove('open');
  });
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ─── Toast ───
let toastTimer;
function showToast(msg){
  const el = document.getElementById('toast');
  if(!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ─── Global search ───
const searchInput = document.getElementById('globalSearch');
if(searchInput){
  searchInput.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && this.value.trim()){
      showToast(`Searching for "${this.value.trim()}"…`);
    }
  });
}

// ─── Date helper ───
function todayStr(){
  return new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}
