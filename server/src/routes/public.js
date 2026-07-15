import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { sendEmail } from '../email.js';

const router = Router();

// Get widget config for embedding
router.get('/widget/:campaignId', (req, res) => {
  const db = getDb();
  const campaign = db.prepare('SELECT id, name, widget_type, prompt_text, accent_color, position, show_stars FROM campaigns WHERE id=?').get(req.params.campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  res.json({ campaign });
});

// Submit a response
router.post('/:campaignId/respond', (req, res) => {
  const { rating, review_text, nps_score, respondent_name, respondent_email } = req.body;
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id=?').get(req.params.campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
  const id = uuid();
  db.prepare('INSERT INTO responses (id,campaign_id,rating,review_text,nps_score,respondent_name,respondent_email) VALUES (?,?,?,?,?,?,?)')
    .run(id, req.params.campaignId, rating||null, review_text||'', nps_score||null, respondent_name||'', respondent_email||'');
  const count = db.prepare('SELECT COUNT(*) as cnt FROM responses WHERE campaign_id=?').get(req.params.campaignId);

  // Send confirmation email if respondent provided email
  if (respondent_email) {
    sendEmail({
      to: respondent_email,
      subject: `Thank you for your feedback!`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#6366f1;margin-bottom:16px">Thank you!</h1>
        <p>Hi ${respondent_name || 'there'},</p>
        <p>Thank you for sharing your feedback${campaign.name ? ' about ' + campaign.name : ''}.</p>
        ${rating ? `<p>Your rating: ${'⭐'.repeat(rating)}</p>` : ''}
        ${nps_score !== null ? `<p>Your NPS score: ${nps_score}/10</p>` : ''}
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
        <p style="color:#888;font-size:13px">ReviewCollector</p>
      </div>`
    });
  }

  res.status(201).json({ response: { id }, response_count: count.cnt });
});

// Get public reviews for display
router.get('/:campaignId/reviews', (req, res) => {
  const db = getDb();
  const responses = db.prepare('SELECT * FROM responses WHERE campaign_id=? AND approved=1 ORDER BY created_at DESC').all(req.params.campaignId);
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id=?').get(req.params.campaignId);
  const stats = db.prepare('SELECT COUNT(*) as cnt, AVG(rating) as avg FROM responses WHERE campaign_id=? AND approved=1').get(req.params.campaignId);
  res.json({ responses, campaign, stats: { count: stats.cnt, avg_rating: stats.avg } });
});

export default router;