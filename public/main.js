// public/main.js
// Replaces previous behavior: creates a visible Login button, shows a username+password modal (you already added),
// and dynamically creates a flag box on successful admin login (renders the flag into the page).
document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-items');
  const categoryButtons = document.getElementById('category-buttons');
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  // Inputs inside the modal
  const usernameInput = document.getElementById('username-input');
  const passwordInput = document.getElementById('password-input');

  // Create/ensure Login button in header
  (function ensureLoginButton() {
    const headerInner = document.querySelector('header div');
    if (!headerInner) return;
    let loginBtn = document.getElementById('login-btn');
    if (!loginBtn) {
      loginBtn = document.createElement('button');
      loginBtn.id = 'login-btn';
      loginBtn.className = 'bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg mr-3';
      loginBtn.textContent = 'Login';
      headerInner.appendChild(loginBtn);
      loginBtn.addEventListener('click', showLoginModal);
    }
  })();

  // Create a flag box dynamically and insert below the header (or inside main content)
  let flagBox = document.getElementById('flag-box-dynamic');
  if (!flagBox) {
    flagBox = document.createElement('div');
    flagBox.id = 'flag-box-dynamic';
    flagBox.className = 'hidden mt-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded-md max-w-3xl mx-auto shadow-md';
    flagBox.innerHTML = '<strong>Flag:</strong> <span id="flag-text-dynamic" class="font-mono"></span>';
    // Insert after header (before main)
    const mainEl = document.querySelector('main');
    if (mainEl && mainEl.parentNode) {
      mainEl.parentNode.insertBefore(flagBox, mainEl);
    } else {
      document.body.appendChild(flagBox);
    }
  }
  const flagText = document.getElementById('flag-text-dynamic');

  // Helpers
  function showLoginModal() {
    if (loginModal) loginModal.classList.remove('hidden');
  }
  function hideLoginModal() {
    if (loginModal) loginModal.classList.add('hidden');
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) passwordInput.value = '';
  }
  function showMessage(msg) {
    // small non-intrusive message: fallback to alert (replace with toast if you want)
    alert(msg);
  }
  function escapeHtml(s) {
    return String(s || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // Render menu items
  function renderMenu(items) {
    if (!items || items.length === 0) {
      menuContainer.innerHTML = '<p class="text-center text-gray-500 mt-8 col-span-full">No items found.</p>';
      return;
    }
    menuContainer.innerHTML = items.map(item => {
      const img = item.image_url
        ? `<img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" class="w-full h-44 object-cover rounded-t-md">`
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

  // Fetch full menu
  async function fetchAllMenu() {
    try {
      const res = await fetch('/api/menu-all');
      const j = await res.json();
      if (j && j.success) renderMenu(j.items || []);
      else renderMenu([]);
    } catch (err) {
      console.error('fetchAllMenu error', err);
      renderMenu([]);
    }
  }

  // Fetch category
  async function fetchByCategory(cat) {
    try {
      const res = await fetch(`/api/filter?category=${encodeURIComponent(cat)}`);
      if (!res.ok) {
        // server returned 5xx or 4xx (e.g., intentional DB errors)
        showMessage(`Server error: ${res.status} ${res.statusText}`);
        return;
      }
      const j = await res.json();
      if (j && j.success) renderMenu(j.items || []);
      else renderMenu([]);
    } catch (err) {
      console.error('fetchByCategory error', err);
      showMessage('Network error while fetching category');
    }
  }

  // Wire category buttons
  if (categoryButtons) {
  categoryButtons.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-category]');
    if (!btn) return;
    const cat = btn.getAttribute('data-category');

    // Update URL bar (no reload)
    window.history.pushState({}, '', `?category=${encodeURIComponent(cat)}`);

    // Fetch data
    fetchByCategory(cat);
  });
}


  // Handle login submissions (username + password)
  if (loginForm) {
    loginForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const username = (usernameInput && usernameInput.value || '').trim();
      const password = (passwordInput && passwordInput.value || '').trim();

      if (!username || !password) {
        showMessage('Please enter username and password');
        return;
      }

      try {
        // Admin login: server's /api/login expects { password } and returns flag
        if (username.toLowerCase() === 'admin') {
          const resp = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });

          if (!resp.ok) {
            // If the server intentionally throws DB errors you'll get a non-ok status
            showMessage(`Login failed: ${resp.status} ${resp.statusText}`);
            hideLoginModal();
            return;
          }

          const json = await resp.json();
          if (json && json.success && json.flag) {
            // Display the flag in the dynamic flag box
            flagText.textContent = json.flag;
            flagBox.classList.remove('hidden');

            // Update UI: hide login button, show logout
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            hideLoginModal();
            return;
          } else {
            showMessage(json.message || 'Incorrect admin password');
            hideLoginModal();
            return;
          }
        }

        // Non-admin users: call /api/user-login
        const resp = await fetch('/api/user-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!resp.ok) {
          showMessage(`Login failed: ${resp.status} ${resp.statusText}`);
          hideLoginModal();
          return;
        }
        const json = await resp.json();
        if (json && json.success) {
          showMessage(`Welcome, ${escapeHtml(json.user.username)}!`);
          const loginBtn = document.getElementById('login-btn');
          if (loginBtn) loginBtn.classList.add('hidden');
          if (logoutBtn) logoutBtn.classList.remove('hidden');
          hideLoginModal();
        } else {
          showMessage(json.message || 'Invalid credentials');
          hideLoginModal();
        }
      } catch (err) {
        console.error('login submit error', err);
        showMessage('Network error during login');
        hideLoginModal();
      }
    });
  }

  // Logout handler: hides flag and toggles UI
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      flagBox.classList.add('hidden');
      flagText.textContent = '';
      logoutBtn.classList.add('hidden');
      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) loginBtn.classList.remove('hidden');
      showMessage('Logged out');
    });
  }

  // Close modal when clicking outside modal content
  if (loginModal) {
    loginModal.addEventListener('click', (ev) => {
      if (ev.target === loginModal) hideLoginModal();
    });
  }

  // Initial load
  fetchAllMenu();
});
