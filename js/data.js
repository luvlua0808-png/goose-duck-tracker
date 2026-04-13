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
  { name: '肉汁',     faction: 'goose',   initials: 'rz'   },

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
  { name: '超能力者', faction: 'duck',    initials: 'cnlz', aliases: ['超能力', '超能'] },
  { name: '鸭子',     faction: 'duck',    initials: 'yz'   },
  { name: '小丑',     faction: 'duck',    initials: 'xc'   },

  // 🕊️ 中立阵营 (7)
  { name: '呆呆鸟',   faction: 'neutral', initials: 'ddn'  },
  { name: '秃鹫',     faction: 'neutral', initials: 'tj',   aliases: ['秃就', '图就', '秃旧', '图鹫', '秃', '突就', '突鹫', '脱'] },
  { name: '鸽子',     faction: 'neutral', initials: 'gz'   },
  { name: '鹈鹕',     faction: 'neutral', initials: 'th',   aliases: ['提壶', '提鹄', '提湖', '啼壶', '鹈壶', '题壶', '体壶', '提葫', '特壶', '梯壶', '啼胡', '提胡', '踢壶', '替壶'] },
  { name: '猎鹰',     faction: 'neutral', initials: 'ly',   aliases: ['猎'] },
  { name: '布谷鸟',   faction: 'neutral', initials: 'bgn'  },
  { name: '锦鸡',     faction: 'neutral', initials: 'jj',   aliases: ['近鸡', '金鸡', '紧鸡', '劲鸡', '锦基', '近基', '金基', '紧急', '紧', '锦'], disabled: true },
  { name: '渡鸦',     faction: 'neutral', initials: 'dy',   aliases: ['渡'] },
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

