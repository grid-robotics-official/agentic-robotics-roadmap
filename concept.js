import { createHeroScene } from './hero-scene.js?v=20261112-final18';
const root = document.querySelector('.scene-exhibit');
const stage = document.querySelector('#hero-canvas');
const buttons = [...root.querySelectorAll('[data-scene-phase]')];
const toggle = root.querySelector('.scene-toggle');
const replay = root.querySelector('.scene-replay');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const strings = {
  en: {
    request: 'Place the cup on the marker.', concept: 'an illustration of agentic robotics',
    phases: ['Observe', 'Reason', 'Act', 'Verify'], rounds: ['round 1', 'round 2'],
    captions: [
      ['locating the cup and target ring while identifying obstacles', 'planning a clear route around the obstacle to the intended release point', 'lifting the cup around the obstacle and releasing it at the planned position', 'the cup cleared the obstacle but its base landed in front of the target ring'],
      ['checking the actual position of the misplaced cup against the target ring', 'planning a release point farther back to align the cup base with the ring', 'regrasping the cup where it was left and moving it back onto the marker', 'the cup base is now inside the target ring confirming the placement goal']
    ],
    replay: 'Replay Both Rounds', pause: 'Pause Animation', play: 'Play Animation', static: 'static illustration',
    reset: 'reset view', keyboard: 'Use arrow keys to rotate the view.',
    description: 'A robot places a cup off target, detects the error, then observes, replans, and corrects its placement in a second round.',
    cycle: 'Observe, reason, act, verify, and repeat', roundsLabel: 'Animation Round'
  },
  zh: {
    request: '把杯子放到标记位置。', concept: '智能体机器人的概念演示',
    phases: ['观察', '推理', '行动', '验证'], rounds: ['第一轮', '第二轮'],
    captions: [
      ['识别杯子目标圆环与障碍物为选择搬运路径做好准备', '规划绕过障碍物到达预定落点的无碰撞路径', '提起杯子并绕过障碍物再在规划好的位置松开夹爪', '杯子避开了障碍物但杯底落在目标圆环前方尚未对齐'],
      ['检查放偏的杯子对比其实际落点与目标圆环的位置', '规划将落点向后调整让杯底与目标圆环对齐', '从上次放下的位置重新抓取杯子将它向后移到标记处', '杯底已落在目标圆环内确认放置目标已达成']
    ],
    replay: '重播两轮动画', pause: '暂停动画', play: '播放动画', static: '静态概念图',
    reset: '重置视角', keyboard: '使用方向键旋转视角。',
    description: '机器人第一次放下杯子后发现落点偏差，第二轮重新观察、规划，从实际落点重新抓取并修正位置。',
    cycle: '观察、推理、行动、验证，再次循环', roundsLabel: '动画轮次'
  }
};

// Keep the scene controls with the scene; existing page translations stay independent.
const roundGroup = document.createElement('div');
roundGroup.className = 'scene-rounds'; roundGroup.setAttribute('role', 'group');
const roundButtons = [1, 2].map(round => {
  const button = document.createElement('button');
  button.type = 'button'; button.dataset.sceneRound = String(round);
  roundGroup.appendChild(button); return button;
});
const cycle = root.querySelector('.scene-phases');
cycle.insertAdjacentHTML('afterbegin', `<svg class="scene-cycle" viewBox="0 0 290 112" preserveAspectRatio="none" aria-hidden="true">
  <path d="M48 34Q67 16 101 16"/><path class="scene-arrowhead" d="m95 12 6 4-6 4"/>
  <path d="M189 16Q223 16 242 34"/><path class="scene-arrowhead" d="m235 32 7 2-2-7"/>
  <path d="M242 78Q223 96 189 96"/><path class="scene-arrowhead" d="m195 92-6 4 6 4"/>
  <path d="M101 96Q67 96 48 78"/><path class="scene-arrowhead" d="m55 80-7-2 2 7"/>
</svg>`);
cycle.appendChild(roundGroup);
const footer = document.createElement('div'); footer.className = 'scene-footer';
cycle.before(footer); footer.append(cycle, root.querySelector('.scene-caption-row'));
const reset = document.createElement('button'); reset.className = 'scene-reset'; reset.type = 'button';
root.querySelector('.scene-playback').append(reset);
const explanation = document.createElement('div'); explanation.className = 'scene-explanation';
const caption = root.querySelector('#scene-caption');
caption.before(explanation); explanation.append(caption);
stage.tabIndex = 0; stage.setAttribute('aria-describedby', 'scene-request');
let phase = 0, round = 1, outcome = 'pending', userPaused = reduced.matches, visible = true, scene = null, failed = false;
const copy = () => strings[document.documentElement.lang.startsWith('zh') ? 'zh' : 'en'];

