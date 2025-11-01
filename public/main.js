// public/main.js
document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-items');
  const categoryButtons = document.getElementById('category-buttons');
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const passwordInput = document.getElementById('password-input');
  const logoutBtn = document.getElementById('logout-btn');

  // Create a Login button in the header if not present
  (function ensureLoginButton() {
    const header = document.querySelector('header div');
    if (!header) return;
    let loginBtn = document.getElementById('login-btn');
    if (!loginBtn) {
      loginBtn = document.createElement('button');
      loginBtn.id = 'login-btn';
      loginBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg';
      loginBtn.textContent = 'Admin Login';
      // insert before the logout button (if exists)
      header.appendChild(loginBtn);
    }
    loginBtn.addEventListener('click', () => {
      showLoginModal();
    });
  })();

  // Show login modal
  function showLoginModal() {
    loginModal.classList.remove('hidden');
  }

  // Hide login modal
  function hideLoginModal() {
    loginModal.classList.add('hidden');
    passwordInput.value = '';
  }

  // Show a short toast/message (simple)
  function showMessage(text, type = 'info') {
    // simple alert fallback
    alert(text);
  }

  // Render menu items into the grid
  function renderMenu(items) {
    if (!items || items.length === 0) {
      menuContainer.innerHTML = '<p class="text-center text-gray-500 mt-8 col-span-full">No items found.</p>';
      return;
    }
    menuContainer.innerHTML = items.map(item => {
      // item: { id, name, category, price, description, image_url }
      const img = item.image_url ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" class="w-full h-44 object-cover rounded-t-md">`
                                 : `<div class="w-full h-44 bg-gray-200 rounded-t-md flex items-center justify-center text-gray-500">No Image</div>`;
      return `
        <div class="bg-white rounded-xl overflow-hidden card-shadow">
          ${img}
          <div class="p-4">
            <h3 class="text-lg font-bold text-gray-900">${escapeHtml(item.name)}</h3>
            <p class="text-sm text-gray-600 mt-1">${escapeHtml(item.description || '')}</p>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-indigo-600 font-semibold">₹${escapeHtml(String(item.price || ''))}</span>
              <span class="text-xs text-gray-500">${escapeHtml(item.category || '')}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Basic escaping to avoid XSS if you later accept user data
  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // Fetch all menu items
  async function fetchAllMenu() {
    try {
      const res = await fetch('/api/menu-all');
      const j = await res.json();
      if (j && j.success) renderMenu(j.items || []);
      else renderMenu([]);
    } catch (e) {
      console.error('Failed to fetch menu-all', e);
      renderMenu([]);
    }
  }

  // Fetch by category
  async function fetchByCategory(cat) {
    try {
      const url = `/api/filter?category=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      // If your server returns a 500 for malformed input, fetch will not throw;
      // we need to handle status codes explicitly:
      if (!res.ok) {
        // Show generic message for 5xx
        showMessage(`Server responded with ${res.status} ${res.statusText}`, 'error');
        return;
      }
      const j = await res.json();
      if (j && j.success) renderMenu(j.items || []);
      else {
        // might be a server-returned JSON with success:false
        renderMenu([]);
      }
    } catch (e) {
      console.error('Error fetching category', e);
      showMessage('Network error while fetching category', 'error');
    }
  }

  // Wire category buttons
  if (categoryButtons) {
    categoryButtons.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-category]');
      if (!btn) return;
      const cat = btn.getAttribute('data-category');
      fetchByCategory(cat);
    });
  }

  // Login form submit handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const password = passwordInput.value || '';
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        if (!res.ok) {
          // If server returned 500 due to DB/SQL error, show generic
          showMessage(`Login failed: server returned ${res.status}`, 'error');
          hideLoginModal();
          return;
        }

        const j = await res.json();
        if (j.success && j.flag) {
          // show the flag in a nicer way
          showMessage(`Flag: ${j.flag}`, 'info');
          hideLoginModal();
          // show logout button, hide login btn
          const loginBtn = document.getElementById('login-btn');
          if (loginBtn) loginBtn.classList.add('hidden');
          logoutBtn.classList.remove('hidden');
        } else {
          showMessage(j.message || 'Incorrect password', 'error');
        }
      } catch (err) {
        console.error('Login error', err);
        showMessage('Network error during login', 'error');
      }
    });
  }

  // Logout handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // For this simple CTF frontend, logout just toggles UI
      logoutBtn.classList.add('hidden');
      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) loginBtn.classList.remove('hidden');
      showMessage('Logged out', 'info');
    });
  }

  // Close modal when clicking outside the box
  loginModal.addEventListener('click', (ev) => {
    if (ev.target === loginModal) hideLoginModal();
  });

  // initial load
  fetchAllMenu();
});
