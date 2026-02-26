// ============================================================
// data.js — 角色库 + 地图定义（节点坐标 + 连线）
// ============================================================

const ROLES = [
  // 🪿 鹅阵营 (15)
  { name: '警长',     faction: 'goose',   initials: 'jz'   },
  { name: '正义使者', faction: 'goose',   initials: 'zysz', aliases: ['正义'] },
  { name: '工程师',   faction: 'goose',   initials: 'gcs'  },
  { name: '通灵者',   faction: 'goose',   initials: 'tlz',  aliases: ['通灵'] },
  { name: '侦探',     faction: 'goose',   initials: 'zt'   },
  { name: '星界行者', faction: 'goose',   initials: 'xjxz', aliases: ['星际行者', '星界行着', '星界行这', '新界行者', '新界行这', '新界', '新界星者'] },
  { name: '观鸟者',   faction: 'goose',   initials: 'gnz',  aliases: ['关鸟者', '官鸟者', '管鸟者', '官僚者', '观僚者', '观鸟', '关鸟'] },
  { name: '跟踪者',   faction: 'goose',   initials: 'gzz'  },
  { name: '加拿大鹅', faction: 'goose',   initials: 'jnde', aliases: ['加拿大'] },
  { name: '殡仪员',   faction: 'goose',   initials: 'byy',  aliases: ['宾仪员', '滨仪员', '濒仪员', '宾义员', '宾一员', '殡仪园', '宾仪园'] },
  { name: '模仿者',   faction: 'goose',   initials: 'mfz'  },
  { name: '复仇者',   faction: 'goose',   initials: 'fcz'  },
  { name: '士兵',     faction: 'goose',   initials: 'sb'   },
  { name: '法医',     faction: 'goose',   initials: 'fy',   aliases: ['法'] },
  { name: '探测员',   faction: 'goose',   initials: 'tcy',  aliases: ['探测'] },
  { name: '大白鹅',   faction: 'goose',   initials: 'dbe'  },

  // 🦆 鸭阵营 (10)
  { name: '专业杀手', faction: 'duck',    initials: 'zyss' },
  { name: '隐形鸭',   faction: 'duck',    initials: 'yxy',  aliases: ['隐形呀', '银行鸭', '隐行鸭', '隐形压', '隐形ya', '隐形牙', '隐形'] },
  { name: '变形者',   faction: 'duck',    initials: 'bxz',  aliases: ['变形'] },
  { name: '爆炸王',   faction: 'duck',    initials: 'bzw',  aliases: ['爆炸'] },
  { name: '刺客',     faction: 'duck',    initials: 'ck'   },
  { name: '食鸟鸭',   faction: 'duck',    initials: 'sny',  aliases: ['食鸟'] },
  { name: '间谍',     faction: 'duck',    initials: 'jd'   },
  { name: '巫医',     faction: 'duck',    initials: 'wy',   aliases: ['无医', '吴医', '巫一', '乌伊', '乌医', '巫伊', '乌衣'] },
  { name: '掠夺者',   faction: 'duck',    initials: 'ldz'  },
  { name: '狙击手',   faction: 'duck',    initials: 'jjs',  aliases: ['狙击'] },
  { name: '鸭子',     faction: 'duck',    initials: 'yz'   },

  // 🕊️ 中立阵营 (7)
  { name: '呆呆鸟',   faction: 'neutral', initials: 'ddn'  },
  { name: '秃鹫',     faction: 'neutral', initials: 'tj',   aliases: ['秃就', '图就', '秃旧', '图鹫', '秃', '突就', '突鹫', '脱'] },
  { name: '鸽子',     faction: 'neutral', initials: 'gz'   },
  { name: '鹈鹕',     faction: 'neutral', initials: 'th',   aliases: ['提壶', '提鹄', '提湖', '啼壶', '鹈壶', '题壶', '体壶', '提葫', '特壶', '梯壶', '啼胡', '提胡', '踢壶', '替壶'] },
  { name: '猎鹰',     faction: 'neutral', initials: 'ly',   aliases: ['猎'] },
  { name: '布谷鸟',   faction: 'neutral', initials: 'bgn'  },
  { name: '锦鸡',     faction: 'neutral', initials: 'jj',   aliases: ['近鸡', '金鸡', '紧鸡', '劲鸡', '锦基', '近基', '金基', '紧急', '紧', '锦'] },
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
    { id: 'shower',    label: '池塘淋浴间', x: 410, y: 30,  aliases: ['淋浴间', '淋浴', '池塘淋浴'] },
    { id: 'quarters',  label: '船员宿舍',   x: 410, y: 120 },
    { id: 'engine_r',  label: '电机室',     x: 150, y: 160, aliases: ['电机石', '电击室', '电击石', '电机事', '电机房'] },
    { id: 'engine',    label: '发动机',     x: 55,  y: 290, aliases: ['发动'] },
    { id: 'reactor',   label: '反应器',     x: 130, y: 290 },
    { id: 'security',  label: '保安室',     x: 240, y: 270, aliases: ['保安市', '保安'] },
    { id: 'corridor',  label: '走廊',       x: 320, y: 170 },
    { id: 'medical',   label: '医疗室',     x: 380, y: 290 },
    { id: 'weapons',   label: '武器房',     x: 580, y: 270 },
    { id: 'prison',    label: '监狱',       x: 240, y: 380 },
    { id: 'lounge',    label: '娱乐室',     x: 480, y: 360, aliases: ['娱乐石', '鱼乐室', '鱼乐石', '娱乐事', '娱乐式', '娱乐坊', '娱乐'] },
    { id: 'storage',   label: '储物间',     x: 550, y: 420 },
    { id: 'comms',     label: '通讯间',     x: 690, y: 310 },
    { id: 'bridge',    label: '桥梁',       x: 770, y: 310 },
    { id: 'hatchery',  label: '孵化器',     x: 160, y: 450, aliases: ['孵化'] },
    { id: 'cafeteria', label: '食堂',       x: 330, y: 460 },
    { id: 'cargo',     label: '货舱',       x: 530, y: 490, aliases: ['货仓', '货场', '货长'] },
  ],
  edges: [
    ['shower',    'quarters'],
    ['engine_r',  'engine'],
    ['engine',    'reactor'],
    ['engine',    'hatchery'],
    ['corridor',  'engine_r'],
    ['corridor',  'quarters'],
    ['corridor',  'security'],
    ['corridor',  'medical'],
    ['corridor',  'weapons'],
    ['corridor',  'cafeteria'],
    ['corridor',  'lounge'],
    ['security',  'prison'],
    ['weapons',   'comms'],
    ['lounge',    'weapons'],
    ['lounge',    'comms'],
    ['storage',   'comms'],
    ['storage',   'cafeteria'],
    ['storage',   'cargo'],
    ['comms',     'bridge'],
    ['hatchery',  'cafeteria'],
  ],
};

