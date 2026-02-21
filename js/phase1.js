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
    const { config } = State.get();
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

    const groups = [
      { faction: 'goose',   icon: '🪿', label: '鹅阵营' },
      { faction: 'duck',    icon: '🦆', label: '鸭阵营' },
      { faction: 'neutral', icon: '🕊️', label: '中立阵营' },
    ];

    groups.forEach(({ faction, icon, label }) => {
      const roles = ROLES.filter(r => r.faction === faction);
      const group = document.createElement('div');
      group.className = 'role-faction-group';
      group.innerHTML = `<div class="role-faction-label">${icon} ${label}</div>`;
      const chips = document.createElement('div');
      chips.className = 'role-chips';
      roles.forEach(role => {
        const chip = document.createElement('span');
        chip.className = 'role-chip';
        chip.textContent = role.name;
        chip.dataset.role = role.name;
        chip.dataset.faction = faction;
        chip.addEventListener('click', () => _toggleOpenRole(role.name, faction, chip));
        chips.appendChild(chip);
      });
      group.appendChild(chips);
      container.appendChild(group);
    });

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
