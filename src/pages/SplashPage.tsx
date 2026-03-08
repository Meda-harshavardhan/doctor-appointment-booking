import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

const SplashPage = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [clicked, setClicked] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const sceneRef = useRef<{
        renderer: THREE.WebGLRenderer;
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        animId: number;
    } | null>(null);

    useEffect(() => {
        // Show hint after 1.5s
        const hintTimer = setTimeout(() => setShowHint(true), 1500);

        const mount = mountRef.current;
        if (!mount) return;

        // ─── Scene Setup ───────────────────────────────────────
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x020818);
        scene.fog = new THREE.FogExp2(0x020818, 0.018);

        const camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 30);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        // ─── Mouse tracking ────────────────────────────────────
        const mouse = new THREE.Vector2(0, 0);
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("mousemove", handleMouseMove);

        // ─── Ambient + Point Lights ────────────────────────────
        scene.add(new THREE.AmbientLight(0x112244, 0.8));

        const blueLight = new THREE.PointLight(0x0ea5e9, 3, 60);
        blueLight.position.set(-15, 10, 10);
        scene.add(blueLight);

        const cyanLight = new THREE.PointLight(0x22d3ee, 2, 50);
        cyanLight.position.set(15, -8, 8);
        scene.add(cyanLight);

        const purpleLight = new THREE.PointLight(0x818cf8, 1.5, 40);
        purpleLight.position.set(0, 15, -5);
        scene.add(purpleLight);

        // ─── DNA Helix ─────────────────────────────────────────
        const helixGroup = new THREE.Group();
        scene.add(helixGroup);

        const sphereGeom = new THREE.SphereGeometry(0.22, 12, 12);
        const mat1 = new THREE.MeshPhongMaterial({
            color: 0x0ea5e9,
            emissive: 0x0369a1,
            shininess: 100,
        });
        const mat2 = new THREE.MeshPhongMaterial({
            color: 0x22d3ee,
            emissive: 0x164e63,
            shininess: 100,
        });

        const helixSpheres: THREE.Mesh[] = [];
        const helixCount = 60;
        const helixRadius = 5;
        const helixHeight = 28;

        for (let i = 0; i < helixCount; i++) {
            const t = i / helixCount;
            const angle = t * Math.PI * 8;
            const y = t * helixHeight - helixHeight / 2;

            // Strand A
            const sA = new THREE.Mesh(sphereGeom, mat1.clone());
            sA.position.set(
                Math.cos(angle) * helixRadius,
                y,
                Math.sin(angle) * helixRadius
            );
            const scaleA = 0.5 + Math.random() * 0.5;
            sA.scale.setScalar(scaleA);
            helixGroup.add(sA);
            helixSpheres.push(sA);

            // Strand B (opposite)
            const sB = new THREE.Mesh(sphereGeom, mat2.clone());
            sB.position.set(
                Math.cos(angle + Math.PI) * helixRadius,
                y,
                Math.sin(angle + Math.PI) * helixRadius
            );
            sB.scale.setScalar(scaleA);
            helixGroup.add(sB);
            helixSpheres.push(sB);

            // Rung connecting both strands (every 4th)
            if (i % 4 === 0) {
                const rungGeom = new THREE.CylinderGeometry(0.05, 0.05, helixRadius * 2, 6);
                const rungMat = new THREE.MeshPhongMaterial({
                    color: 0x38bdf8,
                    emissive: 0x0c4a6e,
                    transparent: true,
                    opacity: 0.6,
                });
                const rung = new THREE.Mesh(rungGeom, rungMat);
                rung.position.set(0, y, 0);
                rung.rotation.z = Math.PI / 2;
                rung.rotation.y = angle;
                helixGroup.add(rung);
            }
        }

        // ─── Floating Particles ──────────────────────────────
        const particleCount = 1800;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const colorOptions = [
            [0.055, 0.647, 0.914],  // blue
            [0.133, 0.827, 0.933],  // cyan
            [0.506, 0.549, 0.973],  // indigo
            [0.804, 0.780, 0.969],  // violet
        ];

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

            const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];
        }

        const particleGeom = new THREE.BufferGeometry();
        particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const particleMat = new THREE.PointsMaterial({
            size: 0.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            sizeAttenuation: true,
        });
        const particles = new THREE.Points(particleGeom, particleMat);
        scene.add(particles);

        // ─── Floating Torus Rings ───────────────────────────
        const rings: THREE.Mesh[] = [];
        const ringData = [
            { r: 9, tube: 0.15, color: 0x0ea5e9, x: -12, y: 6, z: -5 },
            { r: 6, tube: 0.1, color: 0x22d3ee, x: 14, y: -5, z: -8 },
            { r: 7, tube: 0.12, color: 0x818cf8, x: -3, y: -10, z: -10 },
            { r: 5, tube: 0.08, color: 0x38bdf8, x: 10, y: 8, z: -6 },
        ];

        ringData.forEach((rd) => {
            const geom = new THREE.TorusGeometry(rd.r, rd.tube, 16, 100);
            const mat = new THREE.MeshPhongMaterial({
                color: rd.color,
                emissive: rd.color,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.35,
                wireframe: false,
            });
            const ring = new THREE.Mesh(geom, mat);
            ring.position.set(rd.x, rd.y, rd.z);
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.z = Math.random() * Math.PI;
            scene.add(ring);
            rings.push(ring);
        });

        // ─── Heartbeat Pulse Line ───────────────────────────
        const heartbeatPoints: THREE.Vector3[] = [];
        const hbWidth = 30;
        const hbSegments = 200;

        for (let i = 0; i <= hbSegments; i++) {
            const t = (i / hbSegments) * 2 - 1;
            const x = t * hbWidth;
            let y = 0;
            const nt = (t + 1) / 2; // 0..1
            // ECG pattern
            if (nt > 0.38 && nt < 0.42) {
                const p = (nt - 0.38) / 0.04;
                y = Math.sin(p * Math.PI) * 0.5;
            } else if (nt > 0.44 && nt < 0.48) {
                const p = (nt - 0.44) / 0.04;
                y = -Math.sin(p * Math.PI) * 0.3;
            } else if (nt > 0.51 && nt < 0.57) {
                const p = (nt - 0.51) / 0.06;
                y = Math.sin(p * Math.PI) * 5; // QRS spike
            } else if (nt > 0.57 && nt < 0.63) {
                const p = (nt - 0.57) / 0.06;
                y = -Math.sin(p * Math.PI) * 0.8;
            } else if (nt > 0.68 && nt < 0.78) {
                const p = (nt - 0.68) / 0.10;
                y = Math.sin(p * Math.PI) * 1.5;
            }
            heartbeatPoints.push(new THREE.Vector3(x, y - 12, 2));
        }

        const hbGeom = new THREE.BufferGeometry().setFromPoints(heartbeatPoints);
        const hbMat = new THREE.LineBasicMaterial({
            color: 0xf43f5e,
            transparent: true,
            opacity: 0.85,
        });
        const heartbeatLine = new THREE.Line(hbGeom, hbMat);
        scene.add(heartbeatLine);

        // ─── Glowing Orb (central) ──────────────────────────
        const orbGeom = new THREE.SphereGeometry(2.5, 32, 32);
        const orbMat = new THREE.MeshPhongMaterial({
            color: 0x0ea5e9,
            emissive: 0x0369a1,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.15,
            wireframe: true,
        });
        const orb = new THREE.Mesh(orbGeom, orbMat);
        orb.position.set(0, 0, 5);
        scene.add(orb);

        // ─── Animation Loop ─────────────────────────────────
        let time = 0;
        let clickProgress = 0;

        const animate = () => {
            const id = requestAnimationFrame(animate);
            sceneRef.current!.animId = id;
            time += 0.008;

            // Rotate helix
            helixGroup.rotation.y = time * 0.3;
            helixGroup.rotation.x = Math.sin(time * 0.15) * 0.08;

            // Pulsing spheres
            helixSpheres.forEach((s, idx) => {
                const phase = (idx / helixSpheres.length) * Math.PI * 2;
                const pulse = 0.85 + 0.15 * Math.sin(time * 2 + phase);
                s.scale.setScalar(pulse * 0.7);
                (s.material as THREE.MeshPhongMaterial).emissiveIntensity =
                    0.3 + 0.5 * Math.sin(time * 3 + phase);
            });

            // Rotate rings
            rings.forEach((ring, i) => {
                ring.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1);
                ring.rotation.y += 0.005 * (i % 3 === 0 ? 1 : -0.5);
                ring.rotation.z += 0.002;
            });

            // Particles drift
            particles.rotation.y = time * 0.02;
            particles.rotation.x = time * 0.01;

            // Heartbeat scroll
            heartbeatLine.position.x = -((time * 8) % 60) + 30;

            // Orb pulse
            const orbScale = 1 + 0.12 * Math.sin(time * 2.5);
            orb.scale.setScalar(orbScale);
            (orb.material as THREE.MeshPhongMaterial).opacity =
                0.12 + 0.08 * Math.sin(time * 3);

            // Camera mouse parallax
            camera.position.x += (mouse.x * 8 - camera.position.x) * 0.04;
            camera.position.y += (mouse.y * 5 - camera.position.y) * 0.04;
            camera.lookAt(0, 0, 0);

            // Click explosion effect
            if (clickProgress > 0) {
                clickProgress = Math.min(clickProgress + 0.04, 1);
                camera.position.z = 30 - clickProgress * 28;
                scene.fog = new THREE.FogExp2(0x020818, 0.018 + clickProgress * 0.15);
                if (clickProgress >= 1) {
                    navigate("/login");
                    return;
                }
            }

            renderer.render(scene, camera);
        };

        sceneRef.current = { renderer, scene, camera, animId: 0 };
        animate();

        // ─── Click handler ──────────────────────────────────
        const handleClick = () => {
            setClicked(true);
            clickProgress = 0.01; // kick off
        };
        mount.addEventListener("click", handleClick);

        // ─── Resize ─────────────────────────────────────────
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(hintTimer);
            cancelAnimationFrame(sceneRef.current?.animId ?? 0);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
            mount.removeEventListener("click", handleClick);
            renderer.dispose();
            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement);
            }
        };
    }, [navigate]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#020818] cursor-pointer select-none">
            {/* Three.js canvas mount */}
            <div ref={mountRef} className="absolute inset-0" />

            {/* ─── Overlay UI ─────────────────────────────────── */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {/* Logo mark */}
                <div
                    className="mb-6 w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #6366f1 100%)",
                        boxShadow: "0 0 40px rgba(14,165,233,0.5), 0 0 80px rgba(14,165,233,0.2)",
                    }}
                >
                    {/* Heartbeat icon */}
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                        <path
                            d="M4 22 L10 22 L13 12 L17 32 L21 18 L23 26 L26 22 L40 22"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1
                    className="text-6xl md:text-8xl font-black mb-2 tracking-tight"
                    style={{
                        background: "linear-gradient(135deg, #ffffff 0%, #7dd3fc 40%, #22d3ee 80%, #818cf8 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        textShadow: "none",
                        filter: "drop-shadow(0 0 30px rgba(14,165,233,0.4))",
                    }}
                >
                    PulseAppoint
                </h1>

                {/* Tagline */}
                <p
                    className="text-lg md:text-2xl font-light tracking-widest uppercase mb-12"
                    style={{ color: "rgba(186,230,253,0.7)", letterSpacing: "0.25em" }}
                >
                    Your Health &nbsp;•&nbsp; Our Priority
                </p>

                {/* Hint pill */}
                <div
                    className="flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-1000"
                    style={{
                        background: "rgba(14,165,233,0.08)",
                        borderColor: "rgba(14,165,233,0.3)",
                        backdropFilter: "blur(12px)",
                        opacity: showHint ? (clicked ? 0 : 1) : 0,
                        transform: showHint ? "translateY(0)" : "translateY(16px)",
                    }}
                >
                    {/* Pulse dot */}
                    <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{
                            background: "#0ea5e9",
                            animation: "pulseDot 1.4s ease-in-out infinite",
                            boxShadow: "0 0 10px #0ea5e9",
                        }}
                    />
                    <span style={{ color: "rgba(186,230,253,0.85)", fontSize: "0.95rem", letterSpacing: "0.05em" }}>
                        Click anywhere to enter
                    </span>
                </div>

                {/* Entering state */}
                {clicked && (
                    <div
                        className="mt-8 flex items-center gap-3"
                        style={{ animation: "fadeInUp 0.4s ease" }}
                    >
                        <div
                            className="w-5 h-5 rounded-full border-2 border-t-transparent"
                            style={{
                                borderColor: "#0ea5e9",
                                borderTopColor: "transparent",
                                animation: "spin 0.8s linear infinite",
                            }}
                        />
                        <span style={{ color: "#7dd3fc", fontSize: "1rem", letterSpacing: "0.08em" }}>
                            Entering PulseAppoint...
                        </span>
                    </div>
                )}
            </div>

            {/* Vignette overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,8,24,0.7) 100%)",
                }}
            />

            {/* Bottom bar */}
            <div
                className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-4 pointer-events-none"
                style={{
                    background: "linear-gradient(to top, rgba(2,8,24,0.9), transparent)",
                }}
            >
                <span style={{ color: "rgba(186,230,253,0.35)", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
                    © 2025 PulseAppoint
                </span>
                <div className="flex items-center gap-2">
                    <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#22c55e", animation: "pulseDot 2s ease-in-out infinite", boxShadow: "0 0 6px #22c55e" }}
                    />
                    <span style={{ color: "rgba(186,230,253,0.35)", fontSize: "0.75rem" }}>
                        LIVE
                    </span>
                </div>
            </div>

            {/* Keyframe styles */}
            <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default SplashPage;