// ============================================================
// 锦囊妙计数据库（100条）
// type: 'general' | 'role' | 'chaos'
// role: 角色名（仅 type='role' 时有效）
// ============================================================
const JINANG_DB = [
  // ── 通用锦囊（30条）──
  { id: 1,  type: 'general', text: '这轮少说，多听。谁在主动帮别人圆话？帮谁圆就怀疑谁。' },
  { id: 2,  type: 'general', text: '数一下现在还活着几个人，鸭子占几个——票不够用的话，现在就得出手。' },
  { id: 3,  type: 'general', text: '找一个和你走过相同路线的人，对一下目击记录。对不上的那段，就是问题所在。' },
  { id: 4,  type: 'general', text: '直接问："你上一轮在哪个房间，见到了谁？"——回答含糊的，值得盯着。' },
  { id: 5,  type: 'general', text: '死的人是谁？如果死的都是手里有信息的，凶手就在知道这些信息的人里。' },
  { id: 6,  type: 'general', text: '有人在帮某人辩护，但两人路线对不上——不用挑破，看他们自己说漏嘴。' },
  { id: 7,  type: 'general', text: '这轮先别急着投，让大家多说几句——沉默的人一开口，往往最容易出错。' },
  { id: 8,  type: 'general', text: '谁在转移话题？每次快到敏感点就有人带偏方向——下次再出现，直接点名。' },
  { id: 9,  type: 'general', text: '把你最确定的那条信息公开说出来，逼所有人表态。态度最暧昧的，重点怀疑。' },
  { id: 10, type: 'general', text: '说一个你已经知道答案的细节，看谁的描述和你出入最大——说明他根本不在那里。' },
  { id: 11, type: 'general', text: '有没有人说了"我亲眼看到"但时间线对不上？目击时间比目击内容更难伪造。' },
  { id: 12, type: 'general', text: '两个人互相指，旁边还有第三个人在看热闹——他在等什么？先看他。' },
  { id: 13, type: 'general', text: '把本局所有被投票出去的人列出来，是鹅还是鸭？比例说明了局势，也说明谁在主导投票方向。' },
  { id: 14, type: 'general', text: '有没有人这局换过两次怀疑对象？每次换都有理由，但理由之间互相矛盾——那才是关键。' },
  { id: 15, type: 'general', text: '你最不舒服的那个人，说说为什么——就算说不清楚，"感觉不对"也是有效信息。' },
  { id: 16, type: 'general', text: '有人对某个房间细节描述得特别准确？太准了，说明他真在那——或者早就想好了借口。' },
  { id: 17, type: 'general', text: '反推一下：如果今天被投票的是一个鹅，鸭子最想让谁被票？盯着最积极推那个候选人的玩家。' },
  { id: 18, type: 'general', text: '找一个你信任的人先对齐信息再发言，两人口径一致，可信度翻倍。' },
  { id: 19, type: 'general', text: '谁从来不主动提供信息？一直等别人说完才表态的人，在等什么风向？' },
  { id: 20, type: 'general', text: '有人被点名之后没有认真辩解，只说"随便"或沉默——要么是真鸭，要么有更大的底牌。' },
  { id: 21, type: 'general', text: '路径记录里有没有人在同一时间出现在两个不相邻的房间？地图不会说谎。' },
  { id: 22, type: 'general', text: '不要跟风投票——说出你自己的判断，哪怕和多数人不同。跟风的人是最好被利用的。' },
  { id: 23, type: 'general', text: '有人这轮特别积极地推某人——他急什么？推错了最该怀疑的反而是他。' },
  { id: 24, type: 'general', text: '下一轮故意走条平时不走的路线，看谁跟上来了，或者谁刻意避开了你。' },
  { id: 25, type: 'general', text: '对上轮死亡复盘：死者死前说过什么信息？那条信息如果让鸭子难受，就顺着查。' },
  { id: 26, type: 'general', text: '把存活的人分类：确认安全、高度怀疑、不确定。不确定的，这轮重点突破。' },
  { id: 27, type: 'general', text: '有没有人在两轮之间改变了立场但没给理由？立场变了，利益也变了。' },
  { id: 28, type: 'general', text: '会议时间别浪费在无关争论上——把最关键的信息先说完，再讨论。' },
  { id: 29, type: 'general', text: '问一个所有正常玩家都应该知道的规则细节——不知道的，可能没怎么关注任务。' },
  { id: 30, type: 'general', text: '局面乱时谁最冷静？冷静有两种：一是胸有成竹，另一种是已经达到目的了。' },

  // ── 角色专属锦囊（40条）──
  { id: 31,  type: 'role', role: '警长',     text: '你的刀不要急着开——先用"我是警长"的威慑压缩鸭子的活动空间，等信息足够再动手。' },
  { id: 32,  type: 'role', role: '警长',     text: '站出来主导讨论节奏，记下谁在发言时刻意绕开关键问题、谁对你贴近的反应最异常。' },
  { id: 33, type: 'role', role: '警长',     text: '开枪前确认三件事：目标路线对不上、发言逻辑有矛盾、旁边没有会误伤的人。三条全中，再动刀。' },
  { id: 34, type: 'role', role: '警长',     text: '找工程师或正义使者对齐信息——两人的观察加上你的判断，锁人准确率会高很多。' },
  { id: 35, type: 'role', role: '侦探',     text: '你已经有信息了，现在用它设陷阱：说出一个"你还不确定"的细节，看谁主动补刀。' },
  { id: 36, type: 'role', role: '侦探',     text: '把查到的信息和公开目击对比——有没有人描述的路径和你的查验结果对不上？就从这里问。' },
  { id: 37,  type: 'role', role: '通灵者',   text: '持续追踪幽灵数变化，分析哪个时间段有双死或鹈鹕吃人。把这条时间线信息传给你最信任的人，让他来发言——你不用暴露自己。' },
  { id: 38, type: 'role', role: '通灵者',   text: '任务阶段高频按技能，记下幽灵数跳变的时间点。短时间内跳2，说明双死或鹈鹕吃人——会议上找准时机把时间线抛出来。' },
  { id: 39,  type: 'role', role: '观鸟者',   text: '你技能强但肉身脆——找一个可信的人真心换真心一起走，让他在旁边护着你用技能。' },
  { id: 40, type: 'role', role: '观鸟者',   text: '技能可以用来自证：让对方在你视野外做一个动作，你用技能观察后复述，洗脱嫌疑。' },
  { id: 41, type: 'role', role: '观鸟者',   text: '用技能看到有人刀人，立刻上报——描述位置和时间，目击越具体越有说服力。' },
  { id: 42, type: 'role', role: '跟踪者',   text: '你跟过某人，路线对上了吗？如果他说的和你看到的不一样，直接点名，别给他反应时间。' },
  { id: 43,  type: 'role', role: '工程师',   text: '紧急任务触发时，地图上会显示破坏者的大致位置——先记下方位，再去修复，修复时观察周围谁在装忙但没实质行动。' },
  { id: 44, type: 'role', role: '工程师',   text: '感觉有人跟着你？钻管道甩开，换个方向继续做任务。别让鸭子靠贴脸锁定你的身份。' },
  { id: 45, type: 'role', role: '工程师',   text: '在管道出口蹲守，好人做任务不会乱逛，四处排查找人的才是异常。看到有人被刀，先别自曝，以"隔墙目击"为由再上报。' },
  { id: 46, type: 'role', role: '工程师',   text: '紧急任务是你的情报窗口——破坏位置+修复时的行为观察，两条信息叠在一起，直接锁人。' },
  { id: 47,  type: 'role', role: '正义使者', text: '刀留到投票阶段——会议上把最可疑的人盘出来，再动手。别在任务阶段随便出刀。' },
  { id: 48, type: 'role', role: '正义使者', text: '落单时有人鬼鬼祟祟往你身边凑，直接说"再靠近我就出刀"。他还敢来，基本是铁鸭，可以决战了。' },
  { id: 49, type: 'role', role: '正义使者', text: '出刀前先报身份，当着大家的面动手——避免被误当鸭子处决，正义一刀换一只鸭是赚的。' },
  { id: 50, type: 'role', role: '正义使者', text: '看到有人在人堆里刀人，先别冲——可能是警长或猎鹰。听他解释再决定，两把刀互耗只会让好人大亏。' },
  { id: 51, type: 'role', role: '法医',     text: '死亡位置和死者路线能说明问题——凶手必须能在那个时间点到那个房间，排掉不可能的人。' },
  { id: 52,  type: 'role', role: '士兵',     text: '技能没解锁前，低调专注做任务。现在就去暴露是士兵，只会提前成为鸭子的首要目标。' },
  { id: 53, type: 'role', role: '士兵',     text: '解锁出刀后，优先盯发言混乱或全程滑水的人——别心急，把刀留给铁鸭。' },
  { id: 54, type: 'role', role: '士兵',     text: '刀错了别跑，立刻报身份。误刀无责，利用这个时机帮好人缩小怀疑范围。' },
  { id: 55, type: 'role', role: '士兵',     text: '用完刀继续做任务刷进度，别光想着找人——后期无刀可用是最大的浪费。' },
  { id: 56, type: 'role', role: '星界行者', text: '用技能锁定可疑路线——有人说在某处但你根本没观察到他，直接点名质问。' },
  { id: 57, type: 'role', role: '星界行者', text: '穿墙进入隐蔽角落观察其他玩家行动，但发言时只透露大方向路径，别直接说穿墙细节——暴露能力等于暴露身份。' },
  { id: 58,  type: 'role', role: '殡仪员',   text: '抱团走，有人发现尸体就让你去验——拉铃后可以查明死者身份，把信息告诉最信任的队友。' },
  { id: 59, type: 'role', role: '殡仪员',   text: '报身份时真心换真心：找一个可信的人互换身份确认，或者只告诉信任的鹅你是殡仪员，降低被针对的风险。' },
  { id: 60,  type: 'role', role: '模仿者',   text: '只和无对跳的大白鹅报身份，或者干脆不报。场上双狼或三狼时，骗狼出手刀你，立刻开会报身份模仿——一换一甚至一换二。' },
  { id: 61, type: 'role', role: '模仿者',   text: '先钻迷雾，等待下一个钻进来的人——大概率是中立或者鸭子。' },
  { id: 62, type: 'role', role: '模仿者',   text: '有人一直想和你单聊、意图明显，大概率是狼在试探。带他去井盖旁边暗示他钻，狼大概率上钩，拉铃直接票他。' },
  { id: 63,  type: 'role', role: '复仇者',   text: '附近有人被杀时你会短暂获得刀人能力——提前锁定目标，获刀后立刻出手，不要犹豫，窗口期很短。' },
  { id: 64, type: 'role', role: '复仇者',   text: '前期正常做任务，暗中观察有杀人动机的人。不要一直跟着同一个人，多转一转，增加触发机会。' },
  { id: 65,  type: 'role', role: '加拿大鹅', text: '找几个身份明显的好人，私下告诉他们你是加拿大鹅——你死了能带走凶手，他们需要知道这个信息。' },
  { id: 66, type: 'role', role: '加拿大鹅', text: '你的价值是一换一：狼比好人少，带走一只狼就是胜利。敢于主动暴露，比躲着活着更有价值。' },
  { id: 67,  type: 'role', role: '探测员',   text: '报警后立刻开技能——观察哪些红点远离尸体位置，哪些人曾在尸体附近出现，结合路径缩小嫌疑范围。' },
  { id: 68, type: 'role', role: '探测员',   text: '技能冷却很长，每次开启都要追求最大价值。有人长时间单独行动或多人聚集但行为可疑时，是最佳时机。' },
  { id: 69, type: 'role', role: '探测员',   text: '利用全图视野主动找无人区安全做任务——不用冒险靠近人群，专注刷任务进度也是贡献。' },
  { id: 70,  type: 'role', role: '大白鹅',   text: '开局直接跳出来，全场无人对跳你就是身份最高的鹅——带队带节奏，依次找人单聊，好人会直接报身份。' },
  { id: 71, type: 'role', role: '大白鹅',   text: '单聊时犹豫、绕弯子、报带刀好人身份的，大概率是狼。狼喜欢跳警长、正义使者这类角色。' },
  { id: 72, type: 'role', role: '大白鹅',   text: '刺客狼无法狙击你，公屏期间大胆报身份。做好记录，话只能信一半——核对逻辑漏洞。' },
  { id: 73,  type: 'role', role: '肉汁',     text: '立刻找两个可信的人组成三人抱团——三人同行无法被杀，这是你最强的生存保障，不要落单。' },
  { id: 74, type: 'role', role: '肉汁',     text: '场上没有带刀好人了？那更好——专注拉着队友做任务，肉汁活着就是好人的胜利条件。' },
  { id: 75, type: 'role', role: '肉汁',     text: '抱团时确认身边的人是鹅，别被鸭子混进来。三人组一旦有鸭子，保护就失效了。' },
  { id: 76,  type: 'role', role: '专业杀手', text: '好人看不到你的鸡腿，大胆刀单独走的目标——卡好视野，刀完立刻带着另一个队友走，有人问就说不知道他去哪了。' },
  { id: 77,  type: 'role', role: '专业杀手', text: '刀加拿大鹅不会自动报警——如果确认对方是加拿大鹅，放心出手，只需要处理好事后的说辞。' },
  { id: 78,  type: 'role', role: '隐形鸭',   text: '隐身只有6秒，且自己看不到人——提前卡好位置，贴近人群，隐身后立刻刀人，马上跑，不要在原地停留。' },
  { id: 79,  type: 'role', role: '隐形鸭',   text: '隐身期间靠空格是否发亮判断周围是否有人——没亮说明周围没人，刀完立刻离场。' },
  { id: 80,  type: 'role', role: '变形者',   text: '前期观察单走的牌（警长/正义使者/加拿大鹅），贴近抽血后变形当着众人面刀人——事后用他的身份发言抗推，利用信息差。' },
  { id: 81, type: 'role', role: '变形者',   text: '刀完人立刻变形离开现场。即便被人看到，他们看到的是"别人"，第一时间无法锁定你。' },
  { id: 82, type: 'role', role: '变形者',   text: '多人聚集时变身叠刀制造混乱；或趁关灯时变形刀人——黑暗里没人能确认是谁动的手。' },
  { id: 83,  type: 'role', role: '爆炸王',   text: '等人群聚集再扔炸弹——人多的时候出手，事后没人能盘出来炸弹是谁扔的，赖都没法赖。' },
  { id: 84, type: 'role', role: '爆炸王',   text: '不要在只有两三个人的地方扔，范围太小容易被当场锁定。人越多越安全，紧急任务的聚集时机最好。' },
  { id: 85,  type: 'role', role: '刺客',     text: '你的控场比击杀更重要——只要你还活着，好人就不敢乱动。没把握宁可不开，活着就是威慑。' },
  { id: 86, type: 'role', role: '刺客',     text: '看到呆呆鸟要赢了，不要手软，直接做掉。能识破白名装狼是你比好人强的地方，用好它。' },
  { id: 87, type: 'role', role: '刺客',     text: '鹈鹕还活着？提前枪掉，避免最后拼刀阶段被鹈鹕时间拖死。单狼和鹈鹕拼刀基本必输。' },
  { id: 88, type: 'role', role: '刺客',     text: '残局3好人1你：直接面刀一个，秒报警，会议上再开一枪——速战速决，别拖。' },
  { id: 89, type: 'role', role: '刺客',     text: '裁赃技巧：知道某人身份但先不动，等另一个好人主动报身份时，光速枪死前者——演出枪错人的样子，制造混乱。' },
  { id: 90,  type: 'role', role: '间谍',     text: '投票时单独给可疑玩家投一票——下一轮开始就能知道他的真实身份。确保只有你投单，结果才准确。' },
  { id: 91,  type: 'role', role: '间谍',     text: '查到是警长或正义使者？记下来，找机会联手队友先解决他，以绝后患。' },
  { id: 92, type: 'role', role: '间谍',     text: '你的任务全是假的，别做任务，但要跟着别人装做任务——别让人发现你的进度一点没动。' },
  { id: 93, type: 'role', role: '间谍',     text: '有人快要把票集中到队友身上？别直接护，转移话题，把注意力引到别的好人——搅浑水才是正解。' },
  { id: 94,  type: 'role', role: '巫医',     text: '凝视前先用窥视确认周围安全，躲在角落或障碍物后完成5秒注视——无动画无报警，别自己打草惊蛇。' },
  { id: 95, type: 'role', role: '巫医',     text: '击杀后冷却立刻刷新，可以连续作案。会议触发时若没人报警，好人只能靠人数变化察觉——保持镇定发言。' },
  { id: 96, type: 'role', role: '巫医',     text: '优先用窥视确认目标是否被诅咒标记，不要浪费凝视时间在未标记的人身上。' },
  { id: 97,  type: 'role', role: '掠夺者',   text: '队友刚杀完人，立刻去拖尸——你的拖动速度比任何人快，处理完还能缩短自己的击杀冷却。先确认周围没人盯着再行动。' },
  { id: 98, type: 'role', role: '掠夺者',   text: '被人盯上了就别去搬尸，这一票会直接送你出局。安全第一，冷却缩减是锦上添花，不是必须。' },
  { id: 99, type: 'role', role: '掠夺者',   text: '你的任务全是假的，别浪费时间在任务条上。把精力放在配合队友击杀和快速清理鸡腿上。' },
  { id: 100,  type: 'role', role: '狙击手',   text: '目标离开大部队、处于孤立位置时出手——此时没有目击者，事后最难被锁定。' },
  { id: 101, type: 'role', role: '狙击手',   text: '开枪后立刻转移位置，混入人群。报警声响起时众人注意力被吸引，是移动和补刀的好时机。' },
  { id: 102, type: 'role', role: '狙击手',   text: '在地图边缘或角落隐藏，等目标背对你且视野内无人时再扣扳机。' },
  { id: 103,  type: 'role', role: '超能力者', text: '拍完人后立刻走到任务点，拉一个好人说"帮我看着做个任务"——10秒后你定身视角转移，对方以为你在做任务，完美伪装。' },
  { id: 158, type: 'role', role: '超能力者', text: '拍人后18秒内没摇铃那人就会爆开；会议触发会清零CD——拍人的时机要远离摇铃可能，越接近回合末尾越安全。' },
  { id: 159, type: 'role', role: '超能力者', text: '视角转移的8秒内你可以自由发言——观察你拍的目标周围情况，决定是任其爆开还是借机脏在场的人。' },
  { id: 160, type: 'role', role: '超能力者', text: '绝对不要拍加拿大鹅——加拿大鹅爆开1秒后会报警，你若不在人群中，全场会瞬间锁定你。' },
  { id: 161, type: 'role', role: '食鸟鸭',   text: '队友刀完人，立刻靠过去吞食尸体——吃掉就没有证据，好人无法触发会议。先确认周围没人再过去。' },
  { id: 104, type: 'role', role: '食鸟鸭',   text: '自刀后稍微拉开与尸体的距离再回来吞食——吞食有短暂冷却，不能出刀后立刻吃，否则来不及。' },
  { id: 105,  type: 'role', role: '小丑',     text: '先找到好人中的信息位——发言多、提供关键线索的人。对他使用两次氦气技能，会议投票阶段直接击杀。' },
  { id: 106,  type: 'role', role: '小丑',     text: '技能不分敌我，使用前必须确认目标是好人。前期抱团融入聊天，从发言中分辨身份，取得信任再下手。' },
  { id: 107, type: 'role', role: '小丑',     text: '技能可以同时对多人预先叠加，看名字旁边的气球标志判断层数——优先把信息位推进到双气球状态。' },
  { id: 108,  type: 'role', role: '秃鹫',     text: '找队友狼配合，三人组骗孤立的鹅——骗开了杀掉，鸡腿你来吃，吃了就没法报警。' },
  { id: 109, type: 'role', role: '秃鹫',     text: '快吃完了小心被队友狼卖，赶紧拉开距离。如果会议上狼真的出卖你，直接反卖他，同归于尽。' },
  { id: 110, type: 'role', role: '秃鹫',     text: '吃鸡腿是核心操作，吃完鸡腿屁股一抹跑路，绝对不要留在原地等人来。' },
  { id: 111,  type: 'role', role: '鸽子',     text: '开局融入鹅的抱团，假装分析局势拖时间——让大家觉得你是好人，趁机靠近目标完成感染。' },
  { id: 112, type: 'role', role: '鸽子',     text: '感染快满了，用"这几个人有问题"为借口拉着抱团一起去"找"他们——趁机完成最后的感染。' },
  { id: 113, type: 'role', role: '鸽子',     text: '绝对不能让好人拉铃！感染数量一旦重置就前功尽弃。有人要拉铃，想办法转移话题或者先解决他。' },
  { id: 114,  type: 'role', role: '猎鹰',     text: '使用击倒时尽量隐蔽，不要暴露猎鹰身份——活到全局剩3人才是关键，到时候猎鹰时刻自动触发，你直接赢。' },
  { id: 115, type: 'role', role: '猎鹰',     text: '活着就是胜利条件，别冒险。击倒只是工具，保命比出手更重要——等到最后3人再收网。' },
  { id: 116,  type: 'role', role: '锦鸡',     text: '开局低调发包，别急着用技能暴露身份——先攒进度，中期平衡阵营，苟到发满总人数就直接赢。' },
  { id: 117, type: 'role', role: '锦鸡',     text: '贴福字隐身保命，年夜饭清威胁，春联关键轮次控票——技能随机触发，但要留着在最关键时机用。' },
  { id: 118, type: 'role', role: '锦鸡',     text: '快发满了要藏好进度，别让人意识到你要赢了。出生和每次会议结束后自动得1个包，在外面贴人才能积累。' },
  { id: 119,  type: 'role', role: '呆呆鸟',   text: '找一个好人猛泼脏水，同时悄悄保你铁定知道的那只狼——让大家以为你是狼在保队友，但别用力过猛让狼也怀疑你。' },
  { id: 120, type: 'role', role: '呆呆鸟',   text: '装鸽子：一直贴着某个人走，然后顺水推舟被票出去。真鸽子不敢跳出来保你，两全其美。' },
  { id: 121, type: 'role', role: '呆呆鸟',   text: '找到鸡腿后不要立刻报警，站在不远处等人来，然后一句话不说就跑。到你发言了，适度表演一波软弱辩解——然后闭麦。' },
  { id: 122, type: 'role', role: '鹈鹕',     text: '前期跟着好人正常走，第一回合过后找到落单的目标直接开吃——技能范围比狼大，对拼不慌。' },
  { id: 123, type: 'role', role: '鹈鹕',     text: '有大部队抱团就融进去，小团体时可以游离状态找人吃。发言时模糊带过："最后我和XX和XX一起"。' },
  { id: 124, type: 'role', role: '鹈鹕',     text: '不要长时间单走——两个回合都没人见过你，直接被怀疑。小心被"剖腹产"，别让狼盯上你。' },
  { id: 125,  type: 'role', role: '布谷鸟',   text: '选冷门位置下蛋：地下室、隧道、地图边缘、障碍物后、管道口附近——高频活动区（食堂、会议）绝对不选。' },
  { id: 126, type: 'role', role: '布谷鸟',   text: '蛋与蛋间隔至少5个身位，避免被批量踩碎。会议结束后CD重置，立刻找偏僻角落补蛋，别在人群里出手。' },
  { id: 127, type: 'role', role: '布谷鸟',   text: '蛋数量达标后，躲进最隐蔽的角落（雕像后、坑位）静等60秒——小布谷鸟自动攻击，存活即胜利。' },
  { id: 162, type: 'role', role: '渡鸦',     text: '前期低调观察，记住谁在带节奏、谁在滑水——你的胜利条件独立于双方阵营，信息就是你最大的筹码。' },
  { id: 163, type: 'role', role: '渡鸦',     text: '两边都不要站死，谁强帮谁的对手——保持局势平衡才能拖到你的胜利条件达成。' },
  { id: 164, type: 'role', role: '渡鸦',     text: '被怀疑时不要急着自证，模糊回答反而更安全——中立身份一旦暴露，鹅鸭都会想先处理你。' },

  // ── 混沌戏剧性锦囊（30条）──
  { id: 128, type: 'chaos', text: '在会议开始的第一秒，抢先说："先别说话，我数三秒，大家同时报出最怀疑的人。三——二——一——"不给任何人反应时间。' },
  { id: 129, type: 'chaos', text: '全程一言不发，只在投票前说一句："我已经决定了。"然后投票，不解释。' },
  { id: 130, type: 'chaos', text: '突然对某个人说："你刚才笑了一下，为什么？"不管他有没有笑。' },
  { id: 131, type: 'chaos', text: '很认真地说："我不怀疑任何人，我只怀疑这局游戏本身。"然后继续认真参与讨论。' },
  { id: 132, type: 'chaos', text: '在别人激烈争论时，突然说："等一下，我想问一个和这个完全无关的问题。"然后真的问了一个毫不相关的问题。' },
  { id: 133, type: 'chaos', text: '对全场说："你们有没有发现，每次我要开口，就有人打断我？"——不管有没有发生过这件事。' },
  { id: 134, type: 'chaos', text: '在有人被怀疑时，站出来说"我相信他"，然后补一句："但这只是直觉，我也说不清为什么。"' },
  { id: 135, type: 'chaos', text: '宣布："这局我决定只说真话。"——然后说的每一句话都让人完全无法判断真假。' },
  { id: 136, type: 'chaos', text: '在投票前一秒改口："等等，我反悔了。"然后投出去，不说反悔的原因。' },
  { id: 137, type: 'chaos', text: '对正在自证清白的人说："你越解释，我越觉得有问题。你要不要试试不解释？"' },
  { id: 138, type: 'chaos', text: '非常平静地说："我知道我今天会被投出去。"然后若无其事地继续参与讨论，仿佛说的是别人的事。' },
  { id: 139, type: 'chaos', text: '在别人刚说完一段完整的推理之后，只回一个字："嗯。"然后沉默。' },
  { id: 140, type: 'chaos', text: '突然说："我觉得这局大家都玩得太认真了。"——在最剑拔弩张的时刻说。' },
  { id: 141, type: 'chaos', text: '对发言最多的人说："你说了这么多，但你有没有想过，也许什么都不说才是最正确的选择？"' },
  { id: 142, type: 'chaos', text: '在没有任何人怀疑你的时候，主动说："我知道你们都在怀疑我，只是没说出来。"' },
  { id: 143, type: 'chaos', text: '很认真地提议："我们来投一个最不可能是鸭子的人，就当积累样本。"' },
  { id: 144, type: 'chaos', text: '等所有人都说完，最后开口："你们说的我都听了。结论是，我们方向全错了。"然后不再补充任何内容。' },
  { id: 145, type: 'chaos', text: '在有人说"我可以证明我是鹅"之后，平静地说："鸭子也会这么说。"' },
  { id: 146, type: 'chaos', text: '突然问全场："有没有人这局玩得很开心？"——让所有人突然不知道该怎么回答。' },
  { id: 147, type: 'chaos', text: '在投票结束、结果出来之前，抢先说："不管结果是什么，我的判断没有错。"' },
  { id: 148, type: 'chaos', text: '在被人连续追问路线时，淡定回答："不知道，但是我的身材很曼妙。"' },
  { id: 149, type: 'chaos', text: '有人说"我能证明我是鹅"，你接："我也能证明，我的证明是——我说我是鹅。"' },
  { id: 150, type: 'chaos', text: '全程沉默，只在最后投票前发一条："命运的齿轮开始转动。"' },
  { id: 151, type: 'chaos', text: '被怀疑时回一句："我不解释，解释就是掩饰，掩饰就是鸭子，但我不解释。"' },
  { id: 152, type: 'chaos', text: '在最混乱的时候突然说："好了好了，都别吵了，今天谁也别想全身而退。"' },
  { id: 153, type: 'chaos', text: '对着怀疑你的人说："你看我的眼神让我感到被凝视，但我已经习惯了被关注。"' },
  { id: 154, type: 'chaos', text: '有人刚说完一段超长推理，你回："哇，好厉害，但我还是投你。"' },
  { id: 155, type: 'chaos', text: '会议快结束时宣布："我刚才开小差了，但我的直觉告诉我答案，直觉从不说谎。"' },
  { id: 156, type: 'chaos', text: '被人问"你到底是鹅还是鸭"时，深沉地回答："我是谜。"' },
  { id: 157, type: 'chaos', text: '在即将被票出的时候说："好的，我走，但我走之后你们会后悔的，我只说一次。"' },

];
