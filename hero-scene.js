import * as THREE from './vendor/three.module.min.js';

export const ROUND_DURATION = 10.8;
export const DURATION = ROUND_DURATION * 2 + 0.8;
const PHASE_TIMES = [0, 1.65, 3, 8.1, ROUND_DURATION];
const smooth = (t) => { const x = THREE.MathUtils.clamp(t, 0, 1); return x * x * (3 - 2 * x); };
const mix = (a, b, t) => a.clone().lerp(b, smooth(t));
const v = (x, y, z) => new THREE.Vector3(x, y, z);

// Shared scene-space motion model; exported so geometry can be checked without WebGL.
export const WORKCELL = Object.freeze({
  start: [0.16, 0.14, 0.62], misplaced: [1.25, 0.14, 0.55], target: [1.27, 0.14, -0.25],
  shoulder: [-1.35, 0.67, -0.46], rest: [-0.23, 1.62, -0.3],
  gripHeight: 0.76, liftHeight: 0.45, upperLength: 1.45, lowerLength: 1.6,
  obstacle: { center: [0.715, 0.48, 0.185], size: [0.34, 0.68, 0.38] },
});
const cupStart = v(...WORKCELL.start), cupMisplaced = v(...WORKCELL.misplaced), cupTarget = v(...WORKCELL.target);
const carryCurves = [
  new THREE.CubicBezierCurve3(cupStart.clone().add(v(0, WORKCELL.liftHeight, 0)), v(0.55, 0.59, 1.15), v(1.35, 0.59, 1.08), cupMisplaced.clone().add(v(0, WORKCELL.liftHeight, 0))),
  new THREE.CubicBezierCurve3(cupMisplaced.clone().add(v(0, WORKCELL.liftHeight, 0)), v(1.47, 0.59, 0.42), v(1.48, 0.59, -0.1), cupTarget.clone().add(v(0, WORKCELL.liftHeight, 0))),
];

// The first/last quarters lift/lower; the middle half detours around the front of the block.
// Every blue path vertex, its moving bead, and the carried cup use this one function.
export function sampleCupPath(progress, round = 1) {
  const u = THREE.MathUtils.clamp(progress, 0, 1);
  const start = round === 2 ? cupMisplaced : cupStart, end = round === 2 ? cupTarget : cupMisplaced;
  if (u < 0.25) return start.clone().add(v(0, WORKCELL.liftHeight * u * 4, 0));
  if (u <= 0.75) return carryCurves[round === 2 ? 1 : 0].getPoint((u - 0.25) * 2);
  return end.clone().add(v(0, WORKCELL.liftHeight * (1 - u) * 4, 0));
}

