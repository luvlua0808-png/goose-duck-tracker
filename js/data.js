// ============================================================
// data.js — 角色库 + 地图定义（节点坐标 + 连线）
// ============================================================

const ROLES = [
  // 🪿 鹅阵营 (15)
  { name: '警长',     faction: 'goose' },
  { name: '正义使者', faction: 'goose' },
  { name: '工程师',   faction: 'goose' },
  { name: '通灵者',   faction: 'goose' },
  { name: '侦探',     faction: 'goose' },
  { name: '星界行者', faction: 'goose' },
  { name: '观鸟者',   faction: 'goose' },
  { name: '跟踪者',   faction: 'goose' },
  { name: '加拿大鹅', faction: 'goose' },
  { name: '殡仪员',   faction: 'goose' },
  { name: '模仿者',   faction: 'goose' },
  { name: '复仇者',   faction: 'goose' },
  { name: '士兵',     faction: 'goose' },
  { name: '法医',     faction: 'goose' },
  { name: '探测员',   faction: 'goose' },

  // 🦆 鸭阵营 (10)
  { name: '专业杀手', faction: 'duck' },
  { name: '隐形鸭',   faction: 'duck' },
  { name: '变形者',   faction: 'duck' },
  { name: '爆炸王',   faction: 'duck' },
  { name: '刺客',     faction: 'duck' },
  { name: '食鸟鸭',   faction: 'duck' },
  { name: '间谍',     faction: 'duck' },
  { name: '巫医',     faction: 'duck' },
  { name: '掠夺者',   faction: 'duck' },
  { name: '狙击手',   faction: 'duck' },

  // 🕊️ 中立阵营 (7)
  { name: '呆呆鸟',   faction: 'neutral' },
  { name: '秃鹫',     faction: 'neutral' },
  { name: '鸽子',     faction: 'neutral' },
  { name: '鹈鹕',     faction: 'neutral' },
  { name: '猎鹰',     faction: 'neutral' },
  { name: '布谷鸟',   faction: 'neutral' },
  { name: '锦鸡',     faction: 'neutral' },
];

const FACTION_META = {
  goose:   { label: '鹅阵营',  icon: '🪿', color: 'goose' },
  duck:    { label: '鸭阵营',  icon: '🦆', color: 'duck'  },
  neutral: { label: '中立阵营', icon: '🕊️', color: 'neutral' },
};

// ============================================================
// 地图：老妈鹅飞船（16个节点）
// 坐标系：容器 800×520，单位 px
// ============================================================
const MAP_SPACESHIP = {
  id: 'spaceship',
  name: '老妈鹅飞船',
  width: 820,
  height: 540,
  nodes: [
    { id: 'shower',    label: '池塘淋浴间', x: 390, y: 30  },
    { id: 'engine_r',  label: '电机室',     x: 160, y: 110 },
    { id: 'quarters',  label: '船员宿舍',   x: 390, y: 110 },
    { id: 'engine',    label: '发动机',     x: 60,  y: 220 },
    { id: 'reactor',   label: '反应器',     x: 220, y: 220 },
    { id: 'security',  label: '保安室',     x: 370, y: 220 },
    { id: 'medical',   label: '医疗室',     x: 510, y: 220 },
    { id: 'weapons',   label: '武器房',     x: 650, y: 220 },
    { id: 'lounge',    label: '娱乐室',     x: 390, y: 320 },
    { id: 'comms',     label: '通讯间',     x: 600, y: 320 },
    { id: 'bridge',    label: '桥梁',       x: 740, y: 320 },
    { id: 'hatchery',  label: '孵化器',     x: 160, y: 410 },
    { id: 'cafeteria', label: '食堂',       x: 340, y: 410 },
    { id: 'storage',   label: '储物间',     x: 510, y: 410 },
    { id: 'cargo',     label: '货舱',       x: 390, y: 500 },
    { id: 'prison',    label: '监狱',       x: 740, y: 110 },
  ],
  edges: [
    ['shower',    'quarters'],
    ['shower',    'engine_r'],
    ['engine_r',  'quarters'],
    ['engine_r',  'reactor'],
    ['engine_r',  'engine'],
    ['engine',    'reactor'],
    ['reactor',   'security'],
    ['security',  'medical'],
    ['medical',   'weapons'],
    ['weapons',   'lounge'],
    ['weapons',   'comms'],
    ['lounge',    'cafeteria'],
    ['lounge',    'security'],
    ['lounge',    'storage'],
    ['comms',     'bridge'],
    ['comms',     'storage'],
    ['bridge',    'prison'],
    ['hatchery',  'cafeteria'],
    ['hatchery',  'reactor'],
    ['cafeteria', 'storage'],
    ['storage',   'cargo'],
    ['cargo',     'cafeteria'],
    ['quarters',  'security'],
    ['prison',    'medical'],
  ],
};

