// ============================================================
// jinang.js — 锦囊妙计功能
// ============================================================

const Jinang = (() => {

  const MAX_USES = 3;

  // 抽取一条锦囊
  // 规则：role 类型只抽当前角色专属 or 通用/混沌，不展示其他角色专属
  function _draw() {
    const state   = State.get();
    const myRole  = state.myRole;
    const history = State.getJinangHistory();
    const usedIds = new Set(history);
    const usedCount = State.getJinangUsed();

    // 过滤：排除已使用 + 排除不属于自己的角色专属
    const eligible = JINANG_DB.filter(j => {
      if (usedIds.has(j.id)) return false;
      if (j.type === 'role' && j.role !== myRole) return false;
      return true;
    });

    // 若全部用完则降级：只保留非其他角色专属
    const pool = eligible.length > 0
      ? eligible
      : JINANG_DB.filter(j => j.type !== 'role' || j.role === myRole);

    const preferredType = ['role', 'general', 'chaos'][usedCount] || 'chaos';
    const preferredPool = pool.filter(j => {
      if (preferredType === 'role') return j.type === 'role' && j.role === myRole;
      return j.type === preferredType;
    });

    // 最终兜底
    const source = preferredPool.length > 0 ? preferredPool : pool.length > 0 ? pool : JINANG_DB;
    return source[Math.floor(Math.random() * source.length)];
  }

  // 获取主标题文字（阵营・角色 or 通用类型）
  function _getTitle(card) {
    const typeLabel = { general: '通用・策略', chaos: '混沌・诡计' };
    if (card.type === 'role' && card.role) {
      const roleData = typeof ROLES !== 'undefined'
        ? ROLES.find(r => r.name === card.role) : null;
      const factionMap = { goose: '鹅阵营', duck: '鸭阵营', neutral: '中立' };
      const faction = roleData ? (factionMap[roleData.faction] || '') : '';
      return faction ? faction + '・' + card.role : card.role + '・专属';
    }
    return typeLabel[card.type] || '锦囊妙计';
  }

  // 更新触发按钮状态
  function _updateBtn() {
    const btn = document.getElementById('btn-jinang');
    if (!btn) return;
    const left = MAX_USES - State.getJinangUsed();
    const badge = btn.querySelector('.jinang-badge');
    if (badge) badge.textContent = left;
    btn.disabled = left <= 0;
    btn.title = left <= 0 ? '本局锦囊已用完' : `剩余 ${left} 次`;
  }

  // 打开蒙层并显示锦囊内容
  function _open() {
    if (State.getJinangUsed() >= MAX_USES) return;

    const card = _draw();
    State.useJinang();
    State.addJinangHistory(card.id);
    _updateBtn();

    // 填充内容
    const mainTitle  = document.getElementById('jrc-main-title');
    const textEl     = document.getElementById('jinang-text');
    const roleBadge  = document.getElementById('jrc-role-badge');
    const roleNameEl = document.getElementById('jrc-role-name');
    const vSide      = document.getElementById('jrc-v-side');

    if (mainTitle) mainTitle.textContent = _getTitle(card);
    if (vSide)     vSide.textContent = String(card.id).padStart(3, '0');

    if (card.type === 'role' && card.role) {
      if (roleNameEl) roleNameEl.textContent = card.role;
      if (roleBadge)  roleBadge.style.display = 'flex';
    } else {
      if (roleBadge) roleBadge.style.display = 'none';
    }

    textEl.textContent = card.text;
    textEl.style.opacity = '0';

    // 显示蒙层
    const overlay = document.getElementById('jinang-overlay');
    overlay.classList.remove('hidden');
    overlay.style.opacity = '0';
    requestAnimationFrame(() => {
      overlay.style.transition = 'opacity 0.25s ease';
      overlay.style.opacity = '1';
      setTimeout(() => {
        textEl.style.transition = 'opacity 0.4s ease';
        textEl.style.opacity = '1';
      }, 150);
    });
  }

  // 关闭蒙层
  function _close() {
    const overlay = document.getElementById('jinang-overlay');
    overlay.style.transition = 'opacity 0.2s ease';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.style.opacity = '';
      overlay.style.transition = '';
    }, 200);
  }

  function init() {
    const btn = document.getElementById('btn-jinang');
    if (!btn) return;
    btn.addEventListener('click', _open);
    document.getElementById('jinang-confirm-btn').addEventListener('click', _close);
    // 点蒙层背景也可关闭
    document.getElementById('jinang-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('jinang-overlay')) _close();
    });
    _updateBtn();
  }

  function syncBtn() { _updateBtn(); }

  return { init, syncBtn };
})();