// ============================================================
// 玩家编号颜色（抱团连线用）
const PLAYER_COLORS = {
  1: '#FFFFFF',   // 白
  2: '#1e3a5f',   // 深蓝
  3: '#1a472a',   // 深绿
  4: '#ff69b4',   // 粉
  5: '#dc2626',   // 红
  6: '#facc15',   // 黄
  7: '#f97316',   // 橙
  8: '#92400e',   // 棕
  9: '#9CA3AF',   // 亮灰
  10: '#7c3aed',  // 紫
  11: '#86efac',  // 浅绿
  12: '#7dd3fc',  // 浅蓝
  13: '#e11d48',  // 枚红
  14: '#9ca3af',  // 浅灰
  15: '#fef3c7',  // 米黄
};

// ============================================================
// 地图：鹅教堂（19个节点）
// 坐标系：容器 900×580，单位 px
// ============================================================
const MAP_CHURCH = {
  id: 'church',
  name: '鹅教堂',
  width: 900,
  height: 600,
  nodes: [
    { id: 'tavern',      label: '老酒馆',       x: 80,  y: 40  },
    { id: 'mayor',       label: '市长办公室',   x: 250, y: 40  },
    { id: 'barber',      label: '理发店',       x: 420, y: 40  },
    { id: 'court',       label: '法院',         x: 590, y: 40  },
    { id: 'chapel',      label: '礼拜堂',       x: 820, y: 40  },
    { id: 'brewery',      label: '酒厂区',       x: 160, y: 160 },
    { id: 'barber_cross', label: '理发店三岔口', x: 390, y: 160 },
    { id: 'bank',         label: '银行',         x: 660, y: 230 },
    { id: 'plaza',        label: '广场',         x: 820, y: 160 },
    { id: 'city_center',  label: '城市广场',     x: 400, y: 290 },
    { id: 'police',       label: '警察局',       x: 300, y: 380 },
    { id: 'warehouse_x',  label: '仓库十字路口', x: 190, y: 360 },
    { id: 'redlight',     label: '红灯区',       x: 820, y: 370 },
    { id: 'factory',      label: '工厂',         x: 30,  y: 390 },
    { id: 'warehouse',    label: '仓库',         x: 190, y: 470 },
    { id: 'gateway',      label: '进出口',       x: 380, y: 470 },
    { id: 'port',         label: '港口',         x: 580, y: 470 },
    { id: 'dock',         label: '码头',         x: 380, y: 555 },
    { id: 'shack',        label: '开膛手的棚屋', x: 820, y: 470, aliases: ['开膛手的澎湖', '开膛手的蓬屋', '开膛手的篷屋', '澎湖', '棚屋', '蓬屋'] },
  ],
  edges: [
    ['tavern',       'mayor'],
    ['tavern',       'brewery'],
    ['mayor',        'barber'],
    ['mayor',        'brewery'],
    ['barber',       'court'],
    ['court',        'chapel'],
    ['chapel',       'plaza'],
    ['barber',       'barber_cross'],
    ['brewery',      'barber_cross'],
    ['brewery',      'warehouse_x'],
    ['barber_cross', 'plaza'],
    ['barber_cross', 'city_center'],
    ['bank',         'plaza'],
    ['bank',         'city_center'],
    ['court',        'plaza'],
    ['plaza',        'redlight'],
    ['city_center',  'police'],
    ['city_center',  'warehouse_x'],
    ['city_center',  'redlight'],
    ['city_center',  'gateway'],
    ['police',       'warehouse_x'],
    ['warehouse_x',  'factory'],
    ['warehouse_x',  'warehouse'],
    ['redlight',     'port'],
    ['redlight',     'shack'],
    ['warehouse',    'gateway'],
    ['gateway',      'port'],
    ['gateway',      'dock'],
    ['port',         'dock'],
    ['port',         'shack'],
  ],
};

