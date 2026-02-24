// ============================================================
// ai.js — AI 推理助手：硅基流动 DeepSeek-V3 接入
// ============================================================

const AI = (() => {

  const AI_KEY_STORAGE = 'goose_duck_ai_key';
  const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
  const MODEL   = 'deepseek-ai/DeepSeek-V3';

  const SYSTEM_PROMPT = `你是鹅鸭杀（Goose Goose Duck）游戏的推理助手。
你会收到结构化的游戏数据，包括玩家目击记录、备注、角色认领情况和路径记录。
你的任务是帮助玩家快速梳理信息，找到矛盾点，识别可疑或可信的玩家。

输出要求：
- 总字数不超过200字
- 分以下几个部分输出（每部分1-2句话）：
  【矛盾点】目击记录或角色认领中的逻辑冲突
  【重点关注】最可疑的1-2名玩家及理由
  【相对可信】目击信息一致、没有明显矛盾的玩家
  【阵营推算】基于明牌和跳出情况对各阵营的推测
  【建议】一句话行动建议

注意：
- 只基于已知信息推理，不要捏造数据
- 对于推测性内容使用"可能""疑似"等措辞
- 不替玩家做最终决策，提供参考即可`;

  // ── 工具函数 ──────────────────────────────────────────────

  function getApiKey() {
    return localStorage.getItem(AI_KEY_STORAGE) || '';
  }

  function saveApiKey(key) {
    localStorage.setItem(AI_KEY_STORAGE, key.trim());
  }

  // ── 构建用户 Prompt ───────────────────────────────────────

  function buildUserPrompt() {
    const { config, players, rounds, round } = State.get();
    const mapDef = MAPS[config.map];

    const lines = [];

    // 基础配置
    lines.push(`【基础信息】`);
    lines.push(`地图：${mapDef.name}，总人数：${config.playerCount}，当前第 ${round} 轮`);
    lines.push(`阵营配置：鹅 ${config.factions.goose} 人，鸭 ${config.factions.duck} 人，中立 ${config.factions.neutral} 人`);

    // 阵营统计
    const stats = State.getFactionStats();
    lines.push(`\n【阵营统计】`);
    ['goose', 'duck', 'neutral'].forEach(f => {
      const s = stats[f];
      const fLabel = { goose: '鹅', duck: '鸭', neutral: '中立' }[f];
      const openStr  = s.open.length   ? s.open.map(r => r.name).join('、')   : '无';
      const jumpStr  = s.jumped.length ? s.jumped.map(r => r.name).join('、') : '无';
      lines.push(`${fLabel}阵营（共${s.total}人）：明牌=[${openStr}]，跳出=[${jumpStr}]，未知槽位=${s.unknown}`);
      if (s.exceeded) lines.push(`  ⚠️ ${fLabel}阵营跳出总数超过上限，存在虚假认领风险`);
    });

    // 玩家卡片数据
    lines.push(`\n【玩家信息】`);
    const count = config.playerCount;
    for (let i = 1; i <= count; i++) {
      const p = players[i];
      if (!p) continue;

      const status   = p.alive ? '存活' : '死亡';
      const trust    = { unknown: '未知', suspicious: '可疑', trusted: '信任', confirmed_duck: '确认是鸭' }[p.trust] || '未知';
      const faction  = p.faction ? { goose: '鹅', duck: '鸭', neutral: '中立' }[p.faction] : '未标';
      const role     = p.role || '未填';

      // 目击记录（跨轮次）
      const sightings = State.getPlayerSightings(i);
      const sightStr  = sightings.length
        ? sightings.map(s => `R${s.round}/${s.room}`).join('、')
        : '无';

      // 备注（所有轮次）
      const notesArr = Object.entries(p.notes || {})
        .sort(([a], [b]) => Number(a) - Number(b))
        .filter(([, t]) => t && t.trim())
        .map(([r, t]) => `[R${r}]${t}`);
      const notesStr = notesArr.length ? notesArr.join(' ') : '无';

      lines.push(`${i}号玩家：${status} | 阵营标记=${faction} | 角色=${role} | 可信度=${trust}`);
      lines.push(`  目击：${sightStr}`);
      lines.push(`  备注：${notesStr}`);
    }

    // 我的路径记录
    lines.push(`\n【我的路径记录】`);
    const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));
    if (roundKeys.length === 0) {
      lines.push('暂无已提交轮次记录');
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
        const sightNote = sightParts.length ? `（目击：${sightParts.join('；')}）` : '';
        lines.push(`R${r}：${pathLabels.join(' → ')}${sightNote}`);
      });
    }

    lines.push(`\n请根据以上信息进行推理分析。`);
    return lines.join('\n');
  }

  // ── 数据充分性检查 ────────────────────────────────────────

  function hasEnoughData() {
    const { players, rounds, config } = State.get();
    const count = config.playerCount;
    let filledPlayers = 0;
    for (let i = 1; i <= count; i++) {
      const p = players[i];
      if (p && (p.role || p.faction || Object.values(p.notes || {}).some(n => n && n.trim()))) {
        filledPlayers++;
      }
    }
    const hasRounds = Object.keys(rounds).length > 0;
    return filledPlayers >= 2 || hasRounds;
  }

  // ── API 调用（SSE 流式）────────────────────────────────────

  async function callAPI(onChunk, onDone, onError) {
    const apiKey = getApiKey();
    if (!apiKey) {
      onError('no_key');
      return;
    }

    const userPrompt = buildUserPrompt();

    let response;
    try {
      response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: userPrompt },
          ],
          stream: true,
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
    } catch (e) {
      onError('network');
      return;
    }

    if (!response.ok) {
      const status = response.status;
      if (status === 401) { onError('invalid_key'); return; }
      if (status === 402) { onError('no_balance'); return; }
      onError('api_error');
      return;
    }

    // 读取 SSE 流
    const reader  = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop(); // 未完成的行留到下一次

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json  = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) onChunk(delta);
          } catch (_) {
            // 忽略解析错误的行
          }
        }
      }
      onDone();
    } catch (e) {
      onError('stream_error');
    }
  }

  // ── UI：显示结果 ──────────────────────────────────────────

  function _showLoading() {
    const panel = document.getElementById('ai-result-panel');
    const body  = document.getElementById('ai-result-body');
    panel.classList.remove('hidden');
    body.innerHTML = '<div class="ai-loading"><span class="ai-spinner"></span> AI 正在分析中…</div>';
  }

  function _showError(type) {
    const body = document.getElementById('ai-result-body');
    const msgs = {
      no_key:       '⚙️ 请先在右上角「AI设置」中填入 API Key。',
      invalid_key:  '❌ API Key 无效或已过期，请检查后重试。',
      no_balance:   '❌ 账户余额不足，请前往硅基流动充值。',
      network:      '❌ 网络请求失败，请检查网络连接后重试。',
      api_error:    '❌ API 调用失败，请检查网络或 API 配置。',
      stream_error: '❌ 数据流读取失败，请重试。',
      no_data:      '📋 当前记录信息不足，建议补充更多玩家备注或路径记录后再分析。',
    };
    body.innerHTML = `<div class="ai-error-msg">${msgs[type] || msgs.api_error}</div>`;
  }

  function _renderStream() {
    const body = document.getElementById('ai-result-body');
    body.innerHTML = '';

    const pre = document.createElement('div');
    pre.className = 'ai-stream-text';
    body.appendChild(pre);

    let fullText = '';

    function onChunk(chunk) {
      fullText += chunk;
      // 将换行和段落格式化为 HTML
      pre.innerHTML = _formatAIText(fullText) + '<span class="ai-cursor">▌</span>';
      // 自动滚动到底部
      body.scrollTop = body.scrollHeight;
    }

    function onDone() {
      pre.innerHTML = _formatAIText(fullText);
      body.scrollTop = body.scrollHeight;
    }

    function onError(type) {
      _showError(type);
    }

    callAPI(onChunk, onDone, onError);
  }

  // 将 AI 输出的【标题】格式转换为带颜色的 HTML
  function _formatAIText(text) {
    const sectionColors = {
      '矛盾点':   'ai-section-contradiction',
      '重点关注': 'ai-section-suspect',
      '相对可信': 'ai-section-trust',
      '阵营推算': 'ai-section-faction',
      '建议':     'ai-section-suggest',
    };

    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 将 【标题】 替换为带颜色 span
    html = html.replace(/【([^】]+)】/g, (match, title) => {
      const cls = sectionColors[title] || 'ai-section-default';
      return `<span class="ai-section-tag ${cls}">【${title}】</span>`;
    });

    // 换行转 <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  // ── 设置面板逻辑 ──────────────────────────────────────────

  function _openSettings() {
    const modal = document.getElementById('modal-ai-settings');
    const input = document.getElementById('ai-api-key-input');
    input.value = getApiKey();
    input.type  = 'password';
    document.getElementById('btn-ai-key-toggle').textContent = '显示';
    modal.classList.remove('hidden');
  }

  function _closeSettings() {
    document.getElementById('modal-ai-settings').classList.add('hidden');
  }

  // ── 初始化事件绑定 ────────────────────────────────────────

  function init() {
    // AI 设置按钮
    document.getElementById('btn-ai-settings').addEventListener('click', _openSettings);

    // 设置面板：保存
    document.getElementById('ai-settings-save').addEventListener('click', () => {
      const key = document.getElementById('ai-api-key-input').value.trim();
      saveApiKey(key);
      _closeSettings();
    });

    // 设置面板：取消
    document.getElementById('ai-settings-cancel').addEventListener('click', _closeSettings);

    // 设置面板：点击遮罩关闭
    document.getElementById('modal-ai-settings').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-ai-settings')) _closeSettings();
    });

    // 显示/隐藏 API Key
    document.getElementById('btn-ai-key-toggle').addEventListener('click', () => {
      const input = document.getElementById('ai-api-key-input');
      const btn   = document.getElementById('btn-ai-key-toggle');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '隐藏';
      } else {
        input.type = 'password';
        btn.textContent = '显示';
      }
    });

    // AI 分析按钮
    document.getElementById('btn-ai-analyze').addEventListener('click', () => {
      if (!getApiKey()) {
        _showError('no_key');
        document.getElementById('ai-result-panel').classList.remove('hidden');
        return;
      }
      if (!hasEnoughData()) {
        _showError('no_data');
        document.getElementById('ai-result-panel').classList.remove('hidden');
        return;
      }
      _showLoading();
      // 等一帧再开始，让 loading UI 先渲染
      requestAnimationFrame(() => _renderStream());
    });

    // 关闭 AI 结果面板
    document.getElementById('btn-ai-close').addEventListener('click', () => {
      document.getElementById('ai-result-panel').classList.add('hidden');
    });
  }

  return { init };
})();
