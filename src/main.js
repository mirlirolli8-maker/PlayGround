import * as THREE from 'three';
import './style.css';

const $ = (selector) => document.querySelector(selector);
const sceneRoot = $('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#d4b37b');
scene.fog = new THREE.FogExp2('#cbb58e', 0.009);
const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
sceneRoot.appendChild(renderer.domElement);

const clamp = THREE.MathUtils.clamp;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const mat = (color, roughness = 0.85, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const sandMat = mat('#cfb176');
const duneMat = mat('#d4bb87');
const stoneMat = mat('#77796b');
const leafMat = mat('#657b55');
const darkLeafMat = mat('#455f4b');
const woodMat = mat('#72553c');
const playerMats = {
  skin: mat('#c99368'), cloth: mat('#d4a756'), dark: mat('#354943'), trim: mat('#f0d093'), leather: mat('#67503b'), metal: mat('#b8b8a4', .3, { metalness: .48 }),
};
const enemyMats = { skin: mat('#826344'), cloth: mat('#754638'), dark: mat('#43332d'), metal: mat('#a78d65', .5, { metalness: .3 }) };

scene.add(new THREE.HemisphereLight('#fff0d3', '#5a5945', 2.15));
const sun = new THREE.DirectionalLight('#fff1d2', 3.2);
sun.position.set(-18, 30, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -24; sun.shadow.camera.right = 24; sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
sun.shadow.bias = -0.0004;
scene.add(sun);
const fill = new THREE.DirectionalLight('#bfd0cb', 1.05); fill.position.set(12, 9, -17); scene.add(fill);

// A wide, sculpted island rim lets the player roam without an empty horizon.
const ground = new THREE.Mesh(new THREE.CircleGeometry(92, 96), sandMat);
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.13; ground.receiveShadow = true; scene.add(ground);
const beach = new THREE.Mesh(new THREE.CircleGeometry(46, 80), duneMat);
beach.rotation.x = -Math.PI / 2; beach.position.y = -0.1; beach.receiveShadow = true; scene.add(beach);
const water = new THREE.Mesh(new THREE.CircleGeometry(125, 96), new THREE.MeshStandardMaterial({ color: '#668d88', roughness: .32, metalness: .08 }));
water.rotation.x = -Math.PI / 2; water.position.y = -0.5; scene.add(water);
const shore = new THREE.Mesh(new THREE.RingGeometry(45.5, 48, 96), new THREE.MeshStandardMaterial({ color: '#e1c88e', roughness: 1, side: THREE.DoubleSide }));
shore.rotation.x = -Math.PI / 2; shore.position.y = -0.06; scene.add(shore);

function addMesh(parent, geometry, material, position, scale, cast = true) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position); if (scale) mesh.scale.copy(scale);
  mesh.castShadow = cast; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function addRock(x, z, size = 1, color = '#77796b') {
  const rock = addMesh(scene, new THREE.DodecahedronGeometry(size, 0), mat(color), v3(x, size * .42, z), v3(1.15, .78, .9));
  rock.rotation.set(.05, Math.random() * Math.PI, .12); return rock;
}
function addPalm(x, z, height = 5, yaw = 0) {
  const group = new THREE.Group(); group.position.set(x, 0, z); group.rotation.y = yaw; scene.add(group);
  const trunk = addMesh(group, new THREE.CylinderGeometry(.13, .27, height, 7), mat('#806043'), v3(0, height / 2, 0));
  trunk.rotation.z = -.1;
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    const leaf = addMesh(group, new THREE.ConeGeometry(.47, 3.25, 5), i % 2 ? leafMat : darkLeafMat, v3(Math.sin(angle) * 1.08, height + .3 - (i % 3) * .14, Math.cos(angle) * 1.08));
    leaf.rotation.z = Math.cos(angle) * .75; leaf.rotation.x = Math.sin(angle) * .7; leaf.rotation.y = angle;
  }
  return group;
}
function addShrub(x, z, scale = 1) {
  for (let i = 0; i < 3; i++) {
    const leaf = addMesh(scene, new THREE.IcosahedronGeometry(.42 * scale, 0), i % 2 ? darkLeafMat : leafMat,
      v3(x + (Math.random() - .5) * .65 * scale, .28 * scale, z + (Math.random() - .5) * .55 * scale), v3(1.1, .8, 1));
    leaf.rotation.y = Math.random() * Math.PI;
  }
}
function addBanner(x, z, color = '#c8794c') {
  const pole = addMesh(scene, new THREE.CylinderGeometry(.035, .045, 2.5, 6), woodMat, v3(x, 1.25, z));
  pole.castShadow = false;
  const flag = addMesh(scene, new THREE.PlaneGeometry(.85, .45), mat(color, .9, { side: THREE.DoubleSide }), v3(x + .39, 2.15, z));
  flag.rotation.y = -.22;
}

