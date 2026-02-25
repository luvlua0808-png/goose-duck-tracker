// ============================================================
// phase2.js — 游戏阶段：地图渲染 + 路径记录 + 目击输入
// ============================================================

const Phase2 = (() => {

  let _popoverTargetRoom = null;
  let _voiceRecognition = null;
  let _voiceListening = false;
  let _voiceSilenceTimer = null;
  let _voiceBufferText = '';

  function init() {
    document.getElementById('btn-clear-path').addEventListener('click', () => {
      State.clearPath();
      render();
    });

    _bindVoiceSighting();

    document.getElementById('btn-enter-meeting').addEventListener('click', () => {
      if (window.AI && typeof window.AI.clearResult === 'function') {
        window.AI.clearResult();
      } else if (typeof AI !== 'undefined' && AI && typeof AI.clearResult === 'function') {
        AI.clearResult();
      }
      State.commitRound();
      App.switchPhase('meeting');
    });

    // 浮层关闭
    document.getElementById('popover-close').addEventListener('click', _closePopover);
    document.getElementById('popover-save').addEventListener('click', _savePopover);
    document.getElementById('popover-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') _savePopover();
      if (e.key === 'Escape') _closePopover();
    });

    // 点击空白关闭浮层
    document.addEventListener('click', e => {
      const popover = document.getElementById('sighting-popover');
      if (!popover.classList.contains('hidden') &&
          !popover.contains(e.target) &&
          !e.target.classList.contains('map-node')) {
        _closePopover();
      }
    });
  }

  function _bindVoiceSighting() {
    const btn = document.getElementById('btn-voice-sighting');
    if (!btn) return;

    function getSR() {
      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
    }

    function parseNums(text) {
      const nums = [];
      const t = (text || '').replace(/\s+/g, '');

      // 阿拉伯数字
      (t.match(/\d+/g) || []).forEach(s => {
        const n = parseInt(s, 10);
        if (!isNaN(n)) nums.push(n);
      });

      // 常见中文数字（1-16）
      const cnMap = {
        '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
        '十': 10, '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15, '十六': 16,
      };
      Object.entries(cnMap).forEach(([k, v]) => {
        const re = new RegExp(k + '号?', 'g');
        if (re.test(t)) nums.push(v);
      });

      return [...new Set(nums)].filter(n => n > 0);
    }

    function pickRoomId(text, mapDef) {
      const t = (text || '').replace(/\s+/g, '');
      let best = null;
      let bestLen = 0;
      mapDef.nodes.forEach(node => {
        if (!node || !node.label) return;
        // 先匹配 label
        if (t.includes(node.label) && node.label.length > bestLen) {
          best = node;
          bestLen = node.label.length;
        }
        // 再匹配 aliases
        if (node.aliases) {
          node.aliases.forEach(alias => {
            if (t.includes(alias) && alias.length > bestLen) {
              best = node;
              bestLen = alias.length;
            }
          });
        }
      });
      return best ? best.id : null;
    }

    function applySighting(roomId, nums) {
      if (!roomId) {
        alert('未识别到地点，请按“号码 + 地点”说法，例如：3号 食堂');
        return;
      }
      if (!nums || nums.length === 0) {
        alert('未识别到玩家编号，请按“号码 + 地点”说法，例如：3号 食堂');
        return;
      }

      // 加入路径
      State.addToPath(roomId);

      // 合并目击
      const existing = State.get().currentSightings[roomId] || [];
      const merged = [...new Set([...(existing || []), ...nums])].sort((a, b) => a - b);
      State.setSighting(roomId, merged);
      render();
    }

    // ── 核心：启动/停止识别 ───────────────────────────────────

    function startListening() {
      const SR = getSR();
      if (!SR) {
        alert('当前浏览器不支持语音识别（建议使用 Chrome/Edge，并用 http://localhost 打开本地页面）');
        return;
      }
      if (_voiceListening) return;

      const { config } = State.get();
      const mapDef = MAPS[config.map];

      _voiceRecognition = new SR();
      _voiceRecognition.lang = 'zh-CN';
      _voiceRecognition.continuous = true;
      _voiceRecognition.interimResults = false;

      _voiceBufferText = '';
      if (_voiceSilenceTimer) { clearTimeout(_voiceSilenceTimer); _voiceSilenceTimer = null; }

      _voiceListening = true;
      btn.classList.add('listening');
      btn.textContent = '🛑 正在听…';

      _voiceRecognition.onresult = ev => {
        let chunk = '';
        try {
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const t = ev.results[i] && ev.results[i][0] ? ev.results[i][0].transcript : '';
            if (t) chunk += t;
          }
        } catch (_) {}
        if (chunk) _voiceBufferText += chunk;
        console.log('[voice-map] result raw:', _voiceBufferText);
      };

      _voiceRecognition.onerror = err => {
        const msg = err && err.error ? err.error : 'unknown';
        if (msg !== 'aborted') {
          alert('语音识别失败：' + msg + '（请确认已允许麦克风权限，并使用 http://localhost 打开）');
        }
      };

      _voiceRecognition.onend = () => {
        if (_voiceSilenceTimer) { clearTimeout(_voiceSilenceTimer); _voiceSilenceTimer = null; }
        _voiceListening = false;
        btn.classList.remove('listening');
        btn.textContent = '🎙 语音(空格)';

        console.log('[voice-map] end, buffer:', _voiceBufferText);
        if (!_voiceBufferText) {
          alert('语音未识别到任何内容，请重试');
          return;
        }

        const nums   = parseNums(_voiceBufferText);
        const roomId = pickRoomId(_voiceBufferText, mapDef);

        if (!roomId) {
          alert('未识别到地点\n原始识别：「' + _voiceBufferText + '」\n请截图反馈以便补充别名');
          _voiceBufferText = '';
          return;
        }
        if (!nums || nums.length === 0) {
          alert('未识别到玩家编号\n原始识别：「' + _voiceBufferText + '」\n请按"号码 + 地点"说，例如：3号 食堂');
          _voiceBufferText = '';
          return;
        }

        applySighting(roomId, nums);
        _voiceBufferText = '';
      };

      try {
        _voiceRecognition.start();
      } catch (_) {
        _voiceListening = false;
        btn.classList.remove('listening');
        btn.textContent = '🎙 语音(空格)';
      }
    }

    function stopListening() {
      if (_voiceListening && _voiceRecognition) {
        _voiceRecognition.stop();
      }
    }

    // ── 按钮点击：切换开始/停止 ──────────────────────────────

    btn.textContent = '🎙 语音(空格)';
    btn.addEventListener('mousedown', e => e.preventDefault());
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (_voiceListening) { stopListening(); } else { startListening(); }
    });

    // ── 空格键：按住开始，松开停止 ───────────────────────────
    // 只在游戏阶段（phase-game 可见）且焦点不在输入框时响应

    document.addEventListener('keydown', e => {
      if (e.code !== 'Space') return;
      const gameSection = document.getElementById('phase-game');
      if (!gameSection || !gameSection.classList.contains('active')) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.repeat) return;
      e.preventDefault();
      startListening();
    });

    document.addEventListener('keyup', e => {
      if (e.code !== 'Space') return;
      stopListening();
    });
  }

  function render() {
    const { config } = State.get();
    const mapDef = MAPS[config.map];
    document.getElementById('map-title').textContent = mapDef.name;
    _renderMap(mapDef);
    _renderSightingList();
    _renderHistoryList();
    _renderPathSummary();
  }

  // ── 地图渲染 ──────────────────────────────────────────────

  function _renderMap(mapDef) {
    const wrapper   = document.querySelector('.map-wrapper');
    const svgEl     = document.getElementById('map-svg');
    const nodesEl   = document.getElementById('map-nodes');
    const { currentPath, currentSightings } = State.get();

    // 设置容器尺寸
    const W = mapDef.width + 40;
    const H = mapDef.height + 40;
    wrapper.style.minWidth  = W + 'px';
    wrapper.style.minHeight = H + 'px';
    svgEl.setAttribute('width',  W);
    svgEl.setAttribute('height', H);
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const OFFSET = 20; // 边距偏移

    // 清空
    svgEl.innerHTML = '';
    nodesEl.innerHTML = '';

    // 画边
    mapDef.edges.forEach(([a, b]) => {
      const na = mapDef.nodes.find(n => n.id === a);
      const nb = mapDef.nodes.find(n => n.id === b);
      if (!na || !nb) return;

      // 判断这条边是否在当前路径中
      const idxA = currentPath.indexOf(a);
      const idxB = currentPath.indexOf(b);
      const isPathEdge = idxA >= 0 && idxB >= 0 && Math.abs(idxA - idxB) === 1;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', na.x + OFFSET);
      line.setAttribute('y1', na.y + OFFSET);
      line.setAttribute('x2', nb.x + OFFSET);
      line.setAttribute('y2', nb.y + OFFSET);
      line.setAttribute('class', isPathEdge ? 'map-edge-path' : 'map-edge');
      svgEl.appendChild(line);
    });

    // 画节点
    mapDef.nodes.forEach(node => {
      const isSelected   = currentPath.includes(node.id);
      const hasSighting  = !!currentSightings[node.id];
      const orderIdx     = currentPath.indexOf(node.id);

      const el = document.createElement('div');
      el.className = 'map-node' +
        (isSelected  ? ' selected'     : '') +
        (hasSighting ? ' has-sighting' : '');
      el.style.left = (node.x + OFFSET) + 'px';
      el.style.top  = (node.y + OFFSET) + 'px';
      el.textContent = node.label;
      el.dataset.id  = node.id;

      // 顺序徽章
      if (isSelected && orderIdx >= 0) {
        const badge = document.createElement('div');
        badge.className = 'node-order-badge';
        badge.textContent = orderIdx + 1;
        el.appendChild(badge);
      }

      el.addEventListener('click', e => {
        e.stopPropagation();
        _onNodeClick(node, el);
      });

      nodesEl.appendChild(el);
    });
  }

  function _onNodeClick(node, el) {
    const { currentPath } = State.get();

    if (currentPath.includes(node.id)) {
      // 已选中：打开目击输入浮层
      _openPopover(node, el);
    } else {
      // 未选中：加入路径
      State.addToPath(node.id);
      render();
      // 加入后立即打开浮层
      const newEl = document.querySelector(`.map-node[data-id="${node.id}"]`);
      if (newEl) _openPopover(node, newEl);
    }
  }

  // ── 目击浮层 ──────────────────────────────────────────────

  function _openPopover(node, anchorEl) {
    _popoverTargetRoom = node.id;
    const popover = document.getElementById('sighting-popover');
    document.getElementById('popover-room-name').textContent = node.label;

    // 填入已有值
    const existing = State.get().currentSightings[node.id] || [];
    document.getElementById('popover-input').value = existing.join(', ');

    // 定位
    const rect = anchorEl.getBoundingClientRect();
    popover.style.left = Math.min(rect.right + 8, window.innerWidth - 260) + 'px';
    popover.style.top  = Math.max(rect.top - 10, 10) + 'px';

    popover.classList.remove('hidden');
    document.getElementById('popover-input').focus();
  }

  function _closePopover() {
    document.getElementById('sighting-popover').classList.add('hidden');
    _popoverTargetRoom = null;
  }

  function _savePopover() {
    if (!_popoverTargetRoom) return;
    const raw = document.getElementById('popover-input').value;
    const nums = raw.split(/[,，\s]+/)
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n) && n > 0);
    State.setSighting(_popoverTargetRoom, nums);
    _closePopover();
    render();
  }

  // ── 右侧面板 ──────────────────────────────────────────────

  function _renderSightingList() {
    const { currentPath, currentSightings, config } = State.get();
    const mapDef = MAPS[config.map];
    const container = document.getElementById('sighting-list');

    if (currentPath.length === 0) {
      container.innerHTML = '<p class="hint-text">点击地图节点后，可在此输入遇到的玩家编号</p>';
      return;
    }

    container.innerHTML = '';
    currentPath.forEach(roomId => {
      const node = mapDef.nodes.find(n => n.id === roomId);
      const nums = currentSightings[roomId] || [];
      const item = document.createElement('div');
      item.className = 'sighting-item';
      item.innerHTML = `
        <div class="sighting-room">${node ? node.label : roomId}</div>
        <div class="sighting-nums">${nums.length > 0 ? '遇到：' + nums.map(n => n + '号').join('、') : '（无目击）'}</div>
      `;
      item.addEventListener('click', () => {
        const el = document.querySelector(`.map-node[data-id="${roomId}"]`);
        if (el) _openPopover(node, el);
      });
      container.appendChild(item);
    });
  }

  function _renderHistoryList() {
    const { rounds, config } = State.get();
    const mapDef = MAPS[config.map];
    const container = document.getElementById('history-list');
    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));

    if (roundKeys.length === 0) {
      container.innerHTML = '<p class="hint-text">暂无历史记录</p>';
      return;
    }

    container.innerHTML = '';
    roundKeys.forEach(r => {
      const data = rounds[r];
      const pathLabels = data.path.map(id => {
        const node = mapDef.nodes.find(n => n.id === id);
        return node ? node.label : id;
      });
      // 收集目击摘要
      const sightSummary = Object.entries(data.sightings || {})
        .filter(([, nums]) => nums.length > 0)
        .map(([roomId, nums]) => {
          const node = mapDef.nodes.find(n => n.id === roomId);
          return `${node ? node.label : roomId}遇${nums.map(n => n + '号').join('/')}`;
        }).join('；');

      const item = document.createElement('div');
      item.className = 'history-item';
      item.innerHTML = `<strong>第${r}轮：</strong>${pathLabels.join(' → ')}${sightSummary ? '<br><span style="color:var(--trust-suspicious);font-size:0.75rem">👁 ' + sightSummary + '</span>' : ''}`;
      container.appendChild(item);
    });
  }

  function _renderPathSummary() {
    const { currentPath, currentSightings, config } = State.get();
    const mapDef = MAPS[config.map];
    const el = document.getElementById('path-summary');

    if (currentPath.length === 0) {
      el.textContent = '（尚未选择房间）';
      return;
    }

    const parts = currentPath.map(id => {
      const node = mapDef.nodes.find(n => n.id === id);
      const label = node ? node.label : id;
      const nums  = currentSightings[id] || [];
      return nums.length > 0 ? `${label}（遇到：${nums.map(n => n + '号').join('、')}）` : label;
    });
    el.textContent = parts.join(' → ');
  }

  return { init, render };
})();
