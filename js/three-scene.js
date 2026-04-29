/* ============================================================
   three-scene.js · Hero scene + about-page globe
   Requires: THREE (r128) loaded globally via CDN
   ============================================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  /* ---------- Mobile / WebGL guard ---------- */
  function webglOK() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }
  if (!webglOK()) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1 · Hero scene
     ============================================================ */
  function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.008);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(0, 0, 80);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);

    /* ---- Particles (icosahedron wireframes) ---- */
    const particleCount = window.innerWidth < 768 ? 220 : 480;
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const wire = new THREE.WireframeGeometry(geo);
    const mat  = new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.32 });
    const matDim = new THREE.LineBasicMaterial({ color: 0x666660, transparent: true, opacity: 0.22 });

    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const m = (i % 7 === 0) ? mat : matDim;
      const p = new THREE.LineSegments(wire, m);
      const r = 70 + Math.random() * 80;
      const t = Math.random() * Math.PI * 2;
      const f = (Math.random() - 0.5) * Math.PI;
      p.position.set(Math.cos(t) * r, Math.sin(f) * r * 0.6, Math.sin(t) * r - 60);
      const s = 0.2 + Math.random() * 0.7;
      p.scale.set(s, s, s);
      p.userData = {
        speedX: (Math.random() - 0.5) * 0.0006,
        speedY: (Math.random() - 0.5) * 0.0006,
        speedZ: (Math.random() - 0.5) * 0.0004,
        baseY: p.position.y,
        phase: Math.random() * Math.PI * 2
      };
      particleGroup.add(p);
      particles.push(p);
    }

    /* ---- Background torus knot ---- */
    const knotGeo = new THREE.TorusKnotGeometry(28, 5, 140, 14);
    const knotWire = new THREE.WireframeGeometry(knotGeo);
    const knotMat = new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.15 });
    const knot = new THREE.LineSegments(knotWire, knotMat);
    knot.position.set(0, 0, -40);
    scene.add(knot);

    /* ---- Mouse parallax ---- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    function onMove(e) {
      const t = e.touches ? e.touches[0] : e;
      mouse.tx = (t.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (t.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });

    /* ---- Resize ---- */
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    window.addEventListener('resize', onResize);

    /* ---- Animate ---- */
    let t0 = performance.now();
    function animate(now) {
      const dt = (now - t0); t0 = now;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      particleGroup.rotation.y += 0.00025 * (REDUCED ? 0 : 1);
      particleGroup.rotation.x += 0.00012 * (REDUCED ? 0 : 1);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i], u = p.userData;
        p.rotation.x += u.speedX;
        p.rotation.y += u.speedY;
        p.rotation.z += u.speedZ;
        p.position.y = u.baseY + Math.sin((now * 0.0004) + u.phase) * 1.2;
      }

      knot.rotation.x += 0.0005;
      knot.rotation.y += 0.0008;

      camera.position.x += (mouse.x * 6 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    /* ---- Scroll fade (hooked by scroll.js too) ---- */
    function onScroll() {
      const y = window.scrollY;
      const fade = Math.max(0, 1 - y / 600);
      const scale = Math.max(0.85, 1 - y / 2400);
      canvas.style.opacity = fade.toFixed(3);
      canvas.style.transform = 'scale(' + scale.toFixed(3) + ')';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ============================================================
     2 · Globe (about page)
     ============================================================ */
  function initGlobe() {
    const mount = document.getElementById('globe');
    if (!mount) return;

    const w = mount.clientWidth || 400;
    const h = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    mount.appendChild(renderer.domElement);

    const globeGeo = new THREE.SphereGeometry(1.6, 36, 24);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.55 });
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(globeGeo), wireMat);
    scene.add(wire);

    const innerMat = new THREE.MeshBasicMaterial({ color: 0x080808, transparent: true, opacity: 0.92 });
    const inner = new THREE.Mesh(globeGeo, innerMat);
    inner.scale.setScalar(0.99);
    scene.add(inner);

    /* Visited markers */
    const cities = [
      [48.78, 9.18],   // Stuttgart
      [48.52, 9.05],   // Tübingen
      [40.07, 9.28],   // Sardinia
      [52.52, 13.41],  // Berlin
      [41.90, 12.49],  // Rome
      [48.86, 2.35],   // Paris
      [40.41, -3.70],  // Madrid
      [51.50, -0.12],  // London
      [37.98, 23.72],  // Athens
      [59.33, 18.06],  // Stockholm
      [55.67, 12.57],  // Copenhagen
      [50.07, 14.43]   // Prague
    ];
    function ll(lat, lon, r) {
      const phi = (90 - lat) * Math.PI / 180;
      const th  = (lon + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(th),
         r * Math.cos(phi),
         r * Math.sin(phi) * Math.sin(th)
      );
    }
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xd4a843 });
    cities.forEach(([la, lo]) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), dotMat);
      dot.position.copy(ll(la, lo, 1.62));
      scene.add(dot);
    });

    function resize() {
      const w2 = mount.clientWidth, h2 = mount.clientHeight;
      camera.aspect = w2 / h2; camera.updateProjectionMatrix();
      renderer.setSize(w2, h2, false);
    }
    window.addEventListener('resize', resize);

    function loop() {
      wire.rotation.y += 0.0025;
      inner.rotation.y = wire.rotation.y;
      scene.children.forEach(c => { if (c !== wire && c !== inner) c.rotation.y = wire.rotation.y; });
      // markers as a group: rotate them with the globe by parenting? simplest: rotate scene.
      renderer.render(scene, camera);
      requestAnimationFrame(loop);
    }
    /* Parent markers to globe so they rotate together */
    const markerGroup = new THREE.Group();
    scene.children.slice().forEach(c => {
      if (c !== wire && c !== inner) {
        scene.remove(c);
        markerGroup.add(c);
      }
    });
    scene.add(markerGroup);

    function loop2() {
      wire.rotation.y += 0.0025;
      inner.rotation.y = wire.rotation.y;
      markerGroup.rotation.y = wire.rotation.y;
      wire.rotation.x = Math.sin(performance.now() * 0.0002) * 0.15;
      inner.rotation.x = wire.rotation.x;
      markerGroup.rotation.x = wire.rotation.x;
      renderer.render(scene, camera);
      requestAnimationFrame(loop2);
    }
    requestAnimationFrame(loop2);
  }

  /* ============================================================
     Boot
     ============================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initHeroScene(); initGlobe(); });
  } else {
    initHeroScene(); initGlobe();
  }
})();