for (let i = 0; i < 19; i++) {
  const a = i * 2.399, r = 13 + Math.random() * 26;
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.hypot(x, z) < 9) continue;
  addPalm(x, z, 4.2 + Math.random() * 2.5, a);
}
for (let i = 0; i < 26; i++) {
  const a = Math.random() * Math.PI * 2, r = 8 + Math.random() * 34;
  const x = Math.cos(a) * r, z = Math.sin(a) * r;
  if (Math.hypot(x, z) < 7) continue;
  if (i % 3 === 0) addRock(x, z, .45 + Math.random() * .85, i % 2 ? '#7b796a' : '#9d8c68');
  else addShrub(x, z, .7 + Math.random() * .75);
}
// Soft dunes and distant rocky ridges.
for (let i = 0; i < 12; i++) {
  const angle = i * Math.PI / 6, r = 38 + (i % 3) * 3;
  const mound = addMesh(scene, new THREE.SphereGeometry(1, 14, 9), i % 2 ? duneMat : sandMat,
    v3(Math.cos(angle) * r, -.05, Math.sin(angle) * r), v3(5 + (i % 3), 1.15, 3.4));
  mound.rotation.y = -angle;
}
// Little shoreline props make the beach legible even when the camera is high.
for (let i = 0; i < 15; i++) {
  const a = (i / 15) * Math.PI * 2;
  const x = Math.cos(a) * (31 + (i % 3) * 1.3), z = Math.sin(a) * (31 + (i % 3) * 1.3);
  if (i % 3 === 0) addPalm(x, z, 4.8 + (i % 2), a);
}

// Vendor stand and an oversized, floating sand-fruit sign.
const stall = new THREE.Group(); stall.position.set(6, 0, -4); stall.rotation.y = -.4; scene.add(stall);
addMesh(stall, new THREE.BoxGeometry(3.2, .22, 1.6), woodMat, v3(0, 1.05, 0));
for (const x of [-1.35, 1.35]) for (const z of [-.6, .6]) addMesh(stall, new THREE.CylinderGeometry(.07, .08, 2.1, 6), woodMat, v3(x, 1.02, z));
const canopy = addMesh(stall, new THREE.BoxGeometry(3.45, .16, 1.9), mat('#bd7950'), v3(0, 2.1, 0));
canopy.rotation.z = .025;
for (let i = 0; i < 5; i++) addMesh(stall, new THREE.BoxGeometry(.4, .18, 1.88), mat(i % 2 ? '#e5c27c' : '#b56e47'), v3(-1.35 + i * .675, 2.08, 0));
const fruitProp = new THREE.Group(); fruitProp.position.set(6, 2.9, -4); scene.add(fruitProp);
addMesh(fruitProp, new THREE.SphereGeometry(.38, 16, 12), mat('#e0a947', .36), v3(0, .35, 0), v3(.9, 1.2, .9));
addMesh(fruitProp, new THREE.ConeGeometry(.15, .29, 6), leafMat, v3(.04, .82, 0), v3(1, 1, .55)).rotation.z = -.35;
const fruitAura = new THREE.PointLight('#ffc76b', 2.4, 7); fruitAura.position.set(6, 3.7, -4); scene.add(fruitAura);
const stallLabel = new THREE.Group(); stallLabel.position.set(6, 3.55, -4); scene.add(stallLabel);
// Handmade floating glyph, clearly visible above the canopy.
const signRing = new THREE.Mesh(new THREE.TorusGeometry(.45, .035, 8, 24), mat('#f3d28e', .4, { emissive: '#8a581e', emissiveIntensity: .35 }));
signRing.position.y = .3; stallLabel.add(signRing);