export function sampleHeroMotion(elapsed) {
  const cycleTime = ((elapsed % DURATION) + DURATION) % DURATION;
  const round = cycleTime < ROUND_DURATION ? 1 : 2;
  const t = cycleTime - (round - 1) * ROUND_DURATION;
  const phase = t < 1.65 ? 0 : t < 3 ? 1 : t < 8.1 ? 2 : 3;
  const progress = THREE.MathUtils.clamp((t - PHASE_TIMES[phase]) / (PHASE_TIMES[phase + 1] - PHASE_TIMES[phase]), 0, 1);
  const start = round === 1 ? cupStart : cupMisplaced, end = round === 1 ? cupMisplaced : cupTarget;
  const rest = v(...WORKCELL.rest), gripOffset = v(0, WORKCELL.gripHeight, 0);
  const pickup = start.clone().add(gripOffset), destination = end.clone().add(gripOffset);
  const hover = sampleCupPath(0.25, round).add(gripOffset), targetHover = sampleCupPath(0.75, round).add(gripOffset);
  let wrist = rest.clone(), cup = start.clone(), opening = 0.34, held = false, opacity = 1, trajectoryProgress = null;
  if (t >= 2.15 && t < 3) wrist = mix(rest, hover, (t - 2.15) / 0.85);
  if (t >= 3 && t < 3.75) wrist = mix(hover, pickup, (t - 3) / 0.75);
  if (t >= 3.75 && t < 4.1) {
    wrist.copy(pickup);
    opening = THREE.MathUtils.lerp(0.34, 0.26, smooth((t - 3.75) / 0.35));
  }
  if (t >= 4.1 && t < 4.85) trajectoryProgress = 0.25 * smooth((t - 4.1) / 0.75);
  if (t >= 4.85 && t < 6.25) trajectoryProgress = 0.25 + 0.5 * smooth((t - 4.85) / 1.4);
  if (t >= 6.25 && t < 6.95) trajectoryProgress = 0.75 + 0.25 * smooth((t - 6.25) / 0.7);
  if (trajectoryProgress !== null) {
    held = true; opening = 0.26;
    cup = sampleCupPath(trajectoryProgress, round);
    wrist.copy(cup).add(gripOffset);
  }
  if (t >= 6.95 && t < 7.3) {
    wrist.copy(destination); cup.copy(end);
    opening = THREE.MathUtils.lerp(0.26, 0.34, smooth((t - 6.95) / 0.35));
  }
  if (t >= 7.3 && t < 7.8) { wrist = mix(destination, targetHover, (t - 7.3) / 0.5); cup.copy(end); }
  if (t >= 7.8) { wrist = mix(targetHover, rest, (t - 7.8)); cup.copy(end); }
  const verificationError = cup.distanceTo(cupTarget);
  const outcome = phase === 3 ? verificationError > 0.08 ? 'retry' : 'success' : 'pending';
  if (cycleTime > DURATION - 0.8) {
    if (cycleTime < DURATION - 0.4) opacity = 1 - smooth((cycleTime - DURATION + 0.8) / 0.4);
    else { cup.copy(cupStart); opacity = smooth((cycleTime - DURATION + 0.4) / 0.4); }
  }
  return { wrist, cup, opening, held, opacity, trajectoryProgress, round, phase, progress, outcome, verificationError, cycleTime };
}

export function solveHeroArm(wrist) {
  const shoulder = v(...WORKCELL.shoulder), direction = wrist.clone().sub(shoulder);
  const requestedDistance = direction.length();
  const distance = Math.min(requestedDistance, WORKCELL.upperLength + WORKCELL.lowerLength - 0.001);
  direction.normalize();
  const along = (WORKCELL.upperLength ** 2 - WORKCELL.lowerLength ** 2 + distance ** 2) / (2 * distance);
  const height = Math.sqrt(Math.max(0, WORKCELL.upperLength ** 2 - along ** 2));
  const bend = v(0, 1, -0.22).addScaledVector(direction, -v(0, 1, -0.22).dot(direction)).normalize();
  const elbow = shoulder.clone().addScaledVector(direction, along).addScaledVector(bend, height);
  return { shoulder, elbow, wrist: wrist.clone(), reachMargin: WORKCELL.upperLength + WORKCELL.lowerLength - requestedDistance };
}

