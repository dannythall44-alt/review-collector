(function() {
  var CAMPAIGN_ID = '__CAMPAIGN_ID__';
  var API_BASE = '__API_BASE__';

  // Create widget container
  var container = document.createElement('div');
  container.id = 'rc-widget-container';
  container.innerHTML = `
    <style>
      #rc-widget-container * { box-sizing: border-box; margin: 0; padding: 0; }
      .rc-widget-btn {
        position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
        border-radius: 50%; background: #6366f1; color: white; border: none;
        cursor: pointer; box-shadow: 0 4px 16px rgba(99,102,241,0.4);
        font-size: 24px; display: flex; align-items: center; justify-content: center;
        z-index: 999999; transition: transform 0.2s;
      }
      .rc-widget-btn:hover { transform: scale(1.1); }
      .rc-widget-panel {
        position: fixed; bottom: 96px; right: 24px; width: 360px;
        max-height: 500px; background: #1a1a24; border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4); z-index: 999999;
        display: none; overflow: hidden; border: 1px solid #2a2a3a;
        color: #e8e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      .rc-widget-panel.open { display: block; }
      .rc-widget-header { padding: 20px; border-bottom: 1px solid #2a2a3a; font-weight: 600; font-size: 16px; }
      .rc-widget-body { padding: 20px; }
      .rc-widget-body p { font-size: 14px; margin-bottom: 16px; color: #8888a0; }
      .rc-stars { display: flex; gap: 8px; margin-bottom: 16px; justify-content: center; }
      .rc-star { font-size: 32px; cursor: pointer; color: #4a4a5a; transition: color 0.2s; }
      .rc-star.active, .rc-star:hover { color: #f59e0b; }
      .rc-nps { display: flex; gap: 4px; margin-bottom: 16px; justify-content: center; }
      .rc-nps-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #2a2a3a; background: transparent; color: #e8e8f0; cursor: pointer; font-size: 12px; transition: all 0.2s; }
      .rc-nps-btn:hover, .rc-nps-btn.active { background: #6366f1; border-color: #6366f1; }
      .rc-textarea { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #2a2a3a; background: #13131a; color: #e8e8f0; font-size: 14px; resize: vertical; min-height: 80px; margin-bottom: 12px; outline: none; font-family: inherit; }
      .rc-textarea:focus { border-color: #6366f1; }
      .rc-submit { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #6366f1; color: white; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
      .rc-submit:hover { opacity: 0.9; }
      .rc-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      .rc-success { text-align: center; padding: 20px; }
      .rc-success h3 { font-size: 18px; margin-bottom: 8px; color: #22c55e; }
      .rc-success p { font-size: 14px; color: #8888a0; }
    </style>
    <button class="rc-widget-btn" id="rc-toggle-btn">⭐</button>
    <div class="rc-widget-panel" id="rc-panel">
      <div class="rc-widget-header" id="rc-header">Share your feedback</div>
      <div class="rc-widget-body" id="rc-body">
        <p id="rc-prompt">How was your experience?</p>
        <div id="rc-input-area"></div>
        <button class="rc-submit" id="rc-submit-btn" disabled>Submit</button>
      </div>
      <div class="rc-widget-body" id="rc-success" style="display:none">
        <div class="rc-success"><h3>🎉 Thank you!</h3><p>Your feedback means a lot to us.</p></div>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  var btn = document.getElementById('rc-toggle-btn');
  var panel = document.getElementById('rc-panel');
  var inputArea = document.getElementById('rc-input-area');
  var submitBtn = document.getElementById('rc-submit-btn');
  var successDiv = document.getElementById('rc-success');
  var bodyDiv = document.getElementById('rc-body');
  var promptEl = document.getElementById('rc-prompt');

  var selectedRating = 0;
  var selectedNps = 0;

  btn.onclick = function() { panel.classList.toggle('open'); };

  // Load widget config
  fetch(API_BASE + '/api/public/widget/' + CAMPAIGN_ID)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      var c = data.campaign;
      promptEl.textContent = c.prompt_text || 'How was your experience?';
      btn.style.background = c.accent_color || '#6366f1';
      submitBtn.style.background = c.accent_color || '#6366f1';
      document.getElementById('rc-header').textContent = c.name || 'Share your feedback';

      if (c.widget_type === 'nps') {
        // NPS 0-10
        var npsHtml = '<div class="rc-nps">';
        for (var i = 0; i <= 10; i++) {
          npsHtml += '<button class="rc-nps-btn" data-value="' + i + '">' + i + '</button>';
        }
        npsHtml += '</div>';
        npsHtml += '<textarea class="rc-textarea" id="rc-review-text" placeholder="Tell us more..."></textarea>';
        inputArea.innerHTML = npsHtml;
        var npsBtns = inputArea.querySelectorAll('.rc-nps-btn');
        npsBtns.forEach(function(b) {
          b.onclick = function() {
            npsBtns.forEach(function(x) { x.classList.remove('active'); });
            b.classList.add('active');
            selectedNps = parseInt(b.dataset.value);
            submitBtn.disabled = false;
          };
        });
      } else {
        // Star rating + review
        var starsHtml = '<div class="rc-stars">';
        for (var i = 1; i <= 5; i++) {
          starsHtml += '<span class="rc-star" data-value="' + i + '">★</span>';
        }
        starsHtml += '</div>';
        starsHtml += '<textarea class="rc-textarea" id="rc-review-text" placeholder="Write your review..."></textarea>';
        inputArea.innerHTML = starsHtml;
        var stars = inputArea.querySelectorAll('.rc-star');
        stars.forEach(function(s) {
          s.onclick = function() {
            var val = parseInt(s.dataset.value);
            selectedRating = val;
            stars.forEach(function(x, idx) {
              x.classList.toggle('active', idx < val);
            });
            submitBtn.disabled = false;
          };
        });
      }
    })
    .catch(function(err) { console.error('RC Widget error:', err); });

  submitBtn.onclick = function() {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    var reviewText = document.getElementById('rc-review-text');
    var body = {
      rating: selectedRating || null,
      nps_score: selectedNps || null,
      review_text: reviewText ? reviewText.value : ''
    };
    fetch(API_BASE + '/api/public/' + CAMPAIGN_ID + '/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      bodyDiv.style.display = 'none';
      successDiv.style.display = 'block';
      setTimeout(function() { panel.classList.remove('open'); }, 3000);
    })
    .catch(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      alert('Something went wrong. Please try again.');
    });
  };
})();