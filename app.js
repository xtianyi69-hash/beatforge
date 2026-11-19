/* BeatForge UI */
(function () {
  'use strict';

  var engine = window.BeatForge;
  var i18n = window.BeatForgeI18n;
  var t = function (k, a) { return i18n ? i18n.t(k, a) : k; };
  var n = function (k, a) { return i18n ? i18n.note(k, a) : k; };
  var rn = function (k, a) { return i18n ? i18n.refineNote(k, a) : k; };
  var $ = function (s) { return document.querySelector(s); };
  if (engine && engine.setTranslator && i18n) {
    engine.setTranslator(function (k, a) { return i18n.t(k, a); }, function (k, a) { return i18n.refineNote(k, a); });
  }

  var ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  var EXAMPLES = [
    { label: 'Boom Bap', zh: '90 BPM 的 boom bap，A 小调，8 小节，鼓要 swing 一点，和弦用七和弦，加点黑胶器声，旋律少一点', en: '90 BPM boom bap in A minor, 8 bars, swing drums, jazzy chords, a bit of vinyl noise, less melody' },
    { label: 'Trap', zh: '140 BPM trap，F 小调，8 小节，808 要滑音，hi-hat 有 roll，氛围暗一点', en: '140 BPM trap in F minor, 8 bars, gliding 808, hi-hat rolls, dark and moody' },
    { label: 'Drill', zh: '142 BPM drill，G 小调，8 小节，808 下滑，鼓要空一点，旋律少', en: '142 BPM drill in G minor, 8 bars, sliding 808, sparse drums, little melody' },
    { label: 'Lo-Fi', zh: '82 BPM lofi hiphop，D 小调，8 小节，爵士和弦，黑胶器声明显，旋律惶懒', en: '82 BPM lofi hip hop in D minor, 8 bars, jazzy chords, heavy vinyl noise, lazy melody' },
    { label: 'House', zh: '124 BPM house，A 小调，8 小节，four on the floor，反拍开镬，和弦 stab', en: '124 BPM house in A minor, 8 bars, four on the floor, offbeat open hats, chord stabs' },
    { label: 'Phonk', zh: '132 BPM phonk，C 小调，8 小节，牛铃旋律，808 失真，鼓要硬', en: '132 BPM phonk in C minor, 8 bars, cowbell melody, distorted 808, hard drums' },
    { label: 'Rock', zh: '122 BPM rock，E 小调，8 小节，失真吉他 power chord，贝斯走八分音符，鼓要 crash 和 tom fill', en: '122 BPM rock in E minor, 8 bars, distorted guitar power chords, eighth-note bass, crash and tom fills' },
    { label: '80s Rock', zh: '118 BPM 80s rock，E 小调，8 小节，gated reverb 军鼓，合成器 pad，主音吉他，tom fill', en: '118 BPM 80s rock in E minor, 8 bars, gated reverb snare, synth pad, lead guitar, tom fills' },
    { label: 'Modern Rap', zh: '146 BPM 现代说唱，D 小调，8 小节，重 808 滑音，hi-hat roll，军鼓落在三拍', en: '146 BPM modern rap in D minor, 8 bars, heavy gliding 808, hi-hat rolls, snare on beat three' },
    { label: 'Reggae', zh: '78 BPM reggae，A 大调，8 小节，one drop，反拍 organ skank，贝斯要深', en: '78 BPM reggae in A major, 8 bars, one drop, offbeat organ skank, deep bass' },
    { label: 'Jazz', zh: '118 BPM jazz，F 大调，8 小节，swing，walking bass，ride 镬', en: '118 BPM jazz in F major, 8 bars, swing, walking bass, ride cymbal' },
    { label: 'DnB', zh: '174 BPM dnb，F# 小调，8 小节，breakbeat，低音要动', en: '174 BPM drum and bass in F# minor, 8 bars, breakbeat, driving sub bass' },
    { label: 'Funk', zh: '108 BPM funk，E 小调，8 小节，16 分贝斯，切分和弦，ghost snare', en: '108 BPM funk in E minor, 8 bars, 16th bass, syncopated chords, ghost snares' },
    { label: 'Reggaeton', zh: '96 BPM reggaeton，D 小调，8 小节，dembow，沙锤，808', en: '96 BPM reggaeton in D minor, 8 bars, dembow, shakers, 808' },
    { label: 'Afrobeats', zh: '104 BPM afrobeats，G 大调，8 小节，切分底鼓，沙锤，吉他 riff', en: '104 BPM afrobeats in G major, 8 bars, syncopated kick, shakers, guitar riff' },
    { label: 'Bossa', zh: '132 BPM bossa，C 大调，8 小节，clave，尼龙吉他，轻鼓', en: '132 BPM bossa in C major, 8 bars, clave, nylon guitar, soft drums' },
    { label: 'Synthwave', zh: '100 BPM synthwave，A 小调，8 小节，鼓机，合成器苦音，pad', en: '100 BPM synthwave in A minor, 8 bars, drum machine, synth arpeggio, pad' }
  ];

  function exPrompt(ex) { return i18n && i18n.isEn() ? ex.en : ex.zh; }
  function keyTextOf(spec) {
    var s = spec.keyText || '';
    return s.replace(/\u5c0f\u8c03/g, t('mode_minor')).replace(/\u5927\u8c03/g, t('mode_major'));
  }

  var el = {
    langBtn: $('#langBtn'),
    prompt: $('#prompt'),
    examples: $('#examples'),
    style: $('#style'),
    bpm: $('#bpm'),
    bars: $('#bars'),
    swing: $('#swing'),
    swingVal: $('#swingVal'),
    root: $('#root'),
    mode: $('#mode'),
    seed: $('#seed'),
    dice: $('#dice'),
    generate: $('#generate'),
    status: $('#status'),
    understood: $('#understood'),
    result: $('#result'),
    resTitle: $('#resTitle'),
    resBadges: $('#resBadges'),
    wave: $('#wave'),
    playhead: $('#playhead'),
    play: $('#play'),
    playIcon: $('#playIcon'),
    time: $('#time'),
    dur: $('#dur'),
    loopBtn: $('#loopBtn'),
    testTone: $('#testTone'),
    safePlay: $('#safePlay'),
    refineBtn: $('#refineBtn'),
    refine: $('#refine'),
    refineClose: $('#refineClose'),
    rBpm: $('#rBpm'),
    rRoot: $('#rRoot'),
    rMode: $('#rMode'),
    rSwing: $('#rSwing'),
    rSwingVal: $('#rSwingVal'),
    rComplex: $('#rComplex'),
    rComplexVal: $('#rComplexVal'),
    rMelody: $('#rMelody'),
    rMelodyVal: $('#rMelodyVal'),
    rBright: $('#rBright'),
    rBrightVal: $('#rBrightVal'),
    rVinyl: $('#rVinyl'),
    rVinylVal: $('#rVinylVal'),
    rReverb: $('#rReverb'),
    rReverbVal: $('#rReverbVal'),
    rGuitar: $('#rGuitar'),
    rNo808: $('#rNo808'),
    rFlute: $('#rFlute'),
    rDrumsOnly: $('#rDrumsOnly'),
    rApply: $('#rApply'),
    stemsReset: $('#stemsReset'),
    rInstr: $('#rInstr'),
    rInstrApply: $('#rInstrApply'),
    rInstrNotes: $('#rInstrNotes'),
    rReset: $('#rReset'),
    stems: $('#stems'),
    dlMix: $('#dlMix'),
    dlZip: $('#dlZip'),
    dlMidi: $('#dlMidi'),
    regen: $('#regen'),
    songBtn: $('#songBtn'),
    songMap: $('#songMap'),
    refineSongTools: $('#refineSongTools'),
    rsBar: $('#rsBar'),
    rsBars: $('#rsBars'),
    rsAction: $('#rsAction'),
    rsTarget: $('#rsTarget'),
    rsAdd: $('#rsAdd'),
    rsEditList: $('#rsEditList'),
    loopBtnBack: $('#loopBtnBack'),
    dawHint: $('#dawHint'),
    toast: $('#toast')
  };

  var state = {
    spec: null,
    result: null,
    baseSpec: null,
    busy: false,
    loop: true,
    songEdits: [],
    editId: 1,
    offset: 0,
    playing: false
  };

  /* ---------------- 初始化 ---------------- */

  function init() {
    if (i18n) {
      i18n.applyStatic(document);
      updateLangBtn();
    }
    el.langBtn.addEventListener('click', function () {
      var next = i18n && i18n.isEn() ? 'zh' : 'en';
      i18n.setLang(next);
      i18n.applyStatic(document);
      updateLangBtn();
      // 重新渲染依赖文案的动态区域
      if (state.spec) reparse();
      if (state.result) {
        showResult(state.result, state.result._genMs || 0);
      }
      renderEditList();
    });
    Object.keys(engine.STYLES).forEach(function (key) {
      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = engine.STYLES[key].label;
      el.style.appendChild(opt);
    });
    ROOTS.forEach(function (r) {
      var opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      el.root.appendChild(opt);
    });
    EXAMPLES.forEach(function (ex) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = ex.label;
      b.addEventListener('click', function () {
        el.prompt.value = exPrompt(ex);
        reparse();
        generate(false);
      });
      el.examples.appendChild(b);
    });

    el.prompt.value = exPrompt(EXAMPLES[0]);
    el.seed.value = '';
    reparse();

    el.prompt.addEventListener('input', debounce(reparse, 180));
    el.style.addEventListener('change', function () {
      var def = engine.STYLES[el.style.value];
      if (!def) return;
      el.bpm.value = def.bpm;
      el.swing.value = Math.round(def.swing * 100);
      el.swingVal.textContent = el.swing.value + '%';
      el.root.value = ROOTS[def.root];
      el.mode.value = def.mode;
    });
    el.swing.addEventListener('input', function () {
      el.swingVal.textContent = el.swing.value + '%';
    });
    el.generate.addEventListener('click', function () { generate(false); });
    el.regen.addEventListener('click', function () { generate(true); });
    el.songBtn.addEventListener('click', expandToSong);
    el.loopBtnBack.addEventListener('click', backToLoop);
    el.rsAdd.addEventListener('click', addSongEdit);
    el.rsTarget.disabled = true;
    el.rsAction.addEventListener('change', function () {
      el.rsTarget.disabled = el.rsAction.value !== 'mute';
    });
    el.dice.addEventListener('click', function () {
      el.seed.value = String(Math.floor(Math.random() * 1000000));
    });
    el.play.addEventListener('click', togglePlay);
    el.testTone.addEventListener('click', playTestTone);
    el.safePlay.addEventListener('click', toggleSafePlay);
    ROOTS.forEach(function (r) {
      var opt = document.createElement('option');
      opt.value = r;
      opt.textContent = r;
      el.rRoot.appendChild(opt);
    });
    el.refineBtn.addEventListener('click', openRefine);
    el.refineClose.addEventListener('click', closeRefine);
    el.refine.addEventListener('click', function (e) {
      if (e.target === el.refine) closeRefine();
    });
    el.stemsReset.addEventListener('click', function () {
      if (!state.result) return;
      state.result.stems.forEach(function (stem) {
        if (stem._slider) stem._slider.value = '100';
        setStemLevel(stem, 100);
      });
      toast(t('toastLevelsReset'));
    });
    el.rApply.addEventListener('click', applyRefine);
    el.rInstrApply.addEventListener('click', applyInstruction);
    el.rInstr.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        applyInstruction();
      }
    });
    el.rReset.addEventListener('click', resetRefine);
    [['rSwing', 'rSwingVal', '%'], ['rComplex', 'rComplexVal', ''], ['rMelody', 'rMelodyVal', ''],
      ['rBright', 'rBrightVal', ''], ['rVinyl', 'rVinylVal', ''], ['rReverb', 'rReverbVal', '']].forEach(function (p) {
      el[p[0]].addEventListener('input', function () {
        el[p[1]].textContent = el[p[0]].value + p[2];
      });
    });
    el.loopBtn.addEventListener('click', function () {
      state.loop = !state.loop;
      el.loopBtn.classList.toggle('active', state.loop);
      el.loopBtn.setAttribute('aria-pressed', String(state.loop));
      if (state.playing) {
        var pos = currentPosition();
        if (safeMode) startSafe(pos, t('statusPlayingGeneric'));
        else { stopPlayback(false); state.offset = pos; play(); }
      }
    });
    el.dlMix.addEventListener('click', downloadMix);
    el.dlZip.addEventListener('click', downloadAll);
    el.dlMidi.addEventListener('click', downloadMidi);
    el.wave.addEventListener('click', seekFromEvent);

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        generate(false);
      } else if (e.key === 'Escape' && !el.refine.hidden) {
        closeRefine();
      } else if (e.code === 'Space' && !isTyping(e.target)) {
        e.preventDefault();
        togglePlay();
      }
    });

    window.addEventListener('resize', debounce(function () {
      if (state.result) drawWave(state.result);
    }, 150));

    setStatus(t('statusReady'));
  }

  function updateLangBtn() {
    var en = i18n && i18n.isEn();
    el.langBtn.textContent = en ? '中' : 'EN';
    el.langBtn.setAttribute('aria-label', en ? t('switchZh') : t('switchEn'));
  }

  function isTyping(t) {
    if (!t) return false;
    var tag = t.tagName;
    return tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'SELECT' || t.isContentEditable;
  }

  function debounce(fn, ms) {
    var timer = 0;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, ms);
    };
  }

  /* ---------------- 解析 / 表单 ---------------- */

  function reparse() {
    var spec = engine.parsePrompt(el.prompt.value);
    state.spec = spec;
    el.style.value = spec.style;
    el.bpm.value = spec.bpm;
    el.bars.value = spec.bars;
    el.swing.value = Math.round(spec.swing * 100);
    el.swingVal.textContent = el.swing.value + '%';
    el.root.value = ROOTS[spec.rootPc];
    el.mode.value = spec.mode;
    if (!el.seed.value) el.seed.value = String(spec.seed % 1000000);
    state.lastPrompt = el.prompt.value;
    renderUnderstood(spec);
  }

  function renderUnderstood(spec) {
    el.understood.innerHTML = '';
    var label = document.createElement('span');
    label.className = 'understood-label';
    label.textContent = t('understood');
    el.understood.appendChild(label);
    var notes = spec.notes || [];
    notes.forEach(function (text) {
      var s = document.createElement('span');
      s.className = 'understood-item';
      s.textContent = text;
      el.understood.appendChild(s);
    });
    var seed = document.createElement('span');
    seed.className = 'understood-item dim';
    seed.textContent = t('seedChip') + ' ' + (el.seed.value || '');
    el.understood.appendChild(seed);
  }

  function collectSpec() {
    var spec = engine.normalizeSpec(state.spec || engine.parsePrompt(el.prompt.value));
    spec.style = el.style.value || spec.style;
    spec.bpm = parseInt(el.bpm.value, 10) || spec.bpm;
    spec.bars = parseInt(el.bars.value, 10) || spec.bars;
    spec.swing = clamp(parseInt(el.swing.value, 10) / 100, 0, 0.45);
    spec.rootPc = Math.max(0, ROOTS.indexOf(el.root.value));
    spec.mode = el.mode.value === 'major' ? 'major' : 'minor';
    spec.seed = Math.abs(parseInt(el.seed.value, 10) || 0) % 1000000;
    return engine.normalizeSpec(spec);
  }

  function clamp(x, a, b) { return x < a ? a : (x > b ? b : x); }

  /* ---------------- 生成 ---------------- */

  function generate(newSeed) {
    if (state.busy) return;
    if (state.lastPrompt !== el.prompt.value) reparse();
    fullStop();
    var spec = collectSpec();
    if (newSeed) {
      spec.seed = Math.floor(Math.random() * 1000000);
      el.seed.value = String(spec.seed);
    }
    state.spec = spec;
    state.songEdits = [];
    state.editId = 1;
    state.useStems = false;
    state.busy = true;
    el.generate.disabled = true;
    el.generate.classList.add('loading');
    el.regen.disabled = true;
    setStatus(t('statusArrange'));
    var t0 = performance.now();

    setTimeout(function () {
      try {
        var phases = { arrange: '编排鼓组与和声…', synth: '合成乐器…', mix: '混音与空间处理…', master: '母带处理…' };
        var res = engine.render(spec, function (phase) {
          setStatus(phases[phase] || t('statusSynthGeneric'));
        });
        var ms = performance.now() - t0;
        state.result = res;
        state.baseSpec = copySpec(res.spec);
        showResult(res, ms);
        setStatus(t('statusDone', [res.duration.toFixed(1), (ms / 1000).toFixed(1)]));
      } catch (err) {
        console.error(err);
        setStatus(t('statusFailed', err && err.message ? err.message : err));
        toast(t('toastFailed'));
      } finally {
        state.busy = false;
        el.generate.disabled = false;
        el.generate.classList.remove('loading');
        el.regen.disabled = false;
      }
    }, 40);
  }

  function showResult(res, ms) {
    var spec = res.spec;
    el.result.hidden = false;
    el.resTitle.textContent = keyTextOf(spec) + ' · ' + spec.bpm + ' BPM · ' + spec.bars + ' ' + t('barsSuffix');
    el.dur.textContent = formatTime(res.duration);
    el.time.textContent = '0:00.0';

    el.resBadges.innerHTML = '';
    var badges = [
      spec.styleLabel,
      'swing ' + Math.round(spec.swing * 100) + '%',
      res.duration.toFixed(1) + 's',
      'seed ' + spec.seed,
      (ms / 1000).toFixed(1) + 's ' + t('genSuffix')
    ];
    if (res.sections) badges.unshift(t('wholeSong', res.sections.length));
    badges.forEach(function (text) {
      var s = document.createElement('span');
      s.className = 'badge';
      s.textContent = text;
      el.resBadges.appendChild(s);
    });

    var layers = (spec.style === 'rock' || spec.guitarLayer)
      ? t('dawLayersRock') : t('dawLayersStd');
    el.dawHint.innerHTML = t('dawHint', [spec.bpm, layers]);
    if (res.sections) {
      el.dawHint.innerHTML += '<br>' + t('songStructure') + res.sections.map(function (s) {
        return s.name + ' (' + t('barsUnit', s.bars) + ')';
      }).join(' → ') + '. ' + t('sectionFill');
      el.songBtn.textContent = t('regenerateSong');
      el.loopBtnBack.hidden = false;
    } else {
      el.songBtn.textContent = t('expandSong');
      el.loopBtnBack.hidden = true;
    }

    renderSongMap(res);
    renderStems(res);
    el.dlMix.disabled = false;
    el.refineBtn.disabled = false;
    el.dlZip.disabled = false;
    el.dlMidi.disabled = false;
    state.offset = 0;
    drawWave(res);
    updatePlayhead();
    if (!el.result.dataset.shown) {
      el.result.dataset.shown = '1';
      setTimeout(function () {
        el.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }

  function ACTION_NAMES() {
    return { fill: t('actFill'), tom: t('actTom'), crash: t('actCrash'), shaker: t('actShaker'), flute: t('actFlute'), mute: t('actMute') };
  }
  function TARGET_NAMES() {
    return { all: t('tAll'), kick: t('tKick'), snare: t('tSnare'), hat: t('tHat'), perc: t('tPerc'), bass: t('tBass'), guitar: t('tGuitar'), chords: t('tChords'), melody: t('tMelody'), flute: t('tFlute') };
  }

  function seekToTime(time) {
    if (!state.result) return;
    var pos = clamp(time, 0, Math.max(0, state.result.duration - 0.01));
    state.offset = pos;
    if (state.playing) {
      if (safeMode) {
        try { safeAudio.pause(); } catch (e) { /* noop */ }
        startSafe(pos, t('statusPlayingGeneric'));
      } else {
        stopPlayback(false);
        play();
      }
    } else {
      // 停止状态下跳转：直接从该位置开始播放，避免出现“跳过去了但没声音”
      startSafe(pos, t('statusPlayingGeneric'));
    }
    updatePlayhead();
  }

  function renderSongMap(res) {
    if (!res.sections) {
      el.songMap.hidden = true;
      el.songMap.innerHTML = '';
      return;
    }
    el.songMap.hidden = false;
    el.songMap.innerHTML = '';
    var barSec = (60 / res.spec.bpm) * 4;
    res.sections.forEach(function (sec, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'song-seg' + (i % 2 ? ' alt' : '');
      var name = document.createElement('b');
      name.textContent = t(sec.name.toLowerCase()) + ' · ' + t('barsUnit', sec.bars);
      var time = document.createElement('span');
      time.textContent = formatTime(sec.startSec) + ' – ' + formatTime(sec.endSec);
      b.appendChild(name);
      b.appendChild(time);
      b.addEventListener('click', function () { seekToTime(sec.startSec); });
      el.songMap.appendChild(b);
    });
    (res.spec.songEdits || []).forEach(function (ed) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'song-seg edit';
      var name = document.createElement('b');
      name.textContent = '✎ ' + ACTION_NAMES()[ed.type] + (ed.type === 'mute' ? ' · ' + TARGET_NAMES()[ed.target] : '');
      var time = document.createElement('span');
      var t0 = ed.bar * barSec;
      time.textContent = t('barRange', [ed.bar + 1, ed.bar + ed.bars]) + ' · ' + formatTime(t0) + ' – ' + formatTime(t0 + ed.bars * barSec);
      b.appendChild(name);
      b.appendChild(time);
      b.addEventListener('click', function () { seekToTime(t0); });
      el.songMap.appendChild(b);
    });
  }

  function renderEditList() {
    if (!el.rsEditList) return;
    el.rsEditList.innerHTML = '';
    if (!state.songEdits.length) return;
    state.songEdits.forEach(function (ed) {
      var row = document.createElement('div');
      row.className = 'rs-edit-row';
      var name = document.createElement('span');
      name.className = 'rs-name';
      name.textContent = t('barFrom', ed.bar + 1) + ' · ' + t('barsUnit', ed.bars) + ' · ' +
        ACTION_NAMES()[ed.type] + (ed.type === 'mute' ? '（' + TARGET_NAMES()[ed.target] + '）' : '');
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn ghost small';
      del.textContent = t('delEdit');
      del.addEventListener('click', function () { removeSongEdit(ed.id); });
      row.appendChild(name);
      row.appendChild(del);
      el.rsEditList.appendChild(row);
    });
  }

  function addSongEdit() {
    if (!state.result || !state.result.sections) return;
    var maxBar = state.result.spec.bars;
    var bar = clamp((parseInt(el.rsBar.value, 10) || 1) - 1, 0, maxBar - 1);
    var bars = clamp(parseInt(el.rsBars.value, 10) || 1, 1, maxBar - bar);
    var type = el.rsAction.value;
    var target = type === 'mute' ? (el.rsTarget.value || 'all') : 'all';
    state.songEdits.push({ id: state.editId++, type: type, bar: bar, bars: bars, target: target });
    var edits = state.songEdits.map(function (e) {
      return { id: e.id, type: e.type, bar: e.bar, bars: e.bars, target: e.target };
    });
    var spec = copySpec(state.result.spec);
    spec.songEdits = edits;
    renderWith(function () {
      return engine.renderSong(spec);
    }, t('statusApplyEdit'), function () {
      renderEditList();
    });
  }

  function removeSongEdit(id) {
    state.songEdits = state.songEdits.filter(function (e) { return e.id !== id; });
    var spec = copySpec(state.result.spec);
    spec.songEdits = state.songEdits.map(function (e) {
      return { id: e.id, type: e.type, bar: e.bar, bars: e.bars, target: e.target };
    });
    renderWith(function () {
      return engine.renderSong(spec);
    }, t('statusRemoveEdit'), function () {
      renderEditList();
    });
  }

  function renderWith(fn, label, done) {
    if (state.busy || !state.result) return;
    fullStop();
    state.busy = true;
    el.generate.disabled = true;
    el.songBtn.disabled = true;
    el.regen.disabled = true;
    setStatus(label + '…');
    var t0 = performance.now();
    setTimeout(function () {
      try {
        var res = fn();
        var ms = performance.now() - t0;
        state.result = res;
        state.baseSpec = copySpec(res.spec);
        showResult(res, ms);
        if (done) done(res);
        setStatus(t('statusEditDone', [label, res.duration.toFixed(1), (ms / 1000).toFixed(1)]));
      } catch (err) {
        console.error(err);
        setStatus(label + t('statusFailed', err && err.message ? err.message : err));
        toast(t('statusOpFail'));
      } finally {
        state.busy = false;
        el.generate.disabled = false;
        el.songBtn.disabled = false;
        el.regen.disabled = false;
      }
    }, 40);
  }

  function expandToSong() {
    var spec = copySpec(state.result.spec);
    if (!state.result.sections) {
      state.songEdits = [];
      state.editId = 1;
    }
    spec.song = true;
    spec.bars = engine.SONG_TEMPLATE.reduce(function (a, s) { return a + s.bars; }, 0);
    spec.songEdits = state.songEdits.map(function (e) {
      return { id: e.id, type: e.type, bar: e.bar, bars: e.bars, target: e.target };
    });
    renderWith(function () {
      return engine.renderSong(spec);
    }, t('statusExpand'));
  }

  function backToLoop() {
    state.songEdits = [];
    state.editId = 1;
    var spec = copySpec(state.result.spec);
    spec.song = false;
    spec.bars = 8;
    renderWith(function () {
      return engine.render(spec);
    }, t('statusBackLoop'));
  }

  /* ---------------- 分轨 UI ---------------- */

  function rmsOf(stem) {
    var a = stem.stereo ? stem.stereo.l : stem.mono;
    var b = stem.stereo ? stem.stereo.r : null;
    var sum = 0, n = 0;
    for (var i = 0; i < a.length; i += 16) {
      sum += a[i] * a[i];
      if (b) sum += b[i] * b[i];
      n++;
    }
    return Math.sqrt(sum / Math.max(1, n));
  }

  function renderStems(res) {
    el.stems.innerHTML = '';
    var rmsValues = res.stems.map(rmsOf);
    var maxRms = Math.max.apply(null, rmsValues.concat([1e-6]));
    res.stems.forEach(function (stem, idx) {
      stem.solo = false;
      stem.mute = false;
      var row = document.createElement('div');
      row.className = 'stem';
      row.dataset.id = stem.id;

      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = stem.color;
      row.appendChild(dot);

      var name = document.createElement('span');
      name.className = 'stem-name';
      name.textContent = t('stem_' + stem.id) !== ('stem_' + stem.id) ? t('stem_' + stem.id) : stem.label;
      row.appendChild(name);

      var meter = document.createElement('span');
      meter.className = 'meter';
      var bar = document.createElement('i');
      var pct = Math.round(Math.pow(rmsValues[idx] / maxRms, 0.6) * 100);
      bar.style.width = Math.max(6, pct) + '%';
      bar.style.background = stem.color;
      meter.appendChild(bar);
      row.appendChild(meter);

      var btns = document.createElement('span');
      btns.className = 'stem-btns';

      var solo = document.createElement('button');
      solo.type = 'button';
      solo.className = 'mini';
      solo.textContent = 'S';
      solo.title = t('soloTitle');
      solo.addEventListener('click', function () {
        stem.solo = !stem.solo;
        solo.classList.toggle('on', stem.solo);
        solo.setAttribute('aria-pressed', String(stem.solo));
        applyStemGains();
      });

      var mute = document.createElement('button');
      mute.type = 'button';
      mute.className = 'mini';
      mute.textContent = 'M';
      mute.title = t('muteTitle');
      mute.addEventListener('click', function () {
        stem.mute = !stem.mute;
        mute.classList.toggle('on', stem.mute);
        mute.setAttribute('aria-pressed', String(stem.mute));
        applyStemGains();
      });

      var dl = document.createElement('button');
      dl.type = 'button';
      dl.className = 'mini dl';
      dl.textContent = '↓';
      dl.title = t('dlStemTitle');
      dl.addEventListener('click', function () { downloadStem(stem); });

      var levelWrap = document.createElement('span');
      levelWrap.className = 'stem-level';
      var slider = document.createElement('input');
      slider.type = 'range';
      slider.min = '0';
      slider.max = '150';
      slider.step = '1';
      slider.value = '100';
      slider.setAttribute('aria-label', stem.label + ' ' + t('volumeSuffix'));
      slider.title = t('volumeTitle');
      var levelOut = document.createElement('span');
      levelOut.className = 'stem-level-val';
      levelOut.textContent = '100%';
      stem._levelOut = levelOut;
      stem._slider = slider;
      slider.addEventListener('input', function () {
        setStemLevel(stem, parseInt(slider.value, 10));
      });
      levelWrap.appendChild(slider);
      levelWrap.appendChild(levelOut);
      row.appendChild(levelWrap);

      btns.appendChild(solo);
      btns.appendChild(mute);
      btns.appendChild(dl);
      row.appendChild(btns);
      el.stems.appendChild(row);
    });
  }

  function stemTarget(stem) {
    var level = stem.level == null ? 1 : stem.level;
    return (stem.playGain || stem.gain || 1) * level * (stem._audible !== false ? 1 : 0);
  }

  function applyStemGains() {
    if (!state.result) return;
    var anySolo = state.result.stems.some(function (s) { return s.solo; });
    state.result.stems.forEach(function (s) {
      var audible = !s.mute && (!anySolo || s.solo);
      s._audible = audible;
    });
    nodes.forEach(function (n) {
      n.gain.gain.setTargetAtTime(stemTarget(n.stem), nodeCtx().currentTime, 0.01);
    });
  }

  function setStemLevel(stem, pct) {
    state.useStems = true;
    stem.level = clamp(pct / 100, 0, 1.5);
    if (stem._levelOut) stem._levelOut.textContent = Math.round(pct) + '%';
    if (state.result) {
      state.result.levelsChanged = true;
      state.result._userMix = null;
    }
    applyStemGains();
  }

  function mixFor(res) {
    if (!res.levelsChanged) return res.mix;
    if (!res._userMix) res._userMix = engine.mixFromStems(res);
    return res._userMix;
  }

  /* ---------------- 波形 ---------------- */

  function drawWave(res) {
    var c = el.wave;
    var dpr = window.devicePixelRatio || 1;
    var rect = c.getBoundingClientRect();
    if (!rect.width) return;
    c.width = Math.floor(rect.width * dpr);
    c.height = Math.floor(rect.height * dpr);
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    var beats = res.spec.bars * 4;
    for (var b = 0; b <= beats; b++) {
      var x = (b / beats) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    if (res.sections) {
      var secNames = { Intro: 'INTRO', Verse: 'VERSE', Build: 'BUILD', Chorus: 'CHORUS', Break: 'BREAK', Outro: 'OUTRO' };
      res.sections.forEach(function (sec, i) {
        var x0 = (sec.startSec / res.duration) * w;
        var x1 = (sec.endSec / res.duration) * w;
        if (i > 0) {
          ctx.strokeStyle = 'rgba(217,255,87,0.5)';
          ctx.beginPath();
          ctx.moveTo(x0, 0);
          ctx.lineTo(x0, h);
          ctx.stroke();
        }
        ctx.fillStyle = i % 2 === 0 ? 'rgba(217,255,87,0.85)' : 'rgba(122,215,255,0.85)';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.fillText(secNames[sec.name] || sec.name, x0 + 5, 13);
        if (x1 - x0 > 70) ctx.fillText(sec.bars + ' bars', x0 + 5, 25);
      });
    }

    var peaks = res.peaks;
    var n = peaks.max.length;
    var mid = h / 2;
    var grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#d9ff57');
    grad.addColorStop(0.55, '#9bf08a');
    grad.addColorStop(1, '#57d9ff');
    ctx.fillStyle = grad;
    for (var i = 0; i < n; i++) {
      var px = (i / n) * w;
      var top = mid - Math.max(0.012, peaks.max[i]) * mid * 0.92;
      var bot = mid - Math.min(-0.012, peaks.min[i]) * mid * 0.92;
      ctx.fillRect(px, top, Math.max(1, w / n - 0.4), Math.max(1, bot - top));
    }

    ctx.strokeStyle = 'rgba(217,255,87,0.18)';
    ctx.beginPath();
    ctx.moveTo(0, mid);
    ctx.lineTo(w, mid);
    ctx.stroke();
    updatePlayhead();
  }

  function updatePlayhead() {
    if (!state.result) return;
    var pct = clamp(currentPosition() / state.result.duration, 0, 1);
    el.playhead.style.left = (pct * 100) + '%';
    el.playhead.hidden = false;
    el.time.textContent = formatTime(currentPosition());
  }

  function seekFromEvent(e) {
    if (!state.result) return;
    var rect = el.wave.getBoundingClientRect();
    var pct = clamp((e.clientX - rect.left) / rect.width, 0, 0.999);
    seekToTime(pct * state.result.duration);
  }

  function formatTime(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60);
    var s = t - m * 60;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1);
  }

  /* ---------------- 播放器 ---------------- */

  var ac = null;
  var masterGain = null;
  var nodes = [];
  var startAt = 0;
  var rafId = 0;

  function nodeCtx() {
    if (!ac) {
      var AC = window.AudioContext || window.webkitAudioContext;
      ac = new AC();
      masterGain = ac.createGain();
      masterGain.gain.value = 0.9;
      masterGain.connect(ac.destination);
      ac.onstatechange = function () {
        if (!state.playing) return;
        if (ac.state === 'running') setStatus(t('statusAudioRestored'));
        else setStatus(t('statusAudioInterrupted', ac.state));
      };
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && state.playing && ac && ac.state !== 'running') {
          ac.resume();
        }
      });
    }
    return ac;
  }

  function makeBuffer(stem, res) {
    var ctx = nodeCtx();
    if (!res._buffers) res._buffers = {};
    if (res._buffers[stem.id]) return res._buffers[stem.id];
    var chans = stem.stereo ? [stem.stereo.l, stem.stereo.r] : [stem.mono];
    var buf = ctx.createBuffer(chans.length, chans[0].length, engine.SR);
    for (var i = 0; i < chans.length; i++) buf.copyToChannel(chans[i], i);
    res._buffers[stem.id] = buf;
    return buf;
  }

  function play() {
    if (!state.result) return;
    var ctx = nodeCtx();
    stopNodes();
    var res = state.result;
    if (state.offset >= res.duration - 0.01) state.offset = 0;
    var offset = state.offset;

    // 关键：必须等 AudioContext 真正 running 后再排期音源。
    // Safari 在 suspended 状态下 currentTime 不前进，提前 start() 会导致间歇性无声。
    function schedule() {
      if (ctx.state !== 'running') {
        setStatus(t('statusAudioNotStarted', ctx.state));
        toast(t('toastAudioNotStarted'));
        return;
      }
      var when = ctx.currentTime + 0.08;
      startAt = when;
      res.stems.forEach(function (stem) {
        var src = ctx.createBufferSource();
        src.buffer = makeBuffer(stem, res);
        src.loop = state.loop;
        if (state.loop) {
          src.loopStart = 0;
          src.loopEnd = src.buffer.duration;
        }
        var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        var gain = ctx.createGain();
        gain.gain.value = stemTarget(stem);
        if (pan) {
          pan.pan.value = stem.stereo ? 0 : clamp(stem.pan || 0, -1, 1);
          src.connect(pan);
          pan.connect(gain);
        } else {
          src.connect(gain);
        }
        gain.connect(masterGain);
        src.start(when, offset);
        nodes.push({ src: src, gain: gain, stem: stem });
      });
      state.playing = true;
      state.offset = offset;
      el.playIcon.textContent = '❚❚';
      el.play.setAttribute('aria-label', '暂停');
      setStatus(t('statusPlaying', res.stems.length));
      tick();
    }

    if (ctx.state === 'running') schedule();
    else ctx.resume().then(schedule, function () {
      setStatus(t('statusAudioFailed'));
    });
  }

  var safeAudio = null;
  var safeUrl = null;
  var safeMode = false;

  function stopSafe() {
    if (safeAudio) {
      try { safeAudio.pause(); } catch (e) { /* noop */ }
      try { safeAudio.src = ''; } catch (e) { /* noop */ }
      safeAudio = null;
    }
    if (safeUrl) {
      try { URL.revokeObjectURL(safeUrl); } catch (e) { /* noop */ }
      safeUrl = null;
    }
    safeMode = false;
  }

  function startSafe(offset, statusText) {
    if (!state.result) return;
    var startAtSec = clamp(offset || 0, 0, Math.max(0, state.result.duration - 0.01));
    fullStop();
    state.offset = startAtSec;
    try {
      var mix = mixFor(state.result);
      var data = engine.encodeWav([mix.l, mix.r], 44100, 24);
      safeUrl = URL.createObjectURL(new Blob([data], { type: 'audio/wav' }));
      safeAudio = new Audio(safeUrl);
      safeAudio.loop = state.loop;
      safeMode = true;
      state.offset = startAtSec;
      safeAudio.onended = function () {
        if (safeMode && !safeAudio.loop) {
          stopSafe();
          state.playing = false;
          state.offset = 0;
          el.playIcon.textContent = '▶';
          el.play.setAttribute('aria-label', '播放');
          updatePlayhead();
          setStatus(t('statusPlayEnded'));
        }
      };
      try { safeAudio.currentTime = startAtSec; } catch (e) { /* noop */ }
      var pr = safeAudio.play();
      function done() {
        try { safeAudio.currentTime = startAtSec; } catch (e) { /* noop */ }
        state.playing = true;
        el.playIcon.textContent = '❚❚';
        el.play.setAttribute('aria-label', '暂停');
        setStatus(statusText || t('statusPlayingGeneric'));
        tick();
      }
      if (pr && pr.then) pr.then(done, function (err) {
        setStatus(t('statusPlayFail', err && err.message ? err.message : err));
        stopSafe();
      });
      else done();
    } catch (e) {
      setStatus(t('statusPlayError', e && e.message ? e.message : e));
      stopSafe();
    }
  }

  function toggleSafePlay() {
    if (!state.result) { toast(t('toastGenerateFirst')); return; }
    if (safeMode && state.playing) {
      try { safeAudio.pause(); } catch (e) { /* noop */ }
      state.offset = currentPosition();
      state.playing = false;
      el.playIcon.textContent = '▶';
      el.play.setAttribute('aria-label', '播放');
      setStatus(t('statusPaused'));
      return;
    }
    startSafe(state.offset, t('statusPlayingCompat'));
  }

  function playTestTone() {
    var c = nodeCtx();
    c.resume().then(function () {
      var osc = c.createOscillator();
      var g = c.createGain();
      g.gain.value = 0;
      osc.frequency.value = 440;
      osc.connect(g);
      g.connect(masterGain);
      var t = c.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.25, t + 0.05);
      g.gain.linearRampToValueAtTime(0, t + 1.2);
      osc.start(t);
      osc.stop(t + 1.25);
      setStatus(t('statusTone', c.state));
    }, function () {
      setStatus(t('statusToneFail'));
    });
  }

  function stopNodes() {
    nodes.forEach(function (n) {
      try { n.src.stop(); } catch (e) { /* noop */ }
      try { n.src.disconnect(); } catch (e) { /* noop */ }
    });
    nodes = [];
    cancelAnimationFrame(rafId);
  }

  function stopPlayback(resetOffset) {
    stopNodes();
    stopSafe();
    state.playing = false;
    el.playIcon.textContent = '▶';
    el.play.setAttribute('aria-label', '播放');
    if (resetOffset !== false) state.offset = 0;
    updatePlayhead();
  }

  function fullStop() {
    stopPlayback(true);
  }

  function currentPosition() {
    if (!state.result) return 0;
    if (safeMode && safeAudio) return safeAudio.currentTime || 0;
    if (!state.playing) return state.offset;
    var p = state.offset + (ac.currentTime - startAt);
    if (p < 0) p = 0;
    if (state.loop) {
      p = p % state.result.duration;
    } else if (p >= state.result.duration) {
      p = state.result.duration;
    }
    return p;
  }

  function tick() {
    if (!state.playing) return;
    var pos = currentPosition();
    el.playhead.style.left = (clamp(pos / state.result.duration, 0, 1) * 100) + '%';
    el.time.textContent = formatTime(pos);
    if (!state.loop && pos >= state.result.duration - 0.02) {
      stopPlayback(true);
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function togglePlay() {
    if (!state.result) {
      toast(t('toastGenerateFirst'));
      return;
    }
    if (state.playing) {
      state.offset = currentPosition();
      if (safeMode) {
        try { safeAudio.pause(); } catch (e) { /* noop */ }
        state.playing = false;
        el.playIcon.textContent = '▶';
        el.play.setAttribute('aria-label', '播放');
        setStatus(t('statusPaused'));
        updatePlayhead();
      } else {
        stopPlayback(false);
      }
    } else if (state.useStems) {
      // 调过分轨音量/独奏后，用 Web Audio 才能保留分轨控制
      play();
    } else {
      // 默认走兼容播放（HTML audio），因为它在 Safari 上最可靠；
      startSafe(state.offset, '播放中');
    }
  }

  /* ---------------- 下载 ---------------- */

  function tagOf(spec) {
    var root = ROOTS[spec.rootPc].replace('#', 's');
    return root + (spec.mode === 'major' ? 'maj' : 'min') + '_' + spec.bpm + 'bpm_' + spec.bars + 'bars';
  }

  function saveBlob(name, data, type) {
    var blob = new Blob([data], { type: type || 'application/octet-stream' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 4000);
  }

  function downloadMix() {
    if (!state.result) return;
    var res = state.result;
    var mix = mixFor(res);
    var data = engine.encodeWav([mix.l, mix.r], 44100, 24);
    saveBlob('beat_' + tagOf(res.spec) + '_mix.wav', data, 'audio/wav');
    toast(t('statusExportMix'));
  }

  function downloadStem(stem) {
    if (!state.result) return;
    var data = engine.encodeStemWav(stem, 24);
    saveBlob(tagOf(state.result.spec) + '_' + stem.id + '.wav', data, 'audio/wav');
    toast(t('toastExportStem', stem.label));
  }

  function downloadMidi() {
    if (!state.result) return;
    var data = engine.encodeMidi(state.result);
    saveBlob('beat_' + tagOf(state.result.spec) + '.mid', data, 'audio/midi');
    toast(t('toastExportMidi'));
  }

  function readmeText(res) {
    var s = res.spec;
    return [
      t('rmTitle'),
      '================================',
      t('rmStyle') + s.styleLabel,
      'BPM: ' + s.bpm,
      t('rmKey') + keyTextOf(s),
      t('rmLength') + s.bars + ' ' + t('barsSuffix') + ' / ' + res.duration.toFixed(2) + ' ' + t('secUnit'),
      t('rmSeed') + s.seed + t('rmSeedNote'),
      '',
      t('rmImportTitle'),
      t('rmStep1', s.bpm),
      t('rmStep2', s.bars + ' ' + t('barsSuffix')),
      t('rmStep3'),
      t('rmStep4'),
      '',
      t('rmNotesTitle'),
      t('rmNote1'),
      t('rmNote2'),
      t('rmNote3'),
      t('rmNote4'),
      ''
    ].join('\n');
  }

  function downloadAll() {
    if (!state.result || state.busy) return;
    var res = state.result;
    var base = 'BeatForge_' + tagOf(res.spec);
    state.busy = true;
    el.dlZip.disabled = true;
    setStatus(t('statusZipping'));
    setTimeout(function () {
      try {
        var entries = [];
        var zipMix = mixFor(res);
        entries.push({ name: base + '/mix.wav', data: engine.encodeWav([zipMix.l, zipMix.r], 44100, 24) });
        res.stems.forEach(function (stem, i) {
          var num = (i + 1 < 10 ? '0' : '') + (i + 1);
          entries.push({ name: base + '/stems/' + num + '_' + stem.id + '.wav', data: engine.encodeStemWav(stem, 24) });
        });
        entries.push({ name: base + '/beat.mid', data: engine.encodeMidi(res) });
        var specOut = {
          engine: res.engine,
          generatedAt: new Date().toISOString(),
          style: res.spec.style,
          styleLabel: res.spec.styleLabel,
          bpm: res.spec.bpm,
          bars: res.spec.bars,
          key: res.spec.keyText,
          rootPc: res.spec.rootPc,
          mode: res.spec.mode,
          swing: res.spec.swing,
          seed: res.spec.seed,
          vinyl: res.spec.vinyl,
          reverb: res.spec.reverb,
          melody: res.spec.melody,
          complexity: res.spec.complexity,
          guitarLayer: res.spec.guitarLayer,
          notes: res.spec.notes
        };
        entries.push({ name: base + '/spec.json', data: new TextEncoder().encode(JSON.stringify(specOut, null, 2)) });
        entries.push({ name: base + '/README.txt', data: new TextEncoder().encode(readmeText(res)) });
        var buf = engine.makeZip(entries);
        saveBlob(base + '.zip', buf, 'application/zip');
        toast(t('toastExportZip'));
        setStatus(t('statusZipDone'));
      } catch (err) {
        console.error(err);
        toast(t('toastZipFail', err.message));
        setStatus(t('statusZipFail'));
      } finally {
        state.busy = false;
        el.dlZip.disabled = false;
      }
    }, 40);
  }

  /* ---------------- 改进窗口 ---------------- */

  function copySpec(s) {
    var o = {};
    for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) o[k] = s[k];
    o.notes = (s.notes || []).slice();
    return o;
  }

  function setRange(input, out, v, unit) {
    input.value = v;
    out.textContent = v + (unit || '');
  }

  function fillRefine(s) {
    var rock = s.style === 'rock' || s.style === 'rock80s';
    el.rBpm.value = s.bpm;
    el.rRoot.value = ROOTS[s.rootPc];
    el.rMode.value = s.mode;
    setRange(el.rSwing, el.rSwingVal, Math.round(s.swing * 100), '%');
    setRange(el.rComplex, el.rComplexVal, Math.round(s.complexity * 100), '');
    setRange(el.rMelody, el.rMelodyVal, Math.round(s.melody * 100), '');
    setRange(el.rBright, el.rBrightVal, Math.round(s.bright * 100), '');
    setRange(el.rVinyl, el.rVinylVal, Math.round(s.vinyl * 100), '');
    setRange(el.rReverb, el.rReverbVal, Math.round(s.reverb * 100), '');
    el.rGuitar.checked = rock || !!s.guitarLayer;
    el.rGuitar.disabled = rock;
    el.rNo808.checked = !!s.no808;
    el.rFlute.checked = !!s.flute;
    el.rDrumsOnly.checked = !!s.drumsOnly;
  }

  function openRefine() {
    if (!state.result) { toast(t('toastGenerateFirstBeat')); return; }
    fillRefine(state.result.spec);
    var isSong = !!state.result.sections;
    el.refineSongTools.hidden = !isSong;
    if (isSong) {
      el.rsBar.max = String(state.result.spec.bars);
      el.rsBars.max = String(state.result.spec.bars);
      renderEditList();
    }
    el.refine.hidden = false;
  }

  function closeRefine() {
    el.refine.hidden = true;
  }

  function readRefine() {
    var s = copySpec(state.result.spec);
    s.songEdits = state.songEdits.map(function (e) {
      return { id: e.id, type: e.type, bar: e.bar, bars: e.bars, target: e.target };
    });
    s.bpm = clamp(parseInt(el.rBpm.value, 10) || s.bpm, 50, 200);
    s.rootPc = Math.max(0, ROOTS.indexOf(el.rRoot.value));
    s.mode = el.rMode.value === 'major' ? 'major' : 'minor';
    s.swing = clamp(parseInt(el.rSwing.value, 10) / 100, 0, 0.45);
    s.complexity = clamp(parseInt(el.rComplex.value, 10) / 100, 0, 1);
    s.melody = clamp(parseInt(el.rMelody.value, 10) / 100, 0, 1);
    s.bright = clamp(parseInt(el.rBright.value, 10) / 100, 0, 1);
    s.vinyl = clamp(parseInt(el.rVinyl.value, 10) / 100, 0, 0.85);
    s.reverb = clamp(parseInt(el.rReverb.value, 10) / 100, 0, 0.5);
    s.guitarLayer = el.rGuitar.checked;
    s.no808 = el.rNo808.checked;
    s.flute = el.rFlute.checked;
    s.drumsOnly = el.rDrumsOnly.checked;
    return engine.normalizeSpec(s);
  }

  function renderRefined(spec, label) {
    if (state.busy) return;
    state.busy = true;
    el.rApply.disabled = true;
    el.rReset.disabled = true;
    setStatus(t('statusRefineRender'));
    var t0 = performance.now();
    setTimeout(function () {
      try {
        fullStop();
        var res = spec.song ? engine.renderSong(spec) : engine.render(spec);
        var ms = performance.now() - t0;
        state.result = res;
        showResult(res, ms);
        setStatus(t('statusRefineDone', [label, res.duration.toFixed(1), (ms / 1000).toFixed(1)]));
      } catch (err) {
        console.error(err);
        setStatus(t('statusRefineFail', err && err.message ? err.message : err));
        toast(t('toastRefineFail'));
      } finally {
        state.busy = false;
        el.rApply.disabled = false;
        el.rReset.disabled = false;
      }
    }, 40);
  }

  function applyRefine() {
    if (!state.result) return;
    renderRefined(readRefine(), t('refineApplied'));
  }

  function applyInstruction() {
    if (!state.result || state.busy) return;
    var text = el.rInstr.value.trim();
    if (!text) {
      el.rInstrNotes.textContent = t('instrEmpty');
      return;
    }
    var out = engine.refineSpec(readRefine(), text);
    if (!out.notes.length) {
      el.rInstrNotes.textContent = t('instrNoMatch');
      return;
    }
    fillRefine(out.spec);
    el.rInstrNotes.textContent = t('instrRecognized', out.notes.join(', '));
    renderRefined(out.spec, t('refineByInstruction'));
  }

  function resetRefine() {
    if (!state.baseSpec) return;
    el.rInstrNotes.textContent = '';
    fillRefine(state.baseSpec);
    renderRefined(engine.normalizeSpec(copySpec(state.baseSpec)), t('refineReset'));
  }

  /* ---------------- 状态 ---------------- */

  function setStatus(text) {
    el.status.textContent = text;
  }

  var toastTimer = 0;
  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.classList.remove('show');
    }, 2200);
  }

  init();
})();
