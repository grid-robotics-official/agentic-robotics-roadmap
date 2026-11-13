import * as THREE from './vendor/three.module.min.js';

const TARGET_X = -0.145;
const SVG_ORIGIN_X = -3.05;
const BELT_TOP = 0.14;
const TRACK_MIN = -2.4;
const TRACK_MAX = 3.2;
const TRACK_CENTER = (TRACK_MIN + TRACK_MAX) / 2;
const TRACK_LENGTH = TRACK_MAX - TRACK_MIN;
const CUP_HEIGHT = 0.488;
const LIFT_HEIGHT = 0.36;
const BELT_SPEED = 0.43;
const GRIPPER_REST = BELT_TOP + 1.00;
const DESCENT = 0.37;
const INITIAL = { cupX: 140, gripperX: 290.5, lift: 0, grab: 0, worldTime: 0, pausedWorld: true };
const v = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (value) => THREE.MathUtils.clamp(value, 0, 1);

/** One deterministic workcell; its owner supplies time and schedules every frame. */
export function createConveyorScene(container, { onError } = {}) {
  let state = { ...INITIAL }, disposed = false, failed = false, renderer, objectScale = 1;
  const fail = (error) => {
    if (failed || disposed) return;
    failed = true;
    onError?.(error);
  };
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    fail(error);
    return { render() {}, dispose() { disposed = true; }, getState: () => ({ ...state, error: true, disposed }) };
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-3.2, 3.2, 1, -1, 0.1, 30);
  // Zero camera azimuth keeps both worlds' conveyor motion exactly horizontal.
  camera.position.set(TRACK_CENTER, 4.65, 12);
  camera.lookAt(TRACK_CENTER, 0.6, 0);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none';
  container.appendChild(canvas);

  const materials = new Set();
  const material = (options) => {
    const result = new THREE.MeshStandardMaterial(options);
    materials.add(result);
    return result;
  };
  const ceramic = material({ color: 0xc5d8e4, roughness: 0.28, metalness: 0.05 });
  const white = material({ color: 0xe5e7e7, roughness: 0.36, metalness: 0.18 });
  const metal = material({ color: 0xbfc8d0, roughness: 0.4, metalness: 0.5 });
  const graphite = material({ color: 0x48525b, roughness: 0.52, metalness: 0.35 });
  const rubber = material({ color: 0x303940, roughness: 0.88, metalness: 0.02 });
  const table = material({ color: 0xe5e8e9, roughness: 0.8, metalness: 0.05 });
  const belt = material({ color: 0xa2a9ac, roughness: 0.94, metalness: 0.03 });

  function mesh(geometry, mat, position, parent = scene) {
    const object = new THREE.Mesh(geometry, mat);
    object.position.copy(position || v(0, 0, 0));
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(w, h, d, mat, position, parent = scene) {
    return mesh(new THREE.BoxGeometry(w, h, d), mat, position, parent);
  }
  function cylinder(radius, height, mat, position, parent = scene) {
    return mesh(new THREE.CylinderGeometry(radius, radius, height, 32), mat, position, parent);
  }
  function line(points, color, opacity, parent = scene) {
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    materials.add(mat);
    const object = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat);
    parent.add(object);
    return object;
  }
  function roundedPlate(width, depth, height, radius, mat, position) {
    const shape = new THREE.Shape();
    const x = -width / 2, z = -depth / 2;
    shape.moveTo(x + radius, z);
    shape.lineTo(x + width - radius, z);
    shape.quadraticCurveTo(x + width, z, x + width, z + radius);
    shape.lineTo(x + width, z + depth - radius);
    shape.quadraticCurveTo(x + width, z + depth, x + width - radius, z + depth);
    shape.lineTo(x + radius, z + depth);
    shape.quadraticCurveTo(x, z + depth, x, z + depth - radius);
    shape.lineTo(x, z + radius);
    shape.quadraticCurveTo(x, z, x + radius, z);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height, bevelEnabled: true, bevelSegments: 3, steps: 1,
      bevelSize: 0.012, bevelThickness: 0.012, curveSegments: 8,
    });
    geometry.rotateX(-Math.PI / 2);
    return mesh(geometry, mat, position);
  }

  // The neutral work surface and narrow rails leave the ceramic cup dominant.
  const workSurface = roundedPlate(5.94, 1.45, 0.08, 0.12, table, v(TRACK_CENTER, -0.16, 0));
  roundedPlate(TRACK_LENGTH, 1.05, 0.13, 0.12, graphite, v(TRACK_CENTER, -0.015, 0));
  box(TRACK_LENGTH - 0.18, 0.024, 0.96, belt, v(TRACK_CENTER, BELT_TOP - 0.012, 0));
  for (const z of [-0.565, 0.565]) {
    box(TRACK_LENGTH - 0.14, 0.075, 0.065, metal, v(TRACK_CENTER, 0.065, z));
    line([v(TRACK_MIN + 0.12, 0.105, z), v(TRACK_MAX - 0.12, 0.105, z)], 0xf1f4f6, 0.55);
  }
  for (const x of [TRACK_MIN + 0.22, TRACK_MAX - 0.22]) {
    for (const z of [-0.61, 0.61]) {
      cylinder(0.022, 0.006, graphite, v(x, -0.066, z));
    }
  }

  const rollers = [];
  for (const x of [TRACK_MIN + 0.12, TRACK_MAX - 0.12]) {
    const group = new THREE.Group();
    group.position.set(x, 0.035, 0);
    scene.add(group);
    const roller = cylinder(0.091, 1.025, metal, v(0, 0, 0), group);
    roller.rotation.x = Math.PI / 2;
    const cap = cylinder(0.065, 0.01, graphite, v(0, 0, 0.52), group);
    cap.rotation.x = Math.PI / 2;
    const axle = cylinder(0.022, 0.012, metal, v(0, 0, 0.528), group);
    axle.rotation.x = Math.PI / 2;
    line([v(-0.048, 0, 0.526), v(0.048, 0, 0.526)], 0xc0c9cf, 0.6, group);
    rollers.push(group);
  }

  // Fine moving seams make world time visible without high-contrast stripes.
  const seams = [], seamPitch = 0.2, seamMin = TRACK_MIN + 0.105, seamMax = TRACK_MAX - 0.105;
  for (let i = 0; i < Math.ceil((seamMax - seamMin) / seamPitch); i++) {
    const seam = line([v(0, BELT_TOP + 0.001, -0.472), v(0, BELT_TOP + 0.001, 0.472)], 0x606c74, 0.12);
    seams.push(seam);
  }

  const markY = BELT_TOP + 0.004;
  const windowMarks = [];
  for (const side of [-1, 1]) for (const front of [-1, 1]) {
    const x = TARGET_X + side * 0.35, z = front * 0.37;
    windowMarks.push(line([v(x - side * 0.12, markY, z), v(x, markY, z), v(x, markY, z - front * 0.12)], 0x397ef2, 0.58));
  }
  line([v(TARGET_X, markY, 0.465), v(TARGET_X, markY, 0.515)], 0x397ef2, 0.5);

  const cup = new THREE.Group();
  scene.add(cup);
  // The same closed, thick-walled ceramic profile as the opening workcell.
  const profile = [[0, 0], [0.176, 0], [0.19, 0.015], [0.211, 0.46], [0.208, 0.488], [0.181, 0.488], [0.178, 0.462], [0.161, 0.065], [0, 0.065]].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(new THREE.LatheGeometry(profile, 64), ceramic, v(0, 0, 0), cup);
  const handleAngle = Math.PI / 6;
  const handle = mesh(new THREE.TorusGeometry(0.126, 0.032, 12, 40), ceramic,
    v(Math.cos(handleAngle) * 0.225, 0.265, Math.sin(handleAngle) * 0.225), cup);
  handle.rotation.y = -handleAngle;
  const lip = mesh(new THREE.TorusGeometry(0.195, 0.012, 10, 64), ceramic, v(0, 0.481, 0), cup);
  lip.rotation.x = Math.PI / 2;

  const gripper = new THREE.Group();
  scene.add(gripper);
  cylinder(0.052, 0.24, metal, v(0, 0.19, 0), gripper);
  cylinder(0.078, 0.06, graphite, v(0, 0.075, 0), gripper);
  box(0.79, 0.095, 0.205, white, v(0, 0.004, 0), gripper);
  box(0.65, 0.038, 0.214, graphite, v(0, -0.056, 0), gripper);
  line([v(-0.33, 0.024, 0.105), v(0.33, 0.024, 0.105)], 0xffffff, 0.45, gripper);
  const fingers = [];
  for (const sign of [-1, 1]) {
    const finger = new THREE.Group();
    gripper.add(finger);
    box(0.065, 0.36, 0.13, metal, v(0, -0.22, 0), finger);
    const pad = box(0.028, 0.18, 0.13, rubber, v(-sign * 0.0416, -0.31, 0), finger);
    pad.rotation.z = -sign * Math.atan(0.021 / 0.445);
    fingers.push(finger);
  }

  const ambient = new THREE.HemisphereLight(0xf4f8ff, 0x8a9bac, 2.35);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfffaf2, 3.8);
  key.position.set(-3.5, 7, 4);
  key.target.position.set(TRACK_CENTER, 0, 0);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 3;
  key.shadow.camera.bottom = -3;
  key.shadow.normalBias = 0.015;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 3;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xa8cbff, 1.8);
  rim.position.set(4, 3, -4);
  scene.add(rim);
  const shadowMat = new THREE.ShadowMaterial({ color: 0x30465d, transparent: true, opacity: 0.12 });
  materials.add(shadowMat);
  const shadow = mesh(new THREE.PlaneGeometry(8.5, 3.5), shadowMat, v(TRACK_CENTER, -0.19, 0));
  shadow.rotation.x = -Math.PI / 2;
  shadow.castShadow = false;

  function draw() {
    if (disposed || failed) return;
    try { renderer.render(scene, camera); } catch (error) { fail(error); }
  }
  function update() {
    const cupX = SVG_ORIGIN_X + state.cupX * 0.01;
    cup.position.set(cupX, BELT_TOP + (state.pausedWorld ? state.lift * LIFT_HEIGHT * objectScale : 0), 0);
    gripper.position.set(SVG_ORIGIN_X + state.gripperX * 0.01, BELT_TOP + (GRIPPER_REST - BELT_TOP - state.grab * DESCENT + state.lift * LIFT_HEIGHT) * objectScale, 0);
    // Descend with clear fingers, then close against the outer ceramic wall.
    const closure = clamp((state.grab - 0.62) / 0.38);
    const opening = THREE.MathUtils.lerp(0.345, 0.2605, closure);
    fingers[0].position.x = -opening;
    fingers[1].position.x = opening;
    const beltOffset = ((state.worldTime * BELT_SPEED) % seamPitch + seamPitch) % seamPitch;
    for (let i = 0; i < seams.length; i++) {
      const x = seamMin + i * seamPitch + beltOffset;
      seams[i].position.x = x;
      seams[i].visible = x <= seamMax;
    }
    for (const roller of rollers) roller.rotation.z = -state.worldTime * BELT_SPEED / 0.091;
  }
  function render(next = {}) {
    if (disposed || failed) return;
    for (const key of ['cupX', 'gripperX', 'lift', 'grab', 'worldTime']) {
      if (Number.isFinite(next[key])) state[key] = next[key];
    }
    state.lift = clamp(state.lift);
    state.grab = clamp(state.grab);
    if (typeof next.pausedWorld === 'boolean') state.pausedWorld = next.pausedWorld;
    update();
    draw();
  }
  function resize() {
    if (disposed || failed) return;
    const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    // Keep the cup legible on a narrow screen without cropping its final location.
    objectScale = 1 + clamp((600 - width) / 320) * 0.25;
    cup.scale.setScalar(objectScale);
    gripper.scale.setScalar(objectScale);
    update();
    const viewHeight = Math.max(1.86, 6.3 / aspect);
    camera.left = -viewHeight * aspect / 2;
    camera.right = viewHeight * aspect / 2;
    // Keep the raised gripper and the full conveyor inside the same camera view.
    const verticalOffset = -0.08 + (objectScale - 1) * 0.4;
    camera.top = viewHeight / 2 + verticalOffset;
    camera.bottom = -viewHeight / 2 + verticalOffset;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    const nativeRatio = window.devicePixelRatio || 1;
    const targetRatio = matchMedia('(pointer: coarse)').matches ? nativeRatio : Math.max(2, nativeRatio);
    const ratio = Math.min(targetRatio, 2, Math.sqrt(800000 / (width * height)));
    if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    const marker = v(TARGET_X, BELT_TOP, 0).project(camera);
    container.style.setProperty('--grasp-window-x', `${(marker.x * 0.5 + 0.5) * 100}%`);
    draw();
  }
  function theme() {
    if (disposed || failed) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    table.color.setHex(dark ? 0x3b4853 : 0xe5e8e9);
    belt.color.setHex(dark ? 0x65737e : 0xa2a9ac);
    metal.color.setHex(dark ? 0xa5b2bc : 0xbfc8d0);
    white.color.setHex(dark ? 0xd1dae1 : 0xe5e7e7);
    ceramic.color.setHex(dark ? 0xb7cddc : 0xc5d8e4);
    graphite.color.setHex(dark ? 0x2b3741 : 0x48525b);
    ambient.intensity = dark ? 1.75 : 2.35;
    key.intensity = dark ? 3.2 : 3.8;
    shadowMat.opacity = dark ? 0.2 : 0.12;
    for (const mark of windowMarks) mark.material.opacity = dark ? 0.72 : 0.58;
    draw();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const themeObserver = new MutationObserver(theme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.addEventListener('resize', resize);
  const contextLost = (event) => { event.preventDefault(); fail(new Error('Conveyor WebGL context lost')); };
  canvas.addEventListener('webglcontextlost', contextLost);
  update();
  resize();
  theme();

  function screenBounds(object) {
    const bounds = new THREE.Box3().setFromObject(object);
    const points = [];
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      points.push(v(x, y, z).project(camera));
    }
    return { left: Math.min(...points.map(p => p.x)) * 0.5 + 0.5, right: Math.max(...points.map(p => p.x)) * 0.5 + 0.5,
      top: 0.5 - Math.max(...points.map(p => p.y)) * 0.5, bottom: 0.5 - Math.min(...points.map(p => p.y)) * 0.5 };
  }
  return {
    render,
    getState() {
      const cupCenter = cup.position.clone().add(v(0, CUP_HEIGHT * objectScale / 2, 0)).project(camera);
      return {
        ...state, error: failed, disposed,
        cupPosition: cup.position.toArray(), gripperPosition: gripper.position.toArray(),
        cupBounds: screenBounds(cup), gripperBounds: screenBounds(gripper), trackBounds: screenBounds(workSurface),
        cupWorldMaxX: new THREE.Box3().setFromObject(cup).max.x, trackMax: TRACK_MAX,
        jawInnerX: (fingers[1].position.x - 0.0556) * objectScale,
        objectScale,
        beltSpeed: BELT_SPEED,
        cupScreen: { x: cupCenter.x * 0.5 + 0.5, y: 0.5 - cupCenter.y * 0.5 },
        pixelRatio: renderer.getPixelRatio(), drawCalls: renderer.info.render.calls,
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', contextLost);
      const geometries = new Set();
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); });
      for (const geometry of geometries) geometry.dispose();
      for (const mat of materials) mat.dispose();
      key.shadow.map?.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
