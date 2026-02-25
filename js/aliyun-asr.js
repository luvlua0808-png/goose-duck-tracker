// ============================================================
// aliyun-asr.js — 阿里云 Paraformer 语音识别接入
// ============================================================

const AliyunASR = (() => {
  let _ws = null;
  let _audioContext = null;
  let _processor = null;
  let _mediaStream = null;

  async function start(config, hotWords, onResult, onEnd, onError) {
    try {
      const token = await AI._getAliyunToken();
      const url = `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1?token=${token}`;
      
      _ws = new WebSocket(url);

      _ws.onopen = () => {
        // 发送开始指令
        const startParams = {
          header: {
            message_id: _generateId(),
            task_id: _generateId(),
            namespace: "SpeechTranscriber",
            name: "StartTranscription",
            appkey: config.appKey
          },
          payload: {
            format: "pcm",
            sample_rate: 16000,
            enable_intermediate_result: true,
            enable_punctuation_prediction: true,
            enable_inverse_text_normalization: true,
            vocabulary_id: config.vocabularyId || undefined,
            customize_words: hotWords
          }
        };
        _ws.send(JSON.stringify(startParams));
      };

      _ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.header.name === "TranscriptionStarted") {
          _startRecording();
        } else if (msg.header.name === "TranscriptionResultChanged" || msg.header.name === "SentenceEnd") {
          onResult(msg.payload.result);
        } else if (msg.header.name === "TaskFailed") {
          onError(msg.header.status_text);
          stop();
        }
      };

      _ws.onerror = (e) => {
        onError("WebSocket Error");
        stop();
      };

      _ws.onclose = () => {
        onEnd();
      };

    } catch (err) {
      onError(err.message === 'no_ak' ? 'no_ak' : 'auth_failed');
    }
  }

  function stop() {
    if (_ws && _ws.readyState === WebSocket.OPEN) {
      _ws.send(JSON.stringify({
        header: {
          message_id: _generateId(),
          task_id: _generateId(),
          namespace: "SpeechTranscriber",
          name: "StopTranscription",
          appkey: ""
        }
      }));
    }
    _stopRecording();
    if (_ws) {
      _ws.close();
      _ws = null;
    }
  }

  async function _startRecording() {
    _audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    _mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = _audioContext.createMediaStreamSource(_mediaStream);
    _processor = _audioContext.createScriptProcessor(4096, 1, 1);

    _processor.onaudioprocess = (e) => {
      if (_ws && _ws.readyState === WebSocket.OPEN) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = _floatTo16BitPCM(inputData);
        _ws.send(pcmData);
      }
    };

    source.connect(_processor);
    _processor.connect(_audioContext.destination);
  }

  function _stopRecording() {
    if (_processor) {
      _processor.disconnect();
      _processor = null;
    }
    if (_audioContext) {
      _audioContext.close();
      _audioContext = null;
    }
    if (_mediaStream) {
      _mediaStream.getTracks().forEach(t => t.stop());
      _mediaStream = null;
    }
  }

  function _floatTo16BitPCM(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output.buffer;
  }

  function _generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  return { start, stop };
})();