function makeCharacter({ enemy = false } = {}) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const m = enemy ? enemyMats : playerMats;
  const parts = {};
  parts.torso = addMesh(body, new THREE.CapsuleGeometry(.32, .62, 4, 8), m.cloth, v3(0, 1.2, 0), v3(1, .82, .72));
  addMesh(body, new THREE.BoxGeometry(.57, .17, .37), m.trim, v3(0, .96, .01));
  parts.head = addMesh(body, new THREE.SphereGeometry(.25, 14, 12), m.skin, v3(0, 1.9, .02), v3(.92, 1.05, .86));
  const hair = addMesh(body, new THREE.SphereGeometry(.265, 12, 9), enemy ? m.dark : m.dark, v3(0, 2.02, -.035), v3(1.04, .61, .97));
  hair.scale.y = .58;
  // Hood/scarf and small face accents.
  addMesh(body, new THREE.BoxGeometry(.43, .14, .16), enemy ? m.dark : m.trim, v3(0, 1.75, .19));
  parts.leftArm = new THREE.Group(); parts.leftArm.position.set(-.39, 1.47, 0); body.add(parts.leftArm);
  addMesh(parts.leftArm, new THREE.CapsuleGeometry(.105, .42, 3, 6), m.cloth, v3(0, -.26, 0), v3(1, 1, 1)).rotation.z = -.1;
  addMesh(parts.leftArm, new THREE.SphereGeometry(.115, 8, 6), m.skin, v3(0, -.52, .03));
  parts.rightArm = new THREE.Group(); parts.rightArm.position.set(.39, 1.47, 0); body.add(parts.rightArm);
  addMesh(parts.rightArm, new THREE.CapsuleGeometry(.105, .42, 3, 6), m.cloth, v3(0, -.25, 0)).rotation.z = .1;
  addMesh(parts.rightArm, new THREE.SphereGeometry(.115, 8, 6), m.skin, v3(0, -.51, .03));
  parts.leftLeg = new THREE.Group(); parts.leftLeg.position.set(-.17, .82, 0); body.add(parts.leftLeg);
  addMesh(parts.leftLeg, new THREE.CapsuleGeometry(.13, .42, 3, 6), m.dark, v3(0, -.28, 0));
  addMesh(parts.leftLeg, new THREE.BoxGeometry(.25, .13, .38), m.leather || m.dark, v3(0, -.58, .08));
  parts.rightLeg = new THREE.Group(); parts.rightLeg.position.set(.17, .82, 0); body.add(parts.rightLeg);
  addMesh(parts.rightLeg, new THREE.CapsuleGeometry(.13, .42, 3, 6), m.dark, v3(0, -.28, 0));
  addMesh(parts.rightLeg, new THREE.BoxGeometry(.25, .13, .38), m.leather || m.dark, v3(0, -.58, .08));
  // Stylized sword in the right hand.
  const sword = new THREE.Group(); sword.position.set(0, -.56, .05); parts.rightArm.add(sword);
  addMesh(sword, new THREE.BoxGeometry(.095, .72, .07), enemy ? m.metal : playerMats.metal, v3(0, -.39, .03));
  addMesh(sword, new THREE.BoxGeometry(.28, .075, .12), enemy ? m.metal : playerMats.trim, v3(0, -.08, .03));
  addMesh(sword, new THREE.CylinderGeometry(.045, .05, .18, 6), woodMat, v3(0, .045, .03));
  sword.rotation.x = -.35; sword.rotation.z = -.12;
  parts.sword = sword;
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.48, 20), new THREE.MeshBasicMaterial({ color: '#32352d', transparent: true, opacity: .25, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = .015; root.add(shadow);
  return { root, body, parts, shadow };
}

const player = makeCharacter();
player.root.position.set(0, 0, 2);
scene.add(player.root);
const playerGlow = new THREE.PointLight('#efbd70', .7, 5); playerGlow.position.set(0, 2.5, 0); player.root.add(playerGlow);
const enemies = [];
const spawnPositions = [[-4, -5], [2, -10], [10, 2], [-10, 5], [13, -7]];
function makeEnemy(index, position) {
  const character = makeCharacter({ enemy: true });
  character.root.position.set(position[0], 0, position[1]);
  character.root.rotation.y = Math.random() * Math.PI * 2;
  scene.add(character.root);
  const hpGroup = new THREE.Group(); hpGroup.position.set(0, 2.55, 0); character.root.add(hpGroup);
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(.9, .09), new THREE.MeshBasicMaterial({ color: '#342f2b', side: THREE.DoubleSide })); hpGroup.add(bg);
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(.86, .055), new THREE.MeshBasicMaterial({ color: '#cf7656', side: THREE.DoubleSide })); bar.position.z = .008; hpGroup.add(bar);
  const marker = new THREE.Mesh(new THREE.ConeGeometry(.1, .16, 4), new THREE.MeshBasicMaterial({ color: '#e1b273' }));
  marker.position.set(0, 2.98, 0); character.root.add(marker);
  const enemy = { ...character, index, hp: 60, maxHp: 60, alive: true, attackAt: 0, hitAt: 0, wanderAngle: Math.random() * 6, bar, hpGroup, marker, attackPhase: 0 };
  enemies.push(enemy);
  return enemy;
}
spawnPositions.forEach((position, index) => makeEnemy(index, position));