// ============================================================
// 地图：地下室（14个节点）
// 坐标系：容器 880×580，单位 px
// 布局参考截图：上方实验室/锅炉房，右侧雾洞/学习室，中部祭坛/前堂，左侧地牢/隐道，下方礼堂/坑
// ============================================================
const MAP_BASEMENT = {
  id: 'basement',
  name: '地下室',
  width: 880,
  height: 600,
  nodes: [
    { id: 'lab',        label: '实验室',       x: 320, y: 50  },
    { id: 'boiler',     label: '锅炉房',       x: 580, y: 50  },
    { id: 'collection', label: '奇珍异品收藏室', x: 270, y: 180 },
    { id: 'dungeon',    label: '地牢',         x: 100, y: 220 },
    { id: 'altar',      label: '祭坛',         x: 450, y: 200 },
    { id: 'study',      label: '学习室',       x: 650, y: 250 },
    { id: 'fog',        label: '雾洞',         x: 820, y: 170 },
    { id: 'locker',     label: '储物柜',       x: 270, y: 340 },
    { id: 'foyer',      label: '前堂',         x: 490, y: 340 },
    { id: 'storage',    label: '储物间',       x: 370, y: 480 },
    { id: 'tunnel',     label: '隧道',         x: 100, y: 440 },
    { id: 'tunnel_ent', label: '隧道入口',     x: 320, y: 580 },
    { id: 'hall',       label: '礼堂',         x: 720, y: 510 },
    { id: 'pit',        label: '坑',           x: 60,  y: 570 },
  ],
  edges: [
    ['lab',        'boiler'],
    ['lab',        'dungeon'],
    ['boiler',     'fog'],
    ['collection', 'dungeon'],
    ['collection', 'locker'],
    ['dungeon',    'tunnel'],
    ['altar',      'foyer'],
    ['study',      'fog'],
    ['study',      'foyer'],
    ['locker',     'storage'],
    ['locker',     'foyer'],
    ['foyer',      'storage'],
    ['foyer',      'hall'],
    ['study',      'hall'],
    ['storage',    'hall'],
    ['storage',    'tunnel_ent'],
    ['tunnel',     'tunnel_ent'],
    ['tunnel',     'pit'],
    ['tunnel_ent', 'pit'],
  ],
};

