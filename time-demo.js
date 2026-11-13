/* Illustrative timing comparison; no measured latency or success-rate data. */
(() => {
  const root = document.querySelector('[data-time-demo]');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const panels = [...root.querySelectorAll('[data-time-world]')];
  const duration = 9.6;
  const leadIn = 3.5;
  const reasoningDelay = 3;
  const decisionAt = leadIn + reasoningDelay;
  const graspDuration = 0.8;
  const liftDuration = 0.7;
  const cupSpeed = 43;
  const startX = 140;
  const targetX = startX + leadIn * cupSpeed;
  const clamp = value => Math.max(0, Math.min(1, value));

  // Authored summaries of an illustrative plan, not a model's internal reasoning.
  for (const panel of panels) {
    const viewport = panel.querySelector('.time-viewport');
    const stage = document.createElement('div');
    stage.className = 'time-stage';
    while (viewport.firstChild) stage.appendChild(viewport.firstChild);
    viewport.appendChild(stage);
    const summary = document.createElement('div');
    summary.className = 'time-thought';
    summary.innerHTML = '<div class="time-thought-copy"><span class="time-thought-title" data-time-thought-title></span><span class="time-thought-detail" data-time-thought-detail></span></div>';
    const reasoning = panel.querySelector('.time-reason-label').parentElement;
    reasoning.classList.add('time-reasoning');
    summary.querySelector('.time-thought-copy').appendChild(reasoning);
    viewport.prepend(summary);
    const clock = panel.querySelector('.time-clock');
    const clockCopy = document.createElement('span');
    clockCopy.className = 'time-clock-copy';
    clockCopy.append(panel.querySelector('[data-time-status]'), panel.querySelector('[data-time-clock-label]'));
    clock.prepend(clockCopy);
    const name = panel.querySelector('.time-world-name');
    name.removeAttribute('data-time-copy');
    name.innerHTML = `<span data-time-copy="${panel.dataset.timeWorld}"></span><span class="time-world-context" data-time-copy="${panel.dataset.timeWorld}Context"></span>`;
    const handle = panel.querySelector('.time-cup-handle');
    handle.setAttribute('d', 'M7 70h2c5 0 8 4 8 10s-3 10-8 10H7v-5h2c3 0 3-2 3-5s0-5-3-5H7z');
    panel.querySelector('.time-cup-body').after(handle);
    panel.querySelector('.time-window').setAttribute('x', String(targetX - 45));
    panel.querySelector('.time-ghost').setAttribute('transform', `translate(${targetX - 170} 0)`);
  }
  const scenes = new Map();
  let graphicsStarted = false;
  function fallback(panel, error) {
    const viewport = panel.querySelector('.time-viewport');
    viewport.dataset.render = 'fallback';
    const canvas = viewport.querySelector('canvas');
    if (canvas) canvas.style.display = 'none';
    console.warn('Conveyor WebGL unavailable:', error);
    render();
  }
  function loadGraphics() {
    if (graphicsStarted) return;
    graphicsStarted = true;
    import('./time-scene3d.js?v=20261112-collision26b').then(({ createConveyorScene }) => {
      panels.forEach(panel => {
        const viewport = panel.querySelector('.time-viewport');
        try {
          const driver = createConveyorScene(panel.querySelector('.time-stage'), { onError: error => fallback(panel, error) });
          scenes.set(panel, driver);
          if (viewport.dataset.render !== 'fallback') viewport.dataset.render = 'webgl';
        } catch (error) { fallback(panel, error); }
      });
      render();
    }).catch(error => panels.forEach(panel => fallback(panel, error)));
  }
  root.querySelectorAll('.time-scene').forEach(scene => scene.setAttribute('viewBox', '0 -35 640 177'));
  const toggle = root.querySelector('[data-time-toggle]');
  const replay = root.querySelector('[data-time-replay]');
  const scrubber = root.querySelector('[data-time-scrubber]');
  let scrubbing = false, resumeAfterScrub = false;
  const copy = {
    heading: ['The world does not wait for reasoning', '现实不会等待推理'],
    command: ['Same Instruction: Pick up the cup.', '相同指令：拿起杯子。'],
    paused: ['Paused World', '暂停的世界'],
    pausedContext: ['(in simulators)', '（在模拟器中）'],
    live: ['Live World', '动态的世界'],
    liveContext: ['(in the real world)', '（在真实世界中）'],
    frozen: ['physical time paused', '物理时间暂停'],
    running: ['physical time advancing', '物理时间持续前进'],
    approaching: ['Cup Approaching', '杯子正在靠近'],
    observing: ['observing the scene', '观察环境'],
    reasoning: ['reasoning…', '推理中…'],
    ready: ['decision ready → act', '决策完成 → 执行动作'],
    complete: ['action complete', '动作完成'],
    window: ['', ''],
    success: ['Cup Caught', '抓取成功'],
    missed: ['Cup Missed', '抓取落空'],
    waiting: ['Waiting for the Decision', '等待决策完成'],
    escaping: ['Cup Moving Away', '杯子正在离开'],
    grasping: ['Executing the Grasp', '正在执行抓取'],
    observe: ['Wait for the Cup', '等待杯子到位'],
    observeDetail: ['both worlds move before reasoning starts.', '两个世界先运动，再开始推理。'],
    locate: ['Locate the Cup', '定位杯子'],
    locateDetail: ['use the observed cup position.', '读取观测中的杯子位置。'],
    choose: ['Choose a Side Grasp', '选择侧向抓取'],
    chooseDetail: ['keep the rim and handle clear.', '避开杯沿和把手。'],
    estimate: ['Estimate the Reach', '估算抓取路径'],
    estimateDetail: ['plan the approach and finger closure.', '规划靠近与夹爪闭合。'],
    execute: ['Execute the Same Plan', '执行相同计划'],
    executeDetail: ['reach from the observed position.', '从观测到的位置规划抓取。'],
    verify: ['Check the Outcome', '检查执行结果'],
    verifyDetail: ['same delay. different physical outcomes.', '相同延迟，产生不同物理结果。'],
    pause: ['Pause', '暂停'],
    resume: ['Resume', '继续'],
    replay: ['Replay', '重播'],
    progress: ['Animation progress', '动画进度'],
    static: ['Reduced Motion: Final State Shown', '已减少动态效果：展示最终状态'],
    description: ['Both cups move into view before the same three-second reasoning delay. The simulated world pauses only during reasoning, then resumes for the grasp. The real world keeps moving, so the same plan catches the first cup and misses the second.', '两个杯子先进入视野，再开始相同的三秒推理。模拟世界只在推理时暂停，执行抓取时恢复；真实世界始终运动，因此相同计划在上方抓住杯子、在下方错过。']
  };
  let elapsed = 0;
  let userPaused = false;
  let visible = true;
  let frame = 0;
  let previous = null;
  let lastThought = '';
  const t = key => copy[key][document.documentElement.lang.startsWith('zh') ? 1 : 0];
  const setText = (element, value) => { if (element.textContent !== value) element.textContent = value; };

  function language() {
    root.querySelectorAll('[data-time-copy]').forEach(el => setText(el, t(el.dataset.timeCopy)));
    root.setAttribute('aria-label', t('description'));
    render();
    controls();
  }
  function controls() {
    const label = reduced.matches ? t('static') : t(userPaused ? 'resume' : 'pause');
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    replay.setAttribute('aria-label', t('replay'));
    replay.title = t('replay');
    scrubber.setAttribute('aria-label', t('progress'));
    scrubber.disabled = reduced.matches;
    toggle.disabled = reduced.matches;
    replay.disabled = reduced.matches;
    toggle.setAttribute('aria-pressed', String(userPaused));
  }
  function sample(time, pausedWorld) {
    const reasonTime = time - leadIn;
    const reasoning = reasonTime >= 0 && time < decisionAt;
    const decided = time >= decisionAt;
    const closed = time >= decisionAt + graspDuration;
    const caught = pausedWorld && closed;
    const worldTime = pausedWorld ? Math.min(time, leadIn) + Math.max(0, time - decisionAt) : time;
    const grab = clamp((time - decisionAt) / graspDuration);
    const lift = clamp((time - decisionAt - graspDuration) / liftDuration);
    const gripperX = targetX + Math.min(Math.max(0, time - decisionAt), graspDuration) * cupSpeed;
    const cupX = caught ? gripperX : startX + worldTime * cupSpeed;
    const phase = time < leadIn ? 'approaching' : !decided ? 'reasoning' : !closed ? 'grasping' : lift < 1 ? 'lifting' : 'result';
    const thought = time < leadIn ? 'observe' : !decided ? (reasonTime < 1 ? 'locate' : reasonTime < 2 ? 'choose' : 'estimate') : lift < 1 ? 'execute' : 'verify';
    const status = time < leadIn ? 'approaching' : !decided ? (!pausedWorld && reasonTime > 0.8 ? 'escaping' : 'waiting') : !closed ? 'grasping' : pausedWorld ? 'success' : 'missed';
    return { time, phase, thought, status, cupX, gripperX, targetX, lift, grab, worldTime, pausedWorld, reasoning, decided, closed, caught, progress: clamp(reasonTime / reasoningDelay) };
  }
  function render() {
    const time = reduced.matches ? 8.8 : elapsed;
    scrubber.value = String(time);
    scrubber.style.setProperty('--time-progress', `${time / duration * 100}%`);
    scrubber.setAttribute('aria-valuetext', document.documentElement.lang.startsWith('zh') ? `${time.toFixed(1)} 秒，共 ${duration} 秒` : `${time.toFixed(1)} of ${duration} seconds`);
    panels.forEach(panel => {
      const state = sample(time, panel.dataset.timeWorld === 'paused');
      const { cupX, gripperX, lift, grab, worldTime, pausedWorld, reasoning, decided, closed, thought } = state;
      const driver = scenes.get(panel);
      if (driver && panel.querySelector('.time-viewport').dataset.render === 'webgl') driver.render(state);
      // Keep SVG state current even while WebGL renders, for immediate context-loss recovery.
      panel.querySelector('.time-cup').setAttribute('transform', `translate(${cupX} ${pausedWorld ? -lift * 36 : 0})`);
      panel.querySelector('.time-gripper').setAttribute('transform', `translate(${gripperX} ${grab * 19 - lift * 36})`);
      const jawGap = 4.5 + 7 * (1 - clamp((grab - 0.62) / 0.38));
      panel.querySelector('.time-jaw-left').setAttribute('transform', `translate(${-jawGap} 0)`);
      panel.querySelector('.time-jaw-right').setAttribute('transform', `translate(${jawGap} 0)`);
      panel.querySelector('.time-ghost').style.opacity = pausedWorld || time < leadIn ? '0' : String(clamp((cupX - targetX) / 50) * 0.3);
      panel.querySelectorAll('.time-wheel-spokes').forEach(wheel => wheel.setAttribute('transform', `rotate(${worldTime * cupSpeed / 7 * 180 / Math.PI})`));
      panel.querySelector('.time-belt-marks').setAttribute('stroke-dashoffset', String(-worldTime * cupSpeed));
      panel.querySelector('.time-clock-hand').style.transform = `rotate(${worldTime * 120}deg)`;
      panel.querySelector('.time-reason-fill').style.transform = `scaleX(${state.progress})`;
      panel.dataset.state = closed ? (pausedWorld ? 'success' : 'missed') : state.phase;
      panel.dataset.phase = state.phase;
      setText(panel.querySelector('[data-time-thought-title]'), t(thought));
      setText(panel.querySelector('[data-time-thought-detail]'), t(`${thought}Detail`));
      setText(panel.querySelector('[data-time-phase]'), t(time < leadIn ? 'observing' : !decided ? 'reasoning' : state.phase === 'result' ? 'complete' : 'ready'));
      setText(panel.querySelector('[data-time-status]'), t(state.status));
      setText(panel.querySelector('[data-time-clock-label]'), t(pausedWorld && reasoning ? 'frozen' : 'running'));
      lastThought = thought;
    });
  }
  function tick(now) {
    frame = 0;
    if (reduced.matches) { render(); controls(); previous = null; return; }
    if (previous !== null) elapsed = (elapsed + Math.min((now - previous) / 1000, 0.08)) % duration;
    previous = now;
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = null;
    if (!userPaused && !reduced.matches && visible && !document.hidden) frame = requestAnimationFrame(tick);
    controls();
  }
  toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
  replay.addEventListener('click', () => { elapsed = 0; userPaused = false; render(); sync(); });
  scrubber.addEventListener('pointerdown', event => {
    if (scrubber.disabled) return;
    scrubbing = true;
    resumeAfterScrub = !userPaused;
    userPaused = true;
    scrubber.setPointerCapture(event.pointerId);
    sync();
  });
  scrubber.addEventListener('input', () => {
    elapsed = Math.max(0, Math.min(duration - 0.001, Number(scrubber.value)));
    previous = null;
    render();
  });
  function finishScrub() {
    if (!scrubbing) return;
    scrubbing = false;
    userPaused = !resumeAfterScrub;
    sync();
  }
  scrubber.addEventListener('pointerup', finishScrub);
  scrubber.addEventListener('pointercancel', finishScrub);
  scrubber.addEventListener('lostpointercapture', finishScrub);
  reduced.addEventListener('change', () => { render(); sync(); });
  document.addEventListener('visibilitychange', sync);
  new MutationObserver(language).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if ('IntersectionObserver' in window) {
    const preload = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { loadGraphics(); preload.disconnect(); } }, { rootMargin: '400px' });
    preload.observe(root);
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) loadGraphics(); sync(); }, { threshold: 0.1 }).observe(root);
  } else loadGraphics();
  window.timeComparison = {
    seek(time, { pause = true } = {}) {
      if (!Number.isFinite(time)) return;
      elapsed = Math.max(0, Math.min(duration - 0.001, time));
      userPaused = pause;
      render();
      sync();
      return this.getState();
    },
    getState: () => ({
      elapsed, duration, leadIn, reasoningDelay, decisionAt, graspDuration, liftDuration, startX, targetX, cupSpeed,
      thought: lastThought, paused: userPaused, visible, reducedMotion: reduced.matches,
      scenes: panels.map(panel => ({ world: panel.dataset.timeWorld, render: panel.querySelector('.time-viewport').dataset.render, state: panel.dataset.state,
        ...sample(reduced.matches ? 8.8 : elapsed, panel.dataset.timeWorld === 'paused'), geometry: panel.querySelector('.time-viewport').dataset.render === 'webgl' ? scenes.get(panel)?.getState() : undefined }))
    })
  };
  language();
  sync();
})();