const decor = [];
for (let i = 0; i < 7; i++) {
  const x = -17 + i * 5.7;
  decor.push(addBanner(x, -19 + (i % 2) * 2, i % 2 ? '#bd7950' : '#d4b773'));
}

const sandRings = [];
function makeSandBurst(center, radius = 4.5, color = '#e6bc73') {
  const group = new THREE.Group(); group.position.copy(center); group.position.y = .09; scene.add(group);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.65, .88, 52), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .93, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; group.add(ring);
  const inner = new THREE.Mesh(new THREE.RingGeometry(.18, .28, 40), new THREE.MeshBasicMaterial({ color: '#ffdf9a', transparent: true, opacity: .75, side: THREE.DoubleSide, depthWrite: false }));
  inner.rotation.x = -Math.PI / 2; inner.position.y = .02; group.add(inner);
  const dust = new THREE.Group(); group.add(dust);
  for (let i = 0; i < 20; i++) {
    const angle = i * Math.PI * 2 / 20;
    const mote = new THREE.Mesh(new THREE.ConeGeometry(.09 + Math.random() * .07, .42 + Math.random() * .65, 5), new THREE.MeshBasicMaterial({ color: i % 3 ? '#d9a85d' : '#f7d99a', transparent: true, opacity: .83 }));
    mote.position.set(Math.sin(angle) * .4, .2, Math.cos(angle) * .4); mote.rotation.z = -.25; mote.userData.angle = angle; dust.add(mote);
  }
  const light = new THREE.PointLight('#f0bb68', 3.2, radius * 2); light.position.y = 1; group.add(light);
  const effect = { group, ring, inner, dust, light, age: 0, duration: .8, radius };
  sandRings.push(effect); return effect;
}

const defaultState = { level: 1, xp: 0, coins: 0, health: 100, kills: 0, fruit: false, questDone: false, potion: 1 };
let state = { ...defaultState };
try { const stored = JSON.parse(localStorage.getItem('sandbound-save') || 'null'); if (stored) state = { ...defaultState, ...stored }; } catch { /* use fresh save */ }
state.level = Math.max(1, Number(state.level) || 1);
state.xp = Math.max(0, Number(state.xp) || 0);
state.coins = Math.max(0, Number(state.coins) || 0);
state.health = clamp(Number(state.health) || 100, 1, 100);
state.kills = clamp(Number(state.kills) || 0, 0, 5);
state.fruit = Boolean(state.fruit);
state.questDone = Boolean(state.questDone);
state.potion = Math.max(0, Number(state.potion) || 0);
let lastSkill = -100, lastAttack = -100, playerAttacking = 0, hurtFlash = 0, audioCtx = null;
const keys = new Set();
const joy = { x: 0, y: 0, active: false, id: null };
const clock = new THREE.Clock();
let worldTime = 0, toastTimer = 0, levelTimer = 0, cameraTarget = v3(0, 2.7, 0), cameraDesired = v3(0, 5, 9);
const shopPosition = v3(6, 0, -4);