// ============================================================
// 地图：丛林殿堂（13个节点）
// 坐标系：容器 900×560，单位 px
// 布局参考截图：上方金銮殿/喷泉，左侧西宝室/准备室/暂存区，中部宝物室/墓室，右侧前堂/训练场，下方营地/供货区
// ============================================================
const MAP_JUNGLE = {
  id: 'jungle',
  name: '丛林殿堂',
  width: 900,
  height: 580,
  nodes: [
    { id: 'throne',    label: '金銮殿',    x: 270, y: 60  },
    { id: 'fountain',  label: '喷泉',      x: 590, y: 60  },
    { id: 'west_room', label: '西宝室',    x: 200, y: 190 },
    { id: 'treasury',  label: '宝物室',    x: 480, y: 190 },
    { id: 'foyer',     label: '前堂',      x: 720, y: 190 },
    { id: 'prep',      label: '准备室',    x: 110, y: 300 },
    { id: 'tomb',      label: '墓室',      x: 550, y: 300 },
    { id: 'worship',   label: '敬拜坑',    x: 340, y: 390 },
    { id: 'altar',     label: '祭坛',      x: 590, y: 420 },
    { id: 'staging',   label: '暂存准备区', x: 100, y: 420 },
    { id: 'training',  label: '训练场',    x: 820, y: 370 },
    { id: 'camp',      label: '营地',      x: 560, y: 510 },
    { id: 'supply',    label: '供货区',    x: 300, y: 510 },
  ],
  edges: [
    ['throne',    'fountain'],
    ['throne',    'west_room'],
    ['throne',    'treasury'],
    ['fountain',  'treasury'],
    ['fountain',  'foyer'],
    ['west_room', 'prep'],
    ['west_room', 'treasury'],
    ['treasury',  'tomb'],
    ['treasury',  'foyer'],
    ['foyer',     'training'],
    ['foyer',     'tomb'],
    ['prep',      'staging'],
    ['staging',   'worship'],
    ['worship',   'west_room'],
    ['worship',   'treasury'],
    ['tomb',      'altar'],
    ['tomb',      'worship'],
    ['worship',   'altar'],
    ['worship',   'supply'],
    ['altar',     'camp'],
    ['altar',     'training'],
    ['staging',   'supply'],
    ['supply',    'camp'],
    ['training',  'camp'],
  ],
};

const MAPS = {
  spaceship: MAP_SPACESHIP,
  church:    MAP_CHURCH,
  basement:  MAP_BASEMENT,
  jungle:    MAP_JUNGLE,
};

// 根据角色名查找阵营
function getRoleFaction(roleName) {
  const r = ROLES.find(r => r.name === roleName);
  return r ? r.faction : null;
}

// 模糊搜索角色（支持名字包含 + 拼音首字母前缀匹配）
function searchRoles(query) {
  if (!query) return ROLES;
  const q = query.trim().toLowerCase();
  return ROLES.filter(r =>
    r.name.toLowerCase().includes(q) ||
    (r.initials && r.initials.startsWith(q))
  );
}
