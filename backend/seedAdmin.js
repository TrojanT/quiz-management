const User = require('./models/User');

async function seedAdmin() {
  if (await User.exists({ role: 'admin' })) return;

  const email = (process.env.ADMIN_EMAIL || '').trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = (process.env.ADMIN_NAME || 'Administrator').trim() || 'Administrator';

  if (!email || !password) {
    console.warn('[Admin seed] No admin in DB — set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    return;
  }

  const doc = await User.findOne({ email });
  if (doc) {
    Object.assign(doc, { role: 'admin', name, password });
    await doc.save();
    console.log('[Admin seed] Promoted', email);
    return;
  }

  await User.create({ name, email, password, role: 'admin' });
  console.log('[Admin seed] Created', email);
}

module.exports = seedAdmin;