// ============================================================
// 地图：鹅教堂（19个节点）
// 坐标系：容器 900×560，单位 px
// ============================================================
const MAP_CHURCH = {
  id: 'church',
  name: '鹅教堂',
  width: 900,
  height: 580,
  nodes: [
    { id: 'tavern',      label: '老酒馆',       x: 80,  y: 40  },
    { id: 'mayor',       label: '市长办公室',   x: 250, y: 40  },
    { id: 'barber',      label: '理发店',       x: 420, y: 40  },
    { id: 'court',       label: '法院',         x: 590, y: 40  },
    { id: 'chapel',      label: '礼拜堂',       x: 760, y: 40  },
    { id: 'brewery',     label: '酒厂区',       x: 160, y: 150 },
    { id: 'barber_cross',label: '理发店三岔口', x: 390, y: 150 },
    { id: 'bank',        label: '银行',         x: 590, y: 150 },
    { id: 'plaza',       label: '广场',         x: 760, y: 150 },
    { id: 'city_center', label: '城市广场',     x: 420, y: 280 },
    { id: 'police',      label: '警察局',       x: 160, y: 380 },
    { id: 'warehouse_x', label: '仓库十字路口', x: 390, y: 380 },
    { id: 'redlight',    label: '红灯区',       x: 660, y: 380 },
    { id: 'warehouse',   label: '仓库',         x: 160, y: 470 },
    { id: 'gateway',     label: '进出口',       x: 350, y: 470 },
    { id: 'port',        label: '港口',         x: 560, y: 470 },
    { id: 'dock',        label: '码头',         x: 350, y: 550 },
    { id: 'shack',       label: '开膛手的棚屋', x: 660, y: 550 },
    { id: 'market',      label: '市场',         x: 760, y: 280 },
  ],
  edges: [
    ['tavern',       'mayor'],
    ['tavern',       'brewery'],
    ['mayor',        'barber'],
    ['mayor',        'brewery'],
    ['barber',       'court'],
    ['barber',       'barber_cross'],
    ['court',        'chapel'],
    ['court',        'bank'],
    ['chapel',       'plaza'],
    ['brewery',      'barber_cross'],
    ['brewery',      'police'],
    ['barber_cross', 'bank'],
    ['barber_cross', 'city_center'],
    ['bank',         'plaza'],
    ['bank',         'city_center'],
    ['plaza',        'market'],
    ['city_center',  'police'],
    ['city_center',  'warehouse_x'],
    ['city_center',  'redlight'],
    ['city_center',  'market'],
    ['police',       'warehouse'],
    ['warehouse_x',  'warehouse'],
    ['warehouse_x',  'gateway'],
    ['warehouse_x',  'port'],
    ['redlight',     'port'],
    ['redlight',     'shack'],
    ['warehouse',    'gateway'],
    ['gateway',      'port'],
    ['gateway',      'dock'],
    ['port',         'dock'],
    ['port',         'shack'],
    ['market',       'redlight'],
  ],
};

const MAPS = {
  spaceship: MAP_SPACESHIP,
  church:    MAP_CHURCH,
};

// 根据角色名查找阵营
function getRoleFaction(roleName) {
  const r = ROLES.find(r => r.name === roleName);
  return r ? r.faction : null;
}

// 模糊搜索角色
function searchRoles(query) {
  if (!query) return ROLES;
  const q = query.trim().toLowerCase();
  return ROLES.filter(r => r.name.toLowerCase().includes(q));
}
