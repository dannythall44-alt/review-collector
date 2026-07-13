import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { reqAuth } from '../middleware/auth.js';
const router = Router();

router.get('/', reqAuth, (req, res) => {
  const db = getDb();
  const campaigns = db.prepare('SELECT * FROM campaigns WHERE user_id=? ORDER BY created_at DESC').all(req.userId);
  const counts = db.prepare('SELECT campaign_id, COUNT(*) as cnt, AVG(rating) as avg_rating FROM responses GROUP BY campaign_id').all();
  const cmap = {};
  counts.forEach(c => cmap[c.campaign_id] = c);
  campaigns.forEach(c => { c.response_count = cmap[c.id]?.cnt || 0; c.avg_rating = cmap[c.id]?.avg_rating || null; });
  res.json({ campaigns });
});

router.get('/:id', reqAuth, (req, res) => {
  const db = getDb();
  const c = db.prepare('SELECT * FROM campaigns WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!c) return res.status(404).json({ error: 'Not found' });
  c.responses = db.prepare('SELECT * FROM responses WHERE campaign_id=? ORDER BY created_at DESC').all(c.id);
  res.json({ campaign: c });
});

router.post('/', reqAuth, (req, res) => {
  const { name, widget_type, prompt_text, accent_color, position, show_stars } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const id = uuid();
  db.prepare('INSERT INTO campaigns (id,user_id,name,widget_type,prompt_text,accent_color,position,show_stars) VALUES (?,?,?,?,?,?,?,?)')
    .run(id, req.userId, name, widget_type||'review', prompt_text||'How was your experience?', accent_color||'#6366f1', position||'bottom-right', show_stars!==undefined?show_stars:1);
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id=?').get(id);
  campaign.response_count = 0; campaign.avg_rating = null;
  res.status(201).json({ campaign });
});

router.put('/:id', reqAuth, (req, res) => {
  const { name, widget_type, prompt_text, accent_color, position, show_stars } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT * FROM campaigns WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE campaigns SET name=?,widget_type=?,prompt_text=?,accent_color=?,position=?,show_stars=?,updated_at=datetime('now') WHERE id=?")
    .run(name||existing.name, widget_type||existing.widget_type, prompt_text||existing.prompt_text, accent_color||existing.accent_color, position||existing.position, show_stars!==undefined?show_stars:existing.show_stars, req.params.id);
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id=?').get(req.params.id);
  res.json({ campaign });
});

router.delete('/:id', reqAuth, (req, res) => {
  const db = getDb();
  const r = db.prepare('DELETE FROM campaigns WHERE id=? AND user_id=?').run(req.params.id, req.userId);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Approve/delete responses
router.put('/:id/responses/:rid/approve', reqAuth, (req, res) => {
  const db = getDb();
  const c = db.prepare('SELECT * FROM campaigns WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!c) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE responses SET approved=1 WHERE id=?").run(req.params.rid);
  res.json({ success: true });
});

router.delete('/:id/responses/:rid', reqAuth, (req, res) => {
  const db = getDb();
  const c = db.prepare('SELECT * FROM campaigns WHERE id=? AND user_id=?').get(req.params.id, req.userId);
  if (!c) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM responses WHERE id=?').run(req.params.rid);
  res.json({ success: true });
});

export default router;