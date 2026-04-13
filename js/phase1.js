// ============================================================
// phase1.js — 初始化阶段 UI 逻辑
// ============================================================

const Phase1 = (() => {

  function init() {
    _bindPlayerCount();
    _bindMapSelector();
    _bindFactionInputs();
    _renderOpenRoles();
    _renderMyRole();
    _bindStartGame();
    render();
  }

  function render() {
    const { config, phase, myRole } = State.get();
    const gameStarted = phase !== 'init';

    // 玩家人数
    document.getElementById('player-count-display').textContent = config.playerCount;
    // 地图按钮
    document.querySelectorAll('.map-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.map === config.map);
    });
    // 阵营数值
    document.getElementById('faction-goose').value   = config.factions.goose;
    document.getElementById('faction-duck').value    = config.factions.duck;
    document.getElementById('faction-neutral').value = config.factions.neutral;
    _updateFactionTotal();
    // 明牌角色
    _updateOpenRoleChips();
    // 我的角色
    _updateMyRoleDisplay(myRole);

    // 游戏已开始：锁定左栏，隐藏开始按钮，显示提示
    const initLeft = document.querySelector('.init-left');
    const startBtn = document.getElementById('btn-start-game');
    if (gameStarted) {
      initLeft.classList.add('init-left-locked');
      startBtn.style.display = 'none';
      if (!document.getElementById('init-locked-tip')) {
        const tip = document.createElement('p');
        tip.id = 'init-locked-tip';
        tip.className = 'init-locked-tip';
        tip.textContent = '⚠ 游戏进行中，基础配置已锁定';
        initLeft.appendChild(tip);
      }
    } else {
      initLeft.classList.remove('init-left-locked');
      startBtn.style.display = '';
      const tip = document.getElementById('init-locked-tip');
      if (tip) tip.remove();
    }
  }

  function _bindPlayerCount() {
    document.getElementById('player-dec').addEventListener('click', () => {
      const cur = State.get().config.playerCount;
      if (cur > 4) {
        State.updateConfig('playerCount', cur - 1);
        document.getElementById('player-count-display').textContent = cur - 1;
        _updateFactionTotal();
      }
    });
    document.getElementById('player-inc').addEventListener('click', () => {
      const cur = State.get().config.playerCount;
      if (cur < 16) {
        State.updateConfig('playerCount', cur + 1);
        document.getElementById('player-count-display').textContent = cur + 1;
        _updateFactionTotal();
      }
    });
  }

  function _bindMapSelector() {
    document.querySelectorAll('.map-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        State.updateConfig('map', btn.dataset.map);
        document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  function _bindFactionInputs() {
    ['goose', 'duck', 'neutral'].forEach(f => {
      document.getElementById(`faction-${f}`).addEventListener('input', () => {
        const val = parseInt(document.getElementById(`faction-${f}`).value) || 0;
        const factions = { ...State.get().config.factions, [f]: val };
        State.updateConfig('factions', factions);
        _updateFactionTotal();
      });
    });
  }

  function _updateFactionTotal() {
    const { config } = State.get();
    const total = (config.factions.goose || 0) + (config.factions.duck || 0) + (config.factions.neutral || 0);
    document.getElementById('faction-total').textContent = total;
    document.getElementById('faction-max').textContent   = config.playerCount;
    const err = document.getElementById('faction-error');
    if (total !== config.playerCount) {
      err.classList.remove('hidden');
    } else {
      err.classList.add('hidden');
    }
  }

  function _renderOpenRoles() {
    const container = document.getElementById('open-roles-container');
    container.innerHTML = '';

    // 搜索框 + 清空按钮
    const searchWrap = document.createElement('div');
    searchWrap.className = 'open-roles-search-wrap';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '角色名或拼音首字母（jz=警长）';
    searchInput.className = 'open-roles-search';

    const clearBtn = document.createElement('button');
    clearBtn.className = 'open-roles-search-clear';
    clearBtn.textContent = '✕';
    clearBtn.title = '清空搜索';
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      _filterChips('');
      searchInput.focus();
    });

    const voiceBtn = document.createElement('button');
    voiceBtn.className = 'open-roles-voice-btn';
    voiceBtn.type = 'button';
    voiceBtn.textContent = '🎙';
    voiceBtn.title = '语音勾选明牌角色（只添加）';

    let recognition = null;
    let listening = false;
    let _silenceTimer = null;
    let _bufferText = '';

    // ── 语音识别相关 ──────────────────────────────────────────

    function _getHotWords() {
      const roomNames = [];
      Object.values(MAPS).forEach(m => {
        m.nodes.forEach(n => {
          roomNames.push(n.label);
          if (n.aliases) roomNames.push(...n.aliases);
        });
      });

      const roleNames = [];
      ROLES.forEach(r => {
        roleNames.push(r.name);
        if (r.aliases) roleNames.push(...r.aliases);
      });

      return [
        ...Array.from({length: 16}, (_, i) => `${i + 1}号`),
        ...roomNames,
        ...roleNames,
        "可疑", "有问题", "怀疑", "信任", "没问题", "好人", "是鸭", "鸭子", "锁了"
      ];
    }

    function _startRecognition(onResult, onEnd) {
      const aliConfig = AI.getAliyunConfig();
      if (aliConfig.service === 'aliyun' && aliConfig.appKey && aliConfig.akId && aliConfig.akSecret) {
        AliyunASR.start(
          aliConfig,
          _getHotWords(),
          onResult,
          onEnd,
          (err) => {
            console.error('[voice] aliyun error:', err);
            const msgs = {
              no_ak: '请先在「AI设置」中填写阿里云 AccessKey',
              auth_failed: '阿里云鉴权失败，请检查 Key 是否正确',
            };
            if (err !== 'WebSocket Error') {
              alert(msgs[err] || '阿里云语音连接失败，已切换为 Chrome 内置识别');
            }
            _startChromeRecognition(onResult, onEnd);
          }
        );
      } else {
        _startChromeRecognition(onResult, onEnd);
      }
    }

    function _startChromeRecognition(onResult, onEnd) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        alert('当前浏览器不支持语音识别（建议使用 Chrome/Edge）');
        return;
      }
      recognition = new SR();
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = e => {
        let chunk = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (t) chunk += t;
        }
        if (chunk) onResult(chunk);
      };
      recognition.onend = onEnd;
      recognition.onerror = (err) => {
        if (err.error !== 'aborted') {
          console.error('[voice] chrome error:', err);
        }
      };
      recognition.start();
    }

    function _stopRecognition() {
      const aliConfig = AI.getAliyunConfig();
      if (aliConfig.service === 'aliyun') {
        AliyunASR.stop();
      } else if (recognition) {
        recognition.stop();
      }
    }

    function _pickRolesFromText(text) {
      const t = (text || '').replace(/\s+/g, '');
      const hits = [];
      ROLES.forEach(r => {
        if (!r || !r.name) return;
        if (t.includes(r.name)) { hits.push(r.name); return; }
        if (r.aliases && r.aliases.some(a => t.includes(a))) hits.push(r.name);
      });
      return [...new Set(hits)];
    }

    function _applyOpenRoles(roleNames) {
      if (!roleNames || roleNames.length === 0) return;
      const openRoles = [...State.get().config.openRoles];
      roleNames.forEach(name => {
        if (!openRoles.includes(name)) openRoles.push(name);
      });
      State.updateConfig('openRoles', openRoles);
      _updateOpenRoleChips();
    }

    function startListening() {
      if (listening) return;
      _bufferText = '';
      _startRecognition(
        (text) => {
          _bufferText += text;
          console.log('[voice] chunk:', text);
        },
        () => {
          listening = false;
          voiceBtn.textContent = '🎙(空格)';
          voiceBtn.classList.remove('listening');
          console.log('[voice] end, buffer:', _bufferText);
          const roles = _pickRolesFromText(_bufferText);
          if (roles && roles.length > 0) {
            _applyOpenRoles(roles);
          } else if (_bufferText) {
            alert('未识别到角色名：「' + _bufferText + '」');
          }
          _bufferText = '';
        }
      );
      listening = true;
      voiceBtn.textContent = '🛑';
      voiceBtn.classList.add('listening');
    }

    function stopListening() {
      if (!listening) return;
      _stopRecognition();
    }

    // ── 按钮点击：切换开始/停止 ──────────────────────────────
    voiceBtn.textContent = '🎙(空格)';
    voiceBtn.addEventListener('mousedown', e => e.preventDefault());
    voiceBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (listening) { stopListening(); } else { startListening(); }
    });

    // ── 空格键：按住开始，松开停止 ───────────────────────────
    // 只在初始化阶段（phase-init 可见）且焦点不在输入框时响应
    document.addEventListener('keydown', e => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const initSection = document.getElementById('phase-init');
      if (!initSection || !initSection.classList.contains('active')) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.repeat) return;
      e.preventDefault();
      startListening();
    });

    document.addEventListener('keyup', e => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      const initSection = document.getElementById('phase-init');
      if (!initSection || !initSection.classList.contains('active')) return;
      stopListening();
    });

    function _filterChips(q) {
      document.querySelectorAll('#open-roles-container .role-chip').forEach(chip => {
        const nameMatch = chip.dataset.role.toLowerCase().includes(q);
        const initialsMatch = (chip.dataset.initials || '').startsWith(q);
        const visible = (!q || nameMatch || initialsMatch) ? '' : 'none';
        chip.style.display = visible;
        const nextEl = chip.nextElementSibling;
        if (nextEl && nextEl.classList.contains('draft-btn')) {
          nextEl.style.display = visible;
        }
      });
      document.querySelectorAll('#open-roles-container .role-faction-group').forEach(group => {
        const anyVisible = [...group.querySelectorAll('.role-chip')].some(c => c.style.display !== 'none');
        group.style.display = anyVisible ? '' : 'none';
      });
    }

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      clearBtn.style.display = q ? '' : 'none';
      _filterChips(q);
    });

    searchWrap.appendChild(searchInput);
    searchWrap.appendChild(clearBtn);
    searchWrap.appendChild(voiceBtn);
    container.appendChild(searchWrap);

    const groupsWrap = document.createElement('div');
    groupsWrap.className = 'open-roles-groups';

    const groups = [
      { faction: 'goose',   icon: '🪿', label: '鹅阵营' },
      { faction: 'duck',    icon: '🦆', label: '鸭阵营' },
      { faction: 'neutral', icon: '🕊️', label: '中立阵营' },
    ];

    groups.forEach(({ faction, icon, label }) => {
      const roles = ROLES.filter(r => r.faction === faction)
        .sort((a, b) => (a.initials || '').localeCompare(b.initials || ''));

      const group = document.createElement('div');
      group.className = 'role-faction-group';
      group.innerHTML = `<div class="role-faction-label">${icon} ${label}</div>`;

      // 按首字母分组
      const letterMap = {};
      roles.forEach(role => {
        const letter = (role.initials || '?')[0].toUpperCase();
        if (!letterMap[letter]) letterMap[letter] = [];
        letterMap[letter].push(role);
      });

      Object.keys(letterMap).sort().forEach(letter => {
        const row = document.createElement('div');
        row.className = 'role-letter-row';

        const letterEl = document.createElement('span');
        letterEl.className = 'role-letter-tag';
        letterEl.textContent = letter;
        row.appendChild(letterEl);

        const chipsWrap = document.createElement('div');
        chipsWrap.className = 'role-chips';
        letterMap[letter].forEach(role => {
          const chip = document.createElement('span');
          chip.className = 'role-chip';
          if (role.disabled) chip.classList.add('role-chip-disabled');
          chip.textContent = role.name;
          chip.dataset.role = role.name;
          chip.dataset.faction = faction;
          chip.dataset.initials = role.initials || '';
          if (!role.disabled) {
            chip.addEventListener('click', () => _toggleOpenRole(role.name, faction, chip));
          }
          chipsWrap.appendChild(chip);
        });
        row.appendChild(chipsWrap);
        group.appendChild(row);
      });

      groupsWrap.appendChild(group);
    });

    container.appendChild(groupsWrap);

    _updateOpenRoleChips();
  }

  function _renderMyRole() {
    const container = document.getElementById('my-role-container');
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'my-role-selector-wrap';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '输入角色名或拼音首字母选择...';
    input.className = 'my-role-input';

    const dropdown = document.createElement('div');
    dropdown.className = 'my-role-dropdown hidden';

    const display = document.createElement('div');
    display.className = 'my-role-display hidden';

    // 过滤逻辑
    const filterRoles = (q) => {
      const query = q.trim().toLowerCase();
      dropdown.innerHTML = '';
      if (!query) {
        dropdown.classList.add('hidden');
        return;
      }

      const matched = ROLES.filter(r =>
        !r.disabled &&
        (r.name.includes(query) ||
        (r.initials && r.initials.startsWith(query)) ||
        (r.aliases && r.aliases.some(a => a.includes(query))))
      );

      if (matched.length > 0) {
        matched.forEach(role => {
          const item = document.createElement('div');
          item.className = `my-role-item faction-${role.faction}`;
          item.innerHTML = `
            <span class="role-name">${role.name}</span>
            <span class="faction-label">${FACTION_META[role.faction].label}</span>
          `;
          item.addEventListener('click', () => {
            State.setMyRole(role.name);
            _updateMyRoleDisplay(role.name);
            input.value = '';
            dropdown.classList.add('hidden');
          });
          dropdown.appendChild(item);
        });
        dropdown.classList.remove('hidden');
      } else {
        dropdown.classList.add('hidden');
      }
    };

    input.addEventListener('input', (e) => filterRoles(e.target.value));
    input.addEventListener('focus', (e) => filterRoles(e.target.value));

    // 点击外部关闭下拉
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    wrap.appendChild(input);
    wrap.appendChild(dropdown);
    wrap.appendChild(display);
    container.appendChild(wrap);

    _updateMyRoleDisplay(State.get().myRole);
  }

  function _updateMyRoleDisplay(roleName) {
    const display = document.querySelector('.my-role-display');
    const input = document.querySelector('.my-role-input');
    if (!display || !input) return;

    if (roleName) {
      const role = ROLES.find(r => r.name === roleName);
      if (role) {
        const meta = FACTION_META[role.faction];
        display.innerHTML = `
          <div class="selected-role-box faction-${role.faction}">
            <span class="role-icon">${meta.icon}</span>
            <span class="role-name">${roleName}</span>
            <span class="faction-tag">${meta.label}</span>
            <button class="role-clear-btn" title="清空选择">✕</button>
          </div>
        `;
        display.querySelector('.role-clear-btn').addEventListener('click', () => {
          State.setMyRole(null);
          _updateMyRoleDisplay(null);
        });
        display.classList.remove('hidden');
        input.classList.add('hidden');
      }
    } else {
      display.classList.add('hidden');
      input.classList.remove('hidden');
    }
  }

  function _toggleOpenRole(roleName, faction, chip) {
    const openRoles = [...State.get().config.openRoles];
    const idx = openRoles.indexOf(roleName);
    if (idx >= 0) {
      openRoles.splice(idx, 1);
    } else {
      openRoles.push(roleName);
    }
    State.updateConfig('openRoles', openRoles);
    _updateOpenRoleChips();
  }

  // ── 轮抽号码弹出面板 ──
  let _activeDraftPopover = null;

  function _closeDraftPopover() {
    if (_activeDraftPopover) {
      _activeDraftPopover.remove();
      _activeDraftPopover = null;
    }
  }

  function _openDraftPopover(roleName, anchorEl) {
    _closeDraftPopover();
    const config = State.get().config;
    const drafts = config.openRoleDrafts || {};
    const playerCount = config.playerCount;
    const currentNum = drafts[roleName] || null;

    // Collect used numbers (by other roles)
    const usedNums = new Set();
    Object.entries(drafts).forEach(([r, n]) => {
      if (r !== roleName && n) usedNums.add(n);
    });

    const popover = document.createElement('div');
    popover.className = 'draft-popover';

    const grid = document.createElement('div');
    grid.className = 'draft-grid';

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'draft-num draft-num-clear';
    clearBtn.textContent = '✕';
    clearBtn.title = '清除号码';
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const d = { ...(State.get().config.openRoleDrafts || {}) };
      delete d[roleName];
      State.updateConfig('openRoleDrafts', d);
      _closeDraftPopover();
      _updateOpenRoleChips();
    });
    grid.appendChild(clearBtn);

    for (let i = 1; i <= playerCount; i++) {
      const btn = document.createElement('button');
      btn.className = 'draft-num';
      btn.textContent = i;
      if (i === currentNum) btn.classList.add('active');
      if (usedNums.has(i)) {
        btn.classList.add('used');
        btn.disabled = true;
      }
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const d = { ...(State.get().config.openRoleDrafts || {}) };
        d[roleName] = i;
        State.updateConfig('openRoleDrafts', d);
        _closeDraftPopover();
        _updateOpenRoleChips();
      });
      grid.appendChild(btn);
    }

    popover.appendChild(grid);

    // Position relative to anchor
    document.body.appendChild(popover);
    const rect = anchorEl.getBoundingClientRect();
    popover.style.position = 'fixed';
    popover.style.left = rect.left + 'px';
    popover.style.top = (rect.bottom + 4) + 'px';
    // Clamp to viewport
    requestAnimationFrame(() => {
      const pr = popover.getBoundingClientRect();
      if (pr.right > window.innerWidth - 8) {
        popover.style.left = Math.max(8, window.innerWidth - pr.width - 8) + 'px';
      }
      if (pr.bottom > window.innerHeight - 8) {
        popover.style.top = (rect.top - pr.height - 4) + 'px';
      }
    });

    _activeDraftPopover = popover;
  }

  // Close popover on outside click
  document.addEventListener('click', (e) => {
    if (_activeDraftPopover && !_activeDraftPopover.contains(e.target) && !e.target.classList.contains('draft-btn')) {
      _closeDraftPopover();
    }
  });

  function _updateOpenRoleChips() {
    const config = State.get().config;
    const openRoles = config.openRoles;
    const drafts = config.openRoleDrafts || {};
    document.querySelectorAll('#open-roles-container .role-chip').forEach(chip => {
      const faction = chip.dataset.faction;
      const roleName = chip.dataset.role;
      const roleData = ROLES.find(r => r.name === roleName);
      chip.className = 'role-chip';
      if (roleData && roleData.disabled) chip.classList.add('role-chip-disabled');
      const isOpen = openRoles.includes(roleName);
      if (isOpen) {
        chip.classList.add(`selected-${faction}`);
      }

      // Draft button management
      let wrapper = chip.parentElement;
      let draftBtn = wrapper.querySelector(`.draft-btn[data-role="${roleName}"]`);
      if (isOpen) {
        if (!draftBtn) {
          draftBtn = document.createElement('button');
          draftBtn.className = 'draft-btn';
          draftBtn.dataset.role = roleName;
          draftBtn.type = 'button';
          draftBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            _openDraftPopover(roleName, draftBtn);
          });
          // Insert right after the chip
          chip.after(draftBtn);
        }
        const num = drafts[roleName];
        draftBtn.textContent = num ? `#${num}` : '#';
        if (num) {
          draftBtn.classList.add('draft-btn-active');
        } else {
          draftBtn.classList.remove('draft-btn-active');
        }
      } else {
        if (draftBtn) draftBtn.remove();
        // Also clean up draft data if role was deselected
        if (drafts[roleName]) {
          const d = { ...drafts };
          delete d[roleName];
          State.updateConfig('openRoleDrafts', d);
        }
      }
    });
  }

  function _bindStartGame() {
    document.getElementById('btn-start-game').addEventListener('click', () => {
      const { config } = State.get();
      const total = config.factions.goose + config.factions.duck + config.factions.neutral;
      if (total !== config.playerCount) {
        document.getElementById('faction-error').classList.remove('hidden');
        document.getElementById('faction-error').scrollIntoView({ behavior: 'smooth' });
        return;
      }
      State.startGame();
      if (typeof umami !== 'undefined') umami.track('game_start', { map: config.map, playerCount: config.playerCount });
      App.switchPhase('game');
    });
  }

  return { init, render };
})();
