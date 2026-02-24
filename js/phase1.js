// ============================================================
// phase1.js — 初始化阶段 UI 逻辑
// ============================================================

const Phase1 = (() => {

  function init() {
    _bindPlayerCount();
    _bindMapSelector();
    _bindFactionInputs();
    _renderOpenRoles();
    _bindStartGame();
    render();
  }

  function render() {
    const { config, phase } = State.get();
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

    function _getSpeechRecognition() {
      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }

    function _pickRolesFromText(text) {
      const t = (text || '').replace(/\s+/g, '');
      const hits = [];
      ROLES.forEach(r => {
        if (r && r.name && t.includes(r.name)) hits.push(r.name);
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

    // 防止按钮抢走输入焦点导致触发系统级听写
    voiceBtn.addEventListener('mousedown', e => e.preventDefault());

    voiceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const SR = _getSpeechRecognition();
      if (!SR) {
        alert('当前浏览器不支持语音识别（建议使用 Chrome/Edge，并用 http://localhost 打开本地页面）');
        return;
      }

      // 正在监听：再次点击停止
      if (listening && recognition) {
        recognition.stop();
        return;
      }

      recognition = new SR();
      recognition.lang = 'zh-CN';
      // continuous 可以让一次录入包含更多片段；用静默计时自动结束
      recognition.continuous = true;
      recognition.interimResults = false;

      _bufferText = '';
      if (_silenceTimer) {
        clearTimeout(_silenceTimer);
        _silenceTimer = null;
      }

      listening = true;
      voiceBtn.textContent = '🛑';
      voiceBtn.classList.add('listening');
      console.log('[voice] start');

      recognition.onresult = e => {
        // 累计本次识别到的所有片段
        let chunk = '';
        try {
          for (let i = e.resultIndex; i < e.results.length; i++) {
            const t = e.results[i] && e.results[i][0] ? e.results[i][0].transcript : '';
            if (t) chunk += t;
          }
        } catch (_) {
          // ignore
        }
        if (chunk) _bufferText += chunk;

        console.log('[voice] result:', _bufferText);
        const roles = _pickRolesFromText(_bufferText);
        if (!roles || roles.length === 0) {
          alert('未识别到角色名，请重试（建议说清晰的中文角色全名）');
          return;
        }
        _applyOpenRoles(roles);

        // 如果持续有结果，延后结束；一段时间无新结果自动 stop
        if (_silenceTimer) clearTimeout(_silenceTimer);
        _silenceTimer = setTimeout(() => {
          if (recognition) recognition.stop();
        }, 5000);
      };
      recognition.onerror = (err) => {
        const msg = err && err.error ? err.error : 'unknown';
        console.warn('[voice] error:', err);
        alert('语音识别失败：' + msg + '（请确认已允许麦克风权限，并使用 http://localhost 打开）');
      };
      recognition.onend = () => {
        if (_silenceTimer) {
          clearTimeout(_silenceTimer);
          _silenceTimer = null;
        }
        listening = false;
        voiceBtn.textContent = '🎙';
        voiceBtn.classList.remove('listening');
        console.log('[voice] end');
      };

      try {
        recognition.start();
      } catch (e) {
        // 避免重复 start 抛错导致按钮卡住
        listening = false;
        voiceBtn.textContent = '🎙';
        voiceBtn.classList.remove('listening');
      }
    });

    function _filterChips(q) {
      document.querySelectorAll('#open-roles-container .role-chip').forEach(chip => {
        const nameMatch = chip.dataset.role.toLowerCase().includes(q);
        const initialsMatch = (chip.dataset.initials || '').startsWith(q);
        chip.style.display = (!q || nameMatch || initialsMatch) ? '' : 'none';
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
          chip.textContent = role.name;
          chip.dataset.role = role.name;
          chip.dataset.faction = faction;
          chip.dataset.initials = role.initials || '';
          chip.addEventListener('click', () => _toggleOpenRole(role.name, faction, chip));
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

  function _updateOpenRoleChips() {
    const openRoles = State.get().config.openRoles;
    document.querySelectorAll('.role-chip').forEach(chip => {
      const faction = chip.dataset.faction;
      chip.className = 'role-chip';
      if (openRoles.includes(chip.dataset.role)) {
        chip.classList.add(`selected-${faction}`);
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
      App.switchPhase('game');
    });
  }

  return { init, render };
})();
