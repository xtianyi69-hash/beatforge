/* BeatForge i18n · 中英文界面字典（无依赖） */
(function (global) {
  'use strict';

  var DICT = {
    zh: {
      tagline: '说一句，出伴奏',
      tagStems: '分轨 STEMS',
      composerTitle: '描述你想要的 beat',
      composerDesc: 'BPM、调性、风格、情绪、乐器都可以写进去。中英文都行。',
      localBadge: '100% 本地合成',
      promptPlaceholder: '例如：90 BPM 的 boom bap，A 小调，8 小节，鼓要 swing 一点，和弦用七和弦，加点黑胶噪声，旋律少一点',
      tryIt: '试试',
      style: '风格', bars: '小节', key: '调性', minor: '小调', major: '大调', swing: '摇摆', seed: '种子',
      generate: '生成伴奏', ready: '准备就绪',
      understood: '识别到', seedLabel: 'seed', grooveBadge: '律动 {0}/4',
      promptTip: '提示：同一风格也可以写出差别——试试「半速」「四踩」「加钢琴」「加弦乐」「更暗」「和弦短促」「不要踩镲」「换一个变体」。',
      expandSong: '展开成整首歌 ♫', regenerateSong: '重新生成整首歌 ♫', backLoop: '回到 8 小节循环',
      refine: '改进 ✎', variant: '换一个变体 ↻',
      waveAria: '波形，点击可跳转', play: '播放', pause: '暂停',
      loop: '循环', testTone: '测试音', safePlay: '安全播放',
      testToneTitle: '播放一个 440Hz 测试音，检查音频输出',
      safePlayTitle: '用兼容模式播放混音（绕开 Web Audio）',
      transportHint: '点波形跳转 · 空格播放',
      dlMix: '下载混音 WAV', dlZip: '全部（ZIP）',
      stems: '分轨', stemsHint: '滑块调音量 · S 独奏 · M 静音 · ↓ 单独下载', resetLevels: '全部归位',
      dlStemTitle: '下载这个分轨', soloTitle: '独奏', muteTitle: '静音', volumeSuffix: '音量', volumeTitle: '调节音量（0–150%）',
      refineApplied: '已应用改进', refineByInstruction: '已按需求改进', refineReset: '已恢复原版',
      switchZh: '切换到中文', switchEn: 'Switch to English',
      tagline_boom_bap: '90s 东岸 · 采样味', tagline_trap: '808 滑音 · 半拍军鼓', tagline_drill: '下滑 808 · 阴冷', tagline_lofi: '爵士和弦 · 黑胶器', tagline_house: '四踩 · 反拍开镬', tagline_phonk: '牛铃 · 失真 808', tagline_rock: '失真吉他 · 现场鼓', tagline_rock80s: 'Gated 军鼓 · 合成器 pad', tagline_modernrap: '重 808 滑音 · hi-hat roll', tagline_reggae: 'One drop · 反拍风琴', tagline_jazz: 'Ride 摇摆 · Walking bass', tagline_dnb: 'Breakbeat · 快速切分', tagline_funk: '16 分贝斯 · 切分', tagline_reggaeton: 'Dembow · 808 · 沙锤', tagline_afrobeats: '切分底鼓 · 吉他 riff', tagline_bossa: 'Clave · 尼龙吉他', tagline_synthwave: '鼓机 · 苦音 · Pad',
      mode_minor: '小调', mode_major: '大调', refinePrefix: '改进：{0}',
      rmTitle: 'BeatForge 导出包', rmStyle: '风格: ', rmKey: '调性: ', rmLength: '长度: ',
      rmSeed: '种子: ', rmSeedNote: '（相同种子可复现）',
      rmImportTitle: '如何导入宿主（Ableton / FL Studio / Logic / Cubase / Studio One）',
      rmStep1: '1. 新建工程，把速度设为 {0} BPM。',
      rmStep2: '2. 把 mix.wav 拖到时间线第 1 小节。音频长度正好是 {0}，可直接循环。',
      rmStep3: '3. 需要混音时，把 stems 文件夹里的所有 WAV 拖进来（包括 reverb.wav 与 fx.wav），它们相加约等于混音（母带前）。',
      rmStep4: '4. beat.mid 可导入宿主继续改音符；速度已写入文件。',
      rmNotesTitle: '说明',
      rmNote1: '- WAV: 24-bit / 44.1kHz，混音与分轨都做了防削波归一化。',
      rmNote2: '- 分轨在导出时已包含声像；所有分轨相加约等于母带前混音。',
      rmNote3: '- Rock 或“加吉他”模式会额外包含 guitar.wav（失真节奏吉他）与主音吉他。',
      rmNote4: '- 本文件由 BeatForge 本地生成，无任何采样版权问题，可自由用于你的作品。',
      howTitle: '怎么用 · 怎么导入宿主',
      how1Title: '提出要求', how1: '像跟制作人说话一样描述：风格、BPM、调性、小节数、要 swing 还是直拍、暗一点还是温暖。点“生成伴奏”或按 ⌘↵。',
      how2Title: '试听 / 调整', how2: '试听后可以点“换一个变体”得到同风格的另一个版本。分轨支持独奏与静音，方便检查每一层。',
      how3Title: '导入宿主', how3: '下载混音 WAV，拖进 Ableton / FL / Logic / Cubase，把工程 BPM 设成页面显示的数值。需要细调就下载 ZIP，用里面的分轨和 MIDI。',
      fineprint: '所有声音由代码实时合成，不联网、不上传、不需要 API key。生成内容可用于你的商业或非商业作品。',
      refineTitle: '改进这条 beat',
      refineDesc: '保持同一个 seed，只调整下面的参数，不会重新编曲。点“应用”即时重新渲染。',
      close: '关闭', complexity: '编排复杂度', melody: '旋律', bright: '亮度', vinyl: '黑胶噪声', reverb: '混响',
      instrLabel: '用一句话改进', instrPlaceholder: '例如：鼓更重一点，少一点旋律，加点混响，底鼓更重，吉他小声点，改到 100 BPM',
      instrApply: '按需求改进',
      localEditTitle: '整首歌 · 局部编辑',
      localEditDesc: '按小节指定要改的位置。加花会写进鼓与打击乐，笛子音会加一条笛子分轨；静音会把该轨在这一段清零。改完点“应用编辑”重新渲染。',
      startBar: '起始小节', numBars: '持续小节', action: '操作', targetStem: '目标分轨',
      actFill: '军鼓加花', actTom: '通鼓 fill', actCrash: '加一片镲', actShaker: '加沙锤', actFlute: '加笛子音', actMute: '静音某轨',
      tAll: '全部（静音时）', tKick: '底鼓', tSnare: '军鼓', tHat: '踩镲', tPerc: '打击乐', tBass: '贝斯 / 808',
      tGuitar: '吉他', tChords: '和弦', tMelody: '旋律', tFlute: '笛子',
      addEdit: '+ 添加编辑', delEdit: '删除', barRange: '第 {0}–{1} 小节', barFrom: '第 {0} 小节起', barsUnit: '{0} 小节',
      addGuitar: '加失真吉他层', addFluteLayer: '加笛子', no808: '不要 808 / 贝斯', drumsOnly: '纯鼓（去掉旋律与和弦）',
      refineNote: '注意：编排复杂度和旋律会改变随机细节，鼓点或旋律可能略有不同；其他参数只改音色与律动。',
      resetOriginal: '恢复原版', applyRefine: '应用改进',
      footEngine: '纯前端音频引擎', footDownload: '下载文件在浏览器“下载”文件夹',
      styleLabel: '风格', bpmLabel: 'BPM', notesLabel: '识别到', wholeSong: '整首歌 · {0} 段',
      songStructure: '整首歌结构：', sectionFill: '段落之间已有 crash 和军鼓过门。',
      seedChip: 'seed', genSuffix: '生成', secUnit: '秒', barsSuffix: '小节',
      intro: 'INTRO', verse: 'VERSE', build: 'BUILD', chorus: 'CHORUS', break: 'BREAK', outro: 'OUTRO',
      dawHint: '把 <b>mix.wav</b> 拖进宿主，工程速度设为 <b>{0} BPM</b>，音频已与网格对齐。需要分轨就下载“全部（ZIP）”，里面包含{1}、混响和 MIDI。',
      dawLayersRock: '鼓、电贝斯、失真吉他、主音吉他、旋律',
      dawLayersStd: '鼓、808 / 贝斯、和弦、旋律',
      stemKick: '底鼓 Kick', stemSnare: '军鼓 / 拍手', stemHat: '踩镲 Hats', stemPerc: '打击乐 Perc',
      stemBass: '808 / 贝斯', stemGuitar: '吉他 Guitar', stemChords: '和弦 Chords', stemMelody: '旋律 Melody',
      stemFlute: '笛子 Flute', stemFx: 'FX / 黑胶', stemReverb: '混响 Reverb',
      statusReady: '准备就绪 · 本地生成，不上传任何内容',
      statusArrange: '正在编曲…', statusSynth: '合成乐器…', statusMix: '混音与空间处理…', statusMaster: '母带处理…',
      statusSynthGeneric: '合成中…',
      statusDone: '完成 · {0} 秒音频 · {1} 秒生成',
      statusFailed: '生成失败：{0}', toastFailed: '生成失败，换个描述再试试',
      statusPlaying: '播放中 · {0} 条分轨', statusPlayingCompat: '播放中 · 兼容模式', statusPlayingGeneric: '播放中',
      statusAudioRestored: '播放中 · 音频已恢复',
      statusAudioInterrupted: '音频被系统中断（{0}），点播放可恢复',
      statusAudioNotStarted: '音频未启动（状态 {0}）', toastAudioNotStarted: '音频未启动，请再点一次播放',
      statusAudioFailed: '音频启动失败，请再点一次播放',
      statusPlayEnded: '播放结束', statusPaused: '已暂停',
      statusPlayFail: '播放失败：{0}', statusPlayError: '播放出错：{0}',
      toastGenerateFirst: '先生成伴奏', toastGenerateFirstBeat: '先生成一条 beat',
      statusTone: '测试音播放中（440Hz，约 1 秒）· 音频状态 {0}', statusToneFail: '测试音失败：浏览器拒绝启动音频',
      statusExportMix: '已导出混音 WAV（24-bit / 44.1kHz）',
      toastExportStem: '已导出 {0}', toastExportMidi: '已导出 MIDI（含速度信息）',
      statusZipping: '正在打包 ZIP…', toastExportZip: '已导出 ZIP：混音 + 分轨 + MIDI',
      statusZipDone: '已导出 ZIP · 解压后把 WAV 拖进宿主即可', toastZipFail: '打包失败：{0}', statusZipFail: '打包失败',
      toastLevelsReset: '分轨音量已全部归位',
      statusExpand: '正在编排整首歌', statusBackLoop: '正在回到循环',
      statusApplyEdit: '正在应用编辑', statusRemoveEdit: '正在移除编辑',
      statusEditDone: '{0}完成 · {1} 秒 · {2} 秒',
      statusRefineRender: '正在按新参数重新渲染…',
      statusRefineDone: '{0} · {1} 秒 · 用时 {2} 秒',
      statusRefineFail: '改进失败：{0}', toastRefineFail: '改进失败，已保留上一版',
      statusOpFail: '操作失败，已保留上一版',
      instrEmpty: '先输入一句改进需求', instrNoMatch: '没有识别到可以执行的改进，换个说法试试（如：鼓更重、少一点旋律、加混响、100 BPM）',
      instrRecognized: '已识别：{0}',
      noteStyle: '风格：{0}', noteGuitarRock: '失真吉他 + 电贝斯 + 现场鼓', noteAddGuitar: '加失真吉他',
      notes: {
        bpm: 'BPM {0}', bpmUp: 'BPM +8', bpmDown: 'BPM -8', bars: '{0} 小节',
        rootMode: '{0} {1}', swingPct: '摇摆 {0}%', swingMore: '更多摇摆', straight: '直拍', swingOn: '带 swing',
        drumsOnly: '纯鼓', melodyMore: '旋律更多', melodyLess: '旋律更少',
        complexityUp: '编排更复杂', complexityDown: '编排更简洁',
        vinylMore: '更多黑胶噪声', cleaner: '更干净', reverbBig: '更大空间', dry: '更干',
        dark: '音色偏暗', warm: '温暖复古', bright: '明亮', no808: '不用 808', triplet: '三连音',
        noFlute: '不用笛子', addFlute: '加笛子', flute: '笛子', addGuitar: '加吉他',
        louder: '↑ {0}', quieter: '↓ {0}',
        variant: '律动变体 {0}', energyHigh: '高能量', energyLow: '低能量 / 松弛',
        happy: '开心明快', sad: '悲伤暗淡', aggressive: '凶狠有力', dreamy: '梦幻空灵',
        sexy: '性感暧昧', mysterious: '神秘', epic: '史诗宏大', nostalgic: '怀旧复古',
        fourFloor: '四踩', oneDrop: 'one drop', steppers: 'steppers', dembow: 'dembow',
        breakbeat: 'breakbeat', halfTime: '半速 / half-time', doubleTime: '双倍速',
        noHats: '不要踩镲', sixteenthHats: '16 分踩镲', offbeatHats: '反拍踩镲',
        sparseHats: '稀疏踩镲', rideHats: 'ride 镲', noSnare: '不要军鼓',
        clapSnare: '拍手代替军鼓', ghostSnare: '幽灵军鼓', shaker: '沙锤',
        tambourine: '铃鼓', crash: '加长镲', noFills: '不加花',
        noBass: '不要贝斯', walkingBass: 'walking bass', slapBass: 'slap bass',
        subBass: 'sub bass', glideBass: '滑音 808', offbeatBass: '反拍贝斯',
        chordSustain: '长音铺底', chordStab: '短促切奏', chordArp: '琶音',
        chordPluck: '拨弦分解', seventh: '七和弦', ninth: '九和弦',
        noInst: '去掉{0}', inst: '加{0}',
        inst_piano: '钢琴', inst_strings: '弦乐', inst_organ: '风琴', inst_sax: '萨克斯',
        inst_synth: '合成器', inst_bell: '铃 / 钟琴', inst_cowbell: '牛铃', inst_pluck: '拨弦',
        inst_pad: 'Pad 铺底',
        tape: '磁带音色', delay: '回声 / delay', sidechain: '侧链抽吸',
        distortion: '失真', registerHigh: '高八度', registerLow: '低八度',
        unsupportedVocal: '不支持人声，已生成纯伴奏', unsupportedSample: '不使用采样，全部为合成音色',
        unsupportedArtist: '不模仿具体歌曲 / 艺人，按风格近似',
      },
      refineNotes: {
        bpm: 'BPM {0}', bpmUp: 'BPM +6', bpmDown: 'BPM -6', swingPct: '摇摆 {0}%', swingMore: '摇摆更多', straight: '直拍',
        drumsOnly: '纯鼓', keepMelody: '保留旋律', melodyMore: '旋律更多', melodyLess: '旋律更少',
        complexityUp: '编排更复杂', complexityDown: '编排更简洁',
        noVinyl: '去掉黑胶', vinylMore: '更多黑胶噪声', reverbBig: '混响更大', reverbDry: '混响更干',
        dark: '音色偏暗', warm: '温暖复古', bright: '明亮',
        noGuitar: '去掉吉他层', addGuitar: '加失真吉他', noFlute: '去掉笛子', addFlute: '加笛子',
        no808: '不要 808 / 贝斯', keep808: '保留 808 / 贝斯', newGroove: '换到律动变体 {0}'
      },
      levels: { kick: '底鼓', snare: '军鼓', hat: '踩镲', perc: '打击乐', bass: '808 / 贝斯', chords: '和弦', guitar: '吉他', melody: '旋律', flute: '笛子', reverb: '混响' },
      stem_kick: '底鼓 Kick', stem_snare: '军鼓 / 拍手', stem_hat: '踩镬 Hats', stem_perc: '打击乐 Perc',
      stem_bass: '808 / 贝斯', stem_guitar: '吉他 Guitar', stem_chords: '和弦 Chords', stem_melody: '旋律 Melody',
      stem_flute: '笛子 Flute', stem_fx: 'FX / 黑胶', stem_reverb: '混响 Reverb'
    },

    en: {
      tagline: 'Describe it, get a beat',
      tagStems: 'STEMS',
      composerTitle: 'Describe the beat you want',
      composerDesc: 'BPM, key, style, mood, instruments — write it all. Chinese or English both work.',
      localBadge: '100% local synthesis',
      promptPlaceholder: 'e.g. 90 BPM boom bap in A minor, 8 bars, swing drums, jazzy chords, a bit of vinyl noise, less melody',
      tryIt: 'Try',
      style: 'Style', bars: 'Bars', key: 'Key', minor: 'Minor', major: 'Major', swing: 'Swing', seed: 'Seed',
      generate: 'Generate Beat', ready: 'Ready',
      understood: 'Understood', seedLabel: 'seed', grooveBadge: 'Groove {0}/4',
      promptTip: 'Tip: the same style can sound very different — try "half-time", "four on the floor", "add piano", "add strings", "darker", "short stabs", "no hats", or hit "New Variant".',
      expandSong: 'Expand to Full Song ♫', regenerateSong: 'Regenerate Full Song ♫', backLoop: 'Back to 8-bar loop',
      refine: 'Refine ✎', variant: 'New Variant ↻',
      waveAria: 'Waveform, click to seek', play: 'Play', pause: 'Pause',
      loop: 'Loop', testTone: 'Test Tone', safePlay: 'Safe Play',
      testToneTitle: 'Play a 440Hz tone to check audio output',
      safePlayTitle: 'Play the mix in compatibility mode (bypasses Web Audio)',
      transportHint: 'Click waveform to seek · Space to play',
      dlMix: 'Download Mix WAV', dlZip: 'All (ZIP)',
      stems: 'Stems', stemsHint: 'Sliders for volume · S solo · M mute · ↓ download stem', resetLevels: 'Reset Levels',
      dlStemTitle: 'Download this stem', soloTitle: 'Solo', muteTitle: 'Mute', volumeSuffix: 'volume', volumeTitle: 'Adjust volume (0–150%)',
      refineApplied: 'Refinement applied', refineByInstruction: 'Refined by instruction', refineReset: 'Restored original',
      switchZh: '切换到中文', switchEn: 'Switch to English',
      tagline_boom_bap: '90s East Coast · sampled feel', tagline_trap: 'Gliding 808 · half-time snare', tagline_drill: 'Sliding 808 · dark', tagline_lofi: 'Jazzy chords · vinyl', tagline_house: 'Four on the floor · offbeat hats', tagline_phonk: 'Cowbell · distorted 808', tagline_rock: 'Distorted guitar · live drums', tagline_rock80s: 'Gated snare · synth pad', tagline_modernrap: 'Heavy 808 · hi-hat rolls', tagline_reggae: 'One drop · offbeat organ', tagline_jazz: 'Ride swing · walking bass', tagline_dnb: 'Breakbeat · fast cuts', tagline_funk: '16th bass · syncopation', tagline_reggaeton: 'Dembow · 808 · shakers', tagline_afrobeats: 'Syncopated kick · guitar riff', tagline_bossa: 'Clave · nylon guitar', tagline_synthwave: 'Drum machine · arpeggio · pad',
      mode_minor: 'Minor', mode_major: 'Major', refinePrefix: 'Refined: {0}',
      rmTitle: 'BeatForge Export Pack', rmStyle: 'Style: ', rmKey: 'Key: ', rmLength: 'Length: ',
      rmSeed: 'Seed: ', rmSeedNote: ' (same seed reproduces the same beat)',
      rmImportTitle: 'How to import into your DAW (Ableton / FL Studio / Logic / Cubase / Studio One)',
      rmStep1: '1. Create a new project and set the tempo to {0} BPM.',
      rmStep2: '2. Drag mix.wav to bar 1. Its length is exactly {0}, ready to loop.',
      rmStep3: '3. For mixing, drag all WAVs from the stems folder (including reverb.wav and fx.wav); summed they approximate the pre-master mix.',
      rmStep4: '4. beat.mid can be imported to edit notes; tempo is embedded.',
      rmNotesTitle: 'Notes',
      rmNote1: '- WAV: 24-bit / 44.1kHz; mix and stems are normalized to prevent clipping.',
      rmNote2: '- Stems include panning; summed they approximate the pre-master mix.',
      rmNote3: '- Rock or "add guitar" mode additionally includes guitar.wav (distorted rhythm guitar) and lead guitar.',
      rmNote4: '- Generated locally by BeatForge; no sample copyright issues, free to use in your work.',
      howTitle: 'How to use · Import into your DAW',
      how1Title: 'Describe it', how1: 'Describe it like talking to a producer: style, BPM, key, bars, swing or straight, dark or warm. Click "Generate Beat" or press ⌘↵.',
      how2Title: 'Listen / Adjust', how2: 'Click "New Variant" for another version in the same style. Stems support solo and mute so you can check each layer.',
      how3Title: 'Import to DAW', how3: 'Download the mix WAV, drag it into Ableton / FL / Logic / Cubase, and set your project BPM to the value shown. For detailed editing download the ZIP with stems and MIDI.',
      fineprint: 'All sounds are synthesized in code — no network, no uploads, no API key. Generated audio is free for commercial and non-commercial use.',
      refineTitle: 'Refine this beat',
      refineDesc: 'Keeps the same seed and only adjusts the parameters below — no re-arrangement. Changes re-render instantly.',
      close: 'Close', complexity: 'Complexity', melody: 'Melody', bright: 'Brightness', vinyl: 'Vinyl Noise', reverb: 'Reverb',
      instrLabel: 'Refine with a sentence', instrPlaceholder: 'e.g. heavier drums, less melody, more reverb, louder kick, quieter guitar, change to 100 BPM',
      instrApply: 'Apply Instruction',
      localEditTitle: 'Full Song · Local Edits',
      localEditDesc: 'Pick a bar range to edit. Fills go into drums/percussion, a flute note adds a flute stem, and mute zeros out a stem in that range. Click "Add Edit" to re-render.',
      startBar: 'Start bar', numBars: 'Bars', action: 'Action', targetStem: 'Target stem',
      actFill: 'Snare fill', actTom: 'Tom fill', actCrash: 'Crash', actShaker: 'Shaker', actFlute: 'Flute note', actMute: 'Mute stem',
      tAll: 'All (for mute)', tKick: 'Kick', tSnare: 'Snare', tHat: 'Hi-hat', tPerc: 'Percussion', tBass: 'Bass / 808',
      tGuitar: 'Guitar', tChords: 'Chords', tMelody: 'Melody', tFlute: 'Flute',
      addEdit: '+ Add Edit', delEdit: 'Delete', barRange: 'Bars {0}–{1}', barFrom: 'From bar {0}', barsUnit: '{0} bars',
      addGuitar: 'Add distorted guitar layer', addFluteLayer: 'Add flute', no808: 'No 808 / bass', drumsOnly: 'Drums only (no melody or chords)',
      refineNote: 'Note: complexity and melody change random details, so drums or melody may vary slightly. Other parameters only change tone and groove.',
      resetOriginal: 'Reset to Original', applyRefine: 'Apply Refinement',
      footEngine: 'Pure front-end audio engine', footDownload: 'Downloads go to your browser download folder',
      styleLabel: 'Style', bpmLabel: 'BPM', notesLabel: 'Understood', wholeSong: 'Full Song · {0} sections',
      songStructure: 'Song structure: ', sectionFill: 'Crashes and snare fills are placed between sections.',
      seedChip: 'seed', genSuffix: 'gen', secUnit: 's', barsSuffix: 'bars',
      intro: 'INTRO', verse: 'VERSE', build: 'BUILD', chorus: 'CHORUS', break: 'BREAK', outro: 'OUTRO',
      dawHint: 'Drag <b>mix.wav</b> into your DAW and set the project tempo to <b>{0} BPM</b>; audio is grid-aligned. For detailed editing download "All (ZIP)" with {1}, reverb and MIDI.',
      dawLayersRock: 'drums, electric bass, distorted guitar, lead guitar, melody',
      dawLayersStd: 'drums, 808 / bass, chords, melody',
      stemKick: 'Kick', stemSnare: 'Snare / Clap', stemHat: 'Hi-hats', stemPerc: 'Percussion',
      stemBass: '808 / Bass', stemGuitar: 'Guitar', stemChords: 'Chords', stemMelody: 'Melody',
      stemFlute: 'Flute', stemFx: 'FX / Vinyl', stemReverb: 'Reverb',
      statusReady: 'Ready · generated locally, nothing uploaded',
      statusArrange: 'Arranging…', statusSynth: 'Synthesizing instruments…', statusMix: 'Mixing and space…', statusMaster: 'Mastering…',
      statusSynthGeneric: 'Synthesizing…',
      statusDone: 'Done · {0} of audio · {1} to generate',
      statusFailed: 'Generation failed: {0}', toastFailed: 'Generation failed, try a different description',
      statusPlaying: 'Playing · {0} stems', statusPlayingCompat: 'Playing · compatibility mode', statusPlayingGeneric: 'Playing',
      statusAudioRestored: 'Playing · audio restored',
      statusAudioInterrupted: 'Audio interrupted ({0}), press play to resume',
      statusAudioNotStarted: 'Audio not started (state {0})', toastAudioNotStarted: 'Audio not started, press play again',
      statusAudioFailed: 'Could not start audio, press play again',
      statusPlayEnded: 'Playback ended', statusPaused: 'Paused',
      statusPlayFail: 'Playback failed: {0}', statusPlayError: 'Playback error: {0}',
      toastGenerateFirst: 'Generate a beat first', toastGenerateFirstBeat: 'Generate a beat first',
      statusTone: 'Test tone playing (440Hz, ~1s) · audio state {0}', statusToneFail: 'Test tone failed: browser refused to start audio',
      statusExportMix: 'Exported mix WAV (24-bit / 44.1kHz)',
      toastExportStem: 'Exported {0}', toastExportMidi: 'Exported MIDI (with tempo)',
      statusZipping: 'Building ZIP…', toastExportZip: 'Exported ZIP: mix + stems + MIDI',
      statusZipDone: 'ZIP exported · unzip and drag the WAVs into your DAW', toastZipFail: 'ZIP failed: {0}', statusZipFail: 'ZIP failed',
      toastLevelsReset: 'Stem levels reset',
      statusExpand: 'Arranging full song', statusBackLoop: 'Returning to loop',
      statusApplyEdit: 'Applying edit', statusRemoveEdit: 'Removing edit',
      statusEditDone: '{0} done · {1} · {2} to render',
      statusRefineRender: 'Re-rendering with new parameters…',
      statusRefineDone: '{0} · {1} · {2} to render',
      statusRefineFail: 'Refine failed: {0}', toastRefineFail: 'Refine failed, kept the previous version',
      statusOpFail: 'Operation failed, kept the previous version',
      instrEmpty: 'Enter a refinement request first', instrNoMatch: 'No actionable refinement found, try rephrasing (e.g. heavier drums, less melody, more reverb, 100 BPM)',
      instrRecognized: 'Understood: {0}',
      noteStyle: 'Style: {0}', noteGuitarRock: 'Distorted guitar + electric bass + live drums', noteAddGuitar: 'Add distorted guitar',
      notes: {
        bpm: 'BPM {0}', bpmUp: 'BPM +8', bpmDown: 'BPM -8', bars: '{0} bars',
        rootMode: '{0} {1}', swingPct: 'Swing {0}%', swingMore: 'More swing', straight: 'Straight', swingOn: 'With swing',
        drumsOnly: 'Drums only', melodyMore: 'More melody', melodyLess: 'Less melody',
        complexityUp: 'Busier arrangement', complexityDown: 'Simpler arrangement',
        vinylMore: 'More vinyl noise', cleaner: 'Cleaner', reverbBig: 'More space', dry: 'Drier',
        dark: 'Darker tone', warm: 'Warm / vintage', bright: 'Bright', no808: 'No 808', triplet: 'Triplets',
        noFlute: 'No flute', addFlute: 'Add flute', flute: 'Flute', addGuitar: 'Add guitar',
        louder: '↑ {0}', quieter: '↓ {0}',
        variant: 'Groove variant {0}', energyHigh: 'High energy', energyLow: 'Low energy / relaxed',
        happy: 'Happy / uplifting', sad: 'Sad / dark', aggressive: 'Aggressive / hard', dreamy: 'Dreamy / atmospheric',
        sexy: 'Sultry', mysterious: 'Mysterious', epic: 'Epic / cinematic', nostalgic: 'Nostalgic / retro',
        fourFloor: 'Four on the floor', oneDrop: 'One drop', steppers: 'Steppers', dembow: 'Dembow',
        breakbeat: 'Breakbeat', halfTime: 'Half-time', doubleTime: 'Double-time',
        noHats: 'No hi-hats', sixteenthHats: '16th-note hats', offbeatHats: 'Offbeat hats',
        sparseHats: 'Sparse hats', rideHats: 'Ride cymbal', noSnare: 'No snare',
        clapSnare: 'Clap instead of snare', ghostSnare: 'Ghost snares', shaker: 'Shaker',
        tambourine: 'Tambourine', crash: 'Extra crash', noFills: 'No fills',
        noBass: 'No bass', walkingBass: 'Walking bass', slapBass: 'Slap bass',
        subBass: 'Sub bass', glideBass: 'Gliding 808', offbeatBass: 'Offbeat bass',
        chordSustain: 'Sustained chords', chordStab: 'Short stabs', chordArp: 'Arpeggio',
        chordPluck: 'Plucked chords', seventh: '7th chords', ninth: '9th chords',
        noInst: 'Remove {0}', inst: 'Add {0}',
        inst_piano: 'piano', inst_strings: 'strings', inst_organ: 'organ', inst_sax: 'sax',
        inst_synth: 'synth', inst_bell: 'bells', inst_cowbell: 'cowbell', inst_pluck: 'pluck',
        inst_pad: 'pad',
        tape: 'Tape color', delay: 'Delay / echo', sidechain: 'Sidechain pumping',
        distortion: 'Distortion', registerHigh: 'Octave up', registerLow: 'Octave down',
        unsupportedVocal: 'Vocals are not supported — instrumental only', unsupportedSample: 'No samples — all sounds are synthesized',
        unsupportedArtist: 'Does not imitate a specific song/artist — style approximation',
      },
      refineNotes: {
        bpm: 'BPM {0}', bpmUp: 'BPM +6', bpmDown: 'BPM -6', swingPct: 'Swing {0}%', swingMore: 'More swing', straight: 'Straight',
        drumsOnly: 'Drums only', keepMelody: 'Keep melody', melodyMore: 'More melody', melodyLess: 'Less melody',
        complexityUp: 'Busier arrangement', complexityDown: 'Simpler arrangement',
        noVinyl: 'No vinyl', vinylMore: 'More vinyl noise', reverbBig: 'More reverb', reverbDry: 'Drier reverb',
        dark: 'Darker tone', warm: 'Warm / vintage', bright: 'Bright',
        noGuitar: 'Remove guitar layer', addGuitar: 'Add distorted guitar', noFlute: 'Remove flute', addFlute: 'Add flute',
        no808: 'No 808 / bass', keep808: 'Keep 808 / bass', newGroove: 'Switched to groove variant {0}'
      },
      levels: { kick: 'kick', snare: 'snare', hat: 'hi-hat', perc: 'percussion', bass: '808 / bass', chords: 'chords', guitar: 'guitar', melody: 'melody', flute: 'flute', reverb: 'reverb' },
      stem_kick: 'Kick', stem_snare: 'Snare / Clap', stem_hat: 'Hi-hats', stem_perc: 'Percussion',
      stem_bass: '808 / Bass', stem_guitar: 'Guitar', stem_chords: 'Chords', stem_melody: 'Melody',
      stem_flute: 'Flute', stem_fx: 'FX / Vinyl', stem_reverb: 'Reverb'
    }
  };

  var current = 'zh';
  try {
    var saved = global.localStorage && global.localStorage.getItem('beatforge_lang');
    if (saved === 'en' || saved === 'zh') current = saved;
  } catch (e) { /* noop */ }

  function setLang(lang) {
    current = lang === 'en' ? 'en' : 'zh';
    try { if (global.localStorage) global.localStorage.setItem('beatforge_lang', current); } catch (e) { /* noop */ }
  }
  function getLang() { return current; }

  function lookup(d, key) {
    if (d[key] != null) return d[key];
    var parts = key.split('.');
    var v = d;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return null;
      v = v[parts[i]];
    }
    return v == null ? null : v;
  }

  function t(key, args) {
    var d = DICT[current] || DICT.zh;
    var s = lookup(d, key);
    if (s == null) s = lookup(DICT.zh, key);
    if (s == null) return key;
    if (args != null) {
      if (!Array.isArray(args)) args = [args];
      s = s.replace(/\{(\d+)\}/g, function (m, i) { return args[i] != null ? args[i] : m; });
    }
    return s;
  }

  function note(key, args) { return t('notes.' + key, args); }
  function refineNote(key, args) { return t('refineNotes.' + key, args); }

  function applyStatic(root) {
    root = root || global.document;
    if (!root) return;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.textContent = t(n.getAttribute('data-i18n'));
    }
    var ph = root.querySelectorAll('[data-i18n-placeholder]');
    for (var j = 0; j < ph.length; j++) ph[j].setAttribute('placeholder', t(ph[j].getAttribute('data-i18n-placeholder')));
    var ar = root.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < ar.length; k++) ar[k].setAttribute('aria-label', t(ar[k].getAttribute('data-i18n-aria')));
    var ti = root.querySelectorAll('[data-i18n-title]');
    for (var m = 0; m < ti.length; m++) ti[m].setAttribute('title', t(ti[m].getAttribute('data-i18n-title')));
    if (root.documentElement) root.documentElement.lang = current === 'en' ? 'en' : 'zh-CN';
  }

  global.BeatForgeI18n = {
    t: t, note: note, refineNote: refineNote,
    getLang: getLang, setLang: setLang, applyStatic: applyStatic,
    isEn: function () { return current === 'en'; }
  };
})(window);
