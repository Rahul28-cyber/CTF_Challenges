// server.js
// Robust Food Corner CTF backend with frontend integration
// Run: npm install express cors sqlite3

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public directory
const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
app.use(express.static(PUBLIC_DIR));

// Database directories
const DB_DIR = path.join(__dirname, 'db_files');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR);

const MENU_DB_PATH = path.join(DB_DIR, 'menu.db');
const AUTH_DB_PATH = path.join(DB_DIR, 'auth.db');
const SECRETS_DB_PATH = path.join(DB_DIR, 'secrets.db');
const RUNTIME_DB_PATH = path.join(DB_DIR, 'runtime_main.db');

function openDB(p) {
  return new sqlite3.Database(p, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
}

// Initialize Menu DB
function initMenuDB() {
  const db = openDB(MENU_DB_PATH);
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER NOT NULL,
        description TEXT,
        image_url TEXT
      );
    `, (err) => {
      if (err) return console.error('[menu.db] create table error:', err);

      db.get('SELECT COUNT(1) as c FROM menu', (err2, row) => {
        if (err2) return console.error('[menu.db] count error:', err2);
        if (row.c === 0) {
          const stmt = db.prepare(
            'INSERT INTO menu (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)'
          );
          const items = [
  // Wraps
  ['Spicy Paneer Wrap', 'Wraps', 150, 'Fresh paneer tossed in spicy schezwan sauce, wrapped in a whole wheat paratha.', 'https://www.awesomecuisine.com/wp-content/uploads/2007/11/Paneer-Roll.jpg'],
  ['Veggie Delight Wrap', 'Wraps', 130, 'Mixed veggies, cheese, and tangy mayo wrapped in a soft tortilla.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'],
  ['Chicken Shawarma Wrap', 'Wraps', 160, 'Juicy grilled chicken with garlic sauce and pickles.', 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=600&q=80'],
  ['Paneer Tikka Wrap', 'Wraps', 170, 'Paneer tikka with mint chutney and onions wrapped in a roti.', 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80'],

  // Momos
  ['Tandoori Chicken Momos', 'Momos', 180, 'Steamed momos marinated in tandoori paste and grilled.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8B0zjUb4mxrI9S8z_OnZEpC2ATCGBkSpOGg&s'],
  ['Veg Momos', 'Momos', 120, 'Steamed vegetable dumplings served with spicy chutney.', 'https://i0.wp.com/cookingfromheart.com/wp-content/uploads/2016/08/Veg-Momos-4.jpg?fit=1024%2C683&ssl=1'],
  ['Cheese Corn Momos', 'Momos', 140, 'Cheese and corn filling with a creamy twist.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXivslfxzxSJalfU995QkKwkidMwVhxEQdaQ&s'],
  ['Fried Chicken Momos', 'Momos', 170, 'Crispy fried momos stuffed with spicy chicken.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkzcJPaTBuzz9_ePOvABABN2wYqQ0hgpCtow&s'],

  // Burgers
  ['Classic Veg Burger', 'Burgers', 120, 'Vegetable patty with fresh lettuce and secret sauce.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'],
  ['Paneer Tikka Burger', 'Burgers', 170, 'Cajun paneer tikka burger with spicy mayo.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMZXqVdeVLcEhAXjz-r7RH92F6Dck6aoy4ew&s'],
  ['Crispy Chicken Burger', 'Burgers', 160, 'Golden fried chicken fillet with creamy sauce.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80'],
  ['Double Cheese Burger', 'Burgers', 190, 'Loaded with double cheese and grilled patty.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'],

  // Sandwiches
  ['Cheese and Corn Sandwich', 'Sandwiches', 110, 'Grilled sandwich with sweet corn and melted cheese.', 'https://www.bigbasket.com/media/uploads/recipe/w-l/3644_1_1.jpg'],
  ['Veg Club Sandwich', 'Sandwiches', 130, 'Triple-layered sandwich with veggies and mayo.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRBHCLytv3e3sSwY2FusU4hjFKhEzl50EREQ&s'],
  ['Paneer Grilled Sandwich', 'Sandwiches', 140, 'Grilled paneer sandwich with spicy chutney.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGkUAMhZDMKeTj5nLUYyoGrtxSFHzcXU7jzA&s'],
  ['Chicken Mayo Sandwich', 'Sandwiches', 150, 'Shredded chicken with mayo and herbs.', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80'],

  // Desserts
  ['Chocolate Lava Cake', 'Desserts', 90, 'Warm molten chocolate cake with vanilla ice cream.', 'https://daddysbakery.in/wp-content/uploads/2019/01/Choco-Lava-Cake.jpg'],
  ['Brownie Sundae', 'Desserts', 120, 'Hot brownie with vanilla ice cream and chocolate syrup.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'],
  ['Gulab Jamun', 'Desserts', 80, 'Soft and sweet fried dumplings in sugar syrup.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXF3TN0NQaQO_vkZwGoIz9C-qRV7uCJnzNVQ&s'],
  ['Choco Mousse', 'Desserts', 110, 'Creamy and rich chocolate mousse topped with choco chips.', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'],

  // Drinks
  ['Cold Coffee', 'Drinks', 70, 'Chilled coffee blended with ice cream.', 'https://mytastycurry.com/wp-content/uploads/2020/04/Cafe-style-cold-coffee-with-icecream.jpg'],
  ['Mango Shake', 'Drinks', 90, 'Thick mango milkshake with ice cream.', 'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/04/mango-milkshake-recipe-500x500.jpg'],
  ['Oreo Shake', 'Drinks', 100, 'Creamy shake with crushed Oreos and whipped cream.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvKdnkfcUhR2uJe5uX64AfT4MTeEW1sxbCaA&s'],
  ['Lemon Iced Tea', 'Drinks', 60, 'Refreshing iced tea with lemon flavor.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWERf8cdd2ok4oL0Ek7IO4Zepz9x940yo61w&s']
];


          items.forEach(i => stmt.run(...i));
          stmt.finalize(() => {
            console.log('[DB] menu.db seeded.');
            db.close();
          });
        } else {
          db.close();
        }
      });
    });
  });
}

function initAuthDB() {
  const db = openDB(AUTH_DB_PATH);
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `, (err) => {
      if (err) return console.error('[auth.db] create table error:', err);

      db.get('SELECT COUNT(1) as c FROM users', (err2, row) => {
        if (err2) return console.error('[auth.db] count error:', err2);
        if (row.c === 0) {
          const stmt = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
          const users = [
            ['alice', 'alice123', 'user'],
            ['bob', 'bob2025', 'user'],
            ['charlie', 'charliePwd', 'user'],
            ['david', 'dav_pass', 'user'],
            ['eve', 'eve_pw', 'user'],
            ['mallory', 'mallory1', 'user'],
            ['trent', 'trent_admin', 'user'],
            ['admin', 'collegefest2025', 'admin']
          ];
          users.forEach(u => stmt.run(...u));
          stmt.finalize(() => {
            console.log('[DB] auth.db seeded.');
            db.close();
          });
        } else {
          db.close();
        }
      });
    });
  });
}

