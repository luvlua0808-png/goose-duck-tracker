// ============================================================
// app.js — 主控制器：阶段切换、轮次管理、全局初始化
// ============================================================

const App = (() => {

  const PHASE_SECTIONS = {
    init:    document.getElementById('phase-init'),
    game:    document.getElementById('phase-game'),
    meeting: document.getElementById('phase-meeting'),
  };

  const NAV_BTNS = {
    init:    document.getElementById('nav-init'),
    game:    document.getElementById('nav-game'),
    meeting: document.getElementById('nav-meeting'),
  };

  function switchPhase(phase) {
    // 更新 section 显示
    Object.entries(PHASE_SECTIONS).forEach(([key, el]) => {
      el.classList.toggle('active', key === phase);
    });

    // 更新导航按钮
    Object.entries(NAV_BTNS).forEach(([key, btn]) => {
      btn.classList.toggle('active', key === phase);
    });

    // 更新顶部操作按钮可见性
    const isGame    = phase === 'game';
    const isMeeting = phase === 'meeting';
    const isInit    = phase === 'init';

    document.getElementById('btn-reset-round').style.display = isGame ? '' : 'none';
    document.getElementById('btn-end-game').style.display    = (isGame || isMeeting) ? '' : 'none';
    document.getElementById('round-badge').classList.toggle('hidden', isInit);

    // 更新轮次显示
    _updateRoundBadge();

    // 解锁导航按钮（游戏开始后，切到init页也保持解锁）
    const { phase: statePhase } = State.get();
    const gameEverStarted = statePhase !== 'init';
    if (gameEverStarted || phase !== 'init') {
      NAV_BTNS.game.disabled    = false;
      NAV_BTNS.meeting.disabled = false;
    }

    // 渲染对应阶段
    if (phase === 'init')    Phase1.render();
    if (phase === 'game')    Phase2.render();
    if (phase === 'meeting') Phase3.render();

    // 只有切到游戏/会议页时才更新 state phase（init页不覆盖，保留游戏进行中的状态）
    if (phase !== 'init') State.setPhase(phase);
  }

  function _updateRoundBadge() {
    const { round } = State.get();
    document.getElementById('round-num').textContent = round;
  }

  function _bindNavBtns() {
    Object.entries(NAV_BTNS).forEach(([phase, btn]) => {
      btn.addEventListener('click', () => {
        const { phase: statePhase } = State.get();
        // 游戏从未开始时（state phase 仍是 init），不允许跳到游戏/会议页
        if (statePhase === 'init' && phase !== 'init') return;
        switchPhase(phase);
      });
    });
  }

  function _bindResetRound() {
    document.getElementById('btn-reset-round').addEventListener('click', () => {
      _showConfirm(
        '重置本轮',
        '确定要清空当前轮次的路径和目击记录吗？',
        () => {
          State.clearPath();
          Phase2.render();
        }
      );
    });
  }

  function _showConfirm(title, message, onConfirm) {
    document.getElementById('modal-title').textContent   = title;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-confirm').classList.remove('hidden');

    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn  = document.getElementById('modal-cancel');

    const cleanup = () => {
      document.getElementById('modal-confirm').classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };

    const handleConfirm = () => { cleanup(); onConfirm(); };
    const handleCancel  = () => { cleanup(); };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click',  handleCancel);
  }

  function init() {
    // 加载持久化状态
    State.loadState();

    // 初始化各模块
    Phase1.init();
    Phase2.init();
    Phase3.init();
    Export.init();
    AI.init();

    // 绑定全局控件
    _bindNavBtns();
    _bindResetRound();

    // 恢复上次阶段
    const savedPhase = State.get().phase;
    const startPhase = savedPhase || 'init';

    // 如果已开始游戏，解锁导航
    if (startPhase !== 'init') {
      NAV_BTNS.game.disabled    = false;
      NAV_BTNS.meeting.disabled = false;
    }

    switchPhase(startPhase);
  }

  // 页面加载完成后启动
  document.addEventListener('DOMContentLoaded', init);

  return { switchPhase, init };
})();