function renderPhase(index, currentRound = round, currentOutcome = outcome) {
  phase = index; round = currentRound; outcome = currentOutcome;
  const c = copy();
  buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === phase)));
  roundButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i + 1 === round)));
  root.querySelectorAll('#scene-caption span').forEach((span, i) => span.setAttribute('aria-hidden', String(i !== (round - 1) * 4 + phase)));
  root.dataset.phase = String(phase); root.dataset.round = String(round); root.dataset.outcome = outcome;
}
function language() {
  const c = copy();
  root.querySelectorAll('[data-scene-copy]').forEach(el => el.textContent = c[el.dataset.sceneCopy]);
  root.querySelectorAll('[data-phase-label]').forEach(el => el.textContent = c.phases[+el.dataset.phaseLabel]);
  root.querySelector('#scene-caption').replaceChildren(...c.captions.flat().map(text => {
    const span = document.createElement('span'); span.textContent = text; return span;
  }));
  roundButtons.forEach((button, i) => button.textContent = c.rounds[i]);
  roundGroup.setAttribute('aria-label', c.roundsLabel); cycle.setAttribute('aria-label', c.cycle);
  stage.setAttribute('aria-label', `${c.description} ${c.keyboard}`);
  root.setAttribute('aria-label', c.concept); root.querySelector('.scene-fallback').alt = c.description;
  reset.textContent = c.reset; reset.title = c.reset;
  renderPhase(phase);
  toggle.setAttribute('aria-label', userPaused ? c.play : c.pause); toggle.title = userPaused ? c.play : c.pause;
  replay.setAttribute('aria-label', c.replay); replay.title = c.replay;
}
function sync() {
  if (!scene || failed) return;
  if (userPaused || !visible || document.hidden) scene.pause(); else scene.play();
  toggle.setAttribute('aria-pressed', String(userPaused));
  toggle.setAttribute('aria-label', userPaused ? copy().play : copy().pause); toggle.title = userPaused ? copy().play : copy().pause;
}
buttons.forEach((button, i) => button.addEventListener('click', () => {
  if (!scene || failed) return;
  userPaused = true; scene.seekPhase(i, round); sync();
}));
roundButtons.forEach((button, i) => button.addEventListener('click', () => {
  if (!scene || failed) return;
  userPaused = true; scene.seekPhase(0, i + 1); sync();
}));
toggle.addEventListener('click', () => { userPaused = !userPaused; sync(); });
replay.addEventListener('click', () => {
  if (!scene || failed) return;
  scene.replay(); userPaused = false; sync();
});
reset.addEventListener('click', () => scene?.resetView());
new MutationObserver(language).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: .08 }).observe(root);
document.addEventListener('visibilitychange', sync);
reduced.addEventListener('change', () => {
  userPaused = reduced.matches;
  if (reduced.matches && scene && !failed) scene.seekPhase(3, 2);
  sync();
});
function fallback(error) {
  failed = true; console.warn('Concept scene unavailable:', error);
  stage.hidden = true; stage.tabIndex = -1;
  root.querySelector('.scene-fallback').hidden = false;
  toggle.hidden = true; replay.hidden = true; reset.hidden = true;
  [...buttons, ...roundButtons].forEach(button => button.disabled = true);
  root.dataset.render = 'fallback'; renderPhase(3, 2, 'success');
}
language();
try {
  scene = createHeroScene(stage, {
    onPhase(index, progress, currentRound, currentOutcome) {
      if (index !== phase || currentRound !== round || currentOutcome !== outcome) renderPhase(index, currentRound, currentOutcome);
    },
    onViewChange(isDefault) { reset.dataset.default = String(isDefault); },
    onReady() { root.dataset.render = 'webgl'; }, onError: fallback
  });
  // Public inspection controls also update UI intent, so background tabs cannot resume a paused snapshot.
  window.heroConcept = {
    ...scene,
    pause() { userPaused = true; sync(); },
    play() { userPaused = false; sync(); },
    seek(seconds) { userPaused = true; scene.pause(); scene.seek(seconds); sync(); },
    seekPhase(index, currentRound) { userPaused = true; scene.pause(); scene.seekPhase(index, currentRound); sync(); },
    replay() { scene.replay(); userPaused = false; sync(); }
  };
  if (reduced.matches && !failed) scene.seekPhase(3, 2);
  sync();
} catch (error) { fallback(error); }

// Align the resource buttons with Observe when the scene uses two columns.
(() => {
  const resources = document.querySelector('.hero-resources');
  const observe = root.querySelector('[data-scene-phase="0"]');
  let scheduled = false;
  function alignResources() {
    scheduled = false;
    if (innerWidth <= 1000) { resources.style.removeProperty('--resource-offset'); return; }
    const a = resources.getBoundingClientRect(), b = observe.getBoundingClientRect();
    const applied = parseFloat(resources.style.getPropertyValue('--resource-offset')) || 0;
    const offset = Math.max(0, b.top + b.height / 2 - a.top - a.height / 2 + applied);
    resources.style.setProperty('--resource-offset', offset.toFixed(2) + 'px');
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(alignResources); } }
  new ResizeObserver(schedule).observe(root);
  new MutationObserver(schedule).observe(document.documentElement, {attributes:true,attributeFilter:['lang']});
  addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
})();
