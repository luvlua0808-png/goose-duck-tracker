// ============================================================
// state.js — 游戏状态管理 + localStorage 持久化
// ============================================================

const STORAGE_KEY = 'goose_duck_tracker_v1';

// 默认状态工厂
function createDefaultState() {
  return {
    phase: 'init',          // 'init' | 'game' | 'meeting'
    round: 1,
    myRole: null,           // 我的角色名
    config: {
      playerCount: 13,
      map: 'spaceship',
      factions: { goose: 8, duck: 3, neutral: 2 },
      openRoles: [],         // 明牌角色名数组
    },
    rounds: {},              // { 1: { path: [], sightings: { roomId: [playerNums] } }, ... }
    players: {},             // { 1: { alive, trust, faction, role, notes: { roundN: '' } } }
    currentPath: [],         // 当前轮次路径 roomId 数组
    currentSightings: {},    // 当前轮次目击 { roomId: [nums] }
  };
}

// 全局状态对象
let gameState = createDefaultState();

// ── 持久化 ──────────────────────────────────────────────────

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch (e) {
    console.warn('localStorage 写入失败', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      gameState = Object.assign(createDefaultState(), parsed);
      // 深度合并 config
      gameState.config = Object.assign(createDefaultState().config, parsed.config || {});
    }
  } catch (e) {
    console.warn('localStorage 读取失败，使用默认状态', e);
    gameState = createDefaultState();
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  gameState = createDefaultState();
}

// ── 玩家初始化 ──────────────────────────────────────────────

function initPlayers(count) {
  const players = {};
  for (let i = 1; i <= count; i++) {
    players[i] = {
      alive: true,
      trust: 'unknown',   // 'unknown' | 'suspicious' | 'trusted' | 'confirmed_duck'
      faction: null,      // 'goose' | 'duck' | 'neutral' | null
      role: null,         // 角色名 | null
      notes: {},          // { roundN: '文本' }
    };
  }
  return players;
}

// ── 状态操作 API ────────────────────────────────────────────

