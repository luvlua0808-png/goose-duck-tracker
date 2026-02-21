// ============================================================
// export.js — 导出本局复盘 .txt + 结束本局流程
// ============================================================

const Export = (() => {

  function buildText() {
    const { config, players, rounds, round } = State.get();
    const mapDef = MAPS[config.map];
    const lines = [];

    // ── 标题 ──
    lines.push('== 鹅鸭杀 本局复盘 ==');
    lines.push(`地图：${mapDef.name} | 人数：${config.playerCount}人 | ${config.factions.goose}鹅${config.factions.duck}鸭${config.factions.neutral}中立`);
    lines.push(`明牌角色：${config.openRoles.length > 0 ? config.openRoles.join('、') : '无'}`);
    lines.push('');

    // ── 玩家信息 ──
    lines.push('-- 玩家信息 --');
    const TRUST_LABELS = {
      unknown: '未知', suspicious: '可疑', trusted: '信任', confirmed_duck: '确认是鸭',
    };
    const FACTION_LABELS = { goose: '鹅', duck: '鸭', neutral: '中立' };

    for (let i = 1; i <= config.playerCount; i++) {
      const p = players[i];
      if (!p) continue;
      const factionStr = p.faction ? FACTION_LABELS[p.faction] : '未知';
      const roleStr    = p.role ? `${p.role}（${factionStr}）` : `阵营：${factionStr}`;
      lines.push(`${i}号 | ${p.alive ? '存活' : '死亡'} | 可信度：${TRUST_LABELS[p.trust] || '未知'} | 角色：${roleStr}`);

      // 目击记录
      const sightings = State.getPlayerSightings(i);
      if (sightings.length > 0) {
        const sightStr = sightings.map(s => `第${s.round}轮/${s.room}`).join('、');
        lines.push(`  目击记录：${sightStr}`);
      }

      // 备注（按轮次合并）
      const noteEntries = Object.entries(p.notes || {})
        .sort(([a], [b]) => Number(a) - Number(b))
        .filter(([, t]) => t && t.trim());
      if (noteEntries.length > 0) {
        noteEntries.forEach(([r, t]) => {
          lines.push(`  备注[第${r}轮]：${t.trim()}`);
        });
      }
    }
    lines.push('');

    // ── 路径记录 ──
    lines.push('-- 路径记录 --');
    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
    if (roundKeys.length === 0) {
      lines.push('（无记录）');
    } else {
      roundKeys.forEach(r => {
        const data = rounds[r];
        const pathLabels = data.path.map(id => {
          const node = mapDef.nodes.find(n => n.id === id);
          return node ? node.label : id;
        });
        const sightParts = Object.entries(data.sightings || {})
          .filter(([, nums]) => nums.length > 0)
          .map(([roomId, nums]) => {
            const node = mapDef.nodes.find(n => n.id === roomId);
            return `${node ? node.label : roomId}遇${nums.map(n => n + '号').join('/')}`;
          });
        let line = `第${r}轮：${pathLabels.join(' → ')}`;
        if (sightParts.length > 0) line += `（${sightParts.join('；')}）`;
        lines.push(line);
      });
    }
    lines.push('');

    // ── 阵营统计 ──
    lines.push('-- 阵营统计 --');
    const stats = State.getFactionStats();
    const FACTION_ICONS = { goose: '鹅', duck: '鸭', neutral: '中立' };
    ['goose', 'duck', 'neutral'].forEach(f => {
      const s = stats[f];
      const openStr   = s.open.length   > 0 ? s.open.map(r => r.name).join('、')   : '无';
      const jumpedStr = s.jumped.length > 0 ? s.jumped.map(r => r.name).join('、') : '无';
      lines.push(`${FACTION_ICONS[f]}：${s.total}人 | 明牌：${openStr} | 跳出：${jumpedStr} | 未知：${s.unknown}个`);
    });

    return lines.join('\n');
  }

  function downloadTxt(text) {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `鹅鸭杀复盘_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function triggerEndGame() {
    const text = buildText();
    downloadTxt(text);
    // 显示结束弹窗
    document.getElementById('modal-end-game').classList.remove('hidden');
  }

  function init() {
    document.getElementById('btn-end-game').addEventListener('click', triggerEndGame);

    document.getElementById('end-keep-data').addEventListener('click', () => {
      document.getElementById('modal-end-game').classList.add('hidden');
    });

    document.getElementById('end-clear-data').addEventListener('click', () => {
      document.getElementById('modal-end-game').classList.add('hidden');
      State.reset();
      App.switchPhase('init');
      Phase1.render();
    });
  }

  return { init, buildText };
})();
