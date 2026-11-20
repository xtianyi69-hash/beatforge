/*!
 * BeatForge engine v1.0
 * 纯前端伴奏合成引擎：文本需求 -> 编曲 -> 合成 -> 24-bit WAV / MIDI
 * 无任何外部依赖，所有声音由代码实时合成。
 */
(function (global) {
  'use strict';

  var SR = 44100;
  var TAU = Math.PI * 2;

  /* ============================================================
   * 基础工具
   * ============================================================ */

  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function avg(arr) { var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return s / arr.length; }
  function midiFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function hash32(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  var translator = null;
  var DEFAULT_TR = {
    'noteStyle': '\u98ce\u683c\uff1a{0}', 'noteGuitarRock': '\u5931\u771f\u5409\u4ed6 + \u7535\u8d1d\u65af + \u73b0\u573a\u9f13', 'noteAddGuitar': '\u52a0\u5931\u771f\u5409\u4ed6',
    'notes.bpm': 'BPM {0}', 'notes.bpmUp': 'BPM +8', 'notes.bpmDown': 'BPM -8', 'notes.bars': '{0} \u5c0f\u8282',
    'notes.rootMode': '{0} {1}', 'notes.swingPct': '\u6447\u6446 {0}%', 'notes.swingMore': '\u66f4\u591a\u6447\u6446', 'notes.straight': '\u76f4\u62cd', 'notes.swingOn': '\u5e26 swing',
    'notes.drumsOnly': '\u7eaf\u9f13', 'notes.melodyMore': '\u65cb\u5f8b\u66f4\u591a', 'notes.melodyLess': '\u65cb\u5f8b\u66f4\u5c11',
    'notes.complexityUp': '\u7f16\u6392\u66f4\u590d\u6742', 'notes.complexityDown': '\u7f16\u6392\u66f4\u7b80\u6d01',
    'notes.vinylMore': '\u66f4\u591a\u9ed1\u80f6\u5668\u58f0', 'notes.cleaner': '\u66f4\u5e72\u51c0', 'notes.reverbBig': '\u66f4\u5927\u7a7a\u95f4', 'notes.dry': '\u66f4\u5e72',
    'notes.dark': '\u97f3\u8272\u504f\u6697', 'notes.warm': '\u6e29\u6696\u590d\u53e4', 'notes.bright': '\u660e\u4eae',
    'notes.no808': '\u4e0d\u7528 808', 'notes.triplet': '\u4e09\u8fde\u97f3', 'notes.addFlute': '\u52a0\u7b1b\u5b50',
    'notes.louder': '\u2191 {0}', 'notes.quieter': '\u2193 {0}', 'refinePrefix': '\u6539\u8fdb\uff1a{0}',
    'levels.kick': '\u5e95\u9f13', 'levels.snare': '\u519b\u9f13', 'levels.hat': '\u8e29\u956c', 'levels.perc': '\u6253\u51fb\u4e50', 'levels.bass': '808 / \u8d1d\u65af',
    'levels.chords': '\u548c\u5f26', 'levels.guitar': '\u5409\u4ed6', 'levels.melody': '\u65cb\u5f8b', 'levels.flute': '\u7b1b\u5b50', 'levels.reverb': '\u6df7\u54cd',
    'refineNotes.keepMelody': '\u4fdd\u7559\u65cb\u5f8b', 'refineNotes.noVinyl': '\u53bb\u6389\u9ed1\u80f6', 'refineNotes.reverbBig': '\u6df7\u54cd\u66f4\u5927', 'refineNotes.reverbDry': '\u6df7\u54cd\u66f4\u5e72',
    'refineNotes.noGuitar': '\u53bb\u6389\u5409\u4ed6\u5c42', 'refineNotes.noFlute': '\u53bb\u6389\u7b1b\u5b50', 'refineNotes.no808': '\u4e0d\u8981 808 / \u8d1d\u65af', 'refineNotes.keep808': '\u4fdd\u7559 808 / \u8d1d\u65af',
    'refineNotes.newGroove': '\u6362\u5230\u5f8b\u52a8\u53d8\u4f53 {0}',
    'notes.variant': '\u5f8b\u52a8\u53d8\u4f53 {0}', 'notes.energyHigh': '\u9ad8\u80fd\u91cf', 'notes.energyLow': '\u4f4e\u80fd\u91cf / \u677e\u5f1b',
    'notes.happy': '\u5f00\u5fc3\u660e\u5feb', 'notes.sad': '\u60b2\u4f24\u6697\u6de1', 'notes.aggressive': '\u51f6\u72e0\u6709\u529b', 'notes.dreamy': '\u68a6\u5e7b\u7a7a\u7075',
    'notes.sexy': '\u6027\u611f\u66d6\u6627', 'notes.mysterious': '\u795e\u79d8', 'notes.epic': '\u53f2\u8bd7\u5b8f\u5927', 'notes.nostalgic': '\u6000\u65e7\u590d\u53e4',
    'notes.fourFloor': '\u56db\u8e29', 'notes.oneDrop': 'one drop', 'notes.steppers': 'steppers', 'notes.dembow': 'dembow',
    'notes.breakbeat': 'breakbeat', 'notes.halfTime': '\u534a\u901f / half-time', 'notes.doubleTime': '\u53cc\u500d\u901f',
    'notes.noHats': '\u4e0d\u8981\u8e29\u9570', 'notes.sixteenthHats': '16 \u5206\u8e29\u9570', 'notes.offbeatHats': '\u53cd\u62cd\u8e29\u9570',
    'notes.sparseHats': '\u7a00\u758f\u8e29\u9570', 'notes.rideHats': 'ride \u9557', 'notes.noSnare': '\u4e0d\u8981\u519b\u9f13',
    'notes.clapSnare': '\u62cd\u624b\u4ee3\u66ff\u519b\u9f13', 'notes.ghostSnare': '\u5e7d\u7075\u519b\u9f13', 'notes.shaker': '\u6c99\u9524',
    'notes.tambourine': '\u94c3\u9f13', 'notes.crash': '\u52a0\u9577\u9557', 'notes.noFills': '\u4e0d\u52a0\u82b1',
    'notes.noBass': '\u4e0d\u8981\u8d1d\u65af', 'notes.walkingBass': 'walking bass', 'notes.slapBass': 'slap bass',
    'notes.subBass': 'sub bass', 'notes.glideBass': '\u6ed1\u97f3 808', 'notes.offbeatBass': '\u53cd\u62cd\u8d1d\u65af',
    'notes.chordSustain': '\u957f\u97f3\u94fa\u5e95', 'notes.chordStab': '\u77ed\u4fc3\u5207\u594f', 'notes.chordArp': '\u7436\u97f3',
    'notes.chordPluck': '\u62e8\u5f26\u5206\u89e3', 'notes.seventh': '\u4e03\u548c\u5f26', 'notes.ninth': '\u4e5d\u548c\u5f26',
    'notes.noInst': '\u53bb\u6389{0}', 'notes.inst': '\u52a0{0}',
    'notes.inst_piano': '\u94a2\u7434', 'notes.inst_strings': '\u5f26\u4e50', 'notes.inst_organ': '\u98ce\u7434', 'notes.inst_sax': '\u8428\u514b\u65af',
    'notes.inst_synth': '\u5408\u6210\u5668', 'notes.inst_bell': '\u94c3 / \u949f\u7434', 'notes.inst_cowbell': '\u725b\u94c3', 'notes.inst_pluck': '\u62e8\u5f26',
    'notes.inst_pad': 'Pad \u94fa\u5e95',
    'notes.tape': '\u78c1\u5e26\u97f3\u8272', 'notes.delay': '\u56de\u58f0 / delay', 'notes.sidechain': '\u4fa7\u94fe\u62bd\u5438',
    'notes.distortion': '\u5931\u771f', 'notes.registerHigh': '\u9ad8\u516b\u5ea6', 'notes.registerLow': '\u4f4e\u516b\u5ea6',
    'notes.unsupportedVocal': '\u4e0d\u652f\u6301\u4eba\u58f0\uff0c\u5df2\u751f\u6210\u7eaf\u4f34\u594f', 'notes.unsupportedSample': '\u4e0d\u4f7f\u7528\u91c7\u6837\uff0c\u5168\u90e8\u4e3a\u5408\u6210\u97f3\u8272',
    'notes.unsupportedArtist': '\u4e0d\u6a21\u4eff\u5177\u4f53\u6b4c\u66f2 / \u827a\u4eba\uff0c\u6309\u98ce\u683c\u8fd1\u4f3c'
  };
  function tr(key, args) {
    if (translator) return translator(key, args);
    var s = DEFAULT_TR[key];
    if (s == null) return key;
    if (args != null) {
      if (!Array.isArray(args)) args = [args];
      s = s.replace(/\{(\d+)\}/g, function (m, i) { return args[i] != null ? args[i] : m; });
    }
    return s;
  }
  var refiner = null;
  function rn(key, args) {
    if (refiner) return refiner(key, args);
    return tr('refineNotes.' + key, args);
  }

  function mulberry32(a) {
    a = a >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ============================================================
   * 乐理
   * ============================================================ */

  var ROOT_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var MODES = {
    minor:    { label: '小调', iv: [0, 2, 3, 5, 7, 8, 10] },
    major:    { label: '大调', iv: [0, 2, 4, 5, 7, 9, 11] }
  };

  function noteToPc(letter, acc) {
    var base = PC[letter.toUpperCase()];
    if (base === undefined) return 0;
    var a = 0;
    if (acc === '#' || acc === '♯') a = 1;
    else if (acc === 'b' || acc === '♭') a = -1;
    return ((base + a) % 12 + 12) % 12;
  }

  function scaleMidi(spec, step, octave) {
    var iv = MODES[spec.mode].iv;
    var oct = Math.floor(step / 7);
    var idx = ((step % 7) + 7) % 7;
    return 12 * (octave + 1) + ((spec.rootPc + iv[idx]) % 12) + 12 * oct;
  }

  function chordMidi(spec, degree, octave, ext) {
    var steps = ext === '9' ? [0, 2, 4, 6, 8] : (ext === '7' ? [0, 2, 4, 6] : [0, 2, 4]);
    var iv = MODES[spec.mode].iv;
    return steps.map(function (k) {
      var d = degree + k;
      var oct = Math.floor(d / 7);
      var idx = ((d % 7) + 7) % 7;
      return 12 * (octave + 1) + ((spec.rootPc + iv[idx]) % 12) + 12 * oct;
    });
  }

  function bassMidiFor(spec, degree) {
    var iv = MODES[spec.mode].iv;
    var oct = Math.floor(degree / 7);
    var idx = ((degree % 7) + 7) % 7;
    var pc = (spec.rootPc + iv[idx]) % 12;
    var m = 36 + pc + 12 * oct;
    if (isTrapish(spec.style)) {
      if (m > 40) m -= 12;
      if (m < 26) m += 12;
    }
    return m;
  }

  function voiceChord(notes, prev, center) {
    center = center || 62;
    var best = null, bestScore = 1e9;
    var n = notes.length;
    for (var inv = 0; inv < n; inv++) {
      var v = notes.map(function (x, i) { return i < inv ? x + 12 : x; }).sort(function (a, b) { return a - b; });
      for (var s = -12; s <= 12; s += 12) {
        var vv = v.map(function (x) { return x + s; });
        if (vv[0] < 45 || vv[vv.length - 1] > 81) continue;
        var score = Math.abs(avg(vv) - center);
        score += (vv[vv.length - 1] - vv[0]) * 0.35;
        if (prev && prev.length === vv.length) {
          var move = 0;
          for (var i = 0; i < vv.length; i++) move += Math.abs(vv[i] - prev[i]);
          score += move * 0.55;
        }
        if (score < bestScore) { bestScore = score; best = vv; }
      }
    }
    return best || notes;
  }

  function snapToChord(midi, chord) {
    if (!chord || !chord.length) return midi;
    var pcs = chord.map(function (n) { return ((n % 12) + 12) % 12; });
    var best = midi, bd = 99;
    for (var d = -3; d <= 3; d++) {
      var c = midi + d;
      if (pcs.indexOf(((c % 12) + 12) % 12) !== -1 && Math.abs(d) < bd) { bd = Math.abs(d); best = c; }
    }
    return best;
  }

  function pickProgression(spec, rng) {
    var minor = [[0, 5, 2, 6], [0, 3, 5, 4], [0, 5, 3, 6], [0, 2, 5, 4], [0, 6, 2, 6], [0, 3, 6, 2], [0, 5, 6, 4], [5, 3, 0, 6]];
    var major = [[0, 4, 5, 3], [0, 5, 3, 4], [1, 4, 0, 5], [0, 3, 4, 4], [0, 4, 1, 5], [5, 3, 0, 4], [0, 2, 5, 4], [3, 4, 0, 5]];
    var trapish = [[0, 5, 0, 5], [0, 2, 0, 2], [0, 6, 5, 6], [0, 3, 0, 3], [0, 5, 6, 2], [0, 3, 5, 2], [5, 6, 0, 4], [0, 2, 6, 5]];
    var lofi = [[1, 4, 0, 0], [0, 3, 5, 4], [0, 5, 1, 4], [1, 4, 5, 0], [0, 3, 6, 2], [2, 5, 1, 4]];
    var rock = [[0, 5, 2, 6], [0, 6, 5, 6], [0, 3, 5, 4], [0, 5, 3, 6], [0, 4, 5, 3], [0, 2, 6, 4]];
    var byStyle = {
      jazz: [[1, 4, 0, 0], [1, 4, 0, 5], [2, 5, 1, 4], [1, 4, 3, 0], [0, 5, 1, 4], [2, 5, 0, 4]],
      reggae: [[0, 4, 5, 3], [0, 0, 3, 4], [0, 5, 3, 4], [0, 3, 4, 4], [5, 4, 0, 3]],
      bossa: [[1, 4, 0, 0], [0, 3, 4, 4], [1, 4, 5, 0], [0, 5, 1, 4], [1, 4, 3, 0], [0, 3, 6, 2]],
      funk: [[0, 0, 3, 4], [0, 3, 0, 4], [0, 0, 0, 3], [0, 3, 4, 3], [0, 5, 3, 4], [0, 0, 5, 3]],
      synthwave: [[0, 5, 3, 4], [0, 6, 3, 4], [1, 4, 0, 5], [0, 3, 6, 4], [0, 4, 5, 3], [5, 3, 0, 6]],
      dnb: [[0, 5, 3, 6], [0, 2, 5, 6], [0, 6, 5, 3], [0, 3, 6, 2], [0, 5, 6, 2], [5, 6, 0, 3]],
      reggaeton: [[0, 5, 3, 4], [0, 0, 3, 4], [0, 6, 5, 6], [0, 3, 5, 4], [0, 5, 6, 2]],
      afrobeats: [[0, 4, 5, 3], [0, 3, 4, 0], [0, 5, 3, 4], [0, 4, 1, 5], [5, 4, 0, 3], [0, 2, 5, 4]],
      boom_bap: minor.concat([[1, 4, 0, 5], [0, 5, 1, 4]]),
      house: [[0, 5, 3, 4], [0, 3, 5, 4], [0, 5, 1, 4], [0, 2, 5, 4], [0, 6, 5, 4], [5, 3, 0, 4]],
      trap: trapish,
      drill: trapish.concat([[0, 6, 0, 5], [0, 2, 3, 5]]),
      modernrap: trapish.concat([[0, 5, 2, 6], [0, 3, 2, 5]]),
      phonk: [[0, 0, 3, 4], [0, 3, 0, 4], [0, 0, 5, 3], [0, 6, 0, 5], [0, 3, 5, 3]],
      lofi: lofi,
      rock: rock,
      rock80s: [[0, 5, 3, 4], [0, 3, 4, 4], [0, 4, 5, 3], [0, 5, 4, 3], [0, 4, 1, 5], [5, 3, 0, 4]]
    };
    var pool;
    if (byStyle[spec.style]) pool = byStyle[spec.style];
    else if (spec.mode === 'major') pool = major;
    else pool = minor;
    var idx = (Math.floor(rng() * pool.length) + (spec.variant || 0)) % pool.length;
    return pool[idx];
  }

  /* ============================================================
   * 振荡器 / 噪声
   * ============================================================ */

  var LUT_SIZE = 4096;
  var SINE = new Float32Array(LUT_SIZE + 2);
  for (var i = 0; i <= LUT_SIZE; i++) SINE[i] = Math.sin((i / LUT_SIZE) * TAU);
  SINE[LUT_SIZE + 1] = SINE[1];

  function sine(phase) {
    var p = phase - Math.floor(phase);
    var x = p * LUT_SIZE;
    var i0 = x | 0;
    var f = x - i0;
    return SINE[i0] + (SINE[i0 + 1] - SINE[i0]) * f;
  }

  function saw(phase) {
    var p = phase - Math.floor(phase);
    return 2 * p - 1;
  }

  /* 金属感踩镲音源（预生成，多个非谐波方波叠加） */
  var METAL = (function () {
    var n = SR;
    var buf = new Float32Array(n);
    var freqs = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0];
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var s = 0;
      for (var k = 0; k < freqs.length; k++) s += Math.sin(TAU * freqs[k] * t) >= 0 ? 1 : -1;
      buf[i] = s / freqs.length;
    }
    return buf;
  })();

  /* ============================================================
   * 文本解析：需求 -> spec
   * ============================================================ */

  var STYLE_DEFS = {
    boom_bap: {
      label: 'Boom Bap', tagline: '90s 东岸 · 采样味', bpm: 90, swing: 0.18, root: 9, mode: 'minor',
      vinyl: 0.28, reverb: 0.16, melody: 0.32, complexity: 0.5, bright: 0.45,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    trap: {
      label: 'Trap', tagline: '808 滑音 · 半拍军鼓', bpm: 140, swing: 0.02, root: 5, mode: 'minor',
      vinyl: 0.05, reverb: 0.22, melody: 0.3, complexity: 0.55, bright: 0.5,
      melodyInst: 'bell', bassInst: '808'
    },
    drill: {
      label: 'Drill', tagline: '下滑 808 · 阴冷', bpm: 142, swing: 0.0, root: 7, mode: 'minor',
      vinyl: 0.04, reverb: 0.2, melody: 0.22, complexity: 0.45, bright: 0.35,
      melodyInst: 'bell', bassInst: '808'
    },
    lofi: {
      label: 'Lo-Fi', tagline: '爵士和弦 · 黑胶噪', bpm: 82, swing: 0.24, root: 2, mode: 'minor',
      vinyl: 0.55, reverb: 0.24, melody: 0.4, complexity: 0.4, bright: 0.35,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    house: {
      label: 'House', tagline: '四踩 · 反拍开镲', bpm: 124, swing: 0.03, root: 9, mode: 'minor',
      vinyl: 0.03, reverb: 0.2, melody: 0.18, complexity: 0.5, bright: 0.65,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    phonk: {
      label: 'Phonk', tagline: '牛铃 · 失真 808', bpm: 132, swing: 0.05, root: 0, mode: 'minor',
      vinyl: 0.18, reverb: 0.12, melody: 0.45, complexity: 0.5, bright: 0.5,
      melodyInst: 'cowbell', bassInst: '808'
    },
    rock: {
      label: 'Rock', tagline: '失真吉他 · 现场鼓', bpm: 122, swing: 0, root: 4, mode: 'minor',
      vinyl: 0.02, reverb: 0.16, melody: 0.48, complexity: 0.62, bright: 0.62,
      melodyInst: 'lead', bassInst: 'bass'
    },
    rock80s: {
      label: '80s Rock', tagline: 'Gated 军鼓 · 合成器 pad · 主音吉他', bpm: 118, swing: 0, root: 4, mode: 'minor',
      vinyl: 0.03, reverb: 0.34, melody: 0.5, complexity: 0.55, bright: 0.72,
      melodyInst: 'lead', bassInst: 'bass'
    },
    modernrap: {
      label: 'Modern Rap', tagline: '重 808 滑音 · hi-hat roll · 三拍军鼓', bpm: 146, swing: 0, root: 2, mode: 'minor',
      vinyl: 0.02, reverb: 0.18, melody: 0.26, complexity: 0.62, bright: 0.42,
      melodyInst: 'bell', bassInst: '808'
    },
    reggae: {
      label: 'Reggae', tagline: 'One drop · 反拍风琴 · 深贝斯', bpm: 78, swing: 0.04, root: 9, mode: 'major',
      vinyl: 0.04, reverb: 0.32, melody: 0.22, complexity: 0.35, bright: 0.48,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    jazz: {
      label: 'Jazz', tagline: 'Ride 摇摆 · Walking bass · 七和弦', bpm: 118, swing: 0.32, root: 5, mode: 'major',
      vinyl: 0.08, reverb: 0.22, melody: 0.42, complexity: 0.55, bright: 0.5,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    dnb: {
      label: 'Drum & Bass', tagline: 'Breakbeat · 快速切分 · 重低音', bpm: 174, swing: 0, root: 6, mode: 'minor',
      vinyl: 0.02, reverb: 0.2, melody: 0.2, complexity: 0.7, bright: 0.55,
      melodyInst: 'bell', bassInst: '808'
    },
    funk: {
      label: 'Funk', tagline: '16 分贝斯 · Ghost snare · 切分', bpm: 108, swing: 0.06, root: 4, mode: 'minor',
      vinyl: 0.03, reverb: 0.08, melody: 0.28, complexity: 0.72, bright: 0.62,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    reggaeton: {
      label: 'Reggaeton', tagline: 'Dembow · 808 · 沙锤', bpm: 96, swing: 0, root: 2, mode: 'minor',
      vinyl: 0.02, reverb: 0.14, melody: 0.16, complexity: 0.4, bright: 0.5,
      melodyInst: 'bell', bassInst: '808'
    },
    afrobeats: {
      label: 'Afrobeats', tagline: '切分底鼓 · 沙锤 · 吉他 riff', bpm: 104, swing: 0.05, root: 7, mode: 'major',
      vinyl: 0.02, reverb: 0.14, melody: 0.48, complexity: 0.6, bright: 0.66,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    bossa: {
      label: 'Bossa', tagline: 'Clave · 尼龙吉他 · 轻鼓', bpm: 132, swing: 0.08, root: 0, mode: 'major',
      vinyl: 0.06, reverb: 0.24, melody: 0.36, complexity: 0.4, bright: 0.46,
      melodyInst: 'pluck', bassInst: 'bass'
    },
    synthwave: {
      label: 'Synthwave', tagline: '鼓机 · 琶音 · Pad', bpm: 100, swing: 0, root: 9, mode: 'minor',
      vinyl: 0.02, reverb: 0.3, melody: 0.7, complexity: 0.55, bright: 0.7,
      melodyInst: 'pulse', bassInst: 'bass'
    }
  };

  var ROCK80_RE = /80s|80\s?年代|八十年代|八零|hair\s?metal|glam|synth\s?rock|new\s?wave/;
  var MODERNRAP_RE = /modern\s?rap|现代说唱|现代rap|cloud\s?rap|rage|mumble|现代嘻哈|flex/;

  var ROCK_RE = /rock|摇滚|吉他|guitar|朋克|punk|grunge|垃圾摇|重金属|金属乐|metal|乐队|\bband\b|另类|indie|alternative|硬摇/;

  function isTrapish(s) { return s === 'trap' || s === 'drill' || s === 'modernrap'; }
  function isRockish(s) { return s === 'rock' || s === 'rock80s'; }

  function detectStyle(low) {
    var rules = [
      ['reggaeton', /reggaeton|regueton|dembow|雷鬼顿/],
      ['reggae', /reggae|雷鬼|牙买加|one\s?drop|skank|\bska\b/],
      ['dnb', /dnb|d&b|drum\s?(&|and|n)\s?bass|鼓打贝斯|jungle/],
      ['synthwave', /synthwave|合成波|outrun|retrowave/],
      ['afrobeats', /afrobeats?|阿弗罗|afro\s?beat/],
      ['bossa', /bossa|波萨|bossanova/],
      ['funk', /funk|放克/],
      ['drill', /drill|钻头/],
      ['phonk', /phonk|memphis|孟菲斯|牛铃/],
      ['rock80s', ROCK80_RE],
      ['modernrap', MODERNRAP_RE],
      ['lofi', /lo[\s-]?fi|lofi|低保真|chill|爵士嘻哈|jazz\s?hop|放松|学习/],
      ['jazz', /\bjazz\b|爵士|bebop/],
      ['house', /house|浩室|deep\s?house|tech\s?house|four\s?on\s?the\s?floor|4\s?on\s?the\s?floor|舞曲/],
      ['trap', /trap|陷阱|808/],
      ['boom_bap', /boom\s?bap|boombap|老派|old\s?school|东岸|90\s?s|九零|hip\s?hop|hiphop|嘻哈|说唱/]
    ];
    for (var i = 0; i < rules.length; i++) {
      if (rules[i][1].test(low)) return rules[i][0];
    }
    if (ROCK_RE.test(low)) return 'rock';
    return 'boom_bap';
  }

  function parseKey(text) {
    var s = text.replace(/升\s*([A-Ga-g])/g, '$1#').replace(/降\s*([A-Ga-g])/g, '$1b');
    var m = s.match(/([A-Ga-g])\s*([#b♯♭]?)\s*(小调|大调)/);
    if (m) return { root: noteToPc(m[1], m[2]), mode: m[3] === '大调' ? 'major' : 'minor' };
    m = s.match(/([A-Ga-g])\s*([#b♯♭]?)\s*(minor|major|min|maj)\b/i);
    if (m) return { root: noteToPc(m[1], m[2]), mode: /major|maj/i.test(m[3]) ? 'major' : 'minor' };
    m = s.match(/\b([A-G])([#b♯♭]?)m\b/);
    if (m) return { root: noteToPc(m[1], m[2]), mode: 'minor' };
    m = s.match(/(?:key|调性|调)\s*[:：]?\s*([A-Ga-g])\s*([#b♯♭]?)/i);
    if (m) return { root: noteToPc(m[1], m[2]), mode: null };
    return null;
  }

  /* 把“更具体”的自然语言落到可渲染参数上。
     这里只处理旧解析器没覆盖的维度，避免与 BPM/调性/旋律等重复。 */
  function applyTraits(spec, low, notes) {
    function add(k, a) { notes.push(tr('notes.' + k, a)); }
    var neg = '(?:不要|去掉|别用|不加|不用|没有|no|without)';
    function isOff(re) {
      return new RegExp(neg + '[^，,。；;\\n]{0,6}(?:' + re.source + ')', 'i').test(low);
    }

    // 律动变体：第 1/2/3/4 种
    var vm = low.match(/(?:变体|variant|第)\s*([1-4一二三四])\s*(?:种|版)?/i);
    if (vm) {
      var vmap = { '1': 0, '2': 1, '3': 2, '4': 3, '一': 0, '二': 1, '三': 2, '四': 3 };
      spec.variant = vmap[vm[1]] == null ? spec.variant : vmap[vm[1]];
      add('variant', spec.variant + 1);
    }

    // 能量 / 情绪
    if (/能量|energetic|hype|燃|炸|激烈|high\s*energy|banger|club/.test(low)) {
      spec.energy = 0.86;
      spec.complexity = clamp(spec.complexity + 0.12, 0, 1);
      add('energyHigh');
    } else if (/chill|放松|舒缓|冷静|慵懒|laid\s*back|low\s*energy|mellow|cozy/.test(low)) {
      spec.energy = 0.28;
      spec.complexity = clamp(spec.complexity - 0.1, 0, 1);
      add('energyLow');
    }
    if (/开心|快乐|阳光|happy|uplifting|joyful|cheerful/.test(low)) {
      if (!/小调|minor/.test(low)) spec.mode = 'major';
      spec.bright = Math.max(spec.bright, 0.72);
      add('happy');
    }
    if (/悲伤|忧郁|难过|sad|melanchol|emo\b|lonely/.test(low)) {
      spec.mode = 'minor';
      spec.bright = Math.min(spec.bright, 0.34);
      spec.melody = clamp(spec.melody + 0.08, 0, 1);
      add('sad');
    }
    if (/凶狠|暴躁|猛|硬|aggressive|angry|hard|menacing/.test(low)) {
      spec.energy = 0.9;
      spec.distortion = true;
      add('aggressive');
    }
    if (/梦幻|空灵|氛围|dreamy|ethereal|atmospheric|shoegaze/.test(low)) {
      spec.reverb = clamp(spec.reverb + 0.14, 0, 0.5);
      spec.bright = Math.min(spec.bright, 0.62);
      spec.addPad = true;
      add('dreamy');
      add('pad');
    }
    if (/性感|暧昧|sultry|sexy/.test(low)) {
      spec.swing = clamp(spec.swing + 0.05, 0, 0.45);
      spec.bright = 0.44;
      add('sexy');
    }
    if (/神秘|悬疑|mysterious|eerie|dark\s*ambient/.test(low)) {
      spec.mode = 'minor';
      spec.bright = Math.min(spec.bright, 0.3);
      add('mysterious');
    }
    if (/史诗|宏大|epic|cinematic|trailer/.test(low)) {
      spec.reverb = clamp(spec.reverb + 0.16, 0, 0.5);
      spec.addStrings = true;
      add('epic');
      add('strings');
    }
    if (/怀旧|复古|nostalgic|retro|old\s*school/.test(low)) {
      spec.vinyl = clamp(spec.vinyl + 0.18, 0, 0.85);
      spec.bright = Math.min(spec.bright, 0.55);
      add('nostalgic');
    }

    // 鼓组变化
    if (/四踩|four\s*on\s*the\s*floor|4\s*on\s*the\s*floor/.test(low)) { spec.kickStyle = 'four'; add('fourFloor'); }
    if (/one\s*drop|one-drop|一下雷鬼/.test(low)) { spec.kickStyle = 'one_drop'; add('oneDrop'); }
    if (/steppers?|steppa/.test(low)) { spec.kickStyle = 'steppers'; add('steppers'); }
    if (/dembow|雷鬼顿鼓/.test(low)) { spec.kickStyle = 'dembow'; add('dembow'); }
    if (/breakbeat|碎拍|breaks/.test(low)) { spec.kickStyle = 'breakbeat'; add('breakbeat'); }
    if (/half[\s-]?time|半速|半拍/.test(low)) { spec.halfTime = true; add('halfTime'); }
    if (/double[\s-]?time|双倍速|两倍速|快鼓/.test(low)) { spec.doubleTime = true; add('doubleTime'); }

    if (isOff(/踩镲|镲片|hi.?hat|hats?/)) { spec.noHats = true; add('noHats'); }
    else if (/16\s*分(踩镲|镲)|sixteenth|密集(踩镲|镲)|hi.?hat\s*rolls?|踩镲密|hat\s*rolls?/.test(low)) { spec.hatStyle = '16th'; add('sixteenthHats'); }
    else if (/反拍(踩镲|镲)|offbeat\s*hats?/.test(low)) { spec.hatStyle = 'offbeat'; add('offbeatHats'); }
    else if (/(踩镲|镲|hats?).{0,6}(少|稀疏)|sparse\s*hats?/.test(low)) { spec.hatStyle = 'sparse'; add('sparseHats'); }
    else if (/ride|叮叮镲/.test(low)) { spec.hatStyle = 'ride'; add('rideHats'); }

    if (isOff(/军鼓|snare/)) { spec.snareStyle = 'none'; add('noSnare'); }
    else if (/拍手|clap|handclap/.test(low)) { spec.snareStyle = 'clap'; add('clapSnare'); }
    if (/幽灵音|ghost\s*note/.test(low)) add('ghostSnare');
    if (/沙锤|shaker/.test(low)) { spec.shaker = true; spec.percStyle = 'shaker16'; add('shaker'); }
    if (/铃鼓|tambourine/.test(low)) { spec.tambourine = true; spec.percStyle = 'tamb'; add('tambourine'); }
    if (/加镲|加一片镲|crash/.test(low) && !spec.noHats) { spec.crash = true; add('crash'); }
    if (/不要.{0,3}(加花|fill)|no\s*fills?/.test(low)) { spec.noFills = true; add('noFills'); }

    // 贝斯
    if (isOff(/贝斯|bass|低音/)) { spec.noBass = true; add('noBass'); }
    else if (/walking|行走贝斯|走动贝斯/.test(low)) { spec.bassStyle = 'walking'; add('walkingBass'); }
    else if (/slap|击弦|slapping/.test(low)) { spec.bassStyle = 'slap'; add('slapBass'); }
    else if (/sub\s*bass|超低音|次低音|低频铺底/.test(low)) { spec.bassStyle = 'sub'; add('subBass'); }
    else if (/滑音|glide|slide|808\s*滑/.test(low)) { spec.bassStyle = 'glide'; add('glideBass'); }
    else if (/反拍贝斯|offbeat\s*bass|reggae\s*bass/.test(low)) { spec.bassStyle = 'offbeat'; add('offbeatBass'); }

    // 和弦 / 和声
    if (/长音|铺底|铺满|sustained?|sustain|pad\s*chords?/.test(low)) { spec.chordStyle = 'sustain'; add('chordSustain'); }
    else if (/短促|断奏|stab|staccato/.test(low)) { spec.chordStyle = 'stab'; add('chordStab'); }
    else if (/琶音|arpeggio|arp\b/.test(low)) { spec.chordStyle = 'arp'; add('chordArp'); }
    else if (/分解和弦|拨弦|pluck|指弹/.test(low)) { spec.chordStyle = 'pluck'; add('chordPluck'); }
    if (/七和弦|7th|seventh/.test(low)) { spec.ext = '7'; add('seventh'); }
    else if (/九和弦|9th|ninth/.test(low)) { spec.ext = '9'; add('ninth'); }

    // 乐器层（加 / 不要）
    var insts = [
      ['Piano', /钢琴|piano|键盘|keys/, 'piano', '钢琴'],
      ['Strings', /弦乐|strings?|小提琴|violin|cello|大提琴/, 'strings', '弦乐'],
      ['Organ', /风琴|organ|管风琴/, 'organ', '风琴'],
      ['Sax', /萨克斯|sax|saxophone/, 'sax', '萨克斯'],
      ['Synth', /合成器|synth|电子主音|lead\s*synth/, 'synth', '合成器'],
      ['Bell', /钟琴|铃音|bell(?!.*drum)|glockenspiel|celesta/, 'bell', '铃/钟琴'],
      ['Cowbell', /牛铃|cowbell/, 'cowbell', '牛铃'],
      ['Pluck', /拨弦|pluck|分解和弦|指弹/, 'pluck', '拨弦'],
      ['Pad', /\bpad\b|铺底|氛围垫|ambient/, 'pad', 'Pad 铺底']
    ];
    insts.forEach(function (it) {
      if (isOff(it[1])) {
        spec['add' + it[0]] = false;
        add('noInst', tr('notes.inst_' + it[2]));
      } else if (it[1].test(low)) {
        spec['add' + it[0]] = true;
        add('inst', tr('notes.inst_' + it[2]));
      }
    });

    // 混音 / 效果
    if (/磁带|tape|wobble|抖动/.test(low)) { spec.tape = true; add('tape'); }
    if (/回声|delay|echo|ping.?pong/.test(low)) { spec.delayFx = true; add('delay'); }
    if (/抽吸|侧链|sidechain|pumping/.test(low)) { spec.sidechain = true; add('sidechain'); }
    if (/失真|distortion|overdrive|破音/.test(low)) { spec.distortion = true; add('distortion'); }
    if (/高音区|高八度|high\s*register|octave\s*up/.test(low)) { spec.register = 1; add('registerHigh'); }
    else if (/低音区|低八度|low\s*register|octave\s*down/.test(low)) { spec.register = -1; add('registerLow'); }

    // 无法做到的请求：明确告诉用户，而不是假装听懂
    if ((/人声|vocal|唱歌|歌词/.test(low)) && !/不要.{0,3}人声|no\s*vocals?|纯伴奏/.test(low)) add('unsupportedVocal');
    if (/采样|sample/.test(low) && !/不要.{0,3}(采样|sample)|不用.{0,3}(采样|sample)|no\s*samples?|无采样/.test(low)) add('unsupportedSample');
    if (/模仿|像.{1,10}(风格|一样)|in the style of|sounds?\s+like/.test(low)) add('unsupportedArtist');
  }

  function parsePrompt(text) {
    var t = String(text == null ? '' : text);
    var low = t.toLowerCase();
    var style = detectStyle(low);
    var def = STYLE_DEFS[style];
    var seed = hash32(t) >>> 0;
    var notes = [tr('noteStyle', def.label)];
    var wantsGuitar = ROCK_RE.test(low);
    if (style === 'rock') notes.push(tr('noteGuitarRock'));
    else if (wantsGuitar) notes.push(tr('noteAddGuitar'));
    if (style === 'reggae' || style === 'jazz' || style === 'dnb' || style === 'funk' || style === 'reggaeton' || style === 'afrobeats' || style === 'bossa' || style === 'synthwave') {
      notes.push(translator ? tr('tagline_' + style) : def.tagline);
    }

    var bpm = def.bpm;
    var bpmMatch = t.match(/(\d{2,3})\s*(?:bpm|拍速|拍)/i);
    if (!bpmMatch) {
      var bpmAfter = t.match(/(?:bpm|速度|tempo)\s*[:：]?\s*(\d{2,3})(?!\s*(?:小节|bars?|measures?))/i);
      if (bpmAfter) bpmMatch = bpmAfter;
    }
    if (bpmMatch) {
      var bv = parseInt(bpmMatch[1], 10);
      if (bv >= 50 && bv <= 200) { bpm = bv; notes.push(tr('notes.bpm', bpm)); }
    }
    if (/更快|快一点|faster|uptempo/.test(low)) { bpm += 8; notes.push(tr('notes.bpmUp')); }
    if (/更慢|慢一点|slower|laid\s?back/.test(low)) { bpm -= 8; notes.push(tr('notes.bpmDown')); }
    bpm = clamp(Math.round(bpm), 50, 200);

    var bars = 8;
    var barMatch = t.match(/(\d{1,2})\s*(?:小节|bars?|measures?)/i) || t.match(/(\d{1,2})\s*个\s*小节/);
    if (barMatch) {
      var ba = parseInt(barMatch[1], 10);
      if (ba >= 1 && ba <= 32) { bars = ba; notes.push(tr('notes.bars', ba)); }
    }

    var key = parseKey(t);
    var rootPc = def.root, mode = def.mode;
    if (key && key.root != null) {
      rootPc = key.root;
      mode = key.mode || def.mode;
      notes.push(tr('notes.rootMode', [ROOT_NAMES[rootPc], tr('mode_' + mode, MODES[mode].label)]));
    } else if (/大调|major/.test(low)) {
      mode = 'major';
      notes.push(tr('notes.rootMode', [ROOT_NAMES[rootPc], tr('mode_major', MODES.major.label)]));
    } else if (/小调|minor/.test(low)) {
      mode = 'minor';
      notes.push(tr('notes.rootMode', [ROOT_NAMES[rootPc], tr('mode_minor', MODES.minor.label)]));
    }

    var swing = def.swing;
    var swm = t.match(/swing\s*[:：]?\s*(\d{1,3})\s*%/i) || t.match(/摇摆\s*(\d{1,3})\s*%/) || t.match(/swing\s*[:：]?\s*(\d{1,2})\b/i);
    if (swm) {
      var sv = parseInt(swm[1], 10);
      if (sv <= 45) { swing = sv / 100; notes.push(tr('notes.swingPct', sv)); }
    } else {
      if (/很摇摆|more\s+swing|shuffle/.test(low)) { swing = clamp(swing + 0.1, 0, 0.42); notes.push(tr('notes.swingMore')); }
      else if (/不要太摇摆|no\s+swing|straight|直拍|方正/.test(low)) { swing = 0.02; notes.push(tr('notes.straight')); }
      else if (/swing|摇摆|la[iy]d\s?back|律动/.test(low)) { swing = clamp(swing + 0.06, 0, 0.42); notes.push(tr('notes.swingOn')); }
    }

    var melody = def.melody;
    var drumsOnly = /纯鼓|只要鼓|drums?\s?only|no\s+melody|不要旋律|不要\s*lead|无旋律/.test(low);
    if (drumsOnly) { melody = 0; notes.push(tr('notes.drumsOnly')); }
    else if (/旋律多|多点旋律|多一些旋律|melodic|lead\s+more|来点\s*lead/.test(low)) { melody = 0.75; notes.push(tr('notes.melodyMore')); }
    else if (/旋律少|少一点旋律|less\s+melody|简单旋律/.test(low)) { melody = 0.16; notes.push(tr('notes.melodyLess')); }

    var complexity = def.complexity;
    if (/简单|简洁|干净|minimal|simple|空一点|留白/.test(low)) { complexity = 0.28; notes.push(tr('notes.complexityDown')); }
    else if (/复杂|花一点|花哨|busy|complex|多变化|节奏密|密集/.test(low)) { complexity = 0.85; notes.push(tr('notes.complexityUp')); }

    var vinyl = def.vinyl, reverb = def.reverb, bright = def.bright;
    if (/黑胶|vinyl|dusty|灰尘|颗粒|噪/.test(low)) { vinyl = clamp(vinyl + 0.3, 0, 0.85); notes.push(tr('notes.vinylMore')); }
    if (/干净|hifi|hi-fi|无噪/.test(low)) { vinyl = Math.max(0.02, vinyl - 0.25); notes.push(tr('notes.cleaner')); }
    if (/混响大|大空间|空间感|atmos|reverb\s+big|wash/.test(low)) { reverb = clamp(reverb + 0.14, 0, 0.5); notes.push(tr('notes.reverbBig')); }
    if (/干声|dry|nearfield|近场/.test(low)) { reverb = Math.max(0.03, reverb - 0.12); notes.push(tr('notes.dry')); }
    if (/暗|阴|凶狠|dark|ominous|恐怖|压抑/.test(low)) { bright = 0.28; notes.push(tr('notes.dark')); }
    else if (/温暖|warm|复古|vintage|柔和|软/.test(low)) { bright = 0.55; notes.push(tr('notes.warm')); }
    else if (/明亮|bright|清亮|通透/.test(low)) { bright = 0.8; notes.push(tr('notes.bright')); }

    var flute = /笛子|flute/.test(low);
    if (flute) notes.push(tr('notes.addFlute'));
    var no808 = /不要\s*808|no\s*808|别用\s*808|808\s*不要/.test(low);
    if (no808) notes.push(tr('notes.no808'));
    var triplet = /三连音|triplet/.test(low);
    if (triplet) notes.push(tr('notes.triplet'));

    var spec = {
      style: style,
      bpm: bpm,
      bars: bars,
      swing: clamp(swing, 0, 0.45),
      rootPc: rootPc,
      mode: mode,
      seed: seed,
      vinyl: clamp(vinyl, 0, 0.85),
      reverb: clamp(reverb, 0, 0.5),
      melody: clamp(melody, 0, 1),
      complexity: clamp(complexity, 0, 1),
      bright: clamp(bright, 0, 1),
      drumsOnly: drumsOnly,
      no808: no808,
      triplet: triplet,
      guitarLayer: wantsGuitar && style !== 'rock',
      flute: flute,
      variant: (seed >>> 7) % 4,
      energy: 0.5,
      addPiano: false, addStrings: false, addOrgan: false, addSax: false,
      addSynth: false, addBell: false, addCowbell: false, addPluck: false, addPad: false,
      kickStyle: '', hatStyle: '', snareStyle: '', percStyle: '', bassStyle: '', chordStyle: '',
      halfTime: false, doubleTime: false, noHats: false, shaker: false, tambourine: false,
      crash: false, noFills: false, noBass: false, register: 0,
      tape: false, delayFx: false, sidechain: false, distortion: false,
      ext: '', sus: false,
      notes: notes
    };
    applyTraits(spec, low, notes);
    return spec;
  }

  /* ============================================================
   * 声音合成
   * ============================================================ */

  var KICK_CFG = {
    boom_bap: { f0: 150, f1: 47, pitchTau: 0.030, decay: 0.30, dur: 0.62, drive: 1.7, click: 0.20 },
    lofi:     { f0: 130, f1: 50, pitchTau: 0.036, decay: 0.26, dur: 0.55, drive: 1.2, click: 0.10 },
    trap:     { f0: 180, f1: 52, pitchTau: 0.018, decay: 0.18, dur: 0.40, drive: 2.2, click: 0.32 },
    drill:    { f0: 195, f1: 55, pitchTau: 0.015, decay: 0.15, dur: 0.34, drive: 2.5, click: 0.38 },
    house:    { f0: 160, f1: 50, pitchTau: 0.020, decay: 0.17, dur: 0.32, drive: 1.6, click: 0.28 },
    phonk:    { f0: 175, f1: 50, pitchTau: 0.020, decay: 0.17, dur: 0.36, drive: 2.7, click: 0.30 },
    rock:     { f0: 145, f1: 48, pitchTau: 0.026, decay: 0.24, dur: 0.52, drive: 1.55, click: 0.26 },
    rock80s:  { f0: 160, f1: 50, pitchTau: 0.022, decay: 0.20, dur: 0.44, drive: 1.9, click: 0.32 },
    modernrap:{ f0: 170, f1: 46, pitchTau: 0.016, decay: 0.26, dur: 0.50, drive: 2.4, click: 0.30 },
    reggae:   { f0: 120, f1: 42, pitchTau: 0.040, decay: 0.34, dur: 0.70, drive: 1.3, click: 0.08 },
    jazz:     { f0: 110, f1: 55, pitchTau: 0.030, decay: 0.12, dur: 0.22, drive: 1.1, click: 0.06 },
    dnb:      { f0: 190, f1: 52, pitchTau: 0.012, decay: 0.11, dur: 0.22, drive: 2.4, click: 0.42 },
    funk:     { f0: 155, f1: 48, pitchTau: 0.018, decay: 0.14, dur: 0.28, drive: 1.8, click: 0.34 },
    reggaeton:{ f0: 140, f1: 48, pitchTau: 0.024, decay: 0.22, dur: 0.42, drive: 1.8, click: 0.18 },
    afrobeats:{ f0: 150, f1: 50, pitchTau: 0.020, decay: 0.16, dur: 0.30, drive: 1.7, click: 0.28 },
    bossa:    { f0: 115, f1: 52, pitchTau: 0.034, decay: 0.16, dur: 0.30, drive: 1.05, click: 0.05 },
    synthwave:{ f0: 165, f1: 50, pitchTau: 0.016, decay: 0.14, dur: 0.28, drive: 1.9, click: 0.36 }
  };

  function addKick(out, start, vel, cfg, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(cfg.dur * SR), out.length - start);
    var ph = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var f = cfg.f1 + (cfg.f0 - cfg.f1) * Math.exp(-t / cfg.pitchTau);
      ph += f / SR;
      var env = (1 - Math.exp(-t / 0.0015)) * Math.exp(-t / cfg.decay);
      var s = sine(ph) * env;
      if (t < 0.012) s += (rng() * 2 - 1) * (1 - t / 0.012) * cfg.click;
      s = Math.tanh(s * cfg.drive) * 0.92;
      out[start + i] += s * vel;
    }
  }

  function addSnare(out, start, vel, soft, rng) {
    if (start >= out.length) return;
    var dur = soft ? 0.34 : 0.30;
    var n = Math.min(Math.floor(dur * SR), out.length - start);
    var p1 = 0, p2 = 0;
    var prevX = 0, prevY = 0;
    var hpA = Math.exp(-TAU * 1100 / SR);
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * 6200 / SR);
    var noiseDecay = soft ? 0.15 : 0.12;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p1 += 188 / SR;
      p2 += 283 / SR;
      var tone = (sine(p1) * 0.62 + sine(p2) * 0.38) * Math.exp(-t / 0.055);
      var noise = rng() * 2 - 1;
      var hp = hpA * (prevY + noise - prevX);
      prevX = noise; prevY = hp;
      lp += lpA * (hp - lp);
      var nEnv = Math.min(1, t / 0.001) * Math.exp(-t / noiseDecay);
      var click = t < 0.004 ? (rng() * 2 - 1) * (1 - t / 0.004) * 0.3 : 0;
      var s = tone * 0.55 + lp * (soft ? 1.0 : 1.15) * nEnv + click;
      out[start + i] += Math.tanh(s * 1.15) * vel * 0.8;
    }
  }

  /* 80 年代 gated reverb 军鼓：噪声尾巴在约 0.22 秒处被突然切断 */
  function addGatedSnare(out, start, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(0.26 * SR), out.length - start);
    var p1 = 0, p2 = 0;
    var prevX = 0, prevY = 0;
    var hpA = Math.exp(-TAU * 900 / SR);
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * 7000 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p1 += 190 / SR;
      p2 += 285 / SR;
      var tone = (sine(p1) * 0.6 + sine(p2) * 0.4) * Math.exp(-t / 0.05);
      var noise = rng() * 2 - 1;
      var hp = hpA * (prevY + noise - prevX);
      prevX = noise; prevY = hp;
      lp += lpA * (hp - lp);
      var gate = t < 0.21 ? 1 : Math.exp(-(t - 0.21) / 0.002);
      var nEnv = Math.min(1, t / 0.001) * Math.exp(-t / 0.14) * gate;
      out[start + i] += Math.tanh((tone * 0.6 + lp * 1.3 * nEnv) * 1.2) * vel * 0.8;
    }
  }

  function addClap(out, start, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(0.30 * SR), out.length - start);
    var offsets = [0, 0.009, 0.019, 0.028];
    var prevX = 0, prevY = 0;
    var hpA = Math.exp(-TAU * 900 / SR);
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * 4000 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var env = 0;
      for (var k = 0; k < offsets.length; k++) {
        var dt = t - offsets[k];
        if (dt >= 0) env = Math.max(env, Math.exp(-dt / 0.013));
      }
      env += 0.16 * Math.exp(-t / 0.15);
      var noise = rng() * 2 - 1;
      var hp = hpA * (prevY + noise - prevX);
      prevX = noise; prevY = hp;
      lp += lpA * (hp - lp);
      out[start + i] += lp * env * vel * 0.62;
    }
  }

  function addHat(out, start, vel, open, rng) {
    if (start >= out.length) return;
    var dur = open ? 0.32 : 0.075;
    var n = Math.min(Math.floor(dur * SR), out.length - start);
    var pos = rng() * (METAL.length - 4000);
    var rate = 0.92 + rng() * 0.16;
    var prevX = 0, prevY = 0;
    var hpA = Math.exp(-TAU * (open ? 5000 : 6200) / SR);
    var decay = open ? 0.13 : 0.020;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var src = METAL[pos | 0];
      pos += rate;
      if (pos >= METAL.length - 2) pos -= METAL.length - 4000;
      var hp = hpA * (prevY + src - prevX);
      prevX = src; prevY = hp;
      var env = Math.min(1, t / 0.0008) * Math.exp(-t / decay);
      out[start + i] += hp * env * vel * 2.0;
    }
  }

  function addRim(out, start, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(0.10 * SR), out.length - start);
    var p = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p += 420 / SR;
      var env = Math.min(1, t / 0.001) * Math.exp(-t / 0.016);
      var s = sine(p) * 0.7 + (rng() * 2 - 1) * 0.5 * Math.exp(-t / 0.006);
      out[start + i] += Math.tanh(s * 1.3) * env * vel * 0.65;
    }
  }

  function addShaker(out, start, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(0.09 * SR), out.length - start);
    var prevX = 0, prevY = 0;
    var hpA = Math.exp(-TAU * 3500 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var noise = rng() * 2 - 1;
      var hp = hpA * (prevY + noise - prevX);
      prevX = noise; prevY = hp;
      var env = Math.min(1, t / 0.006) * Math.exp(-t / 0.045);
      out[start + i] += hp * env * vel * 0.7;
    }
  }

  function addCrash(out, start, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(1.4 * SR), out.length - start);
    var prevX = 0, prevY = 0, prevX2 = 0, prevY2 = 0;
    var a1 = Math.exp(-TAU * 3200 / SR);
    var a2 = Math.exp(-TAU * 6000 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var noise = rng() * 2 - 1;
      var hp = a1 * (prevY + noise - prevX); prevX = noise; prevY = hp;
      var sh = a2 * (prevY2 + noise - prevX2); prevX2 = noise; prevY2 = sh;
      var env = Math.min(1, t / 0.006) * Math.exp(-t / 0.55);
      var shimmer = 0.75 + 0.25 * Math.sin(TAU * 6.5 * t + 0.7);
      out[start + i] += (hp * 0.6 + sh * 0.4) * env * vel * 0.45 * shimmer;
    }
  }

  function addBass(out, start, freq, dur, vel) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.08) * SR), out.length - start);
    var p = 0, p2 = 0, p3 = 0;
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * 1300 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p += freq / SR; p2 += (freq * 2) / SR; p3 += (freq * 3) / SR;
      var env = Math.min(1, t / 0.005) * (0.62 + 0.38 * Math.exp(-t / 0.12));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.035);
      var s = (sine(p) + 0.28 * sine(p2) + 0.10 * sine(p3)) * env;
      s = Math.tanh(s * 1.25);
      lp += lpA * (s - lp);
      out[start + i] += lp * vel * 0.75;
    }
  }

  function add808(out, start, freq, dur, vel, fromFreq, glide) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.10) * SR), out.length - start);
    var p = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var f = freq;
      if (fromFreq && glide > 0 && t < glide) f = fromFreq + (freq - fromFreq) * (t / glide);
      f *= 1 + 0.05 * Math.exp(-t / 0.03);
      p += f / SR;
      var env = Math.min(1, t / 0.004) * (0.72 + 0.28 * Math.exp(-t / 0.9));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.05);
      var s = Math.tanh(sine(p) * 2.3) * env;
      out[start + i] += s * vel * 0.72;
    }
  }

  /* 电贝斯：基频 + 少量锯齿谐波 + 拨片瞬态 */
  function addRockBass(out, start, freq, dur, vel) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.09) * SR), out.length - start);
    var p1 = 0, p2 = 0;
    var lp = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p1 += freq / SR;
      p2 += (freq * 2.006) / SR;
      var s = sine(p1) * 0.82 + saw(p2) * 0.20;
      var cutoff = 420 + 1500 * Math.exp(-t / 0.07);
      var a = 1 - Math.exp(-TAU * cutoff / SR);
      lp += a * (s - lp);
      var env = Math.min(1, t / 0.003) * (0.72 + 0.28 * Math.exp(-t / 0.28));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.04);
      var pick = t < 0.004 ? (i % 2 ? 0.18 : -0.18) * (1 - t / 0.004) : 0;
      out[start + i] += Math.tanh((lp + pick) * 1.7) * 0.55 * env * vel;
    }
  }

  /* 失真电吉他：三振荡器失谐 + 拨片瞬态 + 时变低通 + 软削波 */
  function addGuitar(out, start, freq, dur, vel, opts) {
    if (start >= out.length) return;
    opts = opts || {};
    var palm = !!opts.palm;
    var lead = !!opts.lead;
    var rng = opts.rng || Math.random;
    var tail = lead ? 0.22 : (palm ? 0.07 : 0.16);
    var n = Math.min(Math.floor((dur + tail) * SR), out.length - start);
    var p1 = 0, p2 = 0, p3 = 0;
    var det = 0.0045;
    var lp = 0;
    var cab = 0;
    var cabA = 1 - Math.exp(-TAU * 4800 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var vib = lead ? 1 + 0.0038 * Math.sin(TAU * 5.1 * t) * Math.min(1, t / 0.22) : 1;
      p1 += (freq * vib) / SR;
      p2 += (freq * (1 + det) * vib) / SR;
      p3 += (freq * (1 - det) * vib) / SR;
      var osc = saw(p1) * 0.46 + saw(p2) * 0.32 + saw(p3) * 0.22;
      var cutoff = palm ? (720 + 2200 * Math.exp(-t / 0.035))
        : (1300 + (lead ? 4300 : 5200) * Math.exp(-t / 0.14));
      var a = 1 - Math.exp(-TAU * cutoff / SR);
      lp += a * (osc - lp);
      var pick = t < 0.005 ? (rng() * 2 - 1) * (1 - t / 0.005) * 0.18 : 0;
      var env;
      if (palm) env = Math.min(1, t / 0.0025) * Math.exp(-t / 0.14);
      else env = Math.min(1, t / 0.003) * (0.58 + 0.42 * Math.exp(-t / 0.3));
      if (t > dur) env *= Math.exp(-(t - dur) / (lead ? 0.12 : 0.045));
      var drive = palm ? 4.0 : (lead ? 3.1 : 3.5);
      var raw = Math.tanh((lp * 1.65 + pick) * drive);
      cab += cabA * (raw - cab);
      out[start + i] += cab * 0.38 * env * vel;
    }
  }

  /* ---------- 吉他信号链：破音 → 音箱 EQ → 箱体 → 合唱 / 延迟 ---------- */

  function Biquad(type, f, q, gainDb) {
    var A = Math.pow(10, (gainDb || 0) / 40);
    var w0 = TAU * f / SR;
    var cw = Math.cos(w0), sw = Math.sin(w0);
    var alpha = sw / (2 * q);
    var b0, b1, b2, a0, a1, a2;
    if (type === 'lp') {
      b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = (1 - cw) / 2;
      a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    } else if (type === 'hp') {
      b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = (1 + cw) / 2;
      a0 = 1 + alpha; a1 = -2 * cw; a2 = 1 - alpha;
    } else {
      b0 = 1 + alpha * A; b1 = -2 * cw; b2 = 1 - alpha * A;
      a0 = 1 + alpha / A; a1 = -2 * cw; a2 = 1 - alpha / A;
    }
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0;
    this.a1 = a1 / a0; this.a2 = a2 / a0;
    this.x1 = 0; this.x2 = 0; this.y1 = 0; this.y2 = 0;
  }
  Biquad.prototype.run = function (buf) {
    var b0 = this.b0, b1 = this.b1, b2 = this.b2, a1 = this.a1, a2 = this.a2;
    var x1 = this.x1, x2 = this.x2, y1 = this.y1, y2 = this.y2;
    for (var i = 0; i < buf.length; i++) {
      var x = buf[i];
      var y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x; y2 = y1; y1 = y;
      buf[i] = y;
    }
    this.x1 = x1; this.x2 = x2; this.y1 = y1; this.y2 = y2;
  };

  function rmsOfBuf(buf) {
    var s = 0;
    for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    return Math.sqrt(s / Math.max(1, buf.length));
  }

  /* 按风格给出“效果器板 + 音箱”预设 */
  function guitarPreset(spec, role) {
    var s = spec.style;
    if (role === 'lead') {
      return { drive: 3.2, tight: 110, midFreq: 900, midQ: 0.8, midDb: 2.5, presDb: 4, cabLp: 6000,
        chorus: 0, delayMs: 340, delayMix: 0.22, delayFb: 0.32 };
    }
    if (s === 'rock80s') {
      return { drive: 4.0, tight: 100, midFreq: 1000, midQ: 0.9, midDb: 1.5, presDb: 4.5, cabLp: 6000,
        chorus: 0.35, delayMs: 260, delayMix: 0.16, delayFb: 0.25 };
    }
    if (s === 'rock') {
      return { drive: 5.0, tight: 95, midFreq: 720, midQ: 0.9, midDb: -3.5, presDb: 3, cabLp: 5200,
        chorus: 0, delayMs: 120, delayMix: 0.10, delayFb: 0.18 };
    }
    return { drive: 3.6, tight: 95, midFreq: 800, midQ: 0.9, midDb: -1.5, presDb: 2, cabLp: 5000,
      chorus: 0, delayMs: 0, delayMix: 0, delayFb: 0 };
  }

  function applyGuitarChain(buf, p) {
    var rmsIn = rmsOfBuf(buf);
    if (rmsIn < 1e-7) return;

    new Biquad('hp', p.tight, 0.7).run(buf);
    new Biquad('lp', 6200, 0.7).run(buf);

    /* 破音：轻微不对称 + 软削波，产生偶次谐波，比方波/锯齿更“温” */
    var d = p.drive;
    for (var i = 0; i < buf.length; i++) {
      var x = buf[i] * d;
      buf[i] = Math.tanh(x + 0.08 * x * x) / Math.tanh(d);
    }
    new Biquad('hp', 22, 0.7).run(buf);

    /* 音箱 EQ：中频凹陷 + 存在感 */
    new Biquad('peak', p.midFreq, p.midQ, p.midDb).run(buf);
    new Biquad('peak', 3000, 1.0, p.presDb).run(buf);

    /* 4×12 箱体：低切、高切、箱体共振峰 */
    new Biquad('hp', 85, 0.7).run(buf);
    new Biquad('lp', p.cabLp, 0.7).run(buf);
    new Biquad('peak', 2200, 1.4, 3).run(buf);

    if (p.chorus > 0) {
      var cSize = Math.floor(0.04 * SR);
      var cBuf = new Float32Array(cSize);
      var cw = 0;
      for (var c = 0; c < buf.length; c++) {
        var x0 = buf[c];
        cBuf[cw] = x0;
        var lfo = 0.5 + 0.5 * Math.sin(TAU * 0.9 * (c / SR));
        var dly = (0.007 + 0.0035 * lfo) * SR;
        var rp = cw - dly;
        while (rp < 0) rp += cSize;
        var r0 = Math.floor(rp), fr = rp - r0;
        var wet = cBuf[r0 % cSize] * (1 - fr) + cBuf[(r0 + 1) % cSize] * fr;
        buf[c] = x0 * (1 - p.chorus * 0.5) + wet * p.chorus;
        cw = (cw + 1) % cSize;
      }
    }

    if (p.delayMix > 0) {
      var dLen = Math.max(2, Math.floor(p.delayMs / 1000 * SR));
      var dBuf = new Float32Array(dLen);
      var dw = 0, dLp = 0;
      var dA = 1 - Math.exp(-TAU * 3000 / SR);
      for (var e = 0; e < buf.length; e++) {
        var dx = buf[e];
        var dRead = dBuf[dw];
        dLp += dA * (dRead - dLp);
        dBuf[dw] = dx + dLp * p.delayFb;
        dw = (dw + 1) % dLen;
        buf[e] = dx + dRead * p.delayMix;
      }
    }

    var rmsOut = rmsOfBuf(buf);
    var g = rmsOut > 1e-7 ? clamp(rmsIn / rmsOut, 0.2, 1.2) : 1;
    for (var k = 0; k < buf.length; k++) buf[k] *= g;
  }

  /* 摇滚踩镲：噪声为主，比电子踩镲更“沙” */
  function addRockHat(out, start, vel, open, rng) {
    if (start >= out.length) return;
    var dur = open ? 0.34 : 0.075;
    var n = Math.min(Math.floor(dur * SR), out.length - start);
    var a1 = Math.exp(-TAU * (open ? 5200 : 7000) / SR);
    var a2 = Math.exp(-TAU * 9000 / SR);
    var x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    var decay = open ? 0.145 : 0.022;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var nz = rng() * 2 - 1;
      var hp = a1 * (y1 + nz - x1); x1 = nz; y1 = hp;
      var hp2 = a2 * (y2 + hp - x2); x2 = hp; y2 = hp2;
      var env = Math.min(1, t / 0.0006) * Math.exp(-t / decay);
      out[start + i] += (hp * 0.55 + hp2 * 0.85) * env * vel * (open ? 1.45 : 1.7);
    }
  }

  /* 架子鼓通鼓 */
  function addTom(out, start, vel, freq, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(0.38 * SR), out.length - start);
    var p = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var f = freq * (0.72 + 0.28 * Math.exp(-t / 0.055));
      p += f / SR;
      var env = Math.min(1, t / 0.002) * Math.exp(-t / 0.16);
      var noise = (rng() * 2 - 1) * 0.22 * Math.exp(-t / 0.025);
      var s = sine(p) * 0.9 + sine(p * 1.5) * 0.16 + noise;
      out[start + i] += Math.tanh(s * 1.35) * env * vel * 0.62;
    }
  }

  function addEP(out, start, freq, dur, vel, cfg) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.28) * SR), out.length - start);
    var p = 0, mp = 0;
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * cfg.lp / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var idx = cfg.index * Math.exp(-t / 0.35) * Math.min(1, t / 0.002);
      p += freq / SR;
      mp += (freq * cfg.ratio) / SR;
      var s = sine(p + idx * sine(mp));
      var env = Math.min(1, t / 0.004) * (0.42 + 0.58 * Math.exp(-t / cfg.decay));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.14);
      lp += lpA * (s - lp);
      var trem = 1 + 0.05 * Math.sin(TAU * 4.2 * t);
      out[start + i] += lp * env * vel * 0.55 * trem;
    }
  }

  function addPluck(out, start, freq, dur, vel, soft, rng) {
    if (start >= out.length) return;
    var N = Math.max(2, Math.round(SR / freq));
    var line = new Float32Array(N);
    var lp = 0;
    for (var k = 0; k < N; k++) {
      var nz = rng() * 2 - 1;
      lp += 0.32 * (nz - lp);
      line[k] = lp * 1.7;
    }
    var n = Math.min(Math.floor((dur + 0.15) * SR), out.length - start);
    var damp = soft ? 0.9990 : 0.99935;
    var idx = 0;
    var body = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var v = line[idx];
      var nx = line[(idx + 1) % N];
      line[idx] = (v + nx) * 0.5 * damp;
      var env = Math.min(1, t / 0.003) * Math.exp(-t / (soft ? 0.45 : 0.65));
      // 一点点基频身体，避免太单薄
      body += freq / SR;
      var s = v + sine(body) * 0.08 * Math.exp(-t / 0.18);
      out[start + i] += s * env * vel * 0.7;
      idx = (idx + 1) % N;
    }
  }

  /* 笛子：正弦基音 + 少量二三次泛音、延迟起的颤音、气息噪声、慢起音 */
  function addFlute(out, start, freq, dur, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.25) * SR), out.length - start);
    var p = 0;
    var breath = 0;
    var nA = 1 - Math.exp(-TAU * 3000 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var vib = t > 0.22 ? Math.sin(TAU * 5.4 * t) * 0.007 * Math.min(1, (t - 0.22) / 0.3) : 0;
      p += (freq * (1 + vib)) / SR;
      var tone = sine(p) + 0.14 * sine(p * 2) + 0.05 * sine(p * 3);
      breath += nA * ((rng() * 2 - 1) - breath);
      var attack = Math.min(1, t / 0.09);
      var env = attack * (t > dur ? Math.exp(-(t - dur) / 0.1) : 1);
      var airy = breath * 0.16 * (1 - Math.min(1, t / 0.5) * 0.5);
      out[start + i] += (tone * 0.42 + airy) * env * vel;
    }
  }

  function addBell(out, start, freq, dur, vel, dark) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.6) * SR), out.length - start);
    var p = 0, mp = 0;
    var idx0 = dark ? 0.34 : 0.5;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var idx = idx0 * Math.exp(-t / 0.25) * Math.min(1, t / 0.002);
      p += freq / SR;
      mp += (freq * 3.5) / SR;
      var s = sine(p + idx * sine(mp)) + 0.3 * sine(p);
      var env = Math.min(1, t / 0.003) * Math.exp(-t / (dark ? 0.55 : 0.7));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.12);
      out[start + i] += s * env * vel * 0.35;
    }
  }

  function addOrgan(out, start, freq, dur, vel) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.06) * SR), out.length - start);
    var p1 = 0, p2 = 0, p3 = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p1 += freq / SR;
      p2 += (freq * 2.003) / SR;
      p3 += (freq * 2.997) / SR;
      var s = sine(p1) * 0.72 + sine(p2) * 0.2 + sine(p3) * 0.08;
      var env = Math.min(1, t / 0.01);
      if (t > dur) env *= Math.exp(-(t - dur) / 0.028);
      var click = t < 0.025 ? Math.exp(-t / 0.01) * 0.3 : 0;
      out[start + i] += (s * 0.5 + click * sine(p2)) * env * vel * 0.4;
    }
  }

  function addRide(out, start, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor(0.5 * SR), out.length - start);
    var p = 0, prevX = 0, prevY = 0;
    var hpA = Math.exp(-TAU * 4800 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p += 370 / SR;
      var ping = sine(p) * Math.exp(-t / 0.16);
      var nz = rng() * 2 - 1;
      var hp = hpA * (prevY + nz - prevX);
      prevX = nz; prevY = hp;
      var env = Math.min(1, t / 0.001) * Math.exp(-t / 0.2);
      out[start + i] += (ping * 0.4 + hp * 0.4) * env * vel * 0.65;
    }
  }

  function addPulse(out, start, freq, dur, vel) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.04) * SR), out.length - start);
    var p = 0, p2 = 0, lp = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p += freq / SR;
      p2 += (freq * 1.007) / SR;
      var sq = (sine(p) >= 0 ? 0.55 : -0.55) + saw(p2) * 0.22;
      var cutoff = 1600 + 2400 * Math.exp(-t / 0.07);
      var a = 1 - Math.exp(-TAU * cutoff / SR);
      lp += a * (sq - lp);
      var env = Math.min(1, t / 0.003) * Math.exp(-t / 0.11);
      if (t > dur) env *= Math.exp(-(t - dur) / 0.018);
      out[start + i] += lp * env * vel * 0.22;
    }
  }

  function addStab(out, start, freq, dur, vel, detune, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.10) * SR), out.length - start);
    var ph = [0, 0, 0];
    var dets = [-0.007, 0, 0.006];
    var lp = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var s = 0;
      for (var k = 0; k < 3; k++) {
        ph[k] += (freq * (1 + dets[k] * detune)) / SR;
        s += saw(ph[k]);
      }
      s /= 3;
      var cutoff = 800 + 4200 * Math.exp(-t / 0.09);
      var a = 1 - Math.exp(-TAU * cutoff / SR);
      lp += a * (s - lp);
      var env = Math.min(1, t / 0.004) * Math.exp(-t / (dur * 0.5));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.03);
      out[start + i] += lp * env * vel * 0.34;
    }
  }

  function addPad(out, start, freq, dur, vel) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.4) * SR), out.length - start);
    var ph = [0, 0, 0];
    var dets = [-0.004, 0, 0.005];
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * 2200 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var s = 0;
      for (var k = 0; k < 3; k++) {
        ph[k] += (freq * (1 + dets[k])) / SR;
        s += saw(ph[k]);
      }
      s /= 3;
      lp += lpA * (s - lp);
      var env = Math.min(1, t / 0.18) * (0.7 + 0.3 * Math.exp(-t / 1.2));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.25);
      out[start + i] += lp * env * vel * 0.16;
    }
  }

  function addCowbell(out, start, freq, dur, vel) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.05) * SR), out.length - start);
    var p1 = 0, p2 = 0;
    var prevX = 0, prevY = 0;
    var hpA = Math.exp(-TAU * 700 / SR);
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * 4800 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p1 += freq / SR;
      p2 += (freq * 1.48) / SR;
      var sq = (sine(p1) >= 0 ? 0.5 : -0.5) + (sine(p2) >= 0 ? 0.5 : -0.5);
      var hp = hpA * (prevY + sq - prevX);
      prevX = sq; prevY = hp;
      lp += lpA * (hp - lp);
      var env = Math.min(1, t / 0.002) * Math.exp(-t / 0.075);
      if (t > dur) env *= Math.exp(-(t - dur) / 0.02);
      out[start + i] += Math.tanh(lp * 1.6) * env * vel * 0.7;
    }
  }

  /* 原声钢琴：基频 + 二次/三次泛音 + 短促击弦噪声 */
  function addPiano(out, start, freq, dur, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.55) * SR), out.length - start);
    var p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    var decay = 0.9 + 0.5 * (220 / Math.max(80, freq));
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      p1 += freq / SR;
      p2 += (freq * 2.002) / SR;
      p3 += (freq * 3.004) / SR;
      p4 += (freq * 4.01) / SR;
      var body = sine(p1) * 0.66 + sine(p2) * 0.22 + sine(p3) * 0.09 + sine(p4) * 0.03;
      var hammer = t < 0.012 ? (rng() * 2 - 1) * (1 - t / 0.012) * 0.16 : 0;
      var env = Math.min(1, t / 0.0025) * Math.exp(-t / decay);
      if (t > dur) env *= Math.exp(-(t - dur) / 0.16);
      out[start + i] += (body + hammer) * env * vel * 0.42;
    }
  }

  /* 弦乐合奏：三个微失谐锯齿波，慢起音，柔和低通 */
  function addStrings(out, start, freq, dur, vel) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.55) * SR), out.length - start);
    var ph = [0, 0, 0, 0];
    var dets = [-0.006, -0.002, 0.002, 0.006];
    var lp = 0;
    var lpA = 1 - Math.exp(-TAU * 2400 / SR);
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      var s = 0;
      for (var k = 0; k < 4; k++) {
        ph[k] += (freq * (1 + dets[k])) / SR;
        s += saw(ph[k]);
      }
      s /= 4;
      lp += lpA * (s - lp);
      var env = Math.min(1, t / 0.16) * (0.78 + 0.22 * Math.exp(-t / 1.4));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.3);
      out[start + i] += lp * env * vel * 0.17;
    }
  }

  /* 萨克斯：锯齿 + 方波、颤音、气声，带一点共鸣感 */
  function addSax(out, start, freq, dur, vel, rng) {
    if (start >= out.length) return;
    var n = Math.min(Math.floor((dur + 0.22) * SR), out.length - start);
    var p1 = 0, p2 = 0, lp = 0;
    var lpA = 1 - Math.exp(-TAU * 2700 / SR);
    var vib = 0;
    for (var i = 0; i < n; i++) {
      var t = i / SR;
      vib += TAU * 5.2 / SR;
      var f = freq * (1 + 0.006 * sine(vib) * Math.min(1, t / 0.18));
      p1 += f / SR;
      p2 += (f * 2.003) / SR;
      var s = saw(p1) * 0.62 + (sine(p2) >= 0 ? 0.18 : -0.18);
      var breath = (rng() * 2 - 1) * 0.10 * Math.exp(-t / 0.09);
      lp += lpA * (s + breath - lp);
      var env = Math.min(1, t / 0.035) * (0.82 + 0.18 * Math.min(1, t / 0.4));
      if (t > dur) env *= Math.exp(-(t - dur) / 0.09);
      out[start + i] += Math.tanh(lp * 1.25) * env * vel * 0.34;
    }
  }

  /* ============================================================
   * 编曲 / 事件生成
   * ============================================================ */

  /* 每种风格 4 条律动。字符串按 16 分音符写：
     X = 重音, x = 常规, g = 幽灵音, o = 开镲, . = 空拍。 */
  var GROOVE_BANK = {
    boom_bap: {
      kick: ['X.....x...x.....', 'X.....x.x.x.....', 'X..x..x...x.....', 'X.....x...x...x.'],
      snare: ['....X.......X...', '....X.......X..g', '....X.....g.X...', '....X...g...X...'],
      hats: ['8th', '8thOff', '16th', 'offbeat'],
      perc: ['rim', 'shaker8', 'rim', 'shaker16'],
      fill: 'snare', soft: true
    },
    lofi: {
      kick: ['X.....x...x.....', 'X.....x.x.x.....', 'X..x..x...x.....', 'X.....x...x...x.'],
      snare: ['....X.......X...', '....X.......X..g', '....X.....g.X...', '....X...g...X...'],
      hats: ['8th', 'sparse', '16th', 'offbeat'],
      perc: ['shaker8', 'shaker8', 'shaker16', 'rim'],
      fill: 'snare', soft: true
    },
    trap: {
      kick: ['X.....x...x.....', 'X.....x.x.x.....', 'X.....x...x..x..', 'X..x..x...x.....'],
      snare: ['........X.......', '........X.....g.', '........X...g...', '....g...X.......'],
      hats: ['16th', '16thRoll', '8th', '16th'],
      perc: ['none', 'rim', 'none', 'rim'],
      clap: true, fill: 'hatroll'
    },
    drill: {
      kick: ['X......x..x.....', 'X......x..x..x..', 'X..x...x..x.....', 'X......x.....x..'],
      snare: ['........X.......', '........X.....g.', '........X...X...', '....g...X.......'],
      hats: ['16th', '16thRoll', '8th', '16th'],
      perc: ['none', 'rim', 'none', 'rim'],
      clap: true, fill: 'hatroll'
    },
    modernrap: {
      kick: ['X.....x...x.....', 'X.....x.x.x.....', 'X.....x...x..x..', 'X..x..x...x.....'],
      snare: ['........X.......', '........X.....g.', '........X...g...', '........X..g....'],
      hats: ['16thRoll', '16th', '16thRoll', '8th'],
      perc: ['none', 'none', 'rim', 'rim'],
      clap: true, fill: 'hatroll'
    },
    house: {
      kick: ['X...X...X...X...', 'X...X...X...X...', 'X...X...X...X...', 'X...X...X...X...'],
      snare: ['....x.......x...', '....x.......x...', '....x.......x..g', '....x.....g.x...'],
      hats: ['offbeatOpen16', 'offbeatOpen', '16th', 'offbeatOpen16'],
      perc: ['shaker8', 'shaker16', 'shaker16', 'shaker8'],
      fill: 'snare'
    },
    phonk: {
      kick: ['X.....x...x.....', 'X.....x.x.x.....', 'X..x..x...x.....', 'X.....x...x..x..'],
      snare: ['....X.......X...', '....X.......X..g', '....X.....g.X...', '....X...g...X...'],
      hats: ['8th', '8thOff', '16th', 'offbeat'],
      perc: ['rim', 'none', 'rim', 'shaker8'],
      fill: 'snare'
    },
    rock: {
      kick: ['X.......X.......', 'X.......X...x...', 'X...x...X.......', 'X.....x.X...x...'],
      snare: ['....X.......X...', '....X.......X..g', '....X.....g.X...', '....X...g...X...'],
      hats: ['8th', '8th', '16th', 'offbeat'],
      perc: ['none', 'none', 'none', 'none'],
      fill: 'tom', crashEvery: 4
    },
    rock80s: {
      kick: ['X.......X.......', 'X.......X...x...', 'X...x...X.......', 'X.......X.....x.'],
      snare: ['....X.......X...', '....X.......X...', '....X.......X..g', '....X.....g.X...'],
      hats: ['8th', '8th', '16th', 'offbeat'],
      perc: ['none', 'none', 'none', 'none'],
      gsnare: true, fill: 'tom', crashEvery: 4
    },
    reggae: {
      kick: ['........X.......', '........X.......', 'X...X...X...X...', '........X.......'],
      snare: ['........X.......', '....x...X...x...', '........X.......', '........X.......'],
      hats: ['8thOff', '8thOff', '8th', '16th'],
      perc: ['rim', 'rim', 'shaker8', 'rim'],
      fill: 'snare'
    },
    jazz: {
      kick: ['X...x...X...x...', 'X...x...X...x...', 'X...x...X...x..x', 'X.......X.......'],
      snare: ['....g.......g...', '....g.....g.g...', '....g.......g...', '....g...g...g...'],
      hats: ['ride', 'ride', 'ride', 'ride'],
      perc: ['none', 'none', 'none', 'none'],
      fill: 'snare', swingHats: true
    },
    dnb: {
      kick: ['X.....x...x.....', 'X.....x.x.x.....', 'X.....x...x..x..', 'X..x..x...x.....'],
      snare: ['....X......x.X..', '....X...x..x.X..', '....X.....x.X...', '....X..x...x.X..'],
      hats: ['16th', '16th', '8th', '16thRoll'],
      perc: ['none', 'rim', 'none', 'shaker8'],
      fill: 'hatroll'
    },
    funk: {
      kick: ['X..x..x...x.....', 'X..x..x...x..x..', 'X..x....x.x.....', 'X..x..x...x.....'],
      snare: ['....X.......X...', '....X.....g.X..g', '....X..g....X...', '....X.....g.X...'],
      hats: ['16th', '16th', '16th', '16th'],
      perc: ['none', 'rim', 'none', 'tamb'],
      fill: 'snare'
    },
    reggaeton: {
      kick: ['X.....x...x.....', 'X.....x...x..x..', 'X..x..x...x.....', 'X.....x...x.....'],
      snare: ['....X..x....X..x', '....X..x....X..x', '....X..x....X..g', '....X..x..g.X..x'],
      hats: ['8th', '16th', '8th', 'offbeat'],
      perc: ['shaker16', 'shaker16', 'shaker8', 'shaker16'],
      fill: 'snare'
    },
    afrobeats: {
      kick: ['X..x..x...x.....', 'X..x..x..x......', 'X..x..x...x..x..', 'X..x..x...x.....'],
      snare: ['....X.......X...', '....X..g....X...', '....X.......X..g', '....X...g...X...'],
      hats: ['8th', '16th', 'offbeat', '16th'],
      perc: ['shaker16', 'shaker16', 'shaker8', 'tamb'],
      fill: 'tom'
    },
    bossa: {
      kick: ['X.........x.....', 'X.........x.....', 'X.........x..x..', 'X.........x.....'],
      snare: ['X..x..X...x.X...', 'X..x..X...x.....', 'X..x..X...x.X..x', 'X..x..X.....X...'],
      hats: ['8th', 'sparse', '8th', 'none'],
      perc: ['none', 'none', 'shaker8', 'none'],
      fill: 'none', soft: true
    },
    synthwave: {
      kick: ['X...X...X...X...', 'X...X...X...X...', 'X...X...X...X...', 'X...X...X...X...'],
      snare: ['....X.......X...', '....X.......X...', '....X.......X..g', '....X.....g.X...'],
      hats: ['8th', '8th', '16th', 'offbeat'],
      perc: ['none', 'none', 'none', 'none'],
      gsnare: true, fill: 'tom', crashEvery: 4
    }
  };

  var KICK_OVERRIDES = {
    four: 'X...X...X...X...',
    one_drop: '........X.......',
    steppers: 'X...X...X...X...',
    dembow: 'X.....x...x.....',
    breakbeat: 'X.....x...x..x..',
    half: 'X.......x.......'
  };

  var BASS_BANK = {
    boom_bap: [
      [[0, 1.1, 0], [6, 0.55, 0], [10, 0.6, 7]],
      [[0, 0.9, 0], [4, 0.5, 0], [7, 0.45, 0], [10, 0.6, 7]],
      [[0, 1.4, 0], [6, 0.7, 0], [10, 0.5, 0], [14, 0.4, 7]],
      [[0, 0.8, 0], [3, 0.4, 0], [6, 0.55, 0], [10, 0.6, 7], [13, 0.35, 0]]
    ],
    lofi: [
      [[0, 2.4, 0], [10, 1.6, 7]],
      [[0, 1.8, 0], [6, 0.9, 0], [10, 1.2, 7]],
      [[0, 2.8, 0], [8, 0.8, 0], [12, 0.9, 7]],
      [[0, 1.2, 0], [5, 0.5, 0], [8, 1.2, 7]]
    ],
    trap: [
      [[0, 2.4, 0], [6, 1.6, 0], [11, 1.8, 7]],
      [[0, 2.2, 0], [7, 1.4, 0], [10, 1.2, 0], [14, 0.6, 7]],
      [[0, 2.0, 0], [4, 1.0, 0], [8, 1.6, 7], [12, 1.4, 0]],
      [[0, 2.6, 0], [6, 0.9, 0], [8, 0.8, 0], [11, 1.6, 7]]
    ],
    drill: [
      [[0, 2.2, 0], [7, 1.6, 5], [11, 1.8, 0]],
      [[0, 2.0, 0], [3, 0.9, 0], [7, 1.4, 5], [11, 1.6, 0]],
      [[0, 2.4, 0], [7, 1.0, 0], [10, 1.0, 5], [13, 1.2, 0]],
      [[0, 1.8, 0], [6, 0.8, 0], [9, 1.2, 5], [12, 1.6, 0]]
    ],
    modernrap: [
      [[0, 2.2, 0], [6, 1.4, 0], [11, 1.8, 7]],
      [[0, 2.0, 0], [5, 0.9, 0], [8, 1.2, 0], [12, 1.4, 7]],
      [[0, 2.6, 0], [7, 1.2, 5], [11, 1.6, 0]],
      [[0, 1.6, 0], [4, 0.7, 0], [8, 1.2, 7], [12, 0.9, 0], [14, 0.5, 0]]
    ],
    house: [
      [[0, 0.34, 0], [2, 0.34, 0], [4, 0.34, 0], [6, 0.34, 0], [8, 0.34, 0], [10, 0.34, 0], [12, 0.34, 0], [14, 0.34, 7]],
      [[0, 0.4, 0], [3, 0.3, 0], [6, 0.4, 0], [10, 0.4, 7], [14, 0.3, 0]],
      [[0, 0.9, 0], [4, 0.9, 0], [8, 0.9, 7], [12, 0.9, 0]],
      [[2, 0.3, 0], [6, 0.3, 0], [10, 0.3, 7], [14, 0.3, 0]]
    ],
    rock: [
      [[0, 0.42, 0], [2, 0.42, 0], [4, 0.42, 0], [6, 0.42, 0], [8, 0.42, 0], [10, 0.42, 0], [12, 0.42, 0], [14, 0.42, 0]],
      [[0, 0.9, 0], [4, 0.9, 0], [8, 0.9, 0], [12, 0.9, 0]],
      [[0, 0.42, 0], [2, 0.42, 0], [4, 0.42, 0], [6, 0.42, 7], [8, 0.42, 0], [10, 0.42, 0], [12, 0.42, 0], [14, 0.42, 7]],
      [[0, 1.6, 0], [6, 0.4, 0], [8, 1.2, 0], [14, 0.4, 7]]
    ],
    rock80s: [
      [[0, 0.42, 0], [2, 0.42, 0], [4, 0.42, 0], [6, 0.42, 0], [8, 0.42, 0], [10, 0.42, 0], [12, 0.42, 0], [14, 0.42, 7]],
      [[0, 0.9, 0], [4, 0.9, 0], [8, 0.9, 0], [12, 0.9, 7]],
      [[0, 0.42, 0], [2, 0.42, 0], [4, 0.42, 0], [6, 0.42, 7], [8, 0.42, 0], [10, 0.42, 0], [12, 0.42, 0], [14, 0.42, 7]],
      [[0, 1.4, 0], [6, 0.5, 0], [8, 1.0, 7], [14, 0.5, 0]]
    ],
    phonk: [
      [[0, 0.3, 0], [2, 0.3, 0], [4, 0.3, 0], [6, 0.3, 0], [8, 0.3, 0], [10, 0.3, 0], [12, 0.3, 0], [14, 0.3, 7]],
      [[0, 0.5, 0], [3, 0.3, 0], [6, 0.5, 0], [10, 0.5, 7], [13, 0.3, 0]],
      [[0, 1.2, 0], [6, 0.8, 0], [10, 1.0, 7]],
      [[0, 0.4, 0], [4, 0.4, 0], [8, 0.4, 7], [12, 0.4, 0], [14, 0.3, 0]]
    ],
    dnb: [
      [[0, 0.55, 0], [6, 0.35, 5], [10, 0.4, 0], [14, 0.28, 0]],
      [[0, 0.45, 0], [4, 0.3, 0], [7, 0.3, 5], [10, 0.4, 0], [13, 0.3, 0]],
      [[0, 0.7, 0], [6, 0.4, 0], [10, 0.5, 7], [12, 0.3, 0]],
      [[0, 0.35, 0], [3, 0.3, 0], [6, 0.35, 5], [9, 0.3, 0], [12, 0.35, 0], [15, 0.25, 7]]
    ],
    funk: [
      [[0, 0.22, 0], [3, 0.22, 0], [6, 0.22, 7], [7, 0.22, 0], [10, 0.22, 12], [12, 0.22, 0], [14, 0.22, 7]],
      [[0, 0.2, 0], [2, 0.2, 0], [4, 0.2, 7], [6, 0.2, 0], [8, 0.2, 0], [11, 0.2, 12], [13, 0.2, 0], [15, 0.2, 7]],
      [[0, 0.35, 0], [3, 0.3, 7], [6, 0.35, 0], [10, 0.35, 0], [14, 0.3, 7]],
      [[0, 0.2, 0], [3, 0.2, 0], [6, 0.2, 7], [8, 0.2, 0], [10, 0.2, 12], [12, 0.2, 0], [14, 0.2, 0]]
    ],
    reggaeton: [
      [[0, 0.32, 0], [3, 0.32, 0], [6, 0.32, 7], [8, 0.32, 0], [11, 0.32, 0], [14, 0.32, 7]],
      [[0, 0.4, 0], [6, 0.4, 7], [8, 0.4, 0], [14, 0.4, 7]],
      [[0, 0.3, 0], [3, 0.3, 0], [6, 0.3, 0], [10, 0.3, 7], [12, 0.3, 0], [15, 0.3, 7]],
      [[0, 0.32, 0], [4, 0.32, 0], [8, 0.32, 7], [12, 0.32, 0]]
    ],
    afrobeats: [
      [[0, 0.4, 0], [3, 0.4, 0], [6, 0.4, 7], [10, 0.4, 0], [14, 0.4, 0]],
      [[0, 0.5, 0], [3, 0.4, 0], [6, 0.5, 7], [8, 0.4, 0], [11, 0.4, 0], [14, 0.4, 7]],
      [[0, 0.35, 0], [3, 0.35, 0], [6, 0.35, 0], [10, 0.35, 7], [12, 0.35, 0], [14, 0.35, 0]],
      [[0, 0.8, 0], [4, 0.8, 7], [8, 0.8, 0], [12, 0.8, 7]]
    ],
    synthwave: [
      [[0, 0.42, 0], [2, 0.42, 0], [4, 0.42, 0], [6, 0.42, 7], [8, 0.42, 0], [10, 0.42, 0], [12, 0.42, 0], [14, 0.42, 7]],
      [[0, 0.9, 0], [4, 0.9, 0], [8, 0.9, 7], [12, 0.9, 0]],
      [[0, 0.42, 0], [2, 0.42, 0], [4, 0.42, 7], [6, 0.42, 0], [8, 0.42, 0], [10, 0.42, 7], [12, 0.42, 0], [14, 0.42, 7]],
      [[0, 1.6, 0], [6, 0.5, 7], [8, 1.2, 0], [14, 0.4, 7]]
    ]
  };

  function patternHits(str) {
    var out = [];
    for (var i = 0; i < str.length && i < 16; i++) {
      var c = str.charAt(i);
      if (c === '.' ) continue;
      out.push({ step: i, ch: c });
    }
    return out;
  }

  function hatSteps(mode, energy, last, rng) {
    var out = [];
    var e = energy == null ? 0.5 : energy;
    function p(step, vel, kind) { out.push({ step: step, vel: vel, kind: kind || 'hat' }); }
    if (mode === 'none') return out;
    if (mode === 'sparse') {
      for (var s0 = 0; s0 < 16; s0 += 4) p(s0, 0.42);
      return out;
    }
    if (mode === '8th') {
      for (var s1 = 0; s1 < 16; s1 += 2) p(s1, s1 % 4 === 0 ? 0.58 : (0.34 + e * 0.1));
      return out;
    }
    if (mode === '8thOff') {
      for (var s2 = 0; s2 < 16; s2 += 2) {
        if (s2 % 4 === 2 && rng() < 0.22) continue;
        p(s2, s2 % 4 === 0 ? 0.56 : 0.34);
      }
      return out;
    }
    if (mode === '16th' || mode === '16thRoll') {
      for (var s3 = 0; s3 < 16; s3++) {
        var accent = s3 % 4 === 0;
        p(s3, accent ? 0.56 : (s3 % 2 === 0 ? 0.3 : 0.18 + e * 0.06));
      }
      if (mode === '16thRoll' && last) {
        for (var r = 0; r < 8; r++) p(12 + r * 0.25, 0.2 + r * 0.025);
      }
      return out;
    }
    if (mode === 'offbeat') {
      for (var s4 = 2; s4 < 16; s4 += 4) p(s4, 0.38, 'openhat');
      return out;
    }
    if (mode === 'offbeatOpen') {
      for (var s5 = 2; s5 < 16; s5 += 4) p(s5, 0.38, 'openhat');
      return out;
    }
    if (mode === 'offbeatOpen16') {
      for (var s6 = 0; s6 < 16; s6++) {
        if (s6 % 4 === 2) p(s6, 0.36, 'openhat');
        else p(s6, s6 % 4 === 0 ? 0.5 : 0.2);
      }
      return out;
    }
    if (mode === 'ride') {
      for (var s7 = 0; s7 < 16; s7 += 2) p(s7, s7 % 8 === 0 ? 0.6 : (s7 % 4 === 2 ? 0.44 : 0.34), 'ride');
      return out;
    }
    return out;
  }

  function percSteps(mode, rng) {
    var out = [];
    function p(step, vel, kind) { out.push({ step: step, vel: vel, kind: kind }); }
    if (mode === 'none') return out;
    if (mode === 'shaker8') {
      for (var s = 0; s < 16; s += 2) p(s, s % 4 === 0 ? 0.13 : 0.09, 'shaker');
    } else if (mode === 'shaker16') {
      for (var s2 = 0; s2 < 16; s2++) p(s2, s2 % 4 === 0 ? 0.12 : 0.07, 'shaker');
    } else if (mode === 'rim') {
      [3, 7, 11, 15].forEach(function (x) { if (rng() < 0.8) p(x, 0.2, 'rim'); });
    } else if (mode === 'clave') {
      [0, 3, 6, 10, 12].forEach(function (x) { p(x, 0.22, 'rim'); });
    } else if (mode === 'tamb') {
      for (var s3 = 0; s3 < 16; s3++) if (s3 % 2 === 1) p(s3, 0.08, 'shaker');
    }
    return out;
  }

  function buildEvents(spec, rng) {
    var beatSec = 60 / spec.bpm;
    var stepSec = beatSec / 4;
    var ev = {
      kick: [], snare: [], hat: [], perc: [],
      bass: [], guitar: [], chords: [], melody: [], flute: [], fx: []
    };

    var TRACK_OF = {
      kick: 'kick', snare: 'snare', gsnare: 'snare', clap: 'snare', hat: 'hat', openhat: 'hat', ride: 'hat',
      rim: 'perc', shaker: 'perc', crash: 'perc',
      tomhi: 'perc', tommid: 'perc', tomlo: 'perc'
    };

    function tAt(step, swing, jitter) {
      var s = Math.floor(step);
      var frac = step - s;
      var sw = 0;
      if (swing) {
        var m = s % 4;
        if (m === 2) sw = spec.swing * 0.75;
        else if (m === 1 || m === 3) sw = spec.swing * 0.5;
      }
      var t = (s + frac + sw) * stepSec + (rng() - 0.5) * (jitter || 0);
      return Math.max(0, t);
    }

    // ---- 和声进行
    var prog = pickProgression(spec, rng);
    var ext = spec.ext || 'min';
    if (!spec.ext) {
      if (spec.style === 'lofi') ext = rng() < 0.6 ? '9' : '7';
      else if (spec.style === 'boom_bap' || spec.style === 'house') ext = rng() < 0.7 ? '7' : '9';
      else if (spec.style === 'phonk') ext = '7';
      else if (spec.style === 'jazz' || spec.style === 'bossa') ext = rng() < 0.55 ? '9' : '7';
      else if (spec.style === 'funk') ext = '9';
      else if (spec.style === 'reggae') ext = rng() < 0.5 ? '7' : 'min';
      else if (isTrapish(spec.style)) ext = rng() < 0.3 ? '7' : 'min';
    }

    var bars = [];
    var prevVoicing = null;
    for (var b = 0; b < spec.bars; b++) {
      var deg = prog[b % prog.length];
      var chord = chordMidi(spec, deg, 3, ext);
      var voiced = voiceChord(chord, prevVoicing, 62);
      prevVoicing = voiced;
      bars.push({ degree: deg, chord: voiced, bass: bassMidiFor(spec, deg), gtr: bassMidiFor(spec, deg) + 12 });
    }

    // ---- 鼓组（每种风格 4 条律动，按 seed / 关键词选择）
    var bank = GROOVE_BANK[spec.style] || GROOVE_BANK.boom_bap;
    var variant = (spec.variant == null ? 0 : spec.variant) % 4;
    var energy = spec.energy == null ? 0.5 : spec.energy;
    var soft = (spec.style === 'lofi' || bank.soft) ? 0.86 : 1;
    var kickPat = bank.kick[variant % bank.kick.length];
    if (spec.kickStyle && KICK_OVERRIDES[spec.kickStyle]) kickPat = KICK_OVERRIDES[spec.kickStyle];
    if (spec.halfTime) kickPat = KICK_OVERRIDES.half;
    if (spec.doubleTime && !spec.kickStyle && !spec.halfTime) kickPat = bank.kick[(variant + 2) % bank.kick.length];
    var snarePat = bank.snare[variant % bank.snare.length];
    if (spec.kickStyle === 'one_drop') snarePat = '........X.......';
    if (spec.halfTime) snarePat = '........X.......';
    if (spec.snareStyle === 'none') snarePat = '................';
    var hatMode = spec.hatStyle || bank.hats[variant % bank.hats.length];
    if (spec.noHats) hatMode = 'none';
    if (spec.doubleTime) hatMode = '16thRoll';
    if (energy > 0.74 && (hatMode === '8th' || hatMode === '8thOff' || hatMode === 'sparse')) hatMode = '16th';
    if (energy < 0.3 && (hatMode === '16th' || hatMode === '16thRoll')) hatMode = '8th';
    var percMode = spec.percStyle || bank.perc[variant % bank.perc.length];
    if (spec.shaker) percMode = 'shaker16';
    if (spec.tambourine) percMode = 'tamb';
    var snareKind = bank.gsnare ? 'gsnare' : 'snare';

    for (var bar = 0; bar < spec.bars; bar++) {
      (function (bar) {
        var b0 = bar * 16;
        var last = bar === spec.bars - 1;
        function push(kind, step, vel, jit, sw) {
          if (vel <= 0.01) return;
          var v = clamp(vel * (0.93 + rng() * 0.14), 0.02, 1);
          var track = TRACK_OF[kind] || 'perc';
          ev[track].push({ kind: kind, t: tAt(b0 + step, sw !== false, jit || 0.004), vel: v, midi: 0, bar: bar, step: step });
        }
        function playPattern(str, kind, accent, normal, ghost, sw) {
          patternHits(str).forEach(function (h) {
            var v = h.ch === 'X' ? accent : (h.ch === 'g' ? ghost : normal);
            push(kind, h.step, v * soft, 0.003, sw);
          });
        }
        playPattern(kickPat, 'kick', 1.0, 0.82 + energy * 0.12, 0.34, false);
        playPattern(snarePat, snareKind, 0.95, 0.72, 0.16, false);
        if (bank.clap) {
          patternHits(snarePat).forEach(function (h) {
            if (h.ch === 'X') push('clap', h.step, 0.5 * soft, 0.005, false);
          });
        }
        if (spec.snareStyle === 'clap') {
          for (var ci = ev.snare.length - 1; ci >= 0; ci--) {
            if (ev.snare[ci].bar === bar) ev.snare.splice(ci, 1);
          }
          patternHits(snarePat).forEach(function (h) {
            if (h.ch !== '.') push('clap', h.step, (h.ch === 'X' ? 0.82 : 0.42) * soft, 0.005, false);
          });
        }
        hatSteps(hatMode, energy, last, rng).forEach(function (h) {
          push(h.kind, h.step, h.vel * (1 + (energy - 0.5) * 0.2) * soft, 0.003);
        });
        percSteps(percMode, rng).forEach(function (h) {
          push(h.kind, h.step, h.vel * soft, 0.006, false);
        });
        if (bank.crashEvery && bar % bank.crashEvery === 0) push('crash', 0, 0.4, 0.002, false);
        if (spec.crash && bar === 0) push('crash', 0, 0.5, 0.002, false);
        if (last && !spec.noFills) {
          if (bank.fill === 'snare' && spec.snareStyle !== 'none') {
            for (var r = 12; r < 16; r += 0.5) push('snare', r, (0.15 + (r - 12) * 0.08) * soft, 0.003, false);
          } else if (bank.fill === 'tom') {
            var fill = ['tomhi', 'tomhi', 'tommid', 'tommid', 'tomlo', 'tomlo', 'tommid', 'tomhi'];
            for (var ft = 0; ft < fill.length; ft++) push(fill[ft], 12 + ft * 0.5, 0.24 + ft * 0.035, 0.003, false);
          } else if (bank.fill === 'hatroll' && !spec.noHats) {
            for (var hr = 0; hr < 8; hr++) push('hat', 12 + hr * 0.5, 0.18 + hr * 0.02, 0.002);
          }
        }
        if (spec.triplet && !last) {
          for (var tr = 0; tr < 3; tr++) push('hat', 12 + tr / 3, 0.22, 0.002);
        }
      })(bar);
    }

    // ---- 贝斯 / 808
    if (!spec.drumsOnly) for (var bb = 0; bb < spec.bars; bb++) {
      var info = bars[bb];
      var root = info.bass;
      var t0 = bb * 16;
      function bpush(step, midi, beats, vel, opt) {
        ev.bass.push({
          kind: spec.no808 ? 'bass' : STYLE_DEFS[spec.style].bassInst,
          t: tAt(t0 + step, false, 0.002),
          dur: beats * beatSec,
          vel: vel,
          midi: midi,
          fromMidi: opt && opt.from,
          glide: opt && opt.glide
        });
      }

      if (spec.noBass) continue;
      var bassPat = BASS_BANK[spec.style] && BASS_BANK[spec.style][variant % BASS_BANK[spec.style].length];
      var eBoost = 0.86 + energy * 0.2;

      if (spec.bassStyle === 'walking' || spec.style === 'jazz') {
        var walk = [0, 1, 2, rng() < 0.5 ? 4 : 6];
        for (var wi = 0; wi < 4; wi++) {
          bpush(wi * 4, scaleMidi(spec, info.degree + walk[wi], 2), 0.92, wi === 0 ? 0.82 : 0.62);
        }
      } else if (spec.bassStyle === 'slap') {
        var slapSteps = [0, 2, 3, 6, 7, 10, 11, 14];
        for (var si2 = 0; si2 < slapSteps.length; si2++) {
          var ss = slapSteps[si2];
          var sn = root + (ss === 3 || ss === 11 ? 12 : (ss === 7 ? 7 : 0));
          bpush(ss, sn, 0.16, ss % 4 === 0 ? 0.92 : 0.66);
        }
      } else if (spec.bassStyle === 'offbeat') {
        [2, 6, 10, 14].forEach(function (os) {
          bpush(os, root + (os === 14 ? 7 : 0), 0.32, 0.78);
        });
      } else if (spec.bassStyle === 'sub') {
        bpush(0, root, 3.8, 0.95);
        bpush(8, root, 3.6, 0.72);
      } else if (spec.bassStyle === 'glide') {
        bpush(0, root, 2.2, 0.95);
        bpush(7, root + 5, 1.2, 0.84, { from: root, glide: 0.18 });
        bpush(11, root, 1.6, 0.82, { from: root + 7, glide: 0.14 });
        if (rng() < 0.5) bpush(14, root - 2, 0.5, 0.55, { from: root, glide: 0.1 });
      } else if (bassPat) {
        for (var bi = 0; bi < bassPat.length; bi++) {
          var bp = bassPat[bi];
          var bs = bp[0], bd = bp[1], biv = bp[2];
          var glide = (spec.style === 'trap' || spec.style === 'drill' || spec.style === 'modernrap') && bi > 0 && biv !== 0;
          bpush(bs, root + biv, bd, (bs % 4 === 0 ? 0.92 : 0.7) * eBoost,
            glide ? { from: root, glide: spec.style === 'drill' ? 0.16 : 0.11 } : null);
        }
        if (bb === spec.bars - 1 && rng() < 0.55) bpush(15, root + 12, 0.28, 0.5);
      } else if (spec.style === 'reggae') {
        bpush(0, root, 1.3, 0.95);
        bpush(6, root + 7, 0.7, 0.78);
        bpush(10, root, 1.1, 0.82);
        if (rng() < 0.35) bpush(14, root + 12, 0.45, 0.55);
      } else if (spec.style === 'bossa') {
        bpush(0, root, 1.6, 0.75);
        bpush(6, root + 7, 0.7, 0.55);
        bpush(10, root + (rng() < 0.4 ? 4 : 0), 1.2, 0.62);
      } else {
        bpush(0, root, 1.1, 0.95);
        bpush(6, root, 0.55, 0.8);
        bpush(10, root + (rng() < 0.4 ? 7 : 0), 0.6, 0.78);
        if (rng() < 0.4) bpush(14, root, 0.4, 0.55);
      }
    }

    // ---- 和弦
    if (!spec.drumsOnly) for (var cb = 0; cb < spec.bars; cb++) {
      var chord = bars[cb].chord;
      var ct0 = cb * 16;
      function cpush(step, beats, vel, kind, notes) {
        ev.chords.push({
          t: tAt(ct0 + step, true, 0.006),
          dur: beats * beatSec,
          vel: vel,
          kind: kind,
          notes: notes || chord
        });
      }

      if (spec.style === 'house') {
        cpush(0, 4, 0.28, 'pad');
        [2, 6, 10, 14].forEach(function (s) { cpush(s, 0.28, 0.5, 'stab'); });
      } else if (isTrapish(spec.style)) {
        cpush(0, 2.6, 0.55, 'ep');
        cpush(8, 2.2, 0.45, 'ep');
        if (rng() < 0.5) cpush(14, 0.6, 0.3, 'ep');
      } else if (spec.style === 'lofi') {
        cpush(0, 2.6, 0.5, 'ep');
        cpush(8, 1.8, 0.38, 'ep');
        if (rng() < 0.35) cpush(11, 0.5, 0.25, 'ep');
      } else if (spec.style === 'phonk') {
        cpush(0, 1.8, 0.46, 'ep');
        cpush(8, 1.6, 0.36, 'ep');
      } else if (spec.style === 'rock80s') {
        cpush(0, 3.8, 0.55, 'pad');
      } else if (spec.style === 'rock') {
        // 摇滚段落由节奏吉他承担和声，不再叠加电钢
      } else if (spec.style === 'reggae') {
        [2, 6, 10, 14].forEach(function (sk) { cpush(sk, 0.28, 0.62, 'organ'); });
      } else if (spec.style === 'jazz') {
        cpush(0, 1.4, 0.42, 'ep');
        cpush(6, 0.7, 0.32, 'ep');
        cpush(10, 1.1, 0.36, 'ep');
      } else if (spec.style === 'dnb') {
        cpush(0, 3.6, 0.32, 'pad');
        if (rng() < 0.4) cpush(10, 0.35, 0.4, 'stab');
      } else if (spec.style === 'funk') {
        [2, 6, 7, 10, 14].forEach(function (fk) { cpush(fk, 0.18, fk % 4 === 2 ? 0.55 : 0.38, 'stab'); });
      } else if (spec.style === 'reggaeton') {
        cpush(0, 3.2, 0.28, 'pad');
      } else if (spec.style === 'afrobeats') {
        cpush(0, 0.4, 0.4, 'pluck');
        cpush(6, 0.3, 0.32, 'pluck');
        cpush(10, 0.45, 0.36, 'pluck');
      } else if (spec.style === 'bossa') {
        cpush(0, 1.8, 0.42, 'pluck');
        cpush(8, 1.4, 0.32, 'pluck');
      } else if (spec.style === 'synthwave') {
        cpush(0, 3.8, 0.4, 'pad');
      } else {
        cpush(0, 2.2, 0.5, 'ep');
        if (rng() < 0.6) cpush(10, 0.9, 0.36, 'ep');
        if (rng() < 0.25) cpush(6, 0.6, 0.25, 'ep');
      }
    }

    // ---- 和弦律动变体 + 额外乐器层
    if (!spec.drumsOnly) {
      var barSec = beatSec * 4;
      var chordMode = spec.chordStyle;
      if (!chordMode) {
        if (spec.variant === 2 && /^(house|synthwave|dnb|reggaeton|rock80s)$/.test(spec.style)) chordMode = 'sustain';
        else if (spec.variant === 3 && /^(boom_bap|lofi|funk|jazz|bossa|reggae)$/.test(spec.style)) chordMode = 'stab';
      }
      if (chordMode === 'sustain' || chordMode === 'stab' || chordMode === 'arp' || chordMode === 'pluck') {
        for (var cbar = 0; cbar < spec.bars; cbar++) {
          var cStart = cbar * barSec, cEnd = cStart + barSec;
          var inBar = [], first = null;
          for (var qi = 0; qi < ev.chords.length; qi++) {
            var qe = ev.chords[qi];
            if (qe.t >= cStart - 0.001 && qe.t < cEnd - 0.001) {
              inBar.push(qe);
              if (!first || qe.t < first.t) first = qe;
            }
          }
          var cNotes = first ? first.notes : bars[cbar].chord;
          for (var qj = ev.chords.length - 1; qj >= 0; qj--) {
            var qq = ev.chords[qj];
            if (qq.t >= cStart - 0.001 && qq.t < cEnd - 0.001) ev.chords.splice(qj, 1);
          }
          var cpush2 = function (step, beats, vel, kind, notes) {
            ev.chords.push({
              t: tAt(cbar * 16 + step, true, 0.005),
              dur: beats * beatSec,
              vel: vel,
              kind: kind,
              notes: notes || cNotes
            });
          };
          if (chordMode === 'sustain') {
            cpush2(0, 3.9, (first ? first.vel : 0.42) * 1.05, (first && first.kind === 'stab') ? 'pad' : (first ? first.kind : 'pad'));
          } else if (chordMode === 'stab') {
            [0, 2, 6, 7, 10, 14].forEach(function (st, si3) {
              cpush2(st, 0.2, (si3 % 2 === 0 ? 0.52 : 0.36), 'stab');
            });
          } else if (chordMode === 'arp') {
            var arpOrder = [0, 1, 2, 3, 2, 1];
            for (var ai2 = 0; ai2 < 16; ai2 += 1) {
              if (spec.variant === 1 && ai2 % 2 === 1 && rng() < 0.4) continue;
              var an = cNotes[arpOrder[ai2 % arpOrder.length] % cNotes.length] + 12;
              cpush2(ai2, 0.16, ai2 % 4 === 0 ? 0.46 : 0.28, spec.style === 'synthwave' ? 'pulse' : 'pluck', [an]);
            }
          } else if (chordMode === 'pluck') {
            [0, 3, 6, 10, 14].forEach(function (st2, si4) {
              cpush2(st2, 0.24, si4 % 2 === 0 ? 0.44 : 0.3, 'pluck');
            });
          }
        }
      }

      // 用户点名的乐器：叠加到和弦 / 旋律分轨
      for (var ib = 0; ib < spec.bars; ib++) {
        var ib0 = ib * 16;
        var ch = bars[ib].chord;
        var chHi = ch.map(function (n) { return n + 12; });
        function ipush(step, beats, vel, kind, notes) {
          ev.chords.push({
            t: tAt(ib0 + step, true, 0.006),
            dur: beats * beatSec,
            vel: vel,
            kind: kind,
            notes: notes || ch
          });
        }
        if (spec.addPiano) {
          [0, 6, 10].forEach(function (ps2) { ipush(ps2, 0.75, ps2 === 0 ? 0.46 : 0.34, 'piano'); });
        }
        if (spec.addStrings) ipush(0, 3.9, 0.42, 'strings', chHi);
        if (spec.addOrgan) {
          [2, 6, 10, 14].forEach(function (os2) { ipush(os2, 0.3, 0.4, 'organ'); });
        }
        if (spec.addPad) ipush(0, 3.9, 0.36, 'pad', chHi);
        if (spec.addPluck) {
          [0, 3, 6, 10, 14].forEach(function (ps3, pi3) {
            ipush(ps3, 0.25, pi3 % 2 === 0 ? 0.4 : 0.28, 'pluck',
              [ch[pi3 % ch.length] + 12]);
          });
        }
        if (spec.addSax) {
          var saxSteps = spec.variant % 2 === 0 ? [0, 8] : [2, 10];
          saxSteps.forEach(function (ss2, sx) {
            ev.melody.push({
              kind: 'sax',
              t: tAt(ib0 + ss2, true, 0.012),
              dur: (sx === 0 ? 1.2 : 0.8) * beatSec,
              vel: 0.5,
              midi: snapToChord(ch[1 + (ib % 2)] + 12 - 12, ch) + 12
            });
          });
        }
        if (spec.addSynth) {
          [0, 2, 4, 7, 8, 10, 12, 14].forEach(function (ss3) {
            ev.melody.push({
              kind: 'pulse',
              t: tAt(ib0 + ss3, false, 0.002),
              dur: 0.14 * beatSec,
              vel: ss3 % 4 === 0 ? 0.48 : 0.28,
              midi: ch[(ss3 / 2) % ch.length] + 12
            });
          });
        }
        if (spec.addBell) {
          [0, 4, 8, 12].forEach(function (ss4, bi2) {
            ev.melody.push({
              kind: 'bell',
              t: tAt(ib0 + ss4, true, 0.006),
              dur: 0.4 * beatSec,
              vel: 0.34,
              midi: chHi[(bi2 + ib) % chHi.length]
            });
          });
        }
        if (spec.addCowbell) {
          [2, 6, 10, 14].forEach(function (ss5) {
            ev.melody.push({
              kind: 'cowbell',
              t: tAt(ib0 + ss5, false, 0.003),
              dur: 0.16 * beatSec,
              vel: 0.3,
              midi: ch[0] + 12
            });
          });
        }
      }
    }

    // ---- 节奏吉他（Rock 或“加吉他”叠加）
    if (!spec.drumsOnly && (isRockish(spec.style) || spec.guitarLayer)) {
      for (var gb = 0; gb < spec.bars; gb++) {
        (function (gb) {
          var rootG = bars[gb].gtr;
          var pcs = [rootG, rootG + 7, rootG + 12];
          var g0 = gb * 16;
          function gpush(step, beats, vel, palm) {
            ev.guitar.push({
              t: tAt(g0 + step, false, 0.003),
              dur: beats * beatSec,
              vel: vel,
              notes: pcs,
              palm: palm
            });
          }
          if (isRockish(spec.style)) {
            gpush(0, 1.45, 0.86, false);
            gpush(2, 0.36, 0.55, true);
            gpush(4, 0.42, 0.68, false);
            gpush(6, 0.34, 0.54, true);
            gpush(8, 1.20, 0.84, false);
            gpush(10, 0.34, 0.56, true);
            gpush(12, 0.42, 0.70, false);
            gpush(14, 0.34, 0.58, true);
            if (spec.complexity > 0.55) {
              [3, 7, 11, 15].forEach(function (s) {
                if (rng() < 0.40) gpush(s, 0.22, 0.34, true);
              });
            }
            if (gb === spec.bars - 1) gpush(15, 0.30, 0.62, true);
          } else {
            gpush(0, 2.4, 0.50, false);
            if (rng() < 0.55) gpush(10, 0.5, 0.34, true);
          }
        })(gb);
      }
    }

    // ---- 旋律
    if (!spec.drumsOnly && spec.melody > 0.02) {
      if (spec.style === 'phonk') {
        var riff = [0, 0, 3, 0, 5, 3, 0, 3, 0, 0, 3, 0, 5, 3, 2, 0];
        var riffOff = (spec.seed >>> 4) % riff.length;
        for (var pb = 0; pb < spec.bars; pb++) {
          for (var pi = 0; pi < 16; pi += 2) {
            var rd = riff[(pi / 2 + pb * 2 + riffOff) % riff.length];
            if (pi % 8 === 6 && rng() < 0.25) continue;
            var pMidi = scaleMidi(spec, rd + 4, 4);
            ev.melody.push({
              kind: 'cowbell',
              t: tAt(pb * 16 + pi, true, 0.003),
              dur: 0.16,
              vel: pi % 4 === 0 ? 0.52 : 0.3,
              midi: pMidi
            });
          }
        }
      } else if (isRockish(spec.style)) {
        // 主音吉他：重复的 2 小节乐句，强拍落在和弦音上
        var rockRiff = [0, 0, 3, 2, 0, 5, 4, 2, 0, 0, 3, 5, 4, 2, 0, 0];
        var rockOff = (spec.seed >>> 5) % rockRiff.length;
        var playProb = 0.45 + spec.melody * 0.40;
        for (var rb = 0; rb < spec.bars; rb++) {
          for (var ri = 0; ri < 8; ri++) {
            if (rb === 0 && ri < 2) continue;
            if (rng() > playProb) continue;
            var rdeg = rockRiff[(ri + rb * 2 + rockOff) % rockRiff.length];
            var rMidi = scaleMidi(spec, 4 + rdeg, 4);
            if (ri % 4 === 0) rMidi = snapToChord(rMidi, bars[rb].chord);
            ev.melody.push({
              kind: 'lead',
              t: tAt(rb * 16 + ri * 2, true, 0.008),
              dur: (ri % 4 === 0 ? 0.85 : 0.42) * beatSec,
              vel: 0.42 + (ri % 4 === 0 ? 0.16 : 0),
              midi: rMidi
            });
          }
        }
      } else if (spec.style === 'synthwave') {
        var arpSets = [[0, 2, 4, 7, 4, 2, 0, 4], [0, 4, 2, 7, 4, 7, 2, 0], [0, 2, 4, 2, 7, 4, 2, 4], [0, 4, 7, 4, 2, 0, 2, 4]];
        var arp = arpSets[spec.variant % arpSets.length];
        var arpOff = (spec.seed >>> 6) % arp.length;
        for (var sb = 0; sb < spec.bars; sb++) {
          for (var si = 0; si < 16; si++) {
            if (si % 2 === 1 && rng() < 0.4) continue;
            ev.melody.push({
              kind: 'pulse',
              t: tAt(sb * 16 + si, false, 0.001),
              dur: 0.11,
              vel: si % 4 === 0 ? 0.55 : 0.3,
              midi: snapToChord(scaleMidi(spec, arp[(si + arpOff) % arp.length], 5), bars[sb].chord)
            });
          }
        }
      } else if (spec.style === 'jazz') {
        var jline = [0, 2, 4, 2, 5, 4, 2, 0];
        var jOff = (spec.seed >>> 4) % jline.length;
        for (var jb = 0; jb < spec.bars; jb++) {
          for (var ji = 0; ji < 4; ji++) {
            if (rng() < 0.18) continue;
            var jm = scaleMidi(spec, jline[(ji + jb + jOff) % jline.length] + 2 + (spec.variant % 2), 4);
            if (ji === 0) jm = snapToChord(jm, bars[jb].chord);
            ev.melody.push({
              kind: 'pluck',
              t: tAt(jb * 16 + ji * 4, true, 0.01),
              dur: 0.85 * beatSec,
              vel: 0.38,
              midi: jm
            });
          }
        }
      } else if (spec.style === 'reggae') {
        for (var rgb = 0; rgb < spec.bars; rgb++) {
          [4, 12].forEach(function (rs) {
            if (rng() < 0.35) return;
            ev.melody.push({
              kind: 'pluck',
              t: tAt(rgb * 16 + rs, false, 0.008),
              dur: 0.7 * beatSec,
              vel: 0.36,
              midi: snapToChord(scaleMidi(spec, 4 + (rs === 12 ? 2 : 0), 4), bars[rgb].chord)
            });
          });
        }
      } else if (spec.style === 'afrobeats') {
        var ariffSets = [[0, 0, 2, 4, 2, 0, 4, 2], [0, 2, 0, 4, 2, 4, 0, 2], [0, 0, 4, 2, 0, 2, 4, 0], [0, 4, 2, 0, 2, 4, 0, 2]];
        var ariff = ariffSets[spec.variant % ariffSets.length];
        for (var ab = 0; ab < spec.bars; ab++) {
          for (var ai = 0; ai < 8; ai++) {
            if (ai % 4 === 3 && rng() < 0.4) continue;
            ev.melody.push({
              kind: 'pluck',
              t: tAt(ab * 16 + ai * 2, true, 0.004),
              dur: 0.28,
              vel: ai % 4 === 0 ? 0.5 : 0.32,
              midi: scaleMidi(spec, ariff[(ai + ab) % ariff.length] + 3, 4)
            });
          }
        }
      } else if (spec.style === 'dnb') {
        for (var db = 0; db < spec.bars; db += 2) {
          [0, 3, 6].forEach(function (ds, di) {
            ev.melody.push({
              kind: 'bell',
              t: tAt(db * 16 + 8 + ds, false, 0.004),
              dur: 0.22,
              vel: 0.34,
              midi: scaleMidi(spec, 4 + di * 2, 5)
            });
          });
        }
      } else {
        // 两小节动机，之后重复并做小变化
        var motif = [];
        var deg = 4;
        for (var ms = 0; ms < 32; ms += 2) {
          var prob = 0.14 + spec.melody * 0.5;
          if (rng() < prob) {
            deg = clamp(deg + Math.round((rng() - 0.5) * 5), 0, 11);
            motif.push({ s: ms, deg: deg, len: rng() < 0.28 ? 3 : 1, vel: 0.42 + rng() * 0.25 });
          }
        }
        if (!motif.length) motif.push({ s: 0, deg: 4, len: 2, vel: 0.55 });

        for (var mb = 0; mb < spec.bars; mb++) {
          var m0 = mb % 2;
          var variation = Math.floor(mb / 2) % 2 === 1 ? 1 : 0;
          for (var mi = 0; mi < motif.length; mi++) {
            var note = motif[mi];
            if (Math.floor(note.s / 16) !== m0) continue;
            if (mb % 4 === 3 && rng() < 0.3) continue;
            var d = clamp(note.deg - variation, 0, 11);
            var midi = scaleMidi(spec, d, 4 + (spec.register || 0));
            if (note.s % 4 === 0) midi = snapToChord(midi, bars[mb].chord);
            var durBeats = note.len * 0.5;
            ev.melody.push({
              kind: STYLE_DEFS[spec.style].melodyInst,
              t: tAt(mb * 16 + (note.s % 16), true, 0.008),
              dur: durBeats * beatSec,
              vel: note.vel,
              midi: midi
            });
          }
        }
      }
    }

    // ---- 笛子：稀疏的对位线，强拍尽量落在和弦音上
    if (spec.flute && !spec.drumsOnly) {
      var fdeg = 4;
      for (var fb = 0; fb < spec.bars; fb++) {
        var fsteps = [0, 6, 8, 12];
        for (var fk = 0; fk < fsteps.length; fk++) {
          var fs = fsteps[fk];
          if (rng() < 0.38 + spec.melody * 0.2) continue;
          fdeg = clamp(fdeg + Math.round((rng() - 0.5) * 4), 2, 10);
          var fm = scaleMidi(spec, fdeg, 5);
          if (fs % 4 === 0) fm = snapToChord(fm, bars[fb].chord);
          ev.flute.push({
            kind: 'flute',
            t: tAt(fb * 16 + fs, true, 0.01),
            dur: (fs === 0 || fs === 12 ? 1.5 : 0.9) * beatSec,
            vel: 0.5 + rng() * 0.12,
            midi: fm
          });
        }
      }
    }

    // ---- FX（开场 crash；Rock 的 crash 在鼓组里）
    var quietIntro = isRockish(spec.style) || spec.style === 'jazz' || spec.style === 'reggae' || spec.style === 'bossa' || spec.style === 'reggaeton' || spec.style === 'afrobeats' || spec.style === 'funk';
    if (!quietIntro && (spec.style !== 'lofi' || rng() < 0.5)) {
      ev.fx.push({ kind: 'crash', t: 0, dur: 1.2, vel: 0.5, midi: 49 });
    }

    return { ev: ev, bars: bars };
  }

  /* ============================================================
   * 渲染 / 混音
   * ============================================================ */

  var STEM_DEFS = [
    { id: 'kick', label: '底鼓 Kick', gain: 1.00, pan: 0.00, send: 0.00, color: '#d9ff57' },
    { id: 'snare', label: '军鼓 / 拍手', gain: 0.90, pan: 0.00, send: 0.20, color: '#ff9f43' },
    { id: 'hat', label: '踩镲 Hats', gain: 0.50, pan: 0.22, send: 0.06, color: '#7ad7ff' },
    { id: 'perc', label: '打击乐 Perc', gain: 0.52, pan: -0.28, send: 0.14, color: '#c792ff' },
    { id: 'bass', label: '808 / 贝斯', gain: 0.72, pan: 0.00, send: 0.03, color: '#ff6b6b' },
    { id: 'guitar', label: '吉他 Guitar', gain: 0.40, pan: -0.18, send: 0.16, color: '#ff7a45' },
    { id: 'chords', label: '和弦 Chords', gain: 0.46, pan: -0.12, send: 0.24, color: '#ffd166' },
    { id: 'melody', label: '旋律 Melody', gain: 0.55, pan: 0.16, send: 0.30, color: '#8be28b' },
    { id: 'flute', label: '笛子 Flute', gain: 0.5, pan: 0.26, send: 0.28, color: '#f2e394' },
    { id: 'fx', label: 'FX / 黑胶', gain: 0.8, pan: 0.00, send: 0.0, color: '#9aa4b2' }
  ];

  var EP_CFG = {
    boom_bap: { ratio: 2.0, index: 0.22, decay: 1.10, lp: 5200 },
    lofi:     { ratio: 3.0, index: 0.20, decay: 1.00, lp: 3400 },
    trap:     { ratio: 2.0, index: 0.16, decay: 1.50, lp: 2800 },
    drill:    { ratio: 2.0, index: 0.18, decay: 1.60, lp: 2400 },
    house:    { ratio: 2.0, index: 0.20, decay: 0.90, lp: 4200 },
    phonk:    { ratio: 3.0, index: 0.24, decay: 0.85, lp: 4000 },
    rock:     { ratio: 2.0, index: 0.20, decay: 1.00, lp: 4600 },
    rock80s:  { ratio: 2.0, index: 0.24, decay: 1.10, lp: 5200 },
    modernrap:{ ratio: 2.0, index: 0.16, decay: 1.50, lp: 2800 },
    reggae:   { ratio: 2.0, index: 0.16, decay: 0.8, lp: 3600 },
    jazz:     { ratio: 2.0, index: 0.28, decay: 0.7, lp: 4200 },
    dnb:      { ratio: 2.0, index: 0.14, decay: 1.2, lp: 3000 },
    funk:     { ratio: 2.0, index: 0.2, decay: 0.5, lp: 4800 },
    reggaeton:{ ratio: 2.0, index: 0.14, decay: 1.2, lp: 2800 },
    afrobeats:{ ratio: 2.0, index: 0.18, decay: 0.6, lp: 4600 },
    bossa:    { ratio: 3.0, index: 0.16, decay: 0.9, lp: 3400 },
    synthwave:{ ratio: 2.0, index: 0.22, decay: 1.3, lp: 5000 }
  };

  var DRUM_MIDI = { kick: 36, snare: 38, clap: 39, hat: 42, openhat: 46, ride: 51, rim: 37, shaker: 70, crash: 49, tomhi: 50, tommid: 47, tomlo: 43 };

  function toMonoEventSample(t, spec) {
    return Math.floor(clamp(t, 0, spec.bars * 240 / spec.bpm) * SR);
  }

  function buildStems(spec, comp, len, rng) {
    var beatSec = 60 / spec.bpm;
    var ev = comp.ev;
    // 同风格也有细微音色差异（音高、衰减、滤波）
    var toneShift = ((spec.seed >>> 9) % 100) / 100;
    var baseKick = KICK_CFG[spec.style] || KICK_CFG.boom_bap;
    var kcfg = {};
    for (var kk in baseKick) kcfg[kk] = baseKick[kk];
    kcfg.f0 = baseKick.f0 * (0.94 + toneShift * 0.13);
    kcfg.f1 = baseKick.f1 * (0.96 + toneShift * 0.08);
    kcfg.decay = baseKick.decay * (0.9 + toneShift * 0.22);
    var mono = {};
    ['kick', 'snare', 'hat', 'perc', 'bass', 'guitar', 'chords', 'melody', 'flute'].forEach(function (id) {
      mono[id] = new Float32Array(len);
    });

    // 鼓
    ev.kick.forEach(function (e) {
      addKick(mono.kick, toMonoEventSample(e.t, spec), e.vel, kcfg, rng);
    });
    ev.snare.forEach(function (e) {
      var i = toMonoEventSample(e.t, spec);
      if (e.kind === 'clap') addClap(mono.snare, i, e.vel, rng);
      else if (e.kind === 'gsnare') addGatedSnare(mono.snare, i, e.vel, rng);
      else addSnare(mono.snare, i, e.vel, spec.style === 'lofi' || spec.style === 'boom_bap' || spec.style === 'jazz' || spec.style === 'bossa' || spec.style === 'reggae', rng);
    });
    ev.hat.forEach(function (e) {
      var i = toMonoEventSample(e.t, spec);
      if (e.kind === 'ride') addRide(mono.hat, i, e.vel, rng);
      else if (isRockish(spec.style)) addRockHat(mono.hat, i, e.vel, e.kind === 'openhat', rng);
      else addHat(mono.hat, i, e.vel, e.kind === 'openhat', rng);
    });
    ev.perc.forEach(function (e) {
      var i = toMonoEventSample(e.t, spec);
      if (e.kind === 'rim') addRim(mono.perc, i, e.vel, rng);
      else if (e.kind === 'shaker') addShaker(mono.perc, i, e.vel, rng);
      else if (e.kind === 'crash') addCrash(mono.perc, i, e.vel, rng);
      else if (e.kind === 'tomhi') addTom(mono.perc, i, e.vel, 146, rng);
      else if (e.kind === 'tommid') addTom(mono.perc, i, e.vel, 108, rng);
      else if (e.kind === 'tomlo') addTom(mono.perc, i, e.vel, 82, rng);
    });

    // 贝斯 / 808
    ev.bass.forEach(function (e) {
      var i = toMonoEventSample(e.t, spec);
      var f = midiFreq(e.midi);
      if (e.kind === '808') {
        add808(mono.bass, i, f, e.dur, e.vel, e.fromMidi ? midiFreq(e.fromMidi) : 0, e.glide || 0);
      } else if (isRockish(spec.style)) {
        addRockBass(mono.bass, i, f, e.dur, e.vel);
      } else {
        addBass(mono.bass, i, f, e.dur, e.vel);
      }
    });

    // 失真节奏吉他
    ev.guitar.forEach(function (e) {
      e.notes.forEach(function (midi, ni) {
        var i = toMonoEventSample(e.t + ni * 0.002, spec);
        addGuitar(mono.guitar, i, midiFreq(midi), e.dur, e.vel * (ni === 0 ? 1 : 0.78), {
          palm: e.palm,
          rng: rng
        });
      });
    });

    // 和弦
    var baseEp = EP_CFG[spec.style] || EP_CFG.boom_bap;
    var epCfg = {};
    for (var ek in baseEp) epCfg[ek] = baseEp[ek];
    epCfg.decay = baseEp.decay * (0.88 + toneShift * 0.28);
    epCfg.lp = baseEp.lp * (0.92 + toneShift * 0.16);
    var chordInstGain = ((isTrapish(spec.style)) ? 0.78 : (spec.style === 'house' ? 1.35 : 1));
    ev.chords.forEach(function (e) {
      e.notes.forEach(function (midi, ni) {
        var i = toMonoEventSample(e.t + ni * 0.006, spec);
        var f = midiFreq(midi);
        var v = e.vel * (ni === 0 ? 1 : 0.82) * chordInstGain;
        if (e.kind === 'stab') addStab(mono.chords, i, f, e.dur, v, spec.bright, rng);
        else if (e.kind === 'pad') addPad(mono.chords, i, f, e.dur, v);
        else if (e.kind === 'piano') addPiano(mono.chords, i, f, e.dur, v, rng);
        else if (e.kind === 'strings') addStrings(mono.chords, i, f, e.dur, v);
        else if (e.kind === 'organ') addOrgan(mono.chords, i, f, e.dur, v);
        else if (e.kind === 'pluck') addPluck(mono.chords, i, f, e.dur, v, spec.style === 'bossa', rng);
        else addEP(mono.chords, i, f, e.dur, v, epCfg);
      });
    });

    // 旋律
    var melodyInstGain = spec.style === 'phonk' ? 1.4 : (isRockish(spec.style) ? 1.05 : 1);
    var leadBuf = new Float32Array(len);
    var hasLead = false;
    ev.melody.forEach(function (e) {
      var i = toMonoEventSample(e.t, spec);
      var f = midiFreq(e.midi);
      if (e.kind === 'bell') addBell(mono.melody, i, f, e.dur, e.vel * melodyInstGain, spec.bright < 0.45);
      else if (e.kind === 'cowbell') addCowbell(mono.melody, i, f, e.dur, e.vel * melodyInstGain);
      else if (e.kind === 'pulse') addPulse(mono.melody, i, f, e.dur, e.vel * melodyInstGain);
      else if (e.kind === 'sax') addSax(mono.melody, i, f, e.dur, e.vel * melodyInstGain, rng);
      else if (e.kind === 'lead') { hasLead = true; addGuitar(leadBuf, i, f, e.dur, e.vel * melodyInstGain, { lead: true, rng: rng }); }
      else addPluck(mono.melody, i, f, e.dur, e.vel, spec.style === 'lofi' || spec.style === 'bossa', rng);
    });
    if (hasLead) {
      applyGuitarChain(leadBuf, guitarPreset(spec, 'lead'));
      for (var li = 0; li < len; li++) mono.melody[li] += leadBuf[li];
    }

    if (spec.style === 'rock80s' || spec.style === 'rock' || spec.guitarLayer) {
      applyGuitarChain(mono.guitar, guitarPreset(spec, 'rhythm'));
    }

    ev.flute.forEach(function (e) {
      addFlute(mono.flute, toMonoEventSample(e.t, spec), midiFreq(e.midi), e.dur, e.vel, rng);
    });

    // FX：crash + 黑胶噪声
    var fx = { l: new Float32Array(len), r: new Float32Array(len) };
    var crash = new Float32Array(len);
    ev.fx.forEach(function (e) {
      if (e.kind === 'crash') addCrash(crash, 0, e.vel, rng);
    });
    if (spec.vinyl > 0.01) {
      var level = spec.vinyl * 0.022;
      var lpL = 0, lpR = 0;
      var a = 1 - Math.exp(-TAU * 4200 / SR);
      for (var i = 0; i < len; i++) {
        var nl = rng() * 2 - 1;
        var nr = rng() * 2 - 1;
        lpL += a * (nl - lpL);
        lpR += a * (nr - lpR);
        fx.l[i] += (nl * 0.22 + lpL * 0.78) * level;
        fx.r[i] += (nr * 0.22 + lpR * 0.78) * level;
      }
      var crackles = Math.floor((len / SR) * 7);
      for (var c = 0; c < crackles; c++) {
        var pos = Math.floor(rng() * (len - 200));
        var amp = (0.25 + rng() * 0.75) * level * 4;
        var panL = 0.4 + rng() * 0.6;
        for (var j = 0; j < 90; j++) {
          var e2 = Math.exp(-j / 22) * amp;
          fx.l[pos + j] += (rng() * 2 - 1) * e2 * panL;
          fx.r[pos + j] += (rng() * 2 - 1) * e2 * (1.4 - panL);
        }
      }
    }
    for (var fc = 0; fc < len; fc++) {
      fx.l[fc] += crash[fc] * 0.5;
      fx.r[fc] += crash[fc] * 0.5;
    }

    // 侧链抽吸：底鼓一响，和弦与贝斯短暂让位
    if (spec.sidechain) {
      var duck = new Float32Array(len);
      ev.kick.forEach(function (e) {
        var di = toMonoEventSample(e.t, spec);
        var dn = Math.floor(0.22 * SR);
        for (var dk = 0; dk < dn && di + dk < len; dk++) {
          var dv = Math.exp(-dk / (0.075 * SR));
          if (dv > duck[di + dk]) duck[di + dk] = dv;
        }
      });
      ['chords', 'bass'].forEach(function (sid) {
        var sb = mono[sid];
        if (!sb) return;
        for (var si = 0; si < len; si++) sb[si] *= 1 - 0.55 * duck[si];
      });
    }

    // 淡入淡出，避免循环首尾爆音
    var fadeIn = Math.floor(0.002 * SR);
    var fadeOut = Math.floor(0.012 * SR);
    Object.keys(mono).forEach(function (id) {
      var b = mono[id];
      for (var i = 0; i < fadeIn && i < b.length; i++) b[i] *= i / fadeIn;
      for (var j = 0; j < fadeOut && j < b.length; j++) b[b.length - 1 - j] *= j / fadeOut;
    });
    var fadeStereo = function (arr) {
      for (var i = 0; i < fadeIn && i < arr.length; i++) arr[i] *= i / fadeIn;
      for (var j = 0; j < fadeOut && j < arr.length; j++) arr[arr.length - 1 - j] *= j / fadeOut;
    };
    fadeStereo(fx.l); fadeStereo(fx.r);

    return { mono: mono, fx: fx };
  }

  function panGains(pan) {
    var a = (clamp(pan, -1, 1) + 1) * Math.PI / 4;
    return [Math.cos(a), Math.sin(a)];
  }

  function reverbStereo(input, sr) {
    var tunings = [1116, 1188, 1277, 1356, 1422, 1491];
    var spread = 23;
    var outL = new Float32Array(input.length);
    var outR = new Float32Array(input.length);

    function process(out, offset) {
      var combs = [], aps = [];
      for (var i = 0; i < tunings.length; i++) {
        var n = Math.max(8, Math.round(tunings[i] * sr / 44100) + offset);
        combs.push({ buf: new Float32Array(n), idx: 0, lp: 0 });
      }
      var apT = [556, 441, 341];
      for (var j = 0; j < apT.length; j++) {
        var m = Math.max(4, Math.round(apT[j] * sr / 44100) + offset);
        aps.push({ buf: new Float32Array(m), idx: 0 });
      }
      for (var s = 0; s < input.length; s++) {
        var x = input[s] * 0.018;
        var y = 0;
        for (var c = 0; c < combs.length; c++) {
          var cb = combs[c];
          var v = cb.buf[cb.idx];
          cb.lp = v * 0.7 + cb.lp * 0.3;
          cb.buf[cb.idx] = x + cb.lp * 0.84;
          cb.idx = (cb.idx + 1) % cb.buf.length;
          y += v;
        }
        for (var a = 0; a < aps.length; a++) {
          var ap = aps[a];
          var bo = ap.buf[ap.idx];
          var w = -y + bo;
          ap.buf[ap.idx] = y + bo * 0.5;
          ap.idx = (ap.idx + 1) % ap.buf.length;
          y = w;
        }
        out[s] = y;
      }
    }
    process(outL, 0);
    process(outR, spread);

    // 自适应电平，让湿声与原信号成比例
    var inRms = 0, outRms = 0;
    for (var i = 0; i < input.length; i += 4) {
      inRms += input[i] * input[i];
      outRms += outL[i] * outL[i];
    }
    inRms = Math.sqrt(inRms / (input.length / 4)) || 1e-6;
    outRms = Math.sqrt(outRms / (input.length / 4)) || 1e-6;
    var scale = clamp((inRms * 0.55) / outRms, 0.01, 200);
    for (var k = 0; k < outL.length; k++) { outL[k] *= scale; outR[k] *= scale; }
    return { l: outL, r: outR };
  }

  function highpass(buf, freq) {
    var a = 1 - Math.exp(-TAU * freq / SR);
    var lp = 0;
    for (var i = 0; i < buf.length; i++) {
      lp += a * (buf[i] - lp);
      buf[i] -= lp;
    }
  }

  function lowpass(buf, freq) {
    var a = 1 - Math.exp(-TAU * freq / SR);
    var lp = 0;
    for (var i = 0; i < buf.length; i++) {
      lp += a * (buf[i] - lp);
      buf[i] = lp;
    }
  }

  function normalizeStereo(l, r, target) {
    var peak = 0;
    for (var i = 0; i < l.length; i++) {
      var a = Math.abs(l[i]), b = Math.abs(r[i]);
      if (a > peak) peak = a;
      if (b > peak) peak = b;
    }
    if (!isFinite(peak) || peak < 1e-6) return 1;
    var g = target / peak;
    for (var j = 0; j < l.length; j++) { l[j] *= g; r[j] *= g; }
    return g;
  }

  function masterChain(l, r, spec) {
    highpass(l, 24);
    highpass(r, 24);

    // 轻柔总线压缩
    var env = 0;
    var aAtt = Math.exp(-1 / (0.008 * SR));
    var aRel = Math.exp(-1 / (0.16 * SR));
    var thr = 0.55;
    var ratio = 2.0;
    var gain = 1;
    for (var i = 0; i < l.length; i++) {
      var x = Math.max(Math.abs(l[i]), Math.abs(r[i]));
      env = x > env ? aAtt * env + (1 - aAtt) * x : aRel * env + (1 - aRel) * x;
      var target = 1;
      if (env > thr) target = Math.pow(env / thr, 1 / ratio - 1);
      gain += (target - gain) * 0.0025;
      l[i] *= gain;
      r[i] *= gain;
    }

    // 风格化音色
    var lpFreq = spec.style === 'lofi' ? 9500 : (spec.style === 'rock' ? 18000 : (spec.bright < 0.4 ? 11000 : (spec.style === 'trap' ? 19500 : 16500)));
    if (spec.tape) { lpFreq = Math.min(lpFreq, 8200); }
    if (lpFreq < 20000) { lowpass(l, lpFreq); lowpass(r, lpFreq); }

    // 磁带抖动：短延迟 + 缓慢音高波动
    if (spec.tape) {
      var tmax = Math.floor(0.022 * SR);
      var tbl = new Float32Array(tmax), tbr = new Float32Array(tmax);
      var tw = 0;
      for (var ti = 0; ti < l.length; ti++) {
        var tmod = Math.floor((0.005 + 0.0025 * Math.sin(ti / SR * TAU * 0.7)) * SR);
        var trd = (tw - tmod + tmax) % tmax;
        var tyl = l[ti] * 0.76 + tbl[trd] * 0.24;
        var tyr = r[ti] * 0.76 + tbr[trd] * 0.24;
        tbl[tw] = l[ti]; tbr[tw] = r[ti];
        l[ti] = tyl; r[ti] = tyr;
        tw = (tw + 1) % tmax;
      }
    }

    var drive = spec.style === 'phonk' ? 1.9 : (spec.style === 'rock' ? 1.32 : (isTrapish(spec.style) ? 1.25 : 1.06));
    if (spec.distortion) drive *= 1.45;
    for (var j = 0; j < l.length; j++) {
      l[j] = Math.tanh(l[j] * drive) / Math.tanh(drive);
      r[j] = Math.tanh(r[j] * drive) / Math.tanh(drive);
    }

    var g = normalizeStereo(l, r, 0.89);
    return g;
  }

  function computePeaks(l, r, buckets) {
    var min = new Float32Array(buckets);
    var max = new Float32Array(buckets);
    var step = l.length / buckets;
    for (var b = 0; b < buckets; b++) {
      var s = Math.floor(b * step);
      var e = Math.min(l.length, Math.floor((b + 1) * step));
      var mn = 1, mx = -1;
      for (var i = s; i < e; i++) {
        var v = l[i] * 0.5 + r[i] * 0.5;
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
      min[b] = mn; max[b] = mx;
    }
    return { min: min, max: max };
  }

  /* ============================================================
   * 整首歌编排：把一条满意的循环扩展成有起承转合的完整伴奏
   * ============================================================ */

  var SONG_TEMPLATE = [
    { name: 'Intro',  bars: 2, k: 0.12, s: 0.06, h: 0.22, b: 0.18, c: 0.65, m: 0.10 },
    { name: 'Verse',  bars: 6, k: 0.88, s: 0.82, h: 0.82, b: 0.90, c: 0.78, m: 0.55 },
    { name: 'Build',  bars: 2, k: 1.00, s: 1.00, h: 1.00, b: 1.00, c: 0.90, m: 0.80 },
    { name: 'Chorus', bars: 8, k: 1.00, s: 1.00, h: 1.05, b: 1.00, c: 1.00, m: 1.00 },
    { name: 'Break',  bars: 2, k: 0.18, s: 0.15, h: 0.30, b: 0.55, c: 0.85, m: 0.65 },
    { name: 'Chorus', bars: 8, k: 1.00, s: 1.00, h: 1.05, b: 1.00, c: 1.00, m: 1.00 },
    { name: 'Outro',  bars: 4, k: 0.45, s: 0.35, h: 0.35, b: 0.45, c: 0.65, m: 0.35 }
  ];
  var SONG_TOTAL_BARS = 32;

  function songSections(spec) {
    var barSec = (60 / spec.bpm) * 4;
    var out = [], bar = 0;
    SONG_TEMPLATE.forEach(function (t) {
      out.push({
        name: t.name, bar: bar, bars: t.bars,
        startSec: bar * barSec, endSec: (bar + t.bars) * barSec,
        start: Math.round(bar * barSec * SR), end: Math.round((bar + t.bars) * barSec * SR),
        tpl: t
      });
      bar += t.bars;
    });
    return out;
  }

  function songArrangeEvents(spec, comp, rng) {
    var secs = songSections(spec);
    var beatSec = 60 / spec.bpm;
    var barSec = beatSec * 4;
    secs.forEach(function (sec, i) {
      var prev = secs[i - 1];
      var withFill = prev && (prev.name === 'Build' || prev.name === 'Break');
      if (sec.name === 'Chorus' && !withFill) {
        comp.ev.perc.push({ kind: 'crash', t: sec.startSec, dur: 1.2, vel: 0.5, midi: 49 });
      }
      if (withFill) {
        var barStart = prev.endSec - beatSec * 4;
        for (var f = 0; f < 8; f++) {
          comp.ev.snare.push({ kind: 'snare', t: barStart + f * beatSec * 0.25, vel: 0.28 + f * 0.06, midi: 38 });
        }
        comp.ev.perc.push({ kind: 'crash', t: sec.startSec, dur: 1.2, vel: 0.52, midi: 49 });
      }
    });

    // 用户局部编辑：按小节加花 / 加声音 / 静音
    var edits = spec.songEdits || [];
    edits.forEach(function (ed) {
      var st = clamp(Math.floor(ed.bar || 0), 0, spec.bars - 1);
      var n = clamp(Math.floor(ed.bars || 1), 1, spec.bars - st);
      var t0 = st * barSec;
      var target = ed.target || 'all';
      if (ed.type === 'mute') {
        var ids = target === 'all'
          ? ['kick', 'snare', 'hat', 'perc', 'bass', 'guitar', 'chords', 'melody', 'flute']
          : [target];
        ids.forEach(function (id) {
          if (!comp.ev[id]) return;
          comp.ev[id] = comp.ev[id].filter(function (e) { return e.t < t0 || e.t >= t0 + n * barSec; });
        });
        return;
      }
      if (ed.type === 'fill') {
        for (var f = 0; f < n * 8; f++) {
          var ft = t0 + f * beatSec * 0.25;
          comp.ev.snare.push({ kind: 'snare', t: ft, vel: 0.3 + (f % 8) * 0.05, midi: 38 });
          if (f % 4 === 2) {
            var tk = f % 8 < 4 ? 'tomhi' : 'tomlo';
            comp.ev.perc.push({ kind: tk, t: ft, vel: 0.42, midi: tk === 'tomhi' ? 50 : 43 });
          }
        }
      } else if (ed.type === 'crash') {
        comp.ev.perc.push({ kind: 'crash', t: t0 + 0.01, dur: 1.4, vel: 0.6, midi: 49 });
      } else if (ed.type === 'tom') {
        var toms = ['tomhi', 'tommid', 'tomlo'];
        for (var k = 0; k < n * 8; k++) {
          var tk2 = toms[k % 3];
          comp.ev.perc.push({ kind: tk2, t: t0 + k * beatSec * 0.25, vel: 0.42, midi: tk2 === 'tomhi' ? 50 : (tk2 === 'tommid' ? 47 : 43) });
        }
      } else if (ed.type === 'shaker') {
        for (var q = 0; q < n * 8; q++) {
          comp.ev.perc.push({ kind: 'shaker', t: t0 + q * beatSec * 0.25, vel: 0.2, midi: 70 });
        }
      } else if (ed.type === 'flute') {
        comp.ev.flute.push({
          kind: 'flute',
          t: t0,
          dur: n * barSec * 0.82,
          vel: 0.55,
          midi: scaleMidi(spec, 4, 5)
        });
      }
    });
    return secs;
  }

  function songApplyGains(secs, mono, spec) {
    var fade = Math.round(0.16 * SR);
    Object.keys(mono).forEach(function (id) {
      var buf = mono[id];
      var factors = secs.map(function (sec) {
        var t = sec.tpl;
        if (id === 'kick') return t.k;
        if (id === 'snare') return t.s;
        if (id === 'hat') return t.h;
        if (id === 'perc') return t.h;
        if (id === 'bass') return t.b;
        if (id === 'guitar') return t.c;
        if (id === 'chords') return t.c;
        if (id === 'melody') return t.m;
        if (id === 'flute') return t.m;
        if (id === 'fx') return 0.85;
        return 1;
      });
      var sec = 0, b = 1;
      for (var i = 0; i < buf.length; i++) {
        if (b < secs.length && i >= secs[b].start) { sec = b; b++; }
        var f = factors[sec];
        var lastB = b - 1;
        if (lastB >= 1) {
          var bd = secs[lastB].start;
          if (i >= bd - fade && i < bd + fade) {
            var tt = (i - (bd - fade)) / (2 * fade);
            var sm = tt * tt * (3 - 2 * tt);
            f = lerp(factors[lastB - 1], factors[lastB], sm);
          }
        }
        buf[i] *= f;
      }
    });

    // 静音编辑：把对应范围的样本清零，避免上一小节音符的尾巴漏进来
    var barSec = (60 / spec.bpm) * 4;
    (spec.songEdits || []).forEach(function (ed) {
      if (ed.type !== 'mute') return;
      var st = clamp(Math.floor(ed.bar || 0), 0, spec.bars - 1);
      var n = clamp(Math.floor(ed.bars || 1), 1, spec.bars - st);
      var i0 = Math.round(st * barSec * SR);
      var i1 = Math.round((st + n) * barSec * SR);
      var ids = (ed.target || 'all') === 'all' ? Object.keys(mono) : [ed.target];
      ids.forEach(function (id) {
        var b = mono[id];
        if (!b) return;
        for (var i = i0; i < i1 && i < b.length; i++) b[i] = 0;
      });
    });
  }

  function renderSong(input, onPhase) {
    var spec = normalizeSpec(input);
    spec.song = true;
    spec.bars = SONG_TOTAL_BARS;
    return render(spec, onPhase);
  }

  /* ============================================================
   * 主渲染
   * ============================================================ */

  function normalizeSpec(input) {
    var spec = {};
    for (var k in input) if (Object.prototype.hasOwnProperty.call(input, k)) spec[k] = input[k];
    if (!STYLE_DEFS[spec.style]) spec.style = 'boom_bap';
    var def = STYLE_DEFS[spec.style];
    spec.bpm = clamp(Math.round(spec.bpm || def.bpm), 50, 200);
    spec.bars = clamp(Math.round(spec.bars || 8), 1, 32);
    spec.swing = clamp(spec.swing == null ? def.swing : spec.swing, 0, 0.45);
    spec.rootPc = ((spec.rootPc == null ? def.root : spec.rootPc) % 12 + 12) % 12;
    spec.mode = spec.mode === 'major' ? 'major' : 'minor';
    spec.vinyl = clamp(spec.vinyl == null ? def.vinyl : spec.vinyl, 0, 0.85);
    spec.reverb = clamp(spec.reverb == null ? def.reverb : spec.reverb, 0, 0.5);
    spec.melody = clamp(spec.melody == null ? def.melody : spec.melody, 0, 1);
    spec.complexity = clamp(spec.complexity == null ? def.complexity : spec.complexity, 0, 1);
    spec.bright = clamp(spec.bright == null ? def.bright : spec.bright, 0, 1);
    spec.seed = (spec.seed == null ? 1 : spec.seed) >>> 0;
    spec.guitarLayer = !!spec.guitarLayer;
    spec.flute = !!spec.flute;
    spec.variant = clamp(Math.floor(spec.variant == null ? 0 : spec.variant), 0, 3);
    spec.energy = clamp(spec.energy == null ? 0.5 : spec.energy, 0, 1);
    ['addPiano', 'addStrings', 'addOrgan', 'addSax', 'addSynth', 'addBell', 'addCowbell', 'addPluck', 'addPad',
      'halfTime', 'doubleTime', 'noHats', 'shaker', 'tambourine', 'crash', 'noFills', 'noBass',
      'tape', 'delayFx', 'sidechain', 'distortion', 'sus'].forEach(function (bk) {
      spec[bk] = !!spec[bk];
    });
    ['kickStyle', 'hatStyle', 'snareStyle', 'percStyle', 'bassStyle', 'chordStyle'].forEach(function (sk) {
      spec[sk] = spec[sk] || '';
    });
    spec.register = spec.register === 1 ? 1 : (spec.register === -1 ? -1 : 0);
    spec.ext = (spec.ext === '7' || spec.ext === '9') ? spec.ext : '';
    spec.songEdits = (spec.songEdits || []).filter(function (e) {
      return e && typeof e === 'object' && e.type && typeof e.bar === 'number' &&
        e.bar >= 0 && e.bar < 32 && ['fill', 'tom', 'crash', 'shaker', 'flute', 'mute'].indexOf(e.type) >= 0;
    }).map(function (e) {
      return {
        id: e.id || 1,
        type: e.type,
        bar: clamp(Math.floor(e.bar), 0, 31),
        bars: clamp(Math.floor(e.bars || 1), 1, 32),
        target: e.target || 'all'
      };
    });
    spec.keyText = ROOT_NAMES[spec.rootPc] + ' ' + MODES[spec.mode].label;
    spec.styleLabel = def.label;
    spec.stepDur = 60 / spec.bpm / 4;
    return spec;
  }

  function render(input, onPhase) {
    var spec = normalizeSpec(input);
    var rng = mulberry32(spec.seed);
    function levelOf(id) {
      var l = spec.levels && spec.levels[id];
      return l == null ? 1 : clamp(l, 0.2, 2);
    }
    var beatSec = 60 / spec.bpm;
    var durSec = spec.bars * 16 * (beatSec / 4);
    var len = Math.round(durSec * SR);

    if (onPhase) onPhase('arrange');
    var comp = buildEvents(spec, rng);
    var sections = spec.song ? songArrangeEvents(spec, comp, rng) : null;

    if (onPhase) onPhase('synth');
    var built = buildStems(spec, comp, len, rng);
    var mono = built.mono;
    if (sections) songApplyGains(sections, mono, spec);

    // 分轨增益 / 声像
    var stems = [];
    var mixL = new Float32Array(len);
    var mixR = new Float32Array(len);
    var sendMono = new Float32Array(len);
    var normRef = {};

    STEM_DEFS.forEach(function (def) {
      var monoBuf = def.id === 'fx' ? null : mono[def.id];
      if (!monoBuf) return;
      if (def.id === 'fx') return;
      if (!comp.ev[def.id] || comp.ev[def.id].length === 0) return;
      var pg = panGains(def.pan);
      var dg = def.gain * levelOf(def.id);
      var gL = dg * pg[0];
      var gR = dg * pg[1];
      for (var i = 0; i < len; i++) {
        var v = monoBuf[i];
        mixL[i] += v * gL;
        mixR[i] += v * gR;
        sendMono[i] += v * dg * def.send;
      }
      stems.push({
        id: def.id,
        label: def.label,
        color: def.color,
        mono: monoBuf,
        gain: dg,
        pan: def.pan,
        send: def.send
      });
      normRef[def.id] = def.gain;
    });

    // FX / 黑胶：已经是立体声
    var fxGain = 0.85 * levelOf('fx');
    if (built.fx && (spec.vinyl > 0.01 || comp.ev.fx.length > 0)) {
      for (var i2 = 0; i2 < len; i2++) {
        mixL[i2] += built.fx.l[i2] * fxGain;
        mixR[i2] += built.fx.r[i2] * fxGain;
      }
      stems.push({
        id: 'fx',
        label: 'FX / 黑胶',
        color: '#9aa4b2',
        stereo: { l: built.fx.l, r: built.fx.r },
        gain: fxGain,
        pan: 0,
        send: 0
      });
    }

    // 混响
    if (onPhase) onPhase('mix');
    var wet = reverbStereo(sendMono, SR);
    var wetGain = (0.55 + spec.reverb * 1.4) * levelOf('reverb');
    for (var i3 = 0; i3 < len; i3++) {
      mixL[i3] += wet.l[i3] * wetGain;
      mixR[i3] += wet.r[i3] * wetGain;
    }
    stems.push({
      id: 'reverb',
      label: '混响 Reverb',
      color: '#6fa8ff',
      stereo: wet,
      gain: wetGain,
      pan: 0,
      send: 0
    });

    // 回声 / 延迟
    if (spec.delayFx) {
      var dly = Math.max(1, Math.round(beatSec * 0.75 * SR));
      var fb = 0.34, dmix = 0.26;
      var dl = new Float32Array(len), dr = new Float32Array(len);
      for (var di = 0; di < len; di++) {
        var src = sendMono[di] * dmix;
        var backL = di >= dly ? dl[di - dly] * fb : 0;
        var backR = di >= dly ? dr[di - dly] * fb : 0;
        dl[di] = src + backR;
        dr[di] = src + backL;
        mixL[di] += dl[di];
        mixR[di] += dr[di];
      }
    }

    if (onPhase) onPhase('master');
    var prePeak = 0;
    for (var pk = 0; pk < len; pk++) {
      var av = Math.abs(mixL[pk]), bv = Math.abs(mixR[pk]);
      if (av > prePeak) prePeak = av;
      if (bv > prePeak) prePeak = bv;
    }
    var stemNorm = prePeak > 0.89 ? 0.89 / prePeak : 1;
    var masterGain = masterChain(mixL, mixR, spec);

    // 分轨用与混音相同的安全归一化，保证单独导入不会削波
    stems.forEach(function (s) {
      s.playGain = (s.gain || 1) * stemNorm;
      s.exportGain = s.playGain;
      s.level = 1;
    });

    var peaks = computePeaks(mixL, mixR, 1100);

    // MIDI 事件
    var midiTracks = [];
    function addMidiTrack(name, channel, program, notes) {
      if (notes && notes.length) midiTracks.push({ name: name, channel: channel, program: program, notes: notes });
    }
    addMidiTrack('Kick', 9, 0, comp.ev.kick.map(function (e) {
      return { t: e.t, dur: 0.08, midi: DRUM_MIDI.kick, vel: e.vel };
    }));
    addMidiTrack('Snare', 9, 0, comp.ev.snare.map(function (e) {
      return { t: e.t, dur: 0.08, midi: DRUM_MIDI[e.kind] || 38, vel: e.vel };
    }));
    addMidiTrack('Hats', 9, 0, comp.ev.hat.map(function (e) {
      return { t: e.t, dur: 0.05, midi: DRUM_MIDI[e.kind] || 42, vel: e.vel };
    }));
    addMidiTrack('Perc', 9, 0, comp.ev.perc.map(function (e) {
      return { t: e.t, dur: 0.05, midi: DRUM_MIDI[e.kind] || 37, vel: e.vel };
    }));
    var is808 = !spec.no808 && STYLE_DEFS[spec.style].bassInst === '808';
    addMidiTrack(is808 ? '808' : 'Bass', 2, is808 ? 38 : (isRockish(spec.style) ? 33 : 34), comp.ev.bass.map(function (e) {
      return { t: e.t, dur: e.dur, midi: e.midi, vel: e.vel };
    }));
    var guitarNotes = [];
    comp.ev.guitar.forEach(function (e) {
      e.notes.forEach(function (m, i) {
        guitarNotes.push({ t: e.t + i * 0.002, dur: e.dur, midi: m, vel: e.vel * (i === 0 ? 1 : 0.78) });
      });
    });
    addMidiTrack('Guitar', 5, 30, guitarNotes);
    var chordNotes = [];
    comp.ev.chords.forEach(function (e) {
      e.notes.forEach(function (m, i) {
        chordNotes.push({ t: e.t + i * 0.006, dur: e.dur, midi: m, vel: e.vel * 0.9 });
      });
    });
    addMidiTrack('Chords', 3, 4, chordNotes);
    var melodyProgram = isTrapish(spec.style) ? 9 : (spec.style === 'phonk' ? 14 : (spec.style === 'rock80s' ? 80 : (spec.style === 'rock' ? 30 : 24)));
    addMidiTrack('Melody', 4, melodyProgram, comp.ev.melody.map(function (e) {
      return { t: e.t, dur: e.dur, midi: e.midi, vel: e.vel };
    }));

    addMidiTrack('Flute', 7, 73, comp.ev.flute.map(function (e) {
      return { t: e.t, dur: e.dur, midi: e.midi, vel: e.vel };
    }));

    var res = {
      spec: spec,
      engine: 'BeatForge 1.0',
      sampleRate: SR,
      sections: sections,
      duration: durSec,
      frames: len,
      mix: { l: mixL, r: mixR },
      stems: stems,
      peaks: peaks,
      midiTracks: midiTracks,
      events: comp.ev,
      masterGain: masterGain,
      stemNorm: stemNorm
    };
    return res;
  }

  /* ============================================================
   * WAV / MIDI / ZIP 导出
   * ============================================================ */

  function encodeWav(channels, sampleRate, bitDepth) {
    sampleRate = sampleRate || SR;
    bitDepth = bitDepth || 24;
    var nch = channels.length;
    var frames = channels[0].length;
    var bytesPerSample = bitDepth / 8;
    var dataSize = frames * nch * bytesPerSample;
    var buffer = new ArrayBuffer(44 + dataSize);
    var view = new DataView(buffer);
    var p = 0;

    function str(s) { for (var i = 0; i < s.length; i++) view.setUint8(p++, s.charCodeAt(i)); }
    function u32(v) { view.setUint32(p, v, true); p += 4; }
    function u16(v) { view.setUint16(p, v, true); p += 2; }

    str('RIFF'); u32(36 + dataSize); str('WAVE');
    str('fmt '); u32(16); u16(1); u16(nch);
    u32(sampleRate); u32(sampleRate * nch * bytesPerSample);
    u16(nch * bytesPerSample); u16(bitDepth);
    str('data'); u32(dataSize);

    var max = bitDepth === 16 ? 32767 : 8388607;
    var min = bitDepth === 16 ? -32768 : -8388608;
    for (var i = 0; i < frames; i++) {
      for (var c = 0; c < nch; c++) {
        var x = channels[c][i];
        if (!isFinite(x)) x = 0;
        x = clamp(x, -1, 1);
        var v = Math.round(x >= 0 ? x * max : x * -min);
        if (v > max) v = max;
        if (v < min) v = min;
        if (bitDepth === 16) {
          view.setInt16(p, v, true); p += 2;
        } else {
          if (v < 0) v += 0x1000000;
          view.setUint8(p, v & 0xFF);
          view.setUint8(p + 1, (v >> 8) & 0xFF);
          view.setUint8(p + 2, (v >> 16) & 0xFF);
          p += 3;
        }
      }
    }
    return buffer;
  }

  function stemChannels(stem) {
    var g = (stem.playGain != null ? stem.playGain : (stem.gain || 1)) * (stem.level == null ? 1 : stem.level);
    if (stem.stereo) {
      var L = new Float32Array(stem.stereo.l.length);
      var R = new Float32Array(stem.stereo.r.length);
      for (var i = 0; i < L.length; i++) {
        L[i] = stem.stereo.l[i] * g;
        R[i] = stem.stereo.r[i] * g;
      }
      return [L, R];
    }
    var a = (clamp(stem.pan, -1, 1) + 1) * Math.PI / 4;
    var gl = Math.cos(a) * g, gr = Math.sin(a) * g;
    var l = new Float32Array(stem.mono.length);
    var r = new Float32Array(stem.mono.length);
    for (var j = 0; j < l.length; j++) {
      l[j] = stem.mono[j] * gl;
      r[j] = stem.mono[j] * gr;
    }
    return [l, r];
  }

  function encodeStemWav(stem, bitDepth) {
    var ch = stemChannels(stem, 1);
    return encodeWav(ch, SR, bitDepth || 24);
  }

  /* ---------------- MIDI ---------------- */

  function vlq(value) {
    var bytes = [value & 0x7F];
    value >>= 7;
    while (value > 0) {
      bytes.unshift((value & 0x7F) | 0x80);
      value >>= 7;
    }
    return bytes;
  }

  function encodeMidi(res, bpm) {
    bpm = bpm || res.spec.bpm;
    var ppq = 480;
    var tracks = res.midiTracks || [];
    var chunks = [];

    function buildTrack(events, meta) {
      var bytes = [];
      function push() { for (var i = 0; i < arguments.length; i++) bytes.push(arguments[i]); }
      // 轨道名
      var nameBytes = [];
      for (var i = 0; i < meta.name.length; i++) nameBytes.push(meta.name.charCodeAt(i) & 0x7F);
      push(0x00, 0xFF, 0x03, nameBytes.length);
      for (var j = 0; j < nameBytes.length; j++) push(nameBytes[j]);
      if (meta.tempo) {
        var us = Math.round(60000000 / bpm);
        push(0x00, 0xFF, 0x51, 0x03, (us >> 16) & 0xFF, (us >> 8) & 0xFF, us & 0xFF);
        push(0x00, 0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);
      }
      if (meta.program != null) {
        push(0x00, 0xC0 | meta.channel, meta.program & 0x7F);
      }

      var list = [];
      events.forEach(function (n) {
        var tick = Math.max(0, Math.round(n.t * ppq * bpm / 60));
        var dur = Math.max(1, Math.round(n.dur * ppq * bpm / 60));
        var vel = clamp(Math.round(n.vel * 127), 1, 127);
        var midi = clamp(Math.round(n.midi), 0, 127);
        list.push({ tick: tick, order: 1, type: 'on', midi: midi, vel: vel });
        list.push({ tick: tick + dur, order: 0, type: 'off', midi: midi, vel: 0 });
      });
      list.sort(function (a, b) { return a.tick - b.tick || a.order - b.order; });

      var last = 0;
      list.forEach(function (e) {
        var delta = vlq(e.tick - last);
        last = e.tick;
        for (var k = 0; k < delta.length; k++) push(delta[k]);
        if (e.type === 'on') push(0x90 | meta.channel, e.midi, e.vel);
        else push(0x80 | meta.channel, e.midi, 0);
      });
      push(0x00, 0xFF, 0x2F, 0x00);
      return bytes;
    }

    var conductor = buildTrack([], { name: 'BeatForge', channel: 0, program: null, tempo: true });
    chunks.push(conductor);
    tracks.forEach(function (tr) {
      chunks.push(buildTrack(tr.notes, {
        name: tr.name,
        channel: tr.channel & 0x0F,
        program: tr.program == null ? null : tr.program,
        tempo: false
      }));
    });

    var total = 14;
    chunks.forEach(function (c) { total += 8 + c.length; });
    var out = new Uint8Array(total);
    var p = 0;
    function w8(v) { out[p++] = v & 0xFF; }
    function w16(v) { out[p++] = (v >> 8) & 0xFF; out[p++] = v & 0xFF; }
    function w32(v) {
      out[p++] = (v >>> 24) & 0xFF;
      out[p++] = (v >>> 16) & 0xFF;
      out[p++] = (v >>> 8) & 0xFF;
      out[p++] = v & 0xFF;
    }
    function ws(s) { for (var i = 0; i < s.length; i++) w8(s.charCodeAt(i)); }

    ws('MThd'); w32(6); w16(1); w16(chunks.length); w16(ppq);
    chunks.forEach(function (c) {
      ws('MTrk'); w32(c.length);
      for (var i = 0; i < c.length; i++) w8(c[i]);
    });
    return out.buffer;
  }

  /* ---------------- ZIP ---------------- */

  var CRC_TABLE = (function () {
    var table = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  })();

  function crc32(bytes) {
    var c = 0xFFFFFFFF;
    for (var i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function makeZip(entries) {
    var enc = new TextEncoder();
    var items = entries.map(function (e) {
      var data = e.data instanceof Uint8Array ? e.data : new Uint8Array(e.data);
      var name = enc.encode(e.name);
      return { name: name, data: data, crc: crc32(data) };
    });

    var now = new Date();
    var dosTime = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((now.getSeconds() / 2) & 31);
    var dosDate = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);

    var localParts = [];
    var centralParts = [];
    var offset = 0;

    items.forEach(function (it) {
      var lh = new Uint8Array(30 + it.name.length);
      var dv = new DataView(lh.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true);
      dv.setUint16(10, dosTime, true);
      dv.setUint16(12, dosDate, true);
      dv.setUint32(14, it.crc, true);
      dv.setUint32(18, it.data.length, true);
      dv.setUint32(22, it.data.length, true);
      dv.setUint16(26, it.name.length, true);
      dv.setUint16(28, 0, true);
      lh.set(it.name, 30);
      localParts.push(lh, it.data);

      var ch = new Uint8Array(46 + it.name.length);
      var cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x0800, true);
      cv.setUint16(10, 0, true);
      cv.setUint16(12, dosTime, true);
      cv.setUint16(14, dosDate, true);
      cv.setUint32(16, it.crc, true);
      cv.setUint32(20, it.data.length, true);
      cv.setUint32(24, it.data.length, true);
      cv.setUint16(28, it.name.length, true);
      cv.setUint16(30, 0, true);
      cv.setUint16(32, 0, true);
      cv.setUint16(34, 0, true);
      cv.setUint16(36, 0, true);
      cv.setUint32(38, 0, true);
      cv.setUint32(42, offset, true);
      ch.set(it.name, 46);
      centralParts.push(ch);

      offset += lh.length + it.data.length;
    });

    var centralSize = centralParts.reduce(function (s, b) { return s + b.length; }, 0);
    var eocd = new Uint8Array(22);
    var ev = new DataView(eocd.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, items.length, true);
    ev.setUint16(10, items.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);

    var size = offset + centralSize + 22;
    var out = new Uint8Array(size);
    var p = 0;
    localParts.concat(centralParts, [eocd]).forEach(function (b) {
      out.set(b, p);
      p += b.length;
    });
    return out.buffer;
  }

  /* ============================================================
   * 指令改进：在已有 spec 上做增量修改（同一 seed）
   * ============================================================ */

  var LEVEL_TARGETS = [
    { ids: ['kick'], re: /底鼓|kick/ },
    { ids: ['snare'], re: /军鼓|snare|clap|拍手/ },
    { ids: ['hat'], re: /踩镲|hi-?hat|hat/ },
    { ids: ['perc'], re: /打击|perc|crash|tom|通鼓|cowbell|牛铃/ },
    { ids: ['kick', 'snare', 'hat', 'perc'], re: /鼓(?!点)|drums?/, group: true },
    { ids: ['bass'], re: /贝斯|808|bass/ },
    { ids: ['chords'], re: /和弦|chord|pad|stab/ },
    { ids: ['guitar'], re: /吉他|guitar/ },
    { ids: ['melody'], re: /旋律|melody|lead/ },
    { ids: ['reverb'], re: /混响|reverb/ },
    { ids: ['flute'], re: /笛子|flute/ }
  ];
  var LOUDER_RE = /大声|更响|响一点|突出|更重|重一点|重些|大一点|更大|加强|推上来|louder|boost|更强|hard/;
  var QUIETER_RE = /小声|轻一点|轻些|压低|压一下|弱一点|降低|降一点|小一点|quieter|softer|pull back|更轻/;

  function refineSpec(base, text) {
    var s = {};
    for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) s[k] = base[k];
    s.levels = {};
    for (var lk in (base.levels || {})) s.levels[lk] = base.levels[lk];
    s.notes = (base.notes || []).slice();
    var notes = [];
    var t = String(text == null ? '' : text).toLowerCase();

    var bpmM = t.match(/(\d{2,3})\s*bpm/) || t.match(/(?:bpm|速度|tempo)\s*[:：到为]?\s*(\d{2,3})/);
    if (bpmM && +bpmM[1] >= 50 && +bpmM[1] <= 200) {
      s.bpm = +bpmM[1];
      notes.push('BPM ' + s.bpm);
    } else if (/快一点|加快|更快|faster/.test(t)) {
      s.bpm = clamp(s.bpm + 6, 50, 200); notes.push('BPM +6');
    } else if (/慢一点|放慢|更慢|slower/.test(t)) {
      s.bpm = clamp(s.bpm - 6, 50, 200); notes.push('BPM -6');
    }

    var swM = t.match(/(?:摇摆|swing)\s*(\d{1,2})\s*%/);
    if (swM) {
      s.swing = clamp(+swM[1] / 100, 0, 0.45); notes.push(tr('notes.swingPct', swM[1]));
    } else if (/摇摆多|更摇摆|更多摇摆|more swing|shuffle/.test(t)) {
      s.swing = clamp(s.swing + 0.08, 0, 0.45); notes.push(tr('refineNotes.swingMore'));
    } else if (/少摇摆|不要摇摆|直拍|straight|no swing/.test(t)) {
      s.swing = 0.02; notes.push(tr('notes.straight'));
    }

    if (/纯鼓|只要鼓|drums? only/.test(t)) {
      s.drumsOnly = true; notes.push(tr('notes.drumsOnly'));
    } else if (/加回旋律|要旋律|加旋律|有旋律/.test(t)) {
      s.drumsOnly = false; notes.push(rn('keepMelody'));
    }
    if (/旋律多|多一点旋律|更多旋律|旋律再多|more melody/.test(t)) {
      s.melody = clamp(s.melody + 0.25, 0, 1); notes.push(tr('notes.melodyMore'));
    } else if (/旋律少|少一点旋律|旋律再少|less melody/.test(t)) {
      s.melody = clamp(s.melody - 0.25, 0, 1); notes.push(tr('notes.melodyLess'));
    }

    if (/复杂|花一点|花哨|更密|节奏密|busier|complex/.test(t)) {
      s.complexity = clamp(s.complexity + 0.25, 0, 1); notes.push(tr('notes.complexityUp'));
    } else if (/简单|简洁|空一点|留白|simpler|minimal/.test(t)) {
      s.complexity = clamp(s.complexity - 0.25, 0, 1); notes.push(tr('notes.complexityDown'));
    }

    if (/(去掉|不要|没有).{0,3}(黑胶|噪声)/.test(t)) {
      s.vinyl = 0.02; notes.push(rn('noVinyl'));
    } else if (/黑胶|噪声|vinyl/.test(t)) {
      s.vinyl = clamp(s.vinyl + 0.2, 0, 0.85); notes.push(tr('notes.vinylMore'));
    }

    if (/混响大|更多混响|加点混响|加混响|多一点混响|大空间|空间感|more reverb|wash/.test(t)) {
      s.reverb = clamp(s.reverb + 0.15, 0, 0.5); notes.push(rn('reverbBig'));
    } else if (/混响小|少混响|干一点|干声|dry/.test(t)) {
      s.reverb = clamp(s.reverb - 0.15, 0, 0.5); notes.push(rn('reverbDry'));
    }

    if (/暗|阴|dark/.test(t)) { s.bright = 0.28; notes.push(tr('notes.dark')); }
    else if (/温暖|warm|复古|柔和/.test(t)) { s.bright = 0.55; notes.push(tr('notes.warm')); }
    else if (/明亮|亮一点|bright/.test(t)) { s.bright = 0.8; notes.push(tr('notes.bright')); }

    if (/不要\s*吉他|去掉吉他|no\s*guitar/.test(t)) {
      s.guitarLayer = false; notes.push(rn('noGuitar'));
    } else if (/加吉他|加失真|吉他层|加一层吉他|add guitar/.test(t)) {
      s.guitarLayer = true; notes.push(tr('noteAddGuitar'));
    }

    if (/不要\s*笛子|去掉笛子|no\s*flute/.test(t)) {
      s.flute = false; notes.push(rn('noFlute'));
    } else if (/加笛子|加一支笛子|要笛子|加点笛子|add flute|flute/.test(t)) {
      s.flute = true; notes.push(rn('addFlute'));
    }

    if (/不要\s*808|去掉\s*808|no\s*808/.test(t)) {
      s.no808 = true; notes.push(rn('no808'));
    } else if (/加\s*808|要\s*808|带\s*808/.test(t)) {
      s.no808 = false; notes.push(rn('keep808'));
    }

    if (/换.{0,4}(律动|变体|鼓|节奏)|new\s*groove|another\s*groove|different\s*groove/.test(t)) {
      s.variant = (s.variant + 1) % 4;
      notes.push(tr('refineNotes.newGroove', s.variant + 1));
    }

    // 新增的鼓组 / 乐器 / 和弦 / 音效维度，与主输入共用同一套解析
    applyTraits(s, t, notes);

    var clauses = t.split(/[，,。；;\n]/);
    clauses.forEach(function (c) {
      var up = LOUDER_RE.test(c), down = QUIETER_RE.test(c);
      if (!up && !down) return;
      var factor = up ? 1.3 : 0.7;
      var hit = {};
      var specific = LEVEL_TARGETS.filter(function (tg) { return !tg.group && tg.re.test(c); });
      var targets = specific.length ? specific : LEVEL_TARGETS.filter(function (tg) { return tg.group && tg.re.test(c); });
      targets.forEach(function (tg) {
        tg.ids.forEach(function (id) { hit[id] = true; });
      });
      Object.keys(hit).forEach(function (id) {
        var cur = s.levels[id] == null ? 1 : s.levels[id];
        s.levels[id] = clamp(cur * factor, 0.2, 2);
        notes.push(tr((up ? 'notes.louder' : 'notes.quieter'), tr('levels.' + id)));
      });
    });

    s.notes = (base.notes || []).filter(function (n) { return n.indexOf('改进') !== 0; });
    notes.forEach(function (n) { s.notes.push(tr('refinePrefix', n)); });
    return { spec: normalizeSpec(s), notes: notes };
  }

  var LEVEL_NAMES = {
    kick: '底鼓', snare: '军鼓', hat: '踩镲', perc: '打击乐', bass: '808 / 贝斯',
    chords: '和弦', guitar: '吉他', melody: '旋律', flute: '笛子', reverb: '混响'
  };

  /* 按当前分轨电平重新混合（用户调过分轨音量后，mix.wav 与分轨保持一致） */
  function mixFromStems(res) {
    var len = res.frames;
    var l = new Float32Array(len), r = new Float32Array(len);
    res.stems.forEach(function (stem) {
      var ch = stemChannels(stem);
      for (var i = 0; i < len; i++) {
        l[i] += ch[0][i];
        r[i] += ch[1][i];
      }
    });
    var peak = 0;
    for (var k = 0; k < len; k++) peak = Math.max(peak, Math.abs(l[k]), Math.abs(r[k]));
    if (peak > 0.89) {
      var g = 0.89 / peak;
      for (var j = 0; j < len; j++) { l[j] *= g; r[j] *= g; }
    }
    return { l: l, r: r };
  }

  /* ---------------- API ---------------- */

  var API = {
    version: '1.0.0',
    SR: SR,
    STYLES: STYLE_DEFS,
    parsePrompt: parsePrompt,
    refineSpec: refineSpec,
    mixFromStems: mixFromStems,
    normalizeSpec: normalizeSpec,
    render: render,
    renderSong: renderSong,
    SONG_TEMPLATE: SONG_TEMPLATE,
    encodeWav: encodeWav,
    encodeStemWav: encodeStemWav,
    encodeMidi: encodeMidi,
    makeZip: makeZip,
    stemChannels: stemChannels,
    midiFreq: midiFreq,
    noteName: function (pc) { return ROOT_NAMES[((pc % 12) + 12) % 12]; },
    setTranslator: function (fn, refineFn) { translator = fn; refiner = refineFn; }
  };

  global.BeatForge = API;
})(window);
