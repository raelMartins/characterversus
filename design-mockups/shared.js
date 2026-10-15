// Shared sample data + helpers for the three design mockups.
// Everything here is placeholder content for one wired-up matchup: Percy Jackson vs Aelin Galathynius.
(function () {
  const DATA = {
    fighters: {
      a: {
        name: 'Percy Jackson', short: 'Percy', from: 'Percy Jackson & the Olympians', source: 'Riordan Wiki',
        versions: ['House of Hades · after Tartarus', 'The Last Olympian · Curse of Achilles', 'The Lightning Thief · age 12'],
        tier: 'Mountain level',
        feats: ['Set off the eruption of Mount St. Helens', 'Drowned Akhlys in her own poison in Tartarus', 'Heals, breathes and grows stronger in water'],
        weak: ['Much weaker away from water', 'Fatal flaw: loyalty to his friends'],
        stats: { Power: 7.5, Durability: 7, Speed: 6, Skill: 7, Abilities: 6.5, Stamina: 8 }
      },
      b: {
        name: 'Aelin Galathynius', short: 'Aelin', from: 'Throne of Glass', source: 'Throne of Glass Wiki',
        versions: ['Empire of Storms · Queen of Flame', 'Heir of Fire · training with Rowan', 'Throne of Glass · as Celaena'],
        tier: 'Mountain level',
        feats: ['Destroyed the Rifthold clock tower with wildfire', 'Kept her mind through months in an iron coffin', 'Fae shapeshifter trained as an elite assassin'],
        weak: ['Burnout if she overdraws her power', 'Iron suppresses her magic'],
        stats: { Power: 7.5, Durability: 6.5, Speed: 7, Skill: 9, Abilities: 5, Stamina: 6 }
      }
    },
    arenas: {
      ocean: {
        label: 'Open ocean',
        note: 'Endless water for Percy. Nothing to burn out here except Aelin herself.',
        modes: {
          character: { winner: 'a', conf: 72, method: 'Knockout, underwater', finish: 'Percy hauls her back to the surface before it is too late. He wins, and she lives to be furious about it.' },
          bloodlust: { winner: 'a', conf: 81, method: 'Drowning', finish: 'Bloodlusted, he does not bring her back up.' }
        },
        beats: [
          { who: 'b', title: 'Aelin strikes first', sfx: 'FWOOM!', text: 'Aelin does not wait for introductions. A wall of wildfire skims across the waves. Percy drops beneath the surface and the flames pass over empty water.' },
          { who: 'a', title: 'The sea answers', sfx: 'KRSSHH!', text: 'Percy rises on a column of water and brings a thirty-foot wave down on her. Aelin shifts into her Fae form and flash-boils the crest into steam.' },
          { who: 'b', title: 'Scalding fog', sfx: 'HSSSS', text: 'She turns the steam into a weapon and it blisters his arms. Percy sinks into the sea and comes back up healed. Out here the ocean is his first-aid kit.' },
          { who: 'both', title: 'Blade on blade', sfx: 'CLANG!', text: 'Goldryn meets Riptide on a platform of churning water. Aelin is the better swordfighter and opens a cut along his ribs. He cannot win this part of the fight.' },
          { who: 'a', title: 'Pulled under', sfx: 'GLUB.', text: 'So he stops trying. Percy collapses the platform and drags her down. Two hundred feet below, her fire gutters out against the pressure.' }
        ]
      },
      desert: {
        label: 'Desert',
        note: 'Dry air feeds her fire. The nearest real water is a long way down.',
        modes: {
          character: { winner: 'b', conf: 64, method: 'Exhaustion', finish: 'He lets go, the same way he did in Tartarus. Aelin does not give him a second chance.' },
          bloodlust: { winner: 'draw', conf: 55, method: 'Double knockout', finish: 'Bloodlusted, he does not let go. Her last blast and his grip land at the same moment. Neither of them gets up.' }
        },
        beats: [
          { who: 'a', title: 'Running dry', sfx: 'drip.', text: 'Percy reaches for water and finds almost none. He wrings a thin stream out of a cactus. Aelin laughs at him.' },
          { who: 'b', title: 'Dry heat', sfx: 'FWOOOM!', text: 'Fire loves dry air. Aelin turns the dunes into a sea of flame and Percy spends the next minute running.' },
          { who: 'a', title: 'Earthshaker', sfx: 'RRRMBL', text: 'Son of the Earthshaker, Percy shakes the ground. The dune under Aelin collapses and buries her to the waist.' },
          { who: 'both', title: 'Blade on blade', sfx: 'CLANG!', text: 'She burns her way out and closes in. With no water to heal him, every cut Goldryn lands stays landed.' },
          { who: 'a', title: 'Last resort', sfx: '...', text: 'Cornered, Percy reaches for the water inside her body. It works, and he hates that it works.' }
        ]
      },
      city: {
        label: 'City rooftops',
        note: 'Manhattan at night. Water towers on every roof and the Hudson a few blocks west.',
        modes: {
          character: { winner: 'a', conf: 58, method: 'Knockout in the Hudson', finish: 'Close until the river. Percy wins, soaked and bleeding, and drops her on a pier.' },
          bloodlust: { winner: 'a', conf: 61, method: 'Drowning', finish: 'Bloodlusted, it ends the same way the ocean fight does, only faster.' }
        },
        beats: [
          { who: 'b', title: 'Rooftop ambush', sfx: 'FWOOM!', text: 'Aelin opens by setting the roof on fire, with Percy standing on it.' },
          { who: 'a', title: 'Water towers', sfx: 'SPLOOSH!', text: 'Percy bursts every water tower on the block. Ten thousand gallons put out the roof and knock Aelin off her feet.' },
          { who: 'both', title: 'Running fight', sfx: 'CLANG!', text: 'They trade blows across six rooftops. She is faster and the better blade. He is wetter.' },
          { who: 'a', title: 'To the river', sfx: 'SPLASH!', text: 'Percy drags the fight into the Hudson, and from there it plays out like the ocean.' }
        ]
      }
    },
    community: {
      agree: 1284, disagree: 412,
      args: [
        { votes: 318, status: 'Reviewed · verdict held', text: 'Aelin can keep the water around her boiling for the whole fight. Percy cannot drown someone standing in steam.', reply: 'Considered. She can boil a pocket of sea, not the Pacific. Holding it drains her faster than the ocean drains him. Reasoning expanded in v2.' },
        { votes: 201, status: 'Under review', text: 'Percy beat Ares and fought Kronos in the Last Olympian. His sword skill is being underrated here.', reply: null },
        { votes: 96, status: 'Needs 150 votes for review', text: 'Aelin was trained as an assassin. She would go for the throat before Percy ever reaches the water.', reply: null }
      ],
      history: [
        { v: 'v2', date: '12 Oct 2026', text: 'Reasoning expanded after the steam-shield argument. Winner unchanged.' },
        { v: 'v1', date: '30 Sep 2026', text: 'First verdict.' }
      ]
    }
  };

  const SUGGEST = [
    ['Percy Jackson', 'Percy Jackson & the Olympians'], ['Percy Weasley', 'Harry Potter'], ['Peter Parker', 'Marvel'],
    ['Aelin Galathynius', 'Throne of Glass'], ['Aang', 'Avatar: The Last Airbender'], ['Aslan', 'The Chronicles of Narnia'],
    ['Superman', 'DC'], ['Sentry', 'Marvel'], ['Son Goku', 'Dragon Ball'], ['Wanda Maximoff', 'Marvel'],
    ['Hashirama Senju', 'Naruto'], ['Harry Potter', 'Harry Potter'], ['Hermione Granger', 'Harry Potter'],
    ['Thor', 'Marvel'], ['Hulk', 'Marvel'], ['Batman', 'DC'], ['Wolverine', 'Marvel'], ['Deadpool', 'Marvel'],
    ['Katniss Everdeen', 'The Hunger Games'], ['Rowan Whitethorn', 'Throne of Glass'], ['SpongeBob SquarePants', 'SpongeBob']
  ];

  const LOOKS = {
    a: { label: 'Percy Jackson', skin: '#c7b195', top: '#f08a24', bottom: '#355789', boots: '#24221f', hair: '#2b2420', blade: '#d29a46', hilt: '#6b4a22', gem: '#d29a46', aura: 'water' },
    b: { label: 'Aelin Galathynius', skin: '#d6bf9f', top: '#22343c', bottom: '#18242a', boots: '#3b2b20', hair: '#e5b44c', blade: '#e6c26a', hilt: '#8a5a1c', gem: '#c8262f', aura: 'fire', longHair: true, crown: true, flip: true }
  };

  let uid = 0;
  function fig(key, opts) {
    const o = Object.assign({}, LOOKS[key], opts || {});
    const g = 'fg' + (++uid);
    const water = '<path d="M14 282 Q56 252 100 274 Q144 296 186 266" stroke="#38a6d8" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9"/>' +
      '<path d="M26 256 Q48 222 36 186 Q70 210 60 252Z" fill="#5cc3ea" opacity=".65"/><path d="M166 236 Q184 204 170 172 Q198 198 186 238Z" fill="#5cc3ea" opacity=".65"/>';
    const fire = '<path d="M30 272 Q18 230 40 198 Q40 226 54 232 Q48 204 68 182 Q68 222 82 240 Q88 264 68 276Z" fill="#ff6a1a" opacity=".9"/>' +
      '<path d="M44 272 Q40 248 52 234 Q58 252 68 258 Q70 270 60 276Z" fill="#ffd23f"/>' +
      '<path d="M150 276 Q140 244 158 220 Q160 240 170 244 Q168 222 184 206 Q194 240 186 264 Q182 278 168 280Z" fill="#ff6a1a" opacity=".9"/>' +
      '<path d="M160 276 Q158 258 168 248 Q172 262 180 266 Q178 278 170 280Z" fill="#ffd23f"/>';
    const aura = o.aura === 'water' ? water : fire;
    const longHair = o.longHair ? `<path d="M73 56 Q72 26 100 27 Q128 26 127 56 Q134 96 140 130 Q122 122 118 100 L82 100 Q78 122 60 130 Q66 96 73 56Z" fill="${o.hair}"/>` : '';
    const hairTop = o.longHair
      ? `<path d="M75 54 Q76 28 100 28 Q124 28 125 54 Q112 40 100 42 Q88 40 75 54Z" fill="${o.hair}"/>`
      : `<path d="M75 56 Q73 28 100 29 Q128 28 126 54 Q120 42 114 46 Q110 35 102 42 Q94 33 88 44 Q82 40 75 56Z" fill="${o.hair}"/>`;
    const crown = o.crown ? '<path d="M84 31 Q88 16 93 26 Q98 4 104 24 Q110 12 115 30" fill="none" stroke="#ff8a1e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' : '';
    return `<svg class="fig" viewBox="0 0 200 300" role="img" aria-label="${o.label}, drawn as a faceless figure">
<defs>
<radialGradient id="${g}h" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>
<linearGradient id="${g}b" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
</defs>
<g${o.flip ? ' transform="translate(200 0) scale(-1 1)"' : ''}>
${o.noAura ? '' : aura}
${longHair}
<path d="M76 102 Q56 122 58 150 Q60 157 68 154 Q70 132 86 116Z" fill="${o.skin}"/>
<path d="M76 102 Q62 112 60 124 L72 128 Q76 116 86 112Z" fill="${o.top}"/>
<circle cx="63" cy="153" r="7" fill="${o.skin}"/>
<path d="M84 170 L70 262 L88 264 L100 200 L112 264 L130 262 L116 170Z" fill="${o.bottom}"/>
<path d="M66 258 h26 v12 h-30z" fill="${o.boots}"/><path d="M108 258 h26 l4 12 h-30z" fill="${o.boots}"/>
<path d="M68 100 Q100 88 132 100 L126 146 Q120 168 116 174 L84 174 Q80 168 74 146Z" fill="${o.top}"/>
<path d="M68 100 Q100 88 132 100 L126 146 Q120 168 116 174 L84 174 Q80 168 74 146Z" fill="url(#${g}b)"/>
<path d="M84 124 Q100 133 116 124 M100 110 V160" stroke="#000" stroke-opacity=".2" stroke-width="2" fill="none"/>
<rect x="82" y="165" width="36" height="8" fill="#000" fill-opacity=".35"/>
<path d="M150 140 L184 56" stroke="${o.blade}" stroke-width="6" stroke-linecap="round"/>
<path d="M139 131 L162 147" stroke="${o.hilt}" stroke-width="6" stroke-linecap="round"/>
<circle cx="146" cy="152" r="4" fill="${o.gem}"/>
<path d="M124 100 Q146 112 156 134 Q154 143 146 142 Q138 124 120 116Z" fill="${o.skin}"/>
<path d="M124 100 Q138 106 146 118 L134 124 Q128 114 120 112Z" fill="${o.top}"/>
<circle cx="151" cy="140" r="8" fill="${o.skin}"/>
<rect x="93" y="76" width="14" height="16" rx="4" fill="${o.skin}"/>
<circle cx="100" cy="58" r="24" fill="${o.skin}"/>
<circle cx="100" cy="58" r="24" fill="url(#${g}h)"/>
${hairTop}
${crown}
</g></svg>`;
  }

  function setupTheme(btn) {
    const root = document.documentElement;
    try { const t = localStorage.getItem('vs-theme'); if (t) root.dataset.theme = t; } catch (e) {}
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const sync = () => {
      btn.dataset.mode = isDark() ? 'dark' : 'light';
      btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    };
    btn.addEventListener('click', () => {
      root.dataset.theme = isDark() ? 'light' : 'dark';
      try { localStorage.setItem('vs-theme', root.dataset.theme); } catch (e) {}
      sync();
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
    sync();
  }

  // Autocomplete over SUGGEST. onPick(name) fires on click or Enter.
  function setupSearch(input, list, onPick) {
    let items = [], active = -1;
    const render = () => {
      const q = input.value.trim().toLowerCase();
      items = q ? SUGGEST.filter(([n]) => n.toLowerCase().includes(q)).slice(0, 6) : [];
      active = items.length ? 0 : -1;
      list.innerHTML = items.map(([n, s], i) =>
        `<li role="option" id="${list.id}-${i}" aria-selected="${i === active}" data-name="${n}"><span class="s-name">${n}</span><span class="s-from">${s}</span></li>`).join('');
      list.hidden = !items.length;
      input.setAttribute('aria-expanded', String(!!items.length));
    };
    const mark = () => [...list.children].forEach((li, i) => li.setAttribute('aria-selected', String(i === active)));
    const pick = (name) => { input.value = name; list.hidden = true; input.setAttribute('aria-expanded', 'false'); onPick(name); };
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-autocomplete', 'list');
    input.addEventListener('input', render);
    input.addEventListener('focus', () => { input.select(); });
    input.addEventListener('keydown', (e) => {
      if (list.hidden) return;
      if (e.key === 'ArrowDown') { active = (active + 1) % items.length; mark(); e.preventDefault(); }
      else if (e.key === 'ArrowUp') { active = (active - 1 + items.length) % items.length; mark(); e.preventDefault(); }
      else if (e.key === 'Enter' && active > -1) { pick(items[active][0]); e.preventDefault(); }
      else if (e.key === 'Escape') { list.hidden = true; }
    });
    list.addEventListener('mousedown', (e) => { const li = e.target.closest('li'); if (li) { e.preventDefault(); pick(li.dataset.name); } });
    input.addEventListener('blur', () => setTimeout(() => { list.hidden = true; }, 120));
  }

  window.VS = { DATA, SUGGEST, fig, setupTheme, setupSearch };
})();