const State = {

  get() { return gameState; },

  // 阶段切换
  setPhase(phase) {
    gameState.phase = phase;
    saveState();
  },

  // 开始游戏（初始化 → 游戏）
  startGame() {
    const { playerCount } = gameState.config;
    gameState.players = initPlayers(playerCount);
    gameState.round = 1;
    gameState.rounds = {};
    gameState.currentPath = [];
    gameState.currentSightings = {};
    gameState.phase = 'game';
    saveState();
  },

  setMyRole(roleName) {
    gameState.myRole = roleName;
    saveState();
  },

  // 更新配置
  updateConfig(key, value) {
    gameState.config[key] = value;
    saveState();
  },

  // 路径操作
  addToPath(roomId) {
    if (!gameState.currentPath.includes(roomId)) {
      gameState.currentPath.push(roomId);
      saveState();
    }
  },

  removeFromPath(roomId) {
    gameState.currentPath = gameState.currentPath.filter(id => id !== roomId);
    // 同时清除该节点的目击记录
    delete gameState.currentSightings[roomId];
    saveState();
  },

  clearPath() {
    gameState.currentPath = [];
    gameState.currentSightings = {};
    saveState();
  },

  // 目击记录
  setSighting(roomId, nums) {
    if (nums && nums.length > 0) {
      gameState.currentSightings[roomId] = nums;
    } else {
      delete gameState.currentSightings[roomId];
    }
    saveState();
  },

  // 进入会议：保存当前轮次数据，清空路径
  commitRound() {
    const r = gameState.round;
    gameState.rounds[r] = {
      path: [...gameState.currentPath],
      sightings: { ...gameState.currentSightings },
    };
    gameState.currentPath = [];
    gameState.currentSightings = {};
    gameState.phase = 'meeting';
    saveState();
  },

  // 下一轮：会议 → 游戏
  nextRound() {
    gameState.round += 1;
    gameState.currentPath = [];
    gameState.currentSightings = {};
    gameState.phase = 'game';
    saveState();
  },

  // 玩家操作
  toggleAlive(playerNum) {
    const p = gameState.players[playerNum];
    if (p) { p.alive = !p.alive; saveState(); }
  },

  cycleTrust(playerNum) {
    const order = ['unknown', 'suspicious', 'trusted', 'confirmed_duck'];
    const p = gameState.players[playerNum];
    if (!p) return;
    const idx = order.indexOf(p.trust);
    p.trust = order[(idx + 1) % order.length];
    saveState();
  },

  setFaction(playerNum, faction) {
    const p = gameState.players[playerNum];
    if (p) { p.faction = faction; saveState(); }
  },

  setRole(playerNum, roleName) {
    const p = gameState.players[playerNum];
    if (!p) return;
    p.role = roleName;
    if (roleName) {
      p.faction = getRoleFaction(roleName) || p.faction;
    }
    saveState();
  },

  setNote(playerNum, round, text) {
    const p = gameState.players[playerNum];
    if (p) { p.notes[round] = text; saveState(); }
  },

  // 获取某玩家的所有目击记录（跨轮次）
  getPlayerSightings(playerNum) {
    const result = [];
    const num = Number(playerNum);
    Object.entries(gameState.rounds).forEach(([round, data]) => {
      Object.entries(data.sightings || {}).forEach(([roomId, nums]) => {
        if (nums.includes(num)) {
          const map = MAPS[gameState.config.map];
          const node = map.nodes.find(n => n.id === roomId);
          result.push({ round: Number(round), room: node ? node.label : roomId });
        }
      });
    });
    // 当前轮次目击（游戏阶段）
    Object.entries(gameState.currentSightings).forEach(([roomId, nums]) => {
      if (nums.includes(num)) {
        const map = MAPS[gameState.config.map];
        const node = map.nodes.find(n => n.id === roomId);
        result.push({ round: gameState.round, room: node ? node.label : roomId, current: true });
      }
    });
    return result;
  },

  // 计算阵营统计
  getFactionStats() {
    const { config, players } = gameState;
    const stats = {};

    // 收集每个角色的认领玩家列表
    const roleClaimMap = {}; // roleName -> [player]
    Object.values(players).forEach(p => {
      if (p.role) {
        if (!roleClaimMap[p.role]) roleClaimMap[p.role] = [];
        roleClaimMap[p.role].push(p);
      }
    });

    function buildRoleInfo(roleName) {
      const claimers = roleClaimMap[roleName] || [];
      const claimed = claimers.length > 0;
      const claimCount = claimers.length;
      const dead = claimed && claimers.every(p => !p.alive);
      return { name: roleName, claimed, claimCount, dead };
    }

    ['goose', 'duck', 'neutral'].forEach(f => {
      const total = config.factions[f] || 0;
      const openNames = config.openRoles.filter(r => getRoleFaction(r) === f);
      const open = openNames.map(buildRoleInfo);

      const jumpedNames = [];
      Object.values(players).forEach(p => {
        if (p.role && getRoleFaction(p.role) === f && !openNames.includes(p.role)) {
          if (!jumpedNames.includes(p.role)) jumpedNames.push(p.role);
        }
      });
      const exceeded = total > 0 && (openNames.length + jumpedNames.length) > total;
      const jumped = jumpedNames.map(r => ({ ...buildRoleInfo(r), overflowed: exceeded }));

      const unknown = Math.max(0, total - open.length - jumped.length);
      stats[f] = { total, open, jumped, unknown, exceeded };
    });

    return stats;
  },

  updatePlayerTrust(playerNum, trustLevel) {
    const p = gameState.players[playerNum];
    if (p) {
      p.trust = trustLevel;
      saveState();
    }
  },

  reset() {
    clearState();
  },

  loadState() {
    loadState();
  },
};
