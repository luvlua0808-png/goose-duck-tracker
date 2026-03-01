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

  // 拖拽状态
  let _dragState = {
    isDragging: false,
    fromPlayer: null,
    fromColor: null,
    fromPos: null,
    previewLine: null,
    selectedLine: null,
  };

  // 色点坐标缓存 { playerNum: {x, y} }
  let _dotPositions = {};

  function init() {
    document.getElementById('btn-next-round').addEventListener('click', () => {
      if (window.AI && typeof window.AI.clearResult === 'function') {
        window.AI.clearResult();
      } else if (typeof AI !== 'undefined' && AI && typeof AI.clearResult === 'function') {
        AI.clearResult();
      }
      State.nextRound();
      App.switchPhase('game');
    });

    // 初始化拖拽连线事件
    _initGroupDragEvents();
    _initMobileRoleModal();
    _initMobileNoteModal();

    // resize/scroll 时重新计算坐标并刷新连线
    window.addEventListener('resize', () => {
      _updateDotPositions();
      _renderGroupLines();
    });
    window.addEventListener('scroll', () => {
      _updateDotPositions();
      _renderGroupLines();
    }, true);
  }

  function render() {
    _renderPlayerCards();
    _renderFactionStats();
    _renderGroupLines();
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

    // 检测跳出角色是否超限：明牌数 + 跳出数 > 上限 → 所有跳出强红
    let isFactionExceeded = false;
    if (p.role) {
      const faction = p.faction || getRoleFaction(p.role);
      if (faction) {
        const total = config.factions[faction] || 0;
        const openNames = config.openRoles.filter(r => getRoleFaction(r) === faction);
        const isJumped = !openNames.includes(p.role);
        if (isJumped && total > 0) {
          const jumpedNames = [];
          Object.values(players).forEach(pl => {
            if (pl.role && (pl.faction || getRoleFaction(pl.role)) === faction && !openNames.includes(pl.role)) {
              if (!jumpedNames.includes(pl.role)) jumpedNames.push(pl.role);
            }
          });
          isFactionExceeded = openNames.length + jumpedNames.length > total;
        }
      }
    }

    const card = document.createElement('div');
    card.id = `player-${num}`;
    card.className = 'player-card' +
      (p.alive ? ' alive' : ' dead') +
      (p.faction ? ` faction-${p.faction}` : '') +
      (isDuplicate ? ' duplicate-role' : '') +
      (isFactionExceeded ? ' faction-exceeded-card' : '');
    card.dataset.player = num;

    // 玩家颜色小点
    const colorDot = document.createElement('div');
    colorDot.className = 'player-color-dot dot';
    colorDot.style.backgroundColor = PLAYER_COLORS[num] || '#888';
    card.appendChild(colorDot);

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

    // 手机横屏：+角色 小按钮
    const isMobileLandscape = window.matchMedia('(max-width:960px) and (orientation:landscape)').matches;
    if (isMobileLandscape) {
      const rolePickBtn = document.createElement('button');
      rolePickBtn.className = 'role-pick-btn';
      rolePickBtn.textContent = p.role ? '✎' : '+';
      rolePickBtn.title = '选择角色';
      rolePickBtn.addEventListener('click', e => {
        e.stopPropagation();
        _openMobileRoleModal(num);
      });
      header.appendChild(rolePickBtn);
    }

    header.appendChild(trustBtn);
    card.appendChild(header);

    // ── 行2：阵营按钮 + 备注（手机） / 角色搜索（桌面）横排 ──
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

    row2.appendChild(factionBtns);

    if (isMobileLandscape) {
      // 手机横屏：行2 放备注文本（点击弹modal输入，不在卡片内放textarea）
      const noteText = (p.notes || {})[round] || '';
      const noteEl = document.createElement('div');
      noteEl.className = 'card-notes-tap';
      noteEl.textContent = noteText || '备注';
      noteEl.title = '点击编辑备注';
      noteEl.addEventListener('click', e => {
        e.stopPropagation();
        _openMobileNoteModal(num, round);
      });
      row2.appendChild(noteEl);
    } else {
      // 桌面：行2 放角色搜索
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
      roleInput.addEventListener('keydown', e => { if (e.key === 'Escape') dropdown.classList.remove('open'); });
      document.addEventListener('click', e => {
        if (!roleWrapper.contains(e.target)) dropdown.classList.remove('open');
      }, { capture: true });
      roleWrapper.appendChild(roleInput);
      roleWrapper.appendChild(dropdown);
      row2.appendChild(roleWrapper);
    }

    card.appendChild(row2);

    // ── 行3：目击记录（手机）/ 目击+备注（桌面）横排 ──
    const row3 = document.createElement('div');
    row3.className = 'card-row3';

    // 目击记录
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
    row3.appendChild(sightDiv);

    if (!isMobileLandscape) {
      // 桌面：行3 额外放备注
      const notesDiv = document.createElement('div');
      notesDiv.className = 'card-notes';
      const notesLabel = document.createElement('div');
      notesLabel.className = 'card-section-label';
      notesLabel.textContent = '备注';
      notesDiv.appendChild(notesLabel);
      const prevNotes = Object.entries(p.notes || {})
        .sort(([a], [b]) => Number(a) - Number(b))
        .filter(([r, t]) => Number(r) !== round && t && t.trim())
        .map(([r, t]) => `[R${r}]${t}`).join(' ');
      const textarea = document.createElement('textarea');
      textarea.value = (p.notes || {})[round] || '';
      textarea.placeholder = prevNotes || `R${round}备注…`;
      textarea.title = prevNotes ? `历史备注：${prevNotes}` : '';
      textarea.addEventListener('blur', () => State.setNote(num, round, textarea.value));
      notesDiv.appendChild(textarea);
      row3.appendChild(notesDiv);
    }

    card.appendChild(row3);

    return card;
  }

  // ── 手机角色选择 Modal ─────────────────────────────────────

  let _mobileRoleTarget = null;

  function _initMobileRoleModal() {
    const modal   = document.getElementById('mobile-role-modal');
    const closeBtn = document.getElementById('mobile-role-modal-close');
    const searchInput = document.getElementById('mobile-role-search');
    const list    = document.getElementById('mobile-role-list');
    if (!modal) return;

    closeBtn.addEventListener('click', () => _closeMobileRoleModal());
    modal.addEventListener('click', e => { if (e.target === modal) _closeMobileRoleModal(); });

    searchInput.addEventListener('input', () => {
      _renderMobileRoleList(searchInput.value.trim());
    });
  }

  function _openMobileRoleModal(playerNum) {
    _mobileRoleTarget = playerNum;
    const modal = document.getElementById('mobile-role-modal');
    const title = document.getElementById('mobile-role-modal-title');
    const searchInput = document.getElementById('mobile-role-search');
    if (!modal) return;
    title.textContent = `${playerNum}号 — 选择角色`;
    searchInput.value = '';
    _renderMobileRoleList('');
    modal.classList.remove('hidden');
    setTimeout(() => searchInput.focus(), 100);
  }

  function _closeMobileRoleModal() {
    const modal = document.getElementById('mobile-role-modal');
    if (modal) modal.classList.add('hidden');
    _mobileRoleTarget = null;
  }

  // ── 手机备注 Modal ─────────────────────────────────────────

  let _mobileNoteTarget = null;

  function _initMobileNoteModal() {
    const modal    = document.getElementById('mobile-note-modal');
    const closeBtn = document.getElementById('mobile-note-modal-close');
    const input    = document.getElementById('mobile-note-input');
    if (!modal) return;
    const _close = () => {
      modal.classList.add('hidden');
      if (_mobileNoteTarget) {
        const { playerNum, round } = _mobileNoteTarget;
        _refreshCard(playerNum);
      }
      _mobileNoteTarget = null;
    };
    closeBtn.addEventListener('click', _close);
    modal.addEventListener('click', e => { if (e.target === modal) _close(); });
    // 实时自动保存
    input.addEventListener('input', () => {
      if (!_mobileNoteTarget) return;
      const { playerNum, round } = _mobileNoteTarget;
      State.setNote(playerNum, round, input.value);
    });
  }

  function _openMobileNoteModal(playerNum, round) {
    _mobileNoteTarget = { playerNum, round };
    const modal = document.getElementById('mobile-note-modal');
    const title = document.getElementById('mobile-note-modal-title');
    const input = document.getElementById('mobile-note-input');
    if (!modal) return;
    const { players } = State.get();
    const p = players[playerNum];
    title.textContent = `${playerNum}号 — 备注`;
    input.value = (p && p.notes && p.notes[round]) || '';
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 100);
  }

  function _renderMobileRoleList(query) {
    const list = document.getElementById('mobile-role-list');
    if (!list) return;
    const results = searchRoles(query).slice(0, 20);
    list.innerHTML = '';
    // 清除当前角色选项
    const clearItem = document.createElement('div');
    clearItem.className = 'mobile-role-item';
    clearItem.innerHTML = '<span style="color:var(--text-muted);font-style:italic">清除角色</span>';
    clearItem.addEventListener('click', () => {
      if (_mobileRoleTarget) {
        State.setRole(_mobileRoleTarget, null);
        _refreshCard(_mobileRoleTarget);
        _renderFactionStats();
      }
      _closeMobileRoleModal();
    });
    list.appendChild(clearItem);

    results.forEach(role => {
      const item = document.createElement('div');
      item.className = 'mobile-role-item';
      const factionMeta = FACTION_META[role.faction];
      item.innerHTML = `
        <span>${role.name}</span>
        <span class="role-option-faction ${role.faction}">${factionMeta.icon} ${factionMeta.label}</span>
      `;
      item.addEventListener('click', () => {
        if (_mobileRoleTarget) {
          State.setRole(_mobileRoleTarget, role.name);
          _refreshCard(_mobileRoleTarget);
          _renderFactionStats();
        }
        _closeMobileRoleModal();
      });
      list.appendChild(item);
    });
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
      const _selectRole = e => {
        e.preventDefault();
        input.value = role.name;
        dropdown.classList.remove('open');
        State.setRole(playerNum, role.name);
        _refreshCard(playerNum);
        _renderFactionStats();
      };
      opt.addEventListener('mousedown', _selectRole);
      opt.addEventListener('touchstart', _selectRole, { passive: false });
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

  function renderMobileStats() {
    const el = document.getElementById('mobile-faction-stats');
    if (el) _renderFactionStats(el);
  }

  function _renderFactionStats(container) {
    const stats = State.getFactionStats();
    if (!container) container = document.getElementById('faction-stats');
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

  // ── 抱团拖拽连线功能 ────────────────────────────────────────

  // 更新所有色点坐标缓存（使用色点圆心，转换为 wrapper 相对坐标）
  function _updateDotPositions() {
    const wrapper = document.querySelector('.player-cards-wrapper');
    if (!wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    _dotPositions = {};
    document.querySelectorAll('.player-card[data-player]').forEach(card => {
      const num = parseInt(card.dataset.player);
      const dot = document.querySelector(`#player-${num} .dot`);
      if (!dot) return;
      const rect = dot.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 + window.scrollX;
      const cy = rect.top + rect.height / 2 + window.scrollY;
      const wx = wrapperRect.left + window.scrollX;
      const wy = wrapperRect.top + window.scrollY;
      _dotPositions[num] = {
        x: cx - wx,
        y: cy - wy,
      };
    });
  }

  function _initGroupDragEvents() {
    const grid = document.getElementById('player-cards-grid');
    const svg = document.getElementById('group-lines-svg');
    const wrapper = document.querySelector('.player-cards-wrapper');

    // ── 拖拽开始（公共逻辑） ────────────────────────────────────
    function _startDrag(dot, clientX, clientY) {
      const card = dot.closest('.player-card');
      if (!card) return false;
      const fromPlayer = parseInt(card.dataset.player);
      if (!fromPlayer) return false;

      _updateDotPositions();
      const fromPos = _dotPositions[fromPlayer];
      if (!fromPos) return false;

      _dragState.isDragging = true;
      _dragState.fromPlayer = fromPlayer;
      _dragState.fromColor = PLAYER_COLORS[fromPlayer] || '#888';
      _dragState.fromPos = fromPos;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.classList.add('group-line-preview');
      line.setAttribute('stroke', _dragState.fromColor);
      line.setAttribute('d', `M ${fromPos.x} ${fromPos.y} C ${fromPos.x} ${fromPos.y}, ${fromPos.x} ${fromPos.y}, ${fromPos.x} ${fromPos.y}`);
      svg.appendChild(line);
      _dragState.previewLine = line;
      return true;
    }

    // ── 拖拽移动（公共逻辑） ────────────────────────────────────
    function _moveDrag(clientX, clientY) {
      if (!_dragState.isDragging || !_dragState.previewLine) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const x = clientX - wrapperRect.left;
      const y = clientY - wrapperRect.top;
      const fp = _dragState.fromPos;
      if (fp) {
        const dx = Math.abs(x - fp.x) * 0.3;
        const d = `M ${fp.x} ${fp.y} C ${fp.x + dx} ${fp.y} ${x - dx} ${y} ${x} ${y}`;
        _dragState.previewLine.setAttribute('d', d);
      }
    }

    // ── 拖拽结束（公共逻辑） ────────────────────────────────────
    function _endDrag(clientX, clientY) {
      if (!_dragState.isDragging) return;

      if (_dragState.previewLine) {
        _dragState.previewLine.remove();
        _dragState.previewLine = null;
      }

      const el = document.elementFromPoint(clientX, clientY);
      const card = el ? el.closest('.player-card') : null;
      const toPlayer = card ? parseInt(card.dataset.player) : null;

      if (toPlayer && toPlayer !== _dragState.fromPlayer) {
        const success = State.addGroupLink(_dragState.fromPlayer, toPlayer);
        if (success) {
          _renderGroupLines();
          const { round } = State.get();
          if (typeof umami !== 'undefined') umami.track('player_connect', { round });
        }
      }

      _dragState.isDragging = false;
      _dragState.fromPlayer = null;
      _dragState.fromColor = null;
      _dragState.fromPos = null;
    }

    // ── Mouse 事件 ───────────────────────────────────────────────
    grid.addEventListener('mousedown', (e) => {
      const dot = e.target.closest('.player-color-dot');
      if (!dot) return;
      e.preventDefault();
      e.stopPropagation();
      _startDrag(dot, e.clientX, e.clientY);
    });

    document.addEventListener('mousemove', (e) => {
      _moveDrag(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', (e) => {
      _endDrag(e.clientX, e.clientY);
    });

    // ── Touch 事件（移动端并存） ──────────────────────────────────
    grid.addEventListener('touchstart', (e) => {
      const dot = e.target.closest('.player-color-dot');
      if (!dot) return;
      e.preventDefault();
      const t = e.touches[0];
      _startDrag(dot, t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!_dragState.isDragging) return;
      e.preventDefault();
      const t = e.touches[0];
      _moveDrag(t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!_dragState.isDragging) return;
      const t = e.changedTouches[0];
      _endDrag(t.clientX, t.clientY);
    });

    // 连线点击选择（path 元素有 pointer-events: stroke，可以接收事件）
    svg.addEventListener('click', (e) => {
      if (e.target.classList.contains('group-line')) {
        svg.querySelectorAll('.group-line').forEach(l => l.classList.remove('selected'));
        e.target.classList.add('selected');
        _dragState.selectedLine = e.target;
      } else {
        svg.querySelectorAll('.group-line').forEach(l => l.classList.remove('selected'));
        _dragState.selectedLine = null;
      }
    });

    // 双击删除连线
    svg.addEventListener('dblclick', (e) => {
      if (e.target.classList.contains('group-line')) {
        const from = parseInt(e.target.dataset.from);
        const to = parseInt(e.target.dataset.to);
        State.removeGroupLink(from, to);
        _renderGroupLines();
        _dragState.selectedLine = null;
      }
    });
  }

  // 获取玩家色点的位置（优先从缓存读取）
  function _getDotPosition(playerNum) {
    if (_dotPositions[playerNum]) return _dotPositions[playerNum];
    // 缓存未命中时实时计算
    const card = document.querySelector(`.player-card[data-player="${playerNum}"]`);
    if (!card) return { x: 0, y: 0 };
    const wrapper = document.querySelector('.player-cards-wrapper');
    if (!wrapper) return { x: 0, y: 0 };
    const cardRect = card.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    return {
      x: cardRect.right - wrapperRect.left,
      y: cardRect.top - wrapperRect.top + cardRect.height / 2,
    };
  }

  // 渲染所有抱团连线
  function _renderGroupLines() {
    const svg = document.getElementById('group-lines-svg');
    svg.innerHTML = '';

    _updateDotPositions();
    const links = State.getGroupLinks();

    links.forEach(link => {
      const fromPos = _getDotPosition(link.from);
      const toPos = _getDotPosition(link.to);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('group-line');
      path.dataset.from = link.from;
      path.dataset.to = link.to;

      // 线条颜色使用起点的玩家颜色
      const color = PLAYER_COLORS[link.from] || '#888';
      path.setAttribute('stroke', color);

      // 贝塞尔曲线：控制点水平偏移
      const dx = Math.abs(toPos.x - fromPos.x) * 0.3;
      const d = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + dx} ${fromPos.y} ${toPos.x - dx} ${toPos.y} ${toPos.x} ${toPos.y}`;
      path.setAttribute('d', d);

      svg.appendChild(path);
    });
  }

  return { init, render, renderMobileStats };
})();