function persist() { try { localStorage.setItem('sandbound-save', JSON.stringify(state)); } catch { /* storage may be unavailable */ } }
function showToast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.add('show'); toastTimer = 2.4;
}
function playTone(frequency = 220, duration = .08, type = 'triangle', volume = .035) {
  try {
    audioCtx ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator(), gain = audioCtx.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + duration);
    oscillator.connect(gain); gain.connect(audioCtx.destination); oscillator.start(); oscillator.stop(audioCtx.currentTime + duration);
  } catch { /* audio is optional */ }
}
function updateUI() {
  const need = 100 + (state.level - 1) * 40;
  $('#level').textContent = state.level; $('#level-badge').textContent = state.level;
  $('#xp').textContent = state.xp; $('#xp-needed').textContent = need;
  $('#xp-fill').style.width = `${clamp(state.xp / need * 100, 0, 100)}%`;
  $('#health').textContent = Math.ceil(state.health); $('#health-fill').style.width = `${state.health}%`;
  $('#coins').textContent = state.coins.toLocaleString('ru-RU'); $('#shop-coins').textContent = state.coins.toLocaleString('ru-RU');
  $('#quest-count').textContent = `${Math.min(state.kills, 5)} / 5`;
  $('#quest-fill').style.width = `${Math.min(state.kills, 5) / 5 * 100}%`;
  $('#enemy-count').textContent = `${enemies.filter((enemy) => enemy.alive).length} ВРАГОВ`;
  $('#slot-lock').style.display = state.fruit ? 'none' : 'block';
  $('#skill-slot').classList.toggle('active-slot', state.fruit);
  $('#mobile-skill').style.opacity = state.fruit ? '1' : '.62';
  $('#buy-fruit').disabled = state.fruit || state.coins < 10000;
  $('#buy-fruit').querySelector('span').textContent = state.fruit ? 'УЖЕ КУПЛЕНО' : state.coins >= 10000 ? 'КУПИТЬ ПЛОД' : 'НЕ ХВАТАЕТ МОНЕТ';
  $('#quest-live').textContent = state.questDone ? 'ВЫПОЛНЕНО' : 'АКТИВЕН';
}
// Update quest badge text without introducing another layout-specific selector.
$('#quest-live').textContent = state.questDone ? 'ВЫПОЛНЕНО' : 'АКТИВЕН';
function grantXp(amount) {
  state.xp += amount;
  let need = 100 + (state.level - 1) * 40;
  while (state.xp >= need) {
    state.xp -= need; state.level += 1; state.health = 100;
    $('#new-level').textContent = state.level; $('#level-up-overlay').classList.add('show'); levelTimer = 2.2;
    playTone(580, .17, 'sine', .05); setTimeout(() => playTone(790, .22, 'sine', .04), 130);
    need = 100 + (state.level - 1) * 40;
  }
  updateUI(); persist();
}
function updateHealth(value) {
  state.health = clamp(value, 0, 100); updateUI();
  if (state.health <= 0) {
    state.health = 100; player.root.position.set(0, 0, 2); player.root.rotation.y = 0;
    showToast('Ты вернулся в лагерь. Здоровье восстановлено.');
    makeSandBurst(player.root.position, 2.3, '#d8a277'); persist();
  }
  persist();
}
function enemyDamage(enemy, damage, knockback = .65) {
  if (!enemy.alive) return;
  enemy.hp = Math.max(0, enemy.hp - damage);
  enemy.hitAt = worldTime; enemy.bar.scale.x = Math.max(.001, enemy.hp / enemy.maxHp); enemy.bar.position.x = -.43 * (1 - enemy.hp / enemy.maxHp);
  enemy.root.position.x += Math.sin(enemy.root.rotation.y) * knockback;
  enemy.root.position.z += Math.cos(enemy.root.rotation.y) * knockback;
  enemy.root.traverse((child) => { if (child.isMesh && child.material.emissive) { child.material.emissive.set('#6b2317'); child.material.emissiveIntensity = .35; } });
  setTimeout(() => enemy.root.traverse((child) => { if (child.isMesh && child.material.emissive) child.material.emissiveIntensity = 0; }), 90);
  playTone(damage >= 80 ? 130 : 185, .09, 'sawtooth', .022);
  if (enemy.hp === 0) defeatEnemy(enemy);
}
function defeatEnemy(enemy) {
  enemy.alive = false; enemy.root.visible = false;
  state.kills = Math.min(5, state.kills + (state.questDone ? 0 : 1));
  state.coins += 180; grantXp(35);
  const reward = $('#floating-reward'); reward.textContent = '+180 ◉   +35 XP'; reward.classList.remove('show'); void reward.offsetWidth; reward.classList.add('show');
  showToast('Разбойник побеждён! +180 монет · +35 XP');
  if (state.kills >= 5 && !state.questDone) {
    state.questDone = true; state.coins += 10000; grantXp(120);
    setTimeout(() => showToast('Квест выполнен! +10 000 монет · +120 XP'), 350);
  }
  persist(); updateUI();
  // Bring defeated foes back after the first quest, so the island remains playable.
  setTimeout(() => {
    enemy.hp = enemy.maxHp; enemy.alive = true; enemy.root.visible = true; enemy.bar.scale.x = 1; enemy.bar.position.x = 0;
    const angle = Math.random() * Math.PI * 2, radius = 10 + Math.random() * 10;
    enemy.root.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    updateUI();
  }, 11000);
}
function attack() {
  if (worldTime - lastAttack < .48) return;
  lastAttack = worldTime; playerAttacking = .42;
  player.parts.rightArm.rotation.x = -1.75; player.parts.rightArm.rotation.z = -.25;
  playTone(310, .07, 'triangle', .025);
  const forward = v3(Math.sin(player.root.rotation.y), 0, Math.cos(player.root.rotation.y));
  const target = enemies.filter((enemy) => enemy.alive)
    .map((enemy) => ({ enemy, delta: v3().subVectors(enemy.root.position, player.root.position), distance: enemy.root.position.distanceTo(player.root.position) }))
    .filter(({ delta, distance }) => distance < 3.35 && delta.normalize().dot(forward) > -.15)
    .sort((a, b) => a.distance - b.distance)[0];
  if (target) enemyDamage(target.enemy, 34 + Math.max(0, state.level - 1) * 4, .8);
  else showToast('Подойди ближе к разбойнику');
}
function sandSkill() {
  if (!state.fruit) { showToast('Сначала купи Плод песка у торговца'); openShop(); return; }
  if (worldTime - lastSkill < 8) { showToast(`Сила песка перезаряжается · ${Math.ceil(8 - (worldTime - lastSkill))} сек`); return; }
  lastSkill = worldTime; makeSandBurst(player.root.position, 8.5);
  playTone(115, .45, 'sawtooth', .055); setTimeout(() => playTone(74, .5, 'triangle', .035), 100);
  let hit = 0;
  for (const enemy of enemies) if (enemy.alive && enemy.root.position.distanceTo(player.root.position) <= 8.5) { enemyDamage(enemy, 85 + (state.level - 1) * 5, .25); hit++; }
  showToast(hit ? `Песчаный вихрь! Поражено врагов: ${hit}` : 'Песчаный вихрь! Враги не попали в радиус');
}
function openShop() {
  $('#shop-backdrop').classList.add('open'); $('#shop-backdrop').setAttribute('aria-hidden', 'false');
  updateUI();
}
function closeShop() { $('#shop-backdrop').classList.remove('open'); $('#shop-backdrop').setAttribute('aria-hidden', 'true'); }
function buyFruit() {
  if (state.fruit) { showToast('Плод песка уже в твоём инвентаре'); return; }
  if (state.coins < 10000) { showToast(`Нужно ещё ${(10000 - state.coins).toLocaleString('ru-RU')} монет. Выполни квест!`); return; }
  state.coins -= 10000; state.fruit = true; persist(); updateUI(); closeShop();
  showToast('Плод песка куплен! Нажми Q или ✦, чтобы призвать вихрь');
  makeSandBurst(player.root.position, 3.5, '#f4cc7c'); playTone(500, .22, 'sine', .04);
}