/** A self-contained, deterministic pick-and-place workcell. All coordinates are metres. */
export function createHeroScene(container, { onPhase, onReady, onError, onViewChange } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    onError?.(error);
    return { play() {}, pause() {}, replay() {}, seek() {}, seekPhase() {}, resetView() {}, dispose() {}, getState: () => ({ phase: 0, elapsed: 0, error: true }), snapshot() { return this.getState(); } };
  }
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.2, 3.2, 2.65, -2.65, 0.1, 50);
  const cameraTarget = v(0, 0.92, 0), defaultOrbit = { azimuth: Math.atan2(6.8, 8.5), elevation: 0.427 };
  const orbit = { ...defaultOrbit };
  function positionCamera() {
    const radius = 12, horizontal = Math.cos(orbit.elevation) * radius;
    camera.position.set(Math.sin(orbit.azimuth) * horizontal, Math.sin(orbit.elevation) * radius, Math.cos(orbit.azimuth) * horizontal).add(cameraTarget);
    camera.lookAt(cameraTarget);
  }
  positionCamera();
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;outline:none';
  container.appendChild(renderer.domElement);
  const resultBadge = document.createElement('div');
  resultBadge.className = 'scene-result';
  resultBadge.setAttribute('aria-hidden', 'true');
  resultBadge.innerHTML = '<svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="12"/><path class="result-check" d="m8.5 14 3.5 3.5 7.5-8"/><path class="result-retry" d="M14 7.5v8m0 4v.5"/></svg>';
  container.appendChild(resultBadge);

  const materials = [];
  const mat = (options) => { const m = new THREE.MeshStandardMaterial(options); materials.push(m); return m; };
  const white = mat({ color: 0xe5e7e7, roughness: 0.36, metalness: 0.18 });
  const inset = mat({ color: 0x707c88, roughness: 0.43, metalness: 0.5 });
  const graphite = mat({ color: 0x293541, roughness: 0.44, metalness: 0.45 });
  const tableMat = mat({ color: 0xf2f4f5, roughness: 0.8, metalness: 0.05 });
  const edgeMat = mat({ color: 0xbfc8d0, roughness: 0.5, metalness: 0.36 });
  const obstacleMat = mat({ color: 0x929da6, roughness: 0.68, metalness: 0.15 });
  const ceramic = mat({ color: 0xc5d8e4, roughness: 0.28, metalness: 0.05, transparent: true });
  const blue = mat({ color: 0x397ef2, roughness: 0.33, metalness: 0.3, emissive: 0x1557b7, emissiveIntensity: 0.1 });
  const green = new THREE.MeshBasicMaterial({ color: 0x37a58c, transparent: true, opacity: 0 });
  materials.push(green);
  const lineMaterials = [];
  function line(points, color = 0x7b8e9f, opacity = 0.2, dashed = false) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = dashed
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.065, gapSize: 0.045, depthWrite: false })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    lineMaterials.push(material);
    const object = new THREE.Line(geometry, material);
    if (dashed) object.computeLineDistances();
    scene.add(object);
    return object;
  }
  function mesh(geometry, material, position, parent = scene) {
    const object = new THREE.Mesh(geometry, material);
    if (position) object.position.copy(position);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function cylinder(radius, height, material, position, parent = scene, bottom = radius) {
    return mesh(new THREE.CylinderGeometry(radius, bottom, height, 48), material, position, parent);
  }
  function box(w, h, d, material, position, parent = scene) {
    return mesh(new THREE.BoxGeometry(w, h, d), material, position, parent);
  }
  function roundedPlate(w, d, h, radius, material, y) {
    const shape = new THREE.Shape();
    const x = -w / 2, z = -d / 2;
    shape.moveTo(x + radius, z);
    shape.lineTo(x + w - radius, z);
    shape.quadraticCurveTo(x + w, z, x + w, z + radius);
    shape.lineTo(x + w, z + d - radius);
    shape.quadraticCurveTo(x + w, z + d, x + w - radius, z + d);
    shape.lineTo(x + radius, z + d);
    shape.quadraticCurveTo(x, z + d, x, z + d - radius);
    shape.lineTo(x, z + radius);
    shape.quadraticCurveTo(x, z, x + radius, z);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.018, bevelThickness: 0.018, curveSegments: 10 });
    geometry.rotateX(-Math.PI / 2);
    return mesh(geometry, material, v(0, y, 0));
  }

  // A machined work surface with sparse metrology marks, not a decorative particle field.
  roundedPlate(4.55, 2.85, 0.1, 0.15, edgeMat, -0.02);
  roundedPlate(4.49, 2.79, 0.03, 0.14, tableMat, 0.082);
  for (const x of [-1.65, 1.65]) {
    box(0.38, 0.18, 2.05, graphite, v(x, -0.13, 0));
    for (const z of [-0.86, 0.86]) cylinder(0.14, 0.07, inset, v(x, -0.25, z));
  }
  const grid = new THREE.Group();
  scene.add(grid);
  for (let i = -8; i <= 8; i++) {
    const object = line([v(i * 0.25, 0.136, -1.19), v(i * 0.25, 0.136, 1.19)], 0x8d9baa, i % 4 === 0 ? 0.15 : 0.065);
    grid.add(object);
  }
  for (let i = -4; i <= 4; i++) {
    const object = line([v(-2.05, 0.136, i * 0.25), v(2.05, 0.136, i * 0.25)], 0x8d9baa, i % 4 === 0 ? 0.15 : 0.065);
    grid.add(object);
  }
  for (let i = 0; i <= 36; i++) {
    line([v(-1.8 + i * 0.1, 0.137, 1.27), v(-1.8 + i * 0.1, 0.137, i % 5 === 0 ? 1.18 : 1.23)], 0x778899, 0.35);
  }
  for (const x of [-2.1, 2.1]) for (const z of [-1.25, 1.25]) {
    cylinder(0.035, 0.006, inset, v(x, 0.14, z));
    line([v(x - 0.018, 0.144, z), v(x + 0.018, 0.144, z)], 0xe8edf1, 0.5);
  }

  const ambient = new THREE.HemisphereLight(0xf4f8ff, 0x8a9bac, 2.35);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfffaf2, 3.8);
  key.position.set(-3.5, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 3;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa8cbff, 1.8);
  rim.position.set(4, 3, -4);
  scene.add(rim);
  const shadowMaterial = new THREE.ShadowMaterial({ color: 0x30465d, transparent: true, opacity: 0.1 });
  materials.push(shadowMaterial);
  const shadow = mesh(new THREE.PlaneGeometry(30, 30), shadowMaterial, v(0, -0.3, 0));
  shadow.rotation.x = -Math.PI / 2;
  shadow.castShadow = false;

  const base = v(-1.35, 0.14, -0.46);
  cylinder(0.39, 0.07, graphite, base.clone().add(v(0, 0.035, 0)));
  cylinder(0.32, 0.2, white, base.clone().add(v(0, 0.17, 0)), scene, 0.36);
  cylinder(0.324, 0.018, blue, base.clone().add(v(0, 0.25, 0)));
  cylinder(0.25, 0.22, white, base.clone().add(v(0, 0.33, 0)));
  const shoulder = base.clone().add(v(0, 0.53, 0));
  const jointGeometry = new THREE.SphereGeometry(0.18, 32, 24);
  mesh(jointGeometry, white, shoulder);
  const elbowJoint = mesh(jointGeometry, white);
  const wristJoint = mesh(new THREE.SphereGeometry(0.12, 24, 18), graphite);
  const shoulderCap = cylinder(0.155, 0.065, graphite, shoulder.clone().add(v(0, 0, 0.16)));
  shoulderCap.rotation.x = Math.PI / 2;
  const shoulderDisk = cylinder(0.1, 0.068, inset, shoulder.clone().add(v(0, 0, 0.18)));
  shoulderDisk.rotation.x = Math.PI / 2;
  const elbowCap = cylinder(0.145, 0.06, graphite);
  elbowCap.rotation.x = Math.PI / 2;
  const elbowDisk = cylinder(0.085, 0.065, inset);
  elbowDisk.rotation.x = Math.PI / 2;

  function makeLink(length, thickness) {
    const group = new THREE.Group();
    scene.add(group);
    cylinder(thickness * 0.72, length - 0.15, graphite, v(0, 0, 0), group);
    for (const z of [-0.075, 0.075]) {
      const rail = mesh(new THREE.CapsuleGeometry(thickness * 0.61, length - thickness * 1.22 - 0.12, 8, 24), white, v(0, 0, z), group);
      rail.scale.z = 0.7;
    }
    const stripe = box(0.032, length * 0.44, 0.009, inset, v(0, 0.03, 0.145), group);
    stripe.castShadow = false;
    for (const y of [-length * 0.31, length * 0.31]) {
      const screw = cylinder(0.021, 0.012, graphite, v(0, y, 0.15), group);
      screw.rotation.x = Math.PI / 2;
    }
    return group;
  }
  const { upperLength, lowerLength } = WORKCELL;
  const upper = makeLink(upperLength, 0.17);
  const lower = makeLink(lowerLength, 0.145);
  const gripper = new THREE.Group();
  scene.add(gripper);
  cylinder(0.095, 0.19, white, v(0, -0.075, 0), gripper);
  cylinder(0.099, 0.024, blue, v(0, -0.12, 0), gripper);
  box(0.57, 0.115, 0.18, graphite, v(0, -0.19, 0), gripper);
  box(0.45, 0.055, 0.19, white, v(0, -0.166, 0), gripper);
  const fingers = [];
  for (const sign of [-1, 1]) {
    const finger = new THREE.Group();
    gripper.add(finger);
    box(0.065, 0.31, 0.12, white, v(0, -0.365, 0), finger);
    box(0.026, 0.15, 0.115, graphite, v(-sign * 0.042, -0.435, 0), finger);
    fingers.push(finger);
  }
  // A visible sensor on the wrist faces the work surface.
  const sensor = cylinder(0.037, 0.014, blue, v(0, -0.24, 0.102), gripper);
  sensor.rotation.x = Math.PI / 2;

  const start = v(...WORKCELL.start), target = v(...WORKCELL.target);
  const rest = v(...WORKCELL.rest);
  const obstacle = box(...WORKCELL.obstacle.size, obstacleMat, v(...WORKCELL.obstacle.center));
  obstacle.name = 'route-obstacle';
  // A restrained machined block: its full height intersects a straight carried-cup route.
  const [ox, oy, oz] = WORKCELL.obstacle.center;
  const [ow, oh, od] = WORKCELL.obstacle.size;
  line([v(ox - ow / 2 + 0.045, oy + oh / 2 + 0.001, oz + od / 2 - 0.045), v(ox + ow / 2 - 0.045, oy + oh / 2 + 0.001, oz + od / 2 - 0.045)], 0x67737e, 0.55);
  const cup = new THREE.Group();
  scene.add(cup);
  const cupProfile = [[0, 0], [0.176, 0], [0.19, 0.015], [0.211, 0.46], [0.208, 0.488], [0.181, 0.488], [0.178, 0.462], [0.161, 0.065], [0, 0.065]].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(new THREE.LatheGeometry(cupProfile, 64), ceramic, v(0, 0, 0), cup);
  const handle = mesh(new THREE.TorusGeometry(0.126, 0.032, 12, 40), ceramic, v(0, 0.265, 0.225), cup);
  handle.rotation.y = Math.PI / 2;
  const rimLine = mesh(new THREE.TorusGeometry(0.195, 0.012, 10, 64), ceramic, v(0, 0.481, 0), cup);
  rimLine.rotation.x = Math.PI / 2;
  // The target is a physical fiducial, readable before and after the cup arrives.
  const targetGroup = new THREE.Group();
  targetGroup.position.copy(target);
  scene.add(targetGroup);
  const targetRing = mesh(new THREE.RingGeometry(0.29, 0.305, 64), new THREE.MeshBasicMaterial({ color: 0x4d81c4, transparent: true, opacity: 0.4, side: THREE.DoubleSide }), v(0, 0.002, 0), targetGroup);
  targetRing.rotation.x = -Math.PI / 2;
  materials.push(targetRing.material);
  for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
    const a = v(Math.cos(angle) * 0.35, 0.144, Math.sin(angle) * 0.35).add(v(target.x, 0, target.z));
    const b = v(Math.cos(angle) * 0.45, 0.144, Math.sin(angle) * 0.45).add(v(target.x, 0, target.z));
    line([a, b], 0x407ccd, 0.6);
  }
  const successRing = mesh(new THREE.RingGeometry(0.335, 0.355, 64), green, target.clone().add(v(0, 0.006, 0)));
  successRing.rotation.x = -Math.PI / 2;
  const amber = new THREE.MeshBasicMaterial({ color: 0xd28b22, transparent: true, opacity: 0, side: THREE.DoubleSide });
  materials.push(amber);
  const errorRing = mesh(new THREE.RingGeometry(0.285, 0.305, 64), amber, cupMisplaced.clone().add(v(0, 0.006, 0)));
  errorRing.rotation.x = -Math.PI / 2;
  const errorLine = line([cupMisplaced.clone().add(v(0, 0.01, 0)), target.clone().add(v(0, 0.01, 0))], 0xd28b22, 0, true);

  const pathOffset = v(0, 0.24, 0);
  const pathSegments = 160, pathSides = 8;
  const paths = [1, 2].map(round => {
    const visibleCurve = new THREE.Curve();
    visibleCurve.getPoint = (u, point = new THREE.Vector3()) => point.copy(sampleCupPath(u, round)).add(pathOffset);
    const pathMaterial = new THREE.MeshBasicMaterial({ color: 0x397ef2, transparent: true, opacity: 0, depthWrite: false });
    materials.push(pathMaterial);
    const path = mesh(new THREE.TubeGeometry(visibleCurve, pathSegments, 0.013, pathSides, false), pathMaterial);
    path.castShadow = false; path.receiveShadow = false;
    const floor = line(Array.from({ length: 81 }, (_, i) => {
      const p = sampleCupPath(0.25 + i / 160, round); p.y = 0.148; return p;
    }), 0x4388ef, 0, true);
    return { path, floor };
  });
  const ghost = mesh(new THREE.SphereGeometry(0.034, 16, 12), blue);
  ghost.castShadow = false;
  const graspPoints = new THREE.Group();
  scene.add(graspPoints);
  for (const sign of [-1, 1]) {
    const dot = mesh(new THREE.SphereGeometry(0.028, 12, 8), blue, start.clone().add(v(sign * 0.215, 0.325, 0)), graspPoints);
    dot.castShadow = false;
  }
  const boxPoints = [];
  for (const y of [0.025, 0.53]) {
    const points = [v(-0.27, y, -0.27), v(0.27, y, -0.27), v(0.27, y, 0.36), v(-0.27, y, 0.36), v(-0.27, y, -0.27)];
    boxPoints.push(line(points.map(p => p.add(start)), 0x4388ef, 0.35));
  }
  for (const x of [-0.27, 0.27]) for (const z of [-0.27, 0.36]) {
    boxPoints.push(line([start.clone().add(v(x, 0.025, z)), start.clone().add(v(x, 0.53, z))], 0x4388ef, 0.35));
  }
  const scanRing = mesh(new THREE.RingGeometry(0.25, 0.256, 64), new THREE.MeshBasicMaterial({ color: 0x4388ef, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }), start.clone());
  materials.push(scanRing.material);
  scanRing.rotation.x = -Math.PI / 2;
  scanRing.castShadow = false;
  const pointPositions = [];
  for (let row = 0; row < 10; row++) for (let col = 0; col < 24; col++) {
    const a = col / 24 * Math.PI * 2;
    const y = row / 9 * 0.48;
    const radius = 0.2 + row / 9 * 0.012;
    pointPositions.push(start.x + Math.cos(a) * radius, start.y + y, start.z + Math.sin(a) * radius);
  }
  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(pointPositions, 3));
  const pointsMaterial = new THREE.PointsMaterial({ color: 0x4e9dff, size: 0.019, transparent: true, opacity: 0.6, sizeAttenuation: true, depthWrite: false });
  materials.push(pointsMaterial);
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(points);

  let elapsed = 0, phase = 0, running = false, disposed = false, frame = 0, previousTime = 0, ready = false;
  let endEffector = rest.clone(), held = false;
  const axisY = v(0, 1, 0);
  function placeLink(object, a, b) {
    object.position.copy(a).add(b).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(axisY, b.clone().sub(a).normalize());
  }
  function solveArm(wrist) {
    const { elbow } = solveHeroArm(wrist);
    placeLink(upper, shoulder, elbow);
    placeLink(lower, elbow, wrist);
    elbowJoint.position.copy(elbow);
    elbowCap.position.copy(elbow).add(v(0, 0, 0.15));
    elbowDisk.position.copy(elbow).add(v(0, 0, 0.18));
    wristJoint.position.copy(wrist);
    gripper.position.copy(wrist);
  }
  function update() {
    const motion = sampleHeroMotion(elapsed);
    const { wrist, opening, round, progress, outcome, cycleTime: t } = motion;
    phase = motion.phase;
    const observed = round === 1 ? start : cupMisplaced;
    const observedOffset = observed.clone().sub(start);
    held = motion.held;
    ceramic.opacity = motion.opacity;
    cup.position.copy(motion.cup);
    cup.visible = ceramic.opacity > 0.005;
    endEffector.copy(wrist);
    fingers[0].position.x = -opening;
    fingers[1].position.x = opening;
    solveArm(wrist);
    const scanning = phase === 0;
    const reasoning = phase === 1;
    const acting = phase === 2;
    points.visible = scanning;
    points.position.copy(observedOffset);
    pointsMaterial.opacity = 0.17 + Math.sin(t * 2.5) ** 2 * 0.43;
    scanRing.visible = scanning;
    scanRing.position.copy(observed).add(v(0, 0.03 + ((t * 0.65) % 1) * 0.48, 0));
    for (const object of boxPoints) {
      object.position.copy(observedOffset);
      object.visible = scanning || reasoning;
      object.material.opacity = reasoning ? 0.3 : 0.14 + 0.09 * Math.sin(t * 2);
    }
    const pathOpacity = reasoning ? smooth(progress * 3) * 0.85 : acting ? 0.5 : 0;
    paths.forEach(({path, floor}, index) => {
      path.visible = floor.visible = index === round - 1;
      path.material.opacity = pathOpacity;
      floor.material.opacity = pathOpacity * 0.3;
      path.geometry.setDrawRange(0, (reasoning ? Math.max(1, Math.floor(smooth(progress * 1.6) * pathSegments)) : pathSegments) * pathSides * 6);
    });
    graspPoints.visible = reasoning;
    graspPoints.position.copy(observedOffset);
    ghost.visible = reasoning;
    if (reasoning) ghost.position.copy(sampleCupPath((progress * 1.5) % 1, round).add(pathOffset));
    const showResult = phase === 3 && t < DURATION - 0.8;
    green.opacity = showResult && outcome === 'success' ? 0.8 : 0;
    const mismatch = outcome === 'retry' || round === 2 && phase < 2;
    amber.opacity = mismatch ? 0.78 : 0;
    errorLine.material.opacity = mismatch ? 0.65 : 0;
    resultBadge.hidden = !showResult;
    resultBadge.dataset.outcome = outcome;
    positionBadge();
    onPhase?.(phase, progress, round, outcome);
  }
  function positionBadge() {
    const anchor = cup.position.clone().add(v(0, 0.84, 0)).project(camera);
    resultBadge.style.left = `${(anchor.x + 1) / 2 * container.clientWidth}px`;
    resultBadge.style.top = `${(1 - anchor.y) / 2 * container.clientHeight}px`;
  }
  function render() {
    if (disposed) return;
    renderer.render(scene, camera);
    positionBadge();
    if (!ready) { ready = true; queueMicrotask(() => { if (!disposed) onReady?.(); }); }
  }
  function tick(time) {
    if (!running || disposed) return;
    if (previousTime) elapsed += Math.min((time - previousTime) / 1000, 0.08);
    previousTime = time;
    update();
    render();
    frame = requestAnimationFrame(tick);
  }
  function resize() {
    if (disposed) return;
    const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const frustumHeight = Math.max(4.12, 5.5 / aspect);
    camera.left = -frustumHeight * aspect / 2;
    camera.right = frustumHeight * aspect / 2;
    camera.top = frustumHeight / 2;
    camera.bottom = -frustumHeight / 2;
    camera.updateProjectionMatrix();
    // Supersample fine edges on desktop; cap mobile DPR and total fill cost.
    const nativeRatio = window.devicePixelRatio || 1;
    const targetRatio = matchMedia('(pointer: coarse)').matches ? nativeRatio : Math.max(2, nativeRatio);
    const pixelRatio = Math.max(1, Math.min(targetRatio, 2, Math.sqrt(1500000 / (width * height))));
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    render();
  }
  function theme() {
    const dark = document.documentElement.dataset.theme === 'dark';
    tableMat.color.setHex(dark ? 0x26323e : 0xf2f4f5);
    edgeMat.color.setHex(dark ? 0x3b4c5c : 0xbfc8d0);
    white.color.setHex(dark ? 0xd1dae1 : 0xe5e7e7);
    ceramic.color.setHex(dark ? 0x96b9d4 : 0xc5d8e4);
    obstacleMat.color.setHex(dark ? 0x7a8794 : 0x929da6);
    ambient.intensity = dark ? 1.75 : 2.35;
    key.intensity = dark ? 3.2 : 3.8;
    shadowMaterial.opacity = dark ? 0.23 : 0.1;
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  const themeObserver = new MutationObserver(theme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('resize', resize);
  let drag = null;
  const isDefaultView = () => Math.abs(orbit.azimuth - defaultOrbit.azimuth) < 0.001 && Math.abs(orbit.elevation - defaultOrbit.elevation) < 0.001;
  function changeView(dx, dy) {
    orbit.azimuth = THREE.MathUtils.clamp(orbit.azimuth - dx * 0.008, defaultOrbit.azimuth - 1.15, defaultOrbit.azimuth + 1.15);
    orbit.elevation = THREE.MathUtils.clamp(orbit.elevation + dy * 0.006, 0.25, 1.0);
    positionCamera(); render(); onViewChange?.(isDefaultView());
  }
  const pointerDown = event => {
    // Touch keeps native page scrolling; orbit is an explicit mouse interaction.
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, id: event.pointerId };
    container.setPointerCapture(event.pointerId);
    container.classList.add('is-dragging');
  };
  const pointerMove = event => {
    if (!drag || event.pointerId !== drag.id) return;
    changeView(event.clientX - drag.x, event.clientY - drag.y);
    drag.x = event.clientX; drag.y = event.clientY;
  };
  const pointerUp = event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (container.hasPointerCapture(event.pointerId)) container.releasePointerCapture(event.pointerId);
    drag = null; container.classList.remove('is-dragging');
  };
  const keyDown = event => {
    const directions = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] };
    if (!directions[event.key]) return;
    event.preventDefault(); changeView(...directions[event.key]);
  };
  container.addEventListener('pointerdown', pointerDown);
  container.addEventListener('pointermove', pointerMove);
  container.addEventListener('pointerup', pointerUp);
  container.addEventListener('pointercancel', pointerUp);
  container.addEventListener('lostpointercapture', pointerUp);
  container.addEventListener('keydown', keyDown);
  const contextLost = (event) => { event.preventDefault(); running = false; cancelAnimationFrame(frame); onError?.(new Error('WebGL context lost')); };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  update();
  theme();
  resize();
  return {
    play() { if (!disposed && !running) { running = true; previousTime = 0; frame = requestAnimationFrame(tick); } },
    pause() { running = false; previousTime = 0; cancelAnimationFrame(frame); },
    replay() { if (!disposed) { elapsed = 0; previousTime = 0; update(); render(); } },
    seek(seconds) { if (disposed) return; elapsed = Math.max(0, Number(seconds) || 0) % DURATION; previousTime = 0; update(); render(); },
    seekPhase(index, round = sampleHeroMotion(elapsed).round) {
      elapsed = (round === 2 ? ROUND_DURATION : 0) + [0.8, 2.4, 5.55, 9.5][THREE.MathUtils.clamp(Math.round(index), 0, 3)];
      previousTime = 0; update(); render();
    },
    resetView() { Object.assign(orbit, defaultOrbit); positionCamera(); render(); onViewChange?.(true); },
    getState() {
      const motion = sampleHeroMotion(elapsed), arm = solveHeroArm(endEffector);
      const xyz = p => ({ x: p.x, y: p.y, z: p.z });
      return { phase, round: motion.round, outcome: motion.outcome, duration: DURATION, elapsed: elapsed % DURATION, playing: running, gripping: held,
        cup: xyz(cup.position), endEffector: xyz(endEffector), elbow: xyz(arm.elbow),
        trajectoryProgress: motion.trajectoryProgress,
        plannedCup: motion.trajectoryProgress === null ? null : xyz(sampleCupPath(motion.trajectoryProgress, motion.round)),
        target: xyz(target), targetError: cup.position.distanceTo(target),
        verification: { checked: phase === 3, error: motion.verificationError, tolerance: 0.08, passed: motion.outcome === 'success' },
        obstacle: WORKCELL.obstacle, reachMargin: arm.reachMargin, camera: { ...orbit, isDefault: isDefaultView() },
        resultVisible: !resultBadge.hidden, resultAnchor: { left: resultBadge.style.left, top: resultBadge.style.top },
      };
    },
    snapshot() { return this.getState(); },
    dispose() {
      if (disposed) return;
      disposed = true;
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      container.removeEventListener('pointerdown', pointerDown);
      container.removeEventListener('pointermove', pointerMove);
      container.removeEventListener('pointerup', pointerUp);
      container.removeEventListener('pointercancel', pointerUp);
      container.removeEventListener('lostpointercapture', pointerUp);
      container.removeEventListener('keydown', keyDown);
      const geometries = new Set();
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); });
      for (const geometry of geometries) geometry.dispose();
      for (const material of [...materials, ...lineMaterials]) material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      resultBadge.remove();
    }
  };
}
