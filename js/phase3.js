// ============================================================
// phase3.js — 会议阶段：玩家卡片 + 阵营统计面板
// ============================================================

const Phase3 = (() => {

  const TRUST_LABELS = {
    unknown:        '未知',
    suspicious:     '可疑',
    trusted:        '信任',
    confirmed_duck: '确认是鸭',
  };

  function init() {
    document.getElementById('btn-next-round').addEventListener('click', () => {
      State.nextRound();
      App.switchPhase('game');
    });
  }

  function render() {
    _renderPlayerCards();
    _renderFactionStats();
  }

  // ── 玩家卡片 ──────────────────────────────────────────────

  function _renderPlayerCards() {
    const { players, config, round } = State.get();
    const grid = document.getElementById('player-cards-grid');
    grid.innerHTML = '';

    const count = config.playerCount;
    for (let i = 1; i <= count; i++) {
      const p = players[i];
      if (!p) continue;
      const card = _buildCard(i, p, round);
      grid.appendChild(card);
    }
  }

  function _buildCard(num, p, round) {
    const { players, config } = State.get();
    // 检测重复角色
    const isDuplicate = p.role && Object.values(players).filter(pl => pl.role === p.role).length > 1;

    // 检测明牌已满时的跳出角色
    let isOverflowed = false;
    if (p.role) {
      const faction = p.faction || getRoleFaction(p.role);
      if (faction) {
        const openNames = config.openRoles.filter(r => getRoleFaction(r) === faction);
        const total = config.factions[faction] || 0;
        const isJumped = !openNames.includes(p.role);
        const openFull = openNames.length >= total && total > 0;
        isOverflowed = isJumped && openFull;
      }
    }

    const card = document.createElement('div');
    card.className = 'player-card' +
      (p.alive ? ' alive' : ' dead') +
      (p.faction ? ` faction-${p.faction}` : '') +
      (isDuplicate ? ' duplicate-role' : '') +
      (isOverflowed ? ' overflowed-card' : '');
    card.dataset.player = num;

    // ── 行1：编号 + 存活 + 可信度 ──
    const header = document.createElement('div');
    header.className = 'card-header';

    const numEl = document.createElement('span');
    numEl.className = 'card-num';
    numEl.textContent = `${num}号`;

    const aliveBtn = document.createElement('button');
    aliveBtn.className = `alive-btn ${p.alive ? 'alive' : 'dead'}`;
    aliveBtn.textContent = p.alive ? '存活' : '死亡';
    aliveBtn.addEventListener('click', () => {
      State.toggleAlive(num);
      _refreshCard(num);
      _renderFactionStats();
    });

    const trustBtn = document.createElement('button');
    trustBtn.className = `trust-btn trust-${p.trust}`;
    trustBtn.textContent = TRUST_LABELS[p.trust] || '未知';
    trustBtn.addEventListener('click', () => {
      State.cycleTrust(num);
      _refreshCard(num);
    });

    header.appendChild(numEl);
    header.appendChild(aliveBtn);

    // 角色标签（选定角色后高亮显示）
    if (p.role) {
      const faction = p.faction || getRoleFaction(p.role);
      const roleTag = document.createElement('span');
      roleTag.className = `card-role-tag${faction ? ` ${faction}` : ''}`;
      roleTag.textContent = p.role;
      roleTag.title = p.role;
      header.appendChild(roleTag);
    }

    header.appendChild(trustBtn);
    card.appendChild(header);

    // ── 行2：阵营按钮 + 角色搜索 横排 ──
    const row2 = document.createElement('div');
    row2.className = 'card-row2';

    const factionBtns = document.createElement('div');
    factionBtns.className = 'faction-btns';
    [
      { key: 'goose',   label: '🪿' },
      { key: 'duck',    label: '🦆' },
      { key: 'neutral', label: '🕊️' },
    ].forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.className = `faction-btn${p.faction === key ? ` active-${key}` : ''}`;
      btn.textContent = label;
      btn.title = { goose: '鹅阵营', duck: '鸭阵营', neutral: '中立' }[key];
      btn.addEventListener('click', () => {
        State.setFaction(num, p.faction === key ? null : key);
        _refreshCard(num);
        _renderFactionStats();
      });
      factionBtns.appendChild(btn);
    });

    const roleWrapper = document.createElement('div');
    roleWrapper.className = 'role-search-wrapper';
    roleWrapper.style.flex = '1';

    const roleInput = document.createElement('input');
    roleInput.type = 'text';
    roleInput.className = 'role-search-input';
    roleInput.placeholder = '搜索角色…';
    roleInput.value = p.role || '';
    roleInput.autocomplete = 'off';

    const dropdown = document.createElement('div');
    dropdown.className = 'role-dropdown';

    roleInput.addEventListener('input', () => _showRoleDropdown(roleInput, dropdown, num));
    roleInput.addEventListener('focus', () => _showRoleDropdown(roleInput, dropdown, num));
    roleInput.addEventListener('keydown', e => {
      if (e.key === 'Escape') dropdown.classList.remove('open');
    });
    document.addEventListener('click', e => {
      if (!roleWrapper.contains(e.target)) dropdown.classList.remove('open');
    }, { capture: true });

    roleWrapper.appendChild(roleInput);
    roleWrapper.appendChild(dropdown);

    row2.appendChild(factionBtns);
    row2.appendChild(roleWrapper);
    card.appendChild(row2);

    // ── 行3：目击记录 + 备注 横排 ──
    const row3 = document.createElement('div');
    row3.className = 'card-row3';

    // 目击记录（左侧固定宽）
    const sightings = State.getPlayerSightings(num);
    const sightDiv = document.createElement('div');
    sightDiv.className = 'card-sightings';
    const sightLabel = document.createElement('div');
    sightLabel.className = 'card-section-label';
    sightLabel.textContent = '目击';
    sightDiv.appendChild(sightLabel);

    if (sightings.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'no-sighting';
      empty.textContent = '无';
      sightDiv.appendChild(empty);
    } else {
      sightings.forEach(s => {
        const entry = document.createElement('div');
        entry.className = 'sighting-entry';
        entry.innerHTML = `<span class="sighting-round">R${s.round}</span><span>${s.room}</span>`;
        sightDiv.appendChild(entry);
      });
    }

    // 备注（右侧自适应）
    const notesDiv = document.createElement('div');
    notesDiv.className = 'card-notes';
    const notesLabel = document.createElement('div');
    notesLabel.className = 'card-section-label';
    notesLabel.textContent = '备注';
    notesDiv.appendChild(notesLabel);

    const textarea = document.createElement('textarea');
    // 合并历史备注为 placeholder 提示，当前轮次可编辑
    const prevNotes = Object.entries(p.notes || {})
      .sort(([a], [b]) => Number(a) - Number(b))
      .filter(([r, t]) => Number(r) !== round && t && t.trim())
      .map(([r, t]) => `[R${r}]${t}`)
      .join(' ');
    textarea.value = (p.notes || {})[round] || '';
    textarea.placeholder = prevNotes || `R${round}备注…`;
    textarea.title = prevNotes ? `历史备注：${prevNotes}` : '';
    textarea.addEventListener('blur', () => {
      State.setNote(num, round, textarea.value);
    });
    notesDiv.appendChild(textarea);

    row3.appendChild(sightDiv);
    row3.appendChild(notesDiv);
    card.appendChild(row3);

    return card;
  }

  function _showRoleDropdown(input, dropdown, playerNum) {
    const query = input.value.trim();
    const results = searchRoles(query).slice(0, 12);
    dropdown.innerHTML = '';

    if (results.length === 0) {
      dropdown.classList.remove('open');
      return;
    }

    results.forEach(role => {
      const opt = document.createElement('div');
      opt.className = 'role-option';
      const factionMeta = FACTION_META[role.faction];
      opt.innerHTML = `
        <span>${role.name}</span>
        <span class="role-option-faction ${role.faction}">${factionMeta.icon} ${factionMeta.label}</span>
      `;
      opt.addEventListener('mousedown', e => {
        e.preventDefault();
        input.value = role.name;
        dropdown.classList.remove('open');
        State.setRole(playerNum, role.name);
        _refreshCard(playerNum);
        _renderFactionStats();
      });
      dropdown.appendChild(opt);
    });

    dropdown.classList.add('open');
  }

  // 刷新单张卡片（不重绘全部）
  function _refreshCard(playerNum) {
    const { players, round } = State.get();
    const p = players[playerNum];
    if (!p) return;
    const grid = document.getElementById('player-cards-grid');
    const oldCard = grid.querySelector(`[data-player="${playerNum}"]`);
    if (!oldCard) return;
    const newCard = _buildCard(playerNum, p, round);
    grid.replaceChild(newCard, oldCard);
  }

  // ── 阵营统计面板 ──────────────────────────────────────────

  function _renderFactionStats() {
    const stats = State.getFactionStats();
    const container = document.getElementById('faction-stats');
    container.innerHTML = '';

    const factionOrder = [
      { key: 'goose',   icon: '🪿', label: '鹅阵营' },
      { key: 'duck',    icon: '🦆', label: '鸭阵营' },
      { key: 'neutral', icon: '🕊️', label: '中立阵营' },
    ];

    factionOrder.forEach(({ key, icon, label }) => {
      const s = stats[key];
      const block = document.createElement('div');
      block.className = 'faction-stat-block';

      // 头部
      const header = document.createElement('div');
      header.className = `faction-stat-header ${key}`;
      header.innerHTML = `
        <span>${icon} ${label}</span>
        <span class="faction-stat-count">${s.total} 人</span>
      `;
      block.appendChild(header);

      // 内容
      const body = document.createElement('div');
      body.className = 'faction-stat-body';

      // 明牌
      body.appendChild(_buildStatRow('明牌', s.open, 'open'));
      // 跳出
      body.appendChild(_buildStatRow('跳出', s.jumped, 'jumped'));
      // 未知槽位
      const unknownRow = document.createElement('div');
      unknownRow.className = 'stat-row';
      const unknownLabel = document.createElement('div');
      unknownLabel.className = 'stat-row-label';
      unknownLabel.textContent = '未知槽位';
      unknownRow.appendChild(unknownLabel);
      const unknownTags = document.createElement('div');
      unknownTags.className = 'stat-tags';
      if (s.unknown <= 0) {
        unknownTags.innerHTML = '<span class="stat-empty">已全部确认</span>';
      } else {
        for (let i = 0; i < s.unknown; i++) {
          const tag = document.createElement('span');
          tag.className = 'stat-tag unknown-slot';
          tag.textContent = '?';
          unknownTags.appendChild(tag);
        }
      }
      unknownRow.appendChild(unknownTags);
      body.appendChild(unknownRow);

      block.appendChild(body);
      container.appendChild(block);
    });
  }

  function _buildStatRow(labelText, roles, tagClass) {
    const row = document.createElement('div');
    row.className = 'stat-row';
    const label = document.createElement('div');
    label.className = 'stat-row-label';
    label.textContent = labelText;
    row.appendChild(label);
    const tags = document.createElement('div');
    tags.className = 'stat-tags';
    if (roles.length === 0) {
      tags.innerHTML = '<span class="stat-empty">暂无</span>';
    } else {
      roles.forEach(r => {
        const wrap = document.createElement('span');
        wrap.className = 'stat-tag-wrap';

        const tag = document.createElement('span');
        let cls = `stat-tag ${tagClass} ${r.claimed ? 'claimed' : 'unclaimed'}`;
        if (r.dead) cls += ' dead-role';
        if (r.overflowed) cls += ' overflowed-role';
        tag.className = cls;

        const titleParts = [];
        if (r.dead) titleParts.push('认领该角色的玩家已全部死亡');
        else if (r.claimed) titleParts.push('已有玩家认领');
        else titleParts.push('暂无玩家认领');
        if (r.overflowed) titleParts.push('⚠️ 明牌已满，该跳出存疑');
        tag.title = titleParts.join(' · ');

        if (r.dead) {
          tag.innerHTML = `<span class="dead-cross">✕</span>${r.name}`;
        } else if (r.overflowed) {
          tag.innerHTML = `<span class="overflow-warn">⚠</span>${r.name}`;
        } else {
          tag.textContent = r.name;
        }

        wrap.appendChild(tag);

        // 重复认领数字角标
        if (r.claimCount > 1) {
          const badge = document.createElement('span');
          badge.className = 'stat-tag-badge';
          badge.textContent = r.claimCount;
          wrap.appendChild(badge);
        }

        tags.appendChild(wrap);
      });
    }
    row.appendChild(tags);
    return row;
  }

  return { init, render };
})();
