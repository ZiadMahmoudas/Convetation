

const SUPABASE_URL  = 'https://rmthdjgebwfuvwfnreoc.supabase.co'; 
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdGhkamdlYndmdXZ3Zm5yZW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTU2NDEsImV4cCI6MjA4OTE3MTY0MX0.Msi84atf-g130emvOYpqCsP9B43WWEI0sVE6UBME1KU';                      // ← غيّرها

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const Auth = {

  async session() {
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },

  async me() {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    return { ...user, profile };
  },

  async login(emailOrObj, password) {
    let email = emailOrObj, pass = password;
    if (emailOrObj && typeof emailOrObj === 'object') {
      email = emailOrObj.email;
      pass  = emailOrObj.password;
    }
    const { data, error } = await sb.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(pass)
    });
    if (error) throw error;
    return data;
  },

  async register(emailOrObj, password, username, fullName) {
    let email = emailOrObj, pass = password, uname = username, fname = fullName;
    if (emailOrObj && typeof emailOrObj === 'object') {
      email = emailOrObj.email;
      pass  = emailOrObj.password;
      uname = emailOrObj.username;
      fname = emailOrObj.fullName;
    }
    const { data, error } = await sb.auth.signUp({
      email: String(email).trim(),
      password: String(pass),
      options: { data: { username: uname, full_name: fname } }
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    await sb.auth.signOut();
    window.location.href = '/login.html';
  },

  async requireAdmin() {
    const me = await Auth.me();
    if (!me || me.profile?.role !== 'admin') {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  async requireUser() {
    const me = await Auth.me();
    if (!me) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  },

  async isAdmin() {
    const me = await Auth.me();
    return me?.profile?.role === 'admin';
  }
};

const DB = {

  // ── STATS ──
  async getStats() {
    const { data, error } = await sb.from('stats_overview').select('*').single();
    if (error) throw error;
    return data;
  },

  // ── CATEGORIES ──
  async getAllCategories() {
    const { data, error } = await sb
      .from('categories')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data;
  },

  async saveCategory(cat) {
    if (cat.id) {
      const { error } = await sb.from('categories').update(cat).eq('id', cat.id);
      if (error) throw error;
    } else {
      delete cat.id;
      const { error } = await sb.from('categories').insert(cat);
      if (error) throw error;
    }
  },

  async deleteCategory(id) {
    const { error } = await sb.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  // ── CALLIGRAPHY ──
  async getAllCalligraphy() {
    const { data, error } = await sb
      .from('calligraphy')
      .select('*, categories(name, icon)')
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveCalligraphy(item) {
    const { error } = await sb.from('calligraphy').insert(item);
    if (error) throw error;
  },

  async deleteCalligraphy(id) {
    const { error } = await sb.from('calligraphy').delete().eq('id', id);
    if (error) throw error;
  },

  // ── BACKGROUNDS ──
  async getAllBackgrounds() {
    const { data, error } = await sb
      .from('backgrounds')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async saveBackground(item) {
    const { error } = await sb.from('backgrounds').insert(item);
    if (error) throw error;
  },

  async deleteBackground(id) {
    const { error } = await sb.from('backgrounds').delete().eq('id', id);
    if (error) throw error;
  },

  // ── USERS ──
  async getUsers() {
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getCategories() {
    const { data, error } = await sb
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (error) throw error;
    return data;
  },

  async getCalligraphy(categoryId = null) {
    let query = sb
      .from('calligraphy')
      .select('*, categories(name, icon)')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getBackgrounds() {
    const { data, error } = await sb
      .from('backgrounds')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

const GUEST_LIMIT = 2;
const GUEST_KEY   = 'sallim_guest_used';

const Guest = {

  usedCount() {
    const raw = localStorage.getItem(GUEST_KEY);
    try { return JSON.parse(raw)?.count || 0; } catch { return 0; }
  },

  remaining() {
    return Math.max(0, GUEST_LIMIT - this.usedCount());
  },

  hasRemaining() {
    return this.usedCount() < GUEST_LIMIT;
  },

  async recordUse(imageId, imageType) {
    if (!this.hasRemaining()) return false;

    const count = this.usedCount() + 1;
    localStorage.setItem(GUEST_KEY, JSON.stringify({ count, updatedAt: Date.now() }));

    try {
      const fingerprint = await this._fingerprint();
      await sb.from('guest_usage').insert({
        fingerprint,
        image_id:   imageId || null,
        image_type: imageType || null
      });
    } catch (e) {
      console.warn('Guest tracking failed:', e.message);
    }

    return true;
  },

  reset() {
    localStorage.removeItem(GUEST_KEY);
  },

  async _fingerprint() {
    const str = navigator.userAgent + screen.width + screen.height + navigator.language;
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('').slice(0,32);
  }
};


const Storage = {

  async upload(bucket, file, namePrefix = 'file') {
    const ext      = file.name.split('.').pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;

    const { data, error } = await sb.storage
      .from(bucket)
      .upload(fileName, file, { upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = sb.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { path: data.path, url: publicUrl };
  },

  async delete(bucket, path) {
    const { error } = await sb.storage.from(bucket).remove([path]);
    if (error) throw error;
  }
};

async function logActivity(action, entityType = null, entityId = null, details = null) {
  try {
    const me = await Auth.me();
    await sb.from('activity_log').insert({
      user_id:     me?.id || null,
      action,
      entity_type: entityType,
      entity_id:   entityId,
      details
    });
  } catch (e) {
    console.warn('logActivity failed:', e.message);
  }
}