/* ================================================================
   quiz.js — Assessment engine for The Rainmaker App advisor pages
   Vanilla JS · No dependencies · Static-file compatible
   ================================================================ */

(function () {
  'use strict';

  /* ── UTM helpers ── */
  function getUTMParams() {
    var params = {};
    var search = window.location.search.substring(1);
    if (!search) return params;
    search.split('&').forEach(function (pair) {
      var parts = pair.split('=');
      var key = decodeURIComponent(parts[0]);
      if (key.indexOf('utm_') === 0 || key === 'ref') {
        params[key] = decodeURIComponent(parts[1] || '');
      }
    });
    return params;
  }

  function persistUTM() {
    var utm = getUTMParams();
    if (Object.keys(utm).length) {
      sessionStorage.setItem('rainmaker_utm', JSON.stringify(utm));
    }
  }

  function getStoredUTM() {
    try {
      return JSON.parse(sessionStorage.getItem('rainmaker_utm') || '{}');
    } catch (e) {
      return {};
    }
  }

  function appendUTMToUrl(url) {
    var utm = Object.assign({}, getStoredUTM(), getUTMParams());
    var qs = Object.keys(utm).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(utm[k]);
    }).join('&');
    if (!qs) return url;
    return url + (url.indexOf('?') > -1 ? '&' : '?') + qs;
  }

  function injectUTMHiddenFields(form) {
    var utm = Object.assign({}, getStoredUTM(), getUTMParams());
    Object.keys(utm).forEach(function (key) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = utm[key];
      form.appendChild(input);
    });
  }

  /* ── Instantly V2 API ── */
  var INSTANTLY_API_KEY = 'NTA5MjllMTMtOWM5NC00NmU5LTkyYjgtMGE1MWMxNjIzYjM3OmZ0TU9sZVNjUHRQbQ==';
  var INSTANTLY_API_BASE = 'https://api.instantly.ai/api/v2';

  // Campaign IDs — replace these with your actual Instantly campaign UUIDs
  var CAMPAIGN_IDS = {
    hunter:   '8d14f42c-4ba4-436e-9e33-29cf8bb152a8',
    gatherer: '78122468-f519-46f8-9edf-825679613fc0'
  };

  function sendToInstantly(email, firstName, customVars) {
    var advisorType = (customVars && customVars.advisor_type) || '';
    var campaignId = CAMPAIGN_IDS[advisorType];

    var payload = {
      email: email,
      first_name: firstName,
      custom_variables: customVars || {}
    };
    // Assign to campaign if we have the ID
    if (campaignId && campaignId.indexOf('_CAMPAIGN_ID') === -1) {
      payload.campaign_id = campaignId;
    }

    return fetch(INSTANTLY_API_BASE + '/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + INSTANTLY_API_KEY
      },
      body: JSON.stringify(payload)
    }).catch(function () { /* silent fail — funnel still works */ });
  }

  /* ── On page load: persist UTM and patch all internal links ── */
  persistUTM();
  document.addEventListener('DOMContentLoaded', function () {
    // Append UTM to internal links
    var links = document.querySelectorAll('a[href]');
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && (href.indexOf('/') === 0 || href.indexOf('.') === 0 || href.indexOf('advisors') > -1) && href.indexOf('http') !== 0) {
        a.setAttribute('href', appendUTMToUrl(href));
      }
    });

    // Patch forms with UTM hidden fields
    var forms = document.querySelectorAll('form[data-utm]');
    forms.forEach(function (f) { injectUTMHiddenFields(f); });
  });

  /* ── Archetype definitions ── */
  var HUNTER_ARCHETYPES = {
    A: {
      name: 'The Strategist',
      tagline: 'You don\'t chase — you position.',
      description: [
        'You\'re the advisor who does the homework before everyone else shows up. You research your prospects, prepare tailored approaches, and walk into every meeting with a plan. You don\'t rely on charm — you rely on competence. And the right prospects can feel it instantly.',
        'Your natural communication style signals depth, preparation, and intellectual rigor. The prospects who are drawn to you are the ones who value expertise over personality. They want to know that you\'ve thought about their situation more carefully than anyone else will.',
        'Your biggest risk? Over-preparing for people who were never going to appreciate it. When you target the right analytical, detail-oriented prospects, your close rate transforms — because you\'re not selling, you\'re solving.'
      ],
      blindSpot: 'You sometimes mistake a prospect\'s desire for data as genuine buying intent. Not everyone who asks smart questions is ready to act. Learn to test for commitment, not just curiosity.',
      drawnTo: [
        'Analytical professionals who want to understand the "why" behind every recommendation',
        'Business owners who respect preparation and strategic thinking',
        'High-net-worth individuals who\'ve been disappointed by advisors who didn\'t do the work'
      ]
    },
    B: {
      name: 'The Connector',
      tagline: 'People don\'t buy your plan. They buy you.',
      description: [
        'You build trust the old-fashioned way — through genuine human connection. Your best prospecting happens through conversations, referrals, and relationships that develop naturally. You don\'t have a "pitch." You have a way of making people feel heard.',
        'Your strength is that prospects feel safe with you almost immediately. You\'re warm, attentive, and genuinely interested in people. The clients who close fastest with you are the ones who value the relationship as much as the returns.',
        'Your network is your goldmine. The more you lean into relationship-based prospecting, the less you need to cold-call, cold-email, or compete on credentials. Your people find you — and they stay.'
      ],
      blindSpot: 'You sometimes invest heavily in relationships that feel great personally but never convert professionally. Not every warm connection is a qualified prospect. Build a filter for financial fit alongside personal rapport.',
      drawnTo: [
        'Relationship-driven professionals who choose advisors based on trust and likability',
        'Families and individuals going through transitions who need someone who genuinely cares',
        'Referral-rich connectors who introduce you to their entire circle once they trust you'
      ]
    },
    C: {
      name: 'The Closer',
      tagline: 'You were built for the moment of decision.',
      description: [
        'You thrive in the space between interest and commitment. Where other advisors hesitate to ask for the business, you lean in. You\'re direct, confident, and unapologetic about your value — and the right prospects find that incredibly refreshing.',
        'Your natural style attracts ambitious, action-oriented people who are tired of advisors who hedge, qualify, and never get to the point. They want someone who matches their energy — someone who moves as fast as they do.',
        'Your close rate with the right prospects is exceptional. The challenge has never been your ability to convert — it\'s been finding enough of the right people to convert. When your targeting matches your style, your pipeline transforms.'
      ],
      blindSpot: 'Your directness — your greatest asset — can feel like pressure to prospects who need more time. You occasionally lose people who would have said yes in meeting three because you pushed for yes in meeting one. Match your pace to theirs.',
      drawnTo: [
        'Ambitious executives and entrepreneurs who respect directness and decisiveness',
        'High-income professionals who value efficiency and don\'t want to waste time',
        'Action-oriented individuals who are ready to make financial moves now'
      ]
    },
    D: {
      name: 'The Advisor',
      tagline: 'Trust is your currency — and you never devalue it.',
      description: [
        'You play the long game better than anyone. While other advisors are chasing the quick close, you\'re building something that lasts. You lead with education, establish credibility through insight, and let prospects come to you when they\'re ready.',
        'Your approach is magnetic to people who\'ve been burned before — prospects who are skeptical, cautious, and tired of being sold to. They don\'t want a salesperson. They want a trusted advisor. And that\'s exactly what you are.',
        'Your pipeline may build more slowly, but your conversion rate and client retention are extraordinary. The people who choose you almost never leave — because you earned their trust before you ever asked for their business.'
      ],
      blindSpot: 'Your patience is a virtue, but it can become passivity. Some prospects interpret your "no pressure" approach as lack of interest. Build intentional touchpoints so your educational approach doesn\'t accidentally feel like indifference.',
      drawnTo: [
        'Cautious, risk-aware individuals who need to feel completely safe before committing',
        'Professionals approaching retirement who want a steady, trustworthy hand',
        'High-net-worth families who value long-term relationships over short-term performance'
      ]
    }
  };

  var GATHERER_ARCHETYPES = {
    A: {
      name: 'The Authority',
      tagline: 'Your expertise is your edge — and your best clients know it.',
      description: [
        'Your best client relationships are built on respect for your judgment. When clients trust you completely and follow your lead, the relationship works beautifully. When they second-guess every recommendation, the friction is unbearable — not because you\'re inflexible, but because your value is in your expertise.',
        'You\'ve earned the right to lead. Decades of experience have given you pattern recognition that most advisors will never develop. Your ideal clients understand this. They chose you because you know things they don\'t — and they\'re smart enough to let you do your job.',
        'The clients who drain you are the ones who hired an expert and then refuse to take expert advice. That\'s not a relationship problem — it\'s a compatibility problem. And now you can solve it systematically.'
      ],
      blindSpot: 'Some clients who challenge you aren\'t disrespecting your expertise — they\'re processing information differently. Your best growth comes from distinguishing between clients who undermine you and clients who simply need to understand before they trust.',
      drawnTo: [
        'Successful professionals who respect expertise and delegate with confidence',
        'Business owners accustomed to hiring specialists and trusting their judgment',
        'High-net-worth individuals who\'ve had enough advisors to know a great one when they find one'
      ]
    },
    B: {
      name: 'The Confidant',
      tagline: 'Your clients don\'t just trust you with their money — they trust you with their lives.',
      description: [
        'The relationships that energize you go far beyond portfolio management. Your best clients feel like friends — people you genuinely care about, whose lives you\'re invested in beyond the financial plan. When that connection is there, everything flows.',
        'You\'ve always known that your real value isn\'t in asset allocation or market timing. It\'s in being the person your clients call first — not just for financial decisions, but for life decisions. You\'re a confidant, a sounding board, a trusted presence in their world.',
        'The clients who exhaust you are the ones who keep things purely transactional. They evaluate you on performance alone, never invest in the relationship, and would switch advisors for 50 basis points. That\'s not your game — and it never should be.'
      ],
      blindSpot: 'Your deep personal investment in clients can make it harder to set boundaries. Not every client relationship needs to be a friendship. Build a tier system: know which clients get the "confidant experience" and which ones get excellent professional service without the emotional bandwidth.',
      drawnTo: [
        'Clients who value personal relationships and loyalty above all else',
        'Families going through generational wealth transfers who need a trusted guide',
        'Individuals who make financial decisions based on how they feel about their advisor, not just returns'
      ]
    },
    C: {
      name: 'The Catalyst',
      tagline: 'You don\'t just manage wealth — you help people build it.',
      description: [
        'Your energy comes from working with ambitious, growth-oriented clients who want to do something significant with their wealth. Passive clients who just want to "set it and forget it" bore you — not because they\'re bad clients, but because they don\'t need what you\'re best at.',
        'You\'re at your peak when you\'re helping someone see a bigger vision — a business expansion, a philanthropic legacy, a generational wealth strategy that changes a family\'s trajectory. Your value isn\'t in preservation. It\'s in acceleration.',
        'The clients who drain you are the ones who\'ve mentally retired from ambition. They\'re playing defense, and while there\'s nothing wrong with that, it doesn\'t light you up. Your ideal book is full of people who are still building — and want a partner who matches their drive.'
      ],
      blindSpot: 'Your bias toward action can sometimes push clients faster than they\'re comfortable moving. Not every hesitation is resistance — sometimes it\'s prudent caution. The best catalysts know when to push and when to pause.',
      drawnTo: [
        'Entrepreneurs and executives in growth mode who want a proactive financial partner',
        'Clients with complex financial situations who need creative, ambitious strategies',
        'Next-generation wealth holders who want to build their own legacy, not just inherit one'
      ]
    },
    D: {
      name: 'The Steward',
      tagline: 'Your clients sleep well at night — because of you.',
      description: [
        'The deepest satisfaction in your practice comes from knowing your clients feel completely secure. Not just financially — emotionally. They trust you so fully that money is one less thing they worry about. That\'s not just a service. That\'s a gift.',
        'You\'ve built your book on a foundation of deep, enduring trust. Your clients have given you discretion not because they\'re disengaged, but because you\'ve proven — over years of consistent, reliable stewardship — that you\'ve earned it.',
        'The clients who challenge you most are the ones who can never fully relax. They check their accounts daily, question every fee, and treat the relationship like a negotiation rather than a partnership. They need something you can\'t give them — not better advice, but the ability to trust.'
      ],
      blindSpot: 'Your steady, reassuring style is your greatest asset — but it can occasionally be mistaken for lack of ambition. Some clients want to know you\'re proactively seeking opportunity, not just protecting against downside. Communicate your proactive moves, even when they\'re subtle.',
      drawnTo: [
        'Pre-retirees and retirees who prioritize security and peace of mind above all else',
        'Widows, widowers, and individuals navigating financial transitions alone',
        'Long-term clients who value consistency and would never switch advisors for marginal gains'
      ]
    }
  };

  /* ── Scoring engine ── */
  function scoreAnswers(answers) {
    var tally = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach(function (a) { if (tally.hasOwnProperty(a)) tally[a]++; });
    var max = 0;
    var winner = 'A';
    Object.keys(tally).forEach(function (k) {
      if (tally[k] > max) { max = tally[k]; winner = k; }
    });
    return { winner: winner, tally: tally };
  }

  /* ── Quiz controller ── */
  function initQuiz() {
    var quizEl = document.getElementById('quiz-container');
    if (!quizEl) return;

    var questionsData = JSON.parse(quizEl.getAttribute('data-questions'));
    var advisorType = quizEl.getAttribute('data-advisor-type'); // 'hunter' or 'gatherer'
    var answers = [];
    var currentQ = 0;

    var progressFill = document.getElementById('quiz-progress-fill');
    var progressText = document.getElementById('quiz-progress-text');
    var questionArea = document.getElementById('quiz-question-area');

    function renderQuestion(idx) {
      var q = questionsData[idx];
      var html = '<h3 class="text-xl font-semibold text-slate-100 mb-6">' + q.question + '</h3>';
      html += '<div class="space-y-3">';
      q.options.forEach(function (opt, i) {
        var letter = String.fromCharCode(65 + i);
        html += '<button class="quiz-option" data-answer="' + letter + '">' +
          '<span class="font-semibold text-blue-400 mr-2">' + letter + ')</span> ' +
          '<span class="text-slate-200">' + opt + '</span></button>';
      });
      html += '</div>';
      questionArea.innerHTML = html;

      // Bind option clicks
      questionArea.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          // Visual feedback
          questionArea.querySelectorAll('.quiz-option').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');

          // Record answer
          answers[idx] = btn.getAttribute('data-answer');

          // Brief pause then advance
          setTimeout(function () {
            if (idx < questionsData.length - 1) {
              currentQ++;
              updateProgress();
              renderQuestion(currentQ);
            } else {
              finishQuiz();
            }
          }, 350);
        });
      });
    }

    function updateProgress() {
      var pct = ((currentQ) / questionsData.length) * 100;
      progressFill.style.width = pct + '%';
      progressText.textContent = 'Question ' + (currentQ + 1) + ' of ' + questionsData.length;
    }

    function finishQuiz() {
      var result = scoreAnswers(answers);
      // Store result
      sessionStorage.setItem('rainmaker_archetype', result.winner);
      sessionStorage.setItem('rainmaker_advisor_type', advisorType);
      sessionStorage.setItem('rainmaker_tally', JSON.stringify(result.tally));

      // Redirect to result page
      var resultUrl = advisorType === 'hunter'
        ? '/hunter/result.html'
        : '/gatherer/result.html';
      window.location.href = appendUTMToUrl(resultUrl);
    }

    updateProgress();
    renderQuestion(0);
  }

  /* ── Email gate ── */
  function initEmailGate() {
    var gateForm = document.getElementById('email-gate-form');
    if (!gateForm) return;

    gateForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstName = gateForm.querySelector('[name="first_name"]').value.trim();
      var email = gateForm.querySelector('[name="email"]').value.trim();
      if (!firstName || !email) return;

      // Store for later use on result page
      sessionStorage.setItem('rainmaker_first_name', firstName);
      sessionStorage.setItem('rainmaker_email', email);

      // Send to Instantly
      var advisorType = gateForm.getAttribute('data-advisor-type');
      var utm = Object.assign({}, getStoredUTM(), getUTMParams());
      var customVars = Object.assign({}, utm, {
        advisor_type: advisorType,
        form_type: 'email_gate'
      });
      sendToInstantly(email, firstName, customVars);

      // Show quiz
      document.getElementById('email-gate').style.display = 'none';
      document.getElementById('quiz-section').style.display = 'block';
      initQuiz();
    });
  }

  /* ── Result page renderer ── */
  function initResult() {
    var resultEl = document.getElementById('result-container');
    if (!resultEl) return;

    var advisorType = resultEl.getAttribute('data-advisor-type');
    var archetypeKey = sessionStorage.getItem('rainmaker_archetype');
    var firstName = sessionStorage.getItem('rainmaker_first_name') || '';

    if (!archetypeKey) {
      // No result — redirect back to assessment
      window.location.href = appendUTMToUrl('/' + advisorType + '/assessment.html');
      return;
    }

    var archetypes = advisorType === 'hunter' ? HUNTER_ARCHETYPES : GATHERER_ARCHETYPES;
    var arch = archetypes[archetypeKey];
    if (!arch) {
      window.location.href = appendUTMToUrl('/' + advisorType + '/assessment.html');
      return;
    }

    // Populate
    var greetName = firstName ? ', ' + firstName : '';
    document.getElementById('result-greeting').textContent = greetName;
    document.getElementById('result-archetype').textContent = arch.name;
    document.getElementById('result-tagline').textContent = arch.tagline;

    var descHtml = '';
    arch.description.forEach(function (p) {
      descHtml += '<p class="text-slate-300 leading-relaxed mb-4">' + p + '</p>';
    });
    document.getElementById('result-description').innerHTML = descHtml;

    var blindSpotLabel = advisorType === 'hunter'
      ? 'Your Prospecting Blind Spot'
      : 'Your Client Compatibility Pattern';
    document.getElementById('result-blindspot-label').textContent = blindSpotLabel;
    document.getElementById('result-blindspot').textContent = arch.blindSpot;

    var drawnLabel = advisorType === 'hunter'
      ? 'The 3 prospect types most naturally drawn to you:'
      : 'The 3 client types most naturally drawn to you:';
    document.getElementById('result-drawn-label').textContent = drawnLabel;
    var drawnHtml = '';
    arch.drawnTo.forEach(function (item) {
      drawnHtml += '<li class="flex items-start gap-3 text-slate-300">' +
        '<i class="fa-solid fa-check text-gold mt-1"></i><span>' + item + '</span></li>';
    });
    document.getElementById('result-drawn-list').innerHTML = drawnHtml;

    // Pre-fill waitlist form
    var emailInput = document.querySelector('#waitlist-form [name="email"]');
    var fnInput = document.querySelector('#waitlist-form [name="first_name"]');
    if (emailInput) emailInput.value = sessionStorage.getItem('rainmaker_email') || '';
    if (fnInput) fnInput.value = firstName;
  }

  /* ── Waitlist form ── */
  function initWaitlist() {
    var form = document.getElementById('waitlist-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var formData = {};
      new FormData(form).forEach(function (val, key) { formData[key] = val; });

      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
      btn.disabled = true;

      // Build custom variables for Instantly
      var utm = Object.assign({}, getStoredUTM(), getUTMParams());
      var customVars = Object.assign({}, utm, {
        advisor_type: formData.advisor_type || form.getAttribute('data-advisor-type') || '',
        archetype: sessionStorage.getItem('rainmaker_archetype') || '',
        form_type: 'waitlist',
        last_name: formData.last_name || '',
        firm_name: formData.firm_name || '',
        years_in_practice: formData.years_in_practice || ''
      });

      var submitPromise = sendToInstantly(
        formData.email,
        formData.first_name,
        customVars
      ) || Promise.resolve();

      submitPromise
        .then(function () {
          form.innerHTML = '<div class="text-center fade-in-up">' +
            '<i class="fa-solid fa-circle-check text-4xl text-gold mb-4"></i>' +
            '<h3 class="text-2xl font-display font-bold text-slate-100 mb-2">You\'re on the list.</h3>' +
            '<p class="text-slate-400">We\'ll be in touch when your cohort opens. Watch your inbox.</p></div>';
        })
        .catch(function () {
          btn.innerHTML = originalText;
          btn.disabled = false;
          alert('Something went wrong. Please try again.');
        });
    });
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', function () {
    initEmailGate();
    initResult();
    initWaitlist();
  });
})();