$('#open-shop').addEventListener('click', openShop);
$('#shop-sign').addEventListener('click', openShop);
$('#close-shop').addEventListener('click', closeShop);
$('#shop-backdrop').addEventListener('click', (event) => { if (event.target === $('#shop-backdrop')) closeShop(); });
$('#buy-fruit').addEventListener('click', buyFruit);
$('#attack-button').addEventListener('click', attack);
$('#mobile-attack').addEventListener('pointerdown', (event) => { event.preventDefault(); attack(); });
$('#skill-slot').addEventListener('click', sandSkill);
$('#mobile-skill').addEventListener('pointerdown', (event) => { event.preventDefault(); sandSkill(); });
$('#potion-slot').addEventListener('click', () => {
  if (state.health >= 100) return showToast('Здоровье уже полное');
  if (state.potion <= 0) return showToast('Зелья закончились');
  state.potion--; updateHealth(Math.min(100, state.health + 45)); showToast('Зелье использовано · +45 здоровья');
});
$('.sound-toggle').addEventListener('click', (event) => {
  event.currentTarget.classList.toggle('muted');
  event.currentTarget.textContent = event.currentTarget.classList.contains('muted') ? '♪' : '♫';
  event.currentTarget.setAttribute('aria-label', event.currentTarget.classList.contains('muted') ? 'Звук выключен' : 'Звук включен');
  if (audioCtx) audioCtx.suspend();
});
window.addEventListener('keydown', (event) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
  if (event.repeat && ['Space', 'KeyQ', 'KeyE'].includes(event.code)) return;
  keys.add(event.code);
  if (event.code === 'Space' || event.code === 'Enter') attack();
  if (event.code === 'KeyQ') sandSkill();
  if (event.code === 'KeyE') {
    if ($('#shop-backdrop').classList.contains('open')) closeShop();
    else if (player.root.position.distanceTo(shopPosition) < 5.2) openShop();
  }
  if (event.code === 'Digit2') $('#potion-slot').click();
  if (event.code === 'Escape') closeShop();
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

const joystick = $('#joystick'), joystickKnob = $('#joystick-knob');
function updateJoystick(event) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX, dy = event.clientY - centerY;
  const max = rect.width * .31, length = Math.hypot(dx, dy), scale = length > max ? max / length : 1;
  joy.x = dx * scale / max; joy.y = dy * scale / max;
  joystickKnob.style.transform = `translate(calc(-50% + ${dx * scale}px), calc(-50% + ${dy * scale}px))`;
}
joystick.addEventListener('pointerdown', (event) => { event.preventDefault(); joy.active = true; joy.id = event.pointerId; joystick.setPointerCapture(event.pointerId); updateJoystick(event); });
joystick.addEventListener('pointermove', (event) => { if (joy.active && event.pointerId === joy.id) updateJoystick(event); });
const releaseJoystick = (event) => { if (joy.active && (!event || event.pointerId === joy.id)) { joy.active = false; joy.x = 0; joy.y = 0; joystickKnob.style.transform = 'translate(-50%,-50%)'; } };
joystick.addEventListener('pointerup', releaseJoystick); joystick.addEventListener('pointercancel', releaseJoystick);

