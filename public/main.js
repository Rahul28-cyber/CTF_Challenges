// public/main.js
function hideMessage() {
  const box = document.getElementById('message-box');
  if (box) box.classList.add('hidden');
}

function showMessage(title, body) {
  const box = document.getElementById('message-box');
  if (!box) return;
  document.getElementById('message-title').innerText = title;
  document.getElementById('message-body').innerText = body;
  box.classList.remove('hidden');
}

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function updateUrlCategory(cat) {
  const url = new URL(window.location.href);
  if (cat) url.searchParams.set('category', cat);
  else url.searchParams.delete('category');
  window.history.pushState({}, '', url.toString());
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"'`=\/]/g, s => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
    "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
  }[s]));
}

function renderMenuItems(items) {
  const container = document.getElementById('menu-items');
  if (!container) return;
  container.innerHTML = '';

  if (!items || items.length === 0) {
    const p = document.createElement('p');
    p.className = 'text-center text-gray-500 mt-8 col-span-full';
    p.innerText = 'No items found.';
    container.appendChild(p);
    return;
  }

  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl card-shadow overflow-hidden hover:scale-[1.02] transform transition duration-150';
    const imageUrl = it.image_url || 'https://via.placeholder.com/600x400?text=No+Image';
    card.innerHTML = `
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(it.name)}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg mb-1 text-gray-800">${escapeHtml(it.name)}</h3>
        <p class="text-sm text-gray-500 mb-2">${escapeHtml(it.category)} • ₹${escapeHtml(it.price)}</p>
        <p class="text-sm text-gray-700">${escapeHtml(it.description || '')}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

async function fetchMenuByCategory(cat) {
  try {
    const res = await fetch(`/api/filter?category=${encodeURIComponent(cat)}`);
    const data = await res.json();
    if (!data) {
      showMessage('Server error', 'Empty response from server.');
      renderMenuItems([]);
      return;
    }
    if (data.error) {
      renderMenuItems([]);
      showMessage('SQL Error', data.error);
      return;
    }
    renderMenuItems(data.items || []);
  } catch (err) {
    console.error(err);
    showMessage('Network error', 'Could not reach server.');
    renderMenuItems([]);
  }
}

async function fetchAllMenu() {
  try {
    const res = await fetch('/api/menu-all');
    const data = await res.json();
    if (data && data.items) renderMenuItems(data.items);
    else renderMenuItems([]);
  } catch (err) {
    console.error(err);
    renderMenuItems([]);
  }
}

async function handleAdminLogin(evt) {
  evt.preventDefault();
  const pw = document.getElementById('password-input').value;
  if (!pw) return showMessage('Input required', 'Please enter admin password.');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    });
    const data = await res.json();
    if (data && data.flag) {
      hideMessage();
      showMessage('FLAG', data.flag);
      document.getElementById('login-modal').classList.add('hidden');
    } else {
      showMessage('Login failed', data.message || data.error || 'Incorrect password');
    }
  } catch (err) {
    console.error(err);
    showMessage('Network error', 'Could not reach server for login.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      updateUrlCategory(cat);
      fetchMenuByCategory(cat);
    });
  });

  const initialCat = getQueryParam('category');
  if (initialCat) fetchMenuByCategory(initialCat);
  else fetchAllMenu();

  const filterForm = document.getElementById('filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', evt => {
      evt.preventDefault();
      const val = document.getElementById('category-input').value || '';
      updateUrlCategory(val);
      fetchMenuByCategory(val);
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleAdminLogin);
});
