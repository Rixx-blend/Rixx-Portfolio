"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Html, OrbitControls, useAnimations, useGLTF, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { Maximize, Pause, Play, RotateCcw, Rotate3d, Box } from "lucide-react";

type Light = "studio" | "sunset" | "night";
const LIGHTS: { id: Light; label: string }[] = [
  { id: "studio", label: "Studio" },
  { id: "sunset", label: "Coucher de soleil" },
  { id: "night", label: "Nuit" },
];

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="w-40 text-center text-xs text-white/70">
        <div className="h-px w-full bg-white/20">
          <div className="h-px bg-white transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2">{Math.round(progress)} %</p>
      </div>
    </Html>
  );
}

function Model({ url, wireframe, clip, playing, onInfo }: { url: string; wireframe: boolean; clip: number; playing: boolean; onInfo: (i: { tris: number; clips: string[] }) => void }) {
  const gltf = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const scene = useMemo(() => {
    const s = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const k = 2 / Math.max(size.x, size.y, size.z || 1, 0.0001);
    s.scale.setScalar(k);
    s.position.sub(center.multiplyScalar(k));
    s.position.y += (size.y * k) / 2;
    return s;
  }, [gltf.scene]);
  const { actions, names } = useAnimations(gltf.animations, group);

  useEffect(() => {
    let tris = 0;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        const g = m.geometry;
        tris += g.index ? g.index.count / 3 : (g.attributes.position?.count ?? 0) / 3;
      }
    });
    onInfo({ tris: Math.round(tris), clips: names });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, names.join("|")]);

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => ((mat as THREE.MeshStandardMaterial).wireframe = wireframe));
    });
  }, [scene, wireframe]);

  useEffect(() => {
    Object.values(actions).forEach((a) => a?.stop());
    const a = actions[names[clip]];
    if (a) {
      a.reset().play();
      a.paused = !playing;
    }
  }, [actions, names, clip, playing]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export default function ModelViewer({ url, onInfo }: { url: string; onInfo: (i: { tris: number; clips: string[] }) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const controls = useRef<any>(null);
  const [auto, setAuto] = useState(true);
  const [wire, setWire] = useState(false);
  const [light, setLight] = useState<Light>("studio");
  const [clip, setClip] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [clips, setClips] = useState<string[]>([]);
  const [lightBg, setLightBg] = useState(false);

  const btn = "grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 data-[on=true]:bg-white data-[on=true]:text-black";

  return (
    <div ref={wrap} className="relative h-full w-full" style={{ background: lightBg ? "#f2f2f4" : light === "night" ? "#05060a" : "#0b0b0d" }}>
      <Canvas camera={{ position: [3, 2, 4], fov: 40 }} dpr={[1, 2]} shadows>
        <Suspense fallback={<Loader />}>
          <Environment preset={light} />
          <Model url={url} wireframe={wire} clip={clip} playing={playing} onInfo={(i) => { setClips(i.clips); onInfo(i); }} />
          <ContactShadows position={[0, 0, 0]} opacity={0.5} scale={8} blur={2.5} far={4} />
        </Suspense>
        <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} autoRotate={auto} autoRotateSpeed={1.2} target={[0, 1, 0]} maxPolarAngle={Math.PI / 2 + 0.2} />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-wrap items-center justify-center gap-2">
        <button className={btn} data-on={auto} onClick={() => setAuto((v) => !v)} aria-label="Rotation automatique" title="Rotation automatique"><Rotate3d size={18} /></button>
        <button className={btn} onClick={() => controls.current?.reset()} aria-label="Réinitialiser la caméra" title="Réinitialiser la caméra"><RotateCcw size={18} /></button>
        <button className={btn} data-on={wire} onClick={() => setWire((v) => !v)} aria-label="Fil de fer" title="Fil de fer"><Box size={18} /></button>
        <button className={btn} data-on={lightBg} onClick={() => setLightBg((v) => !v)} aria-label="Fond clair/sombre" title="Fond clair/sombre"><span className="text-xs font-bold">BG</span></button>
        <button className={btn} onClick={() => wrap.current?.requestFullscreen?.()} aria-label="Plein écran" title="Plein écran"><Maximize size={18} /></button>
        <select
          value={light}
          onChange={(e) => setLight(e.target.value as Light)}
          className="h-10 rounded-full bg-white/10 px-3 text-xs text-white outline-none backdrop-blur"
          aria-label="Éclairage"
        >
          {LIGHTS.map((l) => <option key={l.id} value={l.id} className="text-black">{l.label}</option>)}
        </select>
        {clips.length > 0 && (
          <>
            <button className={btn} onClick={() => setPlaying((v) => !v)} aria-label="Lecture / pause">{playing ? <Pause size={18} /> : <Play size={18} />}</button>
            {clips.length > 1 && (
              <select value={clip} onChange={(e) => setClip(Number(e.target.value))} className="h-10 rounded-full bg-white/10 px-3 text-xs text-white outline-none backdrop-blur" aria-label="Animation">
                {clips.map((c, i) => <option key={c + i} value={i} className="text-black">{c}</option>)}
              </select>
            )}
          </>
        )}
      </div>
    </div>
  );
}
