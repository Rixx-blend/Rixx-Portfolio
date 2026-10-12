const fs = require("fs");
const out = "public/placeholders";
const grads = [
  ["#3a3a3c", "#0a0a0a"], ["#636366", "#1c1c1e"], ["#48484a", "#000000"],
  ["#8e8e93", "#2c2c2e"], ["#2c2c2e", "#636366"], ["#1c1c1e", "#8e8e93"],
];
function svg(w, h, i, label, round) {
  const [a, b] = grads[i % grads.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<text x="50%" y="50%" fill="#fff" fill-opacity="0.85" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="${Math.round(Math.min(w, h) / 9)}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
}
const w = (n, s) => fs.writeFileSync(`${out}/${n}.svg`, s);
["pdp", "bannieres", "miniatures", "uefn", "modeles-3d"].forEach((n, i) =>
  w(`cover-${n}`, svg(1280, 720, i, n === "modeles-3d" ? "Modèles 3D" : n[0].toUpperCase() + n.slice(1))));
for (let i = 1; i <= 3; i++) {
  w(`miniature-${i}`, svg(1280, 720, i, `Miniature ${i}`));
  w(`banniere-${i}`, svg(1280, 720, i + 1, `Bannière ${i}`));
  w(`uefn-${i}`, svg(1280, 720, i + 2, `UEFN ${i}`));
}
for (let i = 1; i <= 6; i++) w(`pdp-${i}`, svg(600, 600, i, `PDP ${i}`));
w("avatar", svg(600, 600, 0, "Rixx"));
w("model-cube", svg(1280, 720, 4, "Cube"));
for (const t of ["Blender", "Octane", "Photoshop", "UEFN"])
  w(`tool-${t.toLowerCase()}`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2c2c2e"/><text x="50%" y="52%" fill="#fff" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="30" font-weight="700" text-anchor="middle" dominant-baseline="middle">${t[0]}</text></svg>`);

// Minimal cube GLB
const pos = [], nor = [], idx = [];
const faces = [
  [[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]],
  [[0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]],
  [[1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]],
  [[-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]],
  [[0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]],
  [[0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]]],
];
faces.forEach(([n, vs], f) => {
  vs.forEach((v) => { pos.push(...v.map((c) => c * 0.5)); nor.push(...n); });
  const o = f * 4; idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
});
const pb = Buffer.from(new Float32Array(pos).buffer);
const nb = Buffer.from(new Float32Array(nor).buffer);
const ib = Buffer.from(new Uint16Array(idx).buffer);
const bin = Buffer.concat([pb, nb, ib]);
const json = {
  asset: { version: "2.0", generator: "rixx-placeholder" },
  scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
  meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }] }],
  materials: [{ pbrMetallicRoughness: { baseColorFactor: [0.85, 0.85, 0.88, 1], metallicFactor: 0.6, roughnessFactor: 0.25 } }],
  buffers: [{ byteLength: bin.length }],
  bufferViews: [
    { buffer: 0, byteOffset: 0, byteLength: pb.length, target: 34962 },
    { buffer: 0, byteOffset: pb.length, byteLength: nb.length, target: 34962 },
    { buffer: 0, byteOffset: pb.length + nb.length, byteLength: ib.length, target: 34963 },
  ],
  accessors: [
    { bufferView: 0, componentType: 5126, count: 24, type: "VEC3", min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
    { bufferView: 1, componentType: 5126, count: 24, type: "VEC3" },
    { bufferView: 2, componentType: 5123, count: 36, type: "SCALAR" },
  ],
};
let js = Buffer.from(JSON.stringify(json));
js = Buffer.concat([js, Buffer.alloc((4 - (js.length % 4)) % 4, 0x20)]);
const bp = Buffer.concat([bin, Buffer.alloc((4 - (bin.length % 4)) % 4)]);
const total = 12 + 8 + js.length + 8 + bp.length;
const h = Buffer.alloc(12); h.write("glTF", 0); h.writeUInt32LE(2, 4); h.writeUInt32LE(total, 8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(js.length, 0); jh.write("JSON", 4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(bp.length, 0); bh.write("BIN\0", 4);
fs.writeFileSync("public/models/cube.glb", Buffer.concat([h, jh, js, bh, bp]));
console.log("done");