function initSecretsDB() {
  const db = openDB(SECRETS_DB_PATH);
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS secrets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `, (err) => {
      if (err) return console.error('[secrets.db] create table error:', err);

      db.get('SELECT COUNT(1) as c FROM secrets', (err2, row) => {
        if (err2) return console.error('[secrets.db] count error:', err2);
        if (row.c === 0) {
          db.run(
            'INSERT INTO secrets (key, value) VALUES (?, ?)',
            ['flag', 'CTF{SQL_INJ3CT10N_M4ST3R_0F_TH3_F00D_C0RN3R}'],
            (insertErr) => {
              if (insertErr) console.error('[secrets.db] insert error:', insertErr);
              else console.log('[DB] secrets.db seeded.');
              db.close();
            }
          );
        } else {
          db.close();
        }
      });
    });
  });
}


// Initialize all DBs
initMenuDB();
initAuthDB();
initSecretsDB();

// Runtime DB
const runtimeDb = new sqlite3.Database(RUNTIME_DB_PATH);
runtimeDb.serialize(() => {
  runtimeDb.run(`ATTACH DATABASE '${MENU_DB_PATH}' AS menu_db;`);
  runtimeDb.run(`ATTACH DATABASE '${AUTH_DB_PATH}' AS auth_db;`);
  runtimeDb.run(`ATTACH DATABASE '${SECRETS_DB_PATH}' AS secrets_db;`);
  console.log('[DB] Attached all databases.');
});

// Helper
function respondJson(res, obj) {
  res.setHeader('Content-Type', 'application/json');
  res.json(obj);
}

// ---------- API ROUTES ----------

// Filter by category (intentionally vulnerable for CTF)
app.get('/api/filter', (req, res) => {
  const category = req.query.category || '';
  const sql = `SELECT id, name, category, price, description, image_url FROM menu_db.menu WHERE category = '${category}';`;
  console.log('[SQL] /api/filter:', sql);

  runtimeDb.all(sql, (err, rows) => {
    if (err) return respondJson(res, { success: true, items: [], error: err.message });
    return respondJson(res, { success: true, items: rows || [] });
  });
});

// Fetch all menu items
app.get('/api/menu-all', (req, res) => {
  runtimeDb.all(`SELECT id, name, category, price, description, image_url FROM menu_db.menu;`, (err, rows) => {
    if (err) return respondJson(res, { success: false, items: [], message: 'Server error' });
    return respondJson(res, { success: true, items: rows || [] });
  });
});

// Admin login (returns flag)
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!password) return respondJson(res, { success: false, message: 'Password required' });

  runtimeDb.get(`SELECT password FROM auth_db.users WHERE username='admin' LIMIT 1;`, (err, row) => {
    if (err) return respondJson(res, { success: false, message: 'Server error' });
    if (!row) return respondJson(res, { success: false, message: 'Admin not found' });

    if (password === row.password) {
      runtimeDb.get(`SELECT value FROM secrets_db.secrets WHERE key='flag' LIMIT 1;`, (e2, flagRow) => {
        if (e2 || !flagRow) return respondJson(res, { success: false, message: 'Flag missing' });
        return respondJson(res, { success: true, flag: flagRow.value });
      });
    } else {
      return respondJson(res, { success: false, message: 'Incorrect password' });
    }
  });
});

// Safe user login
app.post('/api/user-login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return respondJson(res, { success: false, message: 'username & password required' });

  runtimeDb.get(`SELECT id, username, role FROM auth_db.users WHERE username = ? AND password = ? LIMIT 1;`,
    [username, password],
    (err, row) => {
      if (err) return respondJson(res, { success: false, message: 'Server error' });
      if (!row) return respondJson(res, { success: false, message: 'Invalid credentials' });
      return respondJson(res, { success: true, user: row });
    });
});

// Status check
app.get('/api/_status', (req, res) => {
  respondJson(res, { success: true, attached: ['menu_db', 'auth_db', 'secrets_db'] });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
});