let dragLook = false, previousPointer = null, cameraYaw = 0, cameraDistance = 8.7;
renderer.domElement.addEventListener('pointerdown', (event) => { if (event.pointerType === 'mouse' && event.button === 2) { dragLook = true; previousPointer = [event.clientX, event.clientY]; renderer.domElement.setPointerCapture(event.pointerId); } });
renderer.domElement.addEventListener('pointermove', (event) => { if (dragLook && previousPointer) { cameraYaw -= (event.clientX - previousPointer[0]) * .005; previousPointer = [event.clientX, event.clientY]; } });
renderer.domElement.addEventListener('pointerup', () => { dragLook = false; previousPointer = null; });
renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());
renderer.domElement.addEventListener('wheel', (event) => { cameraDistance = clamp(cameraDistance + event.deltaY * .006, 6, 13); }, { passive: true });

const tempV = new THREE.Vector3();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04); worldTime += dt;
  const moveX = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) + joy.x;
  const moveZ = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) + joy.y;
  const input = v3(moveX, 0, moveZ); if (input.lengthSq() > 1) input.normalize();
  const cameraForward = v3(Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
  const cameraRight = v3(Math.cos(cameraYaw), 0, Math.sin(cameraYaw));
  const moveDir = cameraRight.multiplyScalar(input.x).add(cameraForward.multiplyScalar(-input.z));
  const isMoving = moveDir.lengthSq() > .001;
  if (isMoving) {
    moveDir.normalize(); player.root.position.addScaledVector(moveDir, dt * 4.7);
    player.root.rotation.y = Math.atan2(moveDir.x, moveDir.z);
  }
  const distFromCenter = Math.hypot(player.root.position.x, player.root.position.z);
  if (distFromCenter > 39) { player.root.position.x *= 39 / distFromCenter; player.root.position.z *= 39 / distFromCenter; }
  const walkCycle = worldTime * (isMoving ? 10 : 2);
  player.parts.leftLeg.rotation.x = isMoving ? Math.sin(walkCycle) * .62 : Math.sin(walkCycle) * .025;
  player.parts.rightLeg.rotation.x = isMoving ? -Math.sin(walkCycle) * .62 : -Math.sin(walkCycle) * .025;
  if (playerAttacking > 0) { playerAttacking -= dt; player.parts.rightArm.rotation.x = -1.75 + (playerAttacking < .18 ? 1.15 * (1 - playerAttacking / .18) : 0); }
  else { player.parts.rightArm.rotation.x = THREE.MathUtils.damp(player.parts.rightArm.rotation.x, 0, 12, dt); player.parts.rightArm.rotation.z = THREE.MathUtils.damp(player.parts.rightArm.rotation.z, 0, 12, dt); }
  player.body.position.y = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * .045 : Math.sin(worldTime * 2.2) * .018;

  let nearestEnemy = null, nearestDistance = Infinity;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const delta = v3().subVectors(player.root.position, enemy.root.position); delta.y = 0;
    const distance = delta.length();
    if (distance < nearestDistance) { nearestDistance = distance; nearestEnemy = enemy; }
    enemy.hpGroup.quaternion.copy(camera.quaternion);
    enemy.marker.position.y = 2.98 + Math.sin(worldTime * 3 + enemy.index) * .055;
    if (distance < 10 && distance > 1.55) {
      delta.normalize(); enemy.root.position.addScaledVector(delta, dt * 1.25); enemy.root.rotation.y = Math.atan2(delta.x, delta.z);
      enemy.parts.leftLeg.rotation.x = Math.sin(worldTime * 8 + enemy.index) * .2;
      enemy.parts.rightLeg.rotation.x = -Math.sin(worldTime * 8 + enemy.index) * .2;
    } else if (distance <= 1.55) {
      enemy.root.rotation.y = Math.atan2(delta.x, delta.z);
      if (worldTime - enemy.attackAt > 1.45) {
        enemy.attackAt = worldTime; enemy.attackPhase = .3;
        enemy.parts.rightArm.rotation.x = -1.3;
        if (worldTime - lastAttack > .25) { updateHealth(state.health - (5 + Math.floor(state.level / 3))); hurtFlash = .18; }
        playTone(95, .08, 'square', .012);
      }
    }
    if (enemy.attackPhase > 0) { enemy.attackPhase -= dt; enemy.parts.rightArm.rotation.x = -1.3 * (enemy.attackPhase / .3); }
    else if (distance > 1.55) enemy.parts.rightArm.rotation.x = THREE.MathUtils.damp(enemy.parts.rightArm.rotation.x, 0, 8, dt);
  }
  if (nearestEnemy) {
    $('#enemy-level').textContent = Math.max(1, state.level + Math.floor(nearestEnemy.index / 3));
    $('#enemy-distance').textContent = nearestDistance.toFixed(0);
  } else { $('#enemy-distance').textContent = '—'; }
  $('#interact-prompt').classList.toggle('visible', player.root.position.distanceTo(shopPosition) < 5.2);

  // Camera follows at an over-the-shoulder angle and smoothly eases behind the traveler.
  tempV.set(Math.sin(cameraYaw) * cameraDistance, cameraDistance * .58, Math.cos(cameraYaw) * cameraDistance);
  cameraDesired.copy(player.root.position).add(tempV);
  camera.position.lerp(cameraDesired, 1 - Math.exp(-dt * 3.8));
  cameraTarget.set(player.root.position.x, 1.25, player.root.position.z).lerp(shopPosition.clone().setY(1.5), 0);
  camera.lookAt(cameraTarget);
  scene.fog.density = .008 + Math.sin(worldTime * .13) * .0005;
  stallLabel.rotation.y = Math.sin(worldTime * .5) * .08;
  fruitProp.position.y = 2.9 + Math.sin(worldTime * 1.7) * .07;
  fruitProp.rotation.y += dt * .55;
  for (const effect of [...sandRings]) {
    effect.age += dt; const t = effect.age / effect.duration;
    effect.ring.scale.setScalar(.2 + t * effect.radius / .85); effect.ring.material.opacity = Math.max(0, 1 - t);
    effect.inner.scale.setScalar(.5 + t * 5); effect.inner.material.opacity = Math.max(0, .8 - t);
    effect.dust.rotation.y += dt * 2.2;
    for (const mote of effect.dust.children) mote.position.y = .2 + Math.sin(worldTime * 8 + mote.userData.angle) * .22 + t * .6;
    effect.light.intensity = Math.max(0, 3.2 * (1 - t));
    if (t >= 1) { scene.remove(effect.group); effect.group.traverse((node) => { node.geometry?.dispose(); if (node.material) node.material.dispose(); }); sandRings.splice(sandRings.indexOf(effect), 1); }
  }
  if (toastTimer > 0 && (toastTimer -= dt) <= 0) $('#toast').classList.remove('show');
  if (levelTimer > 0 && (levelTimer -= dt) <= 0) $('#level-up-overlay').classList.remove('show');
  if (hurtFlash > 0) { hurtFlash -= dt; $('#health-fill').style.filter = 'brightness(1.5)'; } else $('#health-fill').style.filter = '';
  renderer.render(scene, camera);
}

function resize() {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.35 : 1.65));
}
window.addEventListener('resize', resize);
updateUI();
// Accessible game starts with the camera framing the player and vendor on the sandy coast.
camera.position.set(0, 6.5, 10.7); camera.lookAt(0, 1.2, 2);
animate();
