/* ============================================================
   three-scene.js · Hero scene + about-page globe
   - Animation loops persist independently of scroll
   - Proper memory disposal on pagehide / beforeunload
   - Reinitialises cleanly after bfcache restore
   Requires: THREE r128 loaded globally via CDN
   ============================================================ */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') return;

  function webglOK() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }
  if (!webglOK()) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Track every scene we create so we can dispose them cleanly */
  const scenes = [];

  function disposeScene(state) {
    if (!state || state.disposed) return;
    state.disposed = true;
    if (state.frameId) cancelAnimationFrame(state.frameId);
    state.listeners.forEach(({ target, type, fn }) => {
      try { target.removeEventListener(type, fn); } catch (e) {}
    });
    if (state.scene) {
      state.scene.traverse((obj) => {
        if (obj.geometry) {
          try { obj.geometry.dispose(); } catch (e) {}
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            try {
              if (m.map) m.map.dispose();
              m.dispose();
            } catch (e) {}
          });
        }
      });
      while (state.scene.children.length > 0) {
        state.scene.remove(state.scene.children[0]);
      }
    }
    if (state.renderer) {
      try { state.renderer.dispose(); } catch (e) {}
      try {
        const ctx = state.renderer.getContext && state.renderer.getContext();
        if (ctx && ctx.getExtension) {
          const lose = ctx.getExtension('WEBGL_lose_context');
          if (lose) lose.loseContext();
        }
      } catch (e) {}
      try { state.renderer.forceContextLoss && state.renderer.forceContextLoss(); } catch (e) {}
    }
    if (state.canvas && state.canvas.parentElement && state.detachOnDispose) {
      try { state.canvas.parentElement.removeChild(state.canvas); } catch (e) {}
    }
  }

  function disposeAll() {
    while (scenes.length) {
      const s = scenes.pop();
      disposeScene(s);
    }
  }

  /* Track listeners on a state object */
  function on(state, target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    state.listeners.push({ target, type, fn });
  }

  /* ============================================================
     1 · Hero scene — animation loop is independent of scroll
     ============================================================ */
  function initHeroScene() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return null;

    const state = {
      canvas,
      listeners: [],
      detachOnDispose: false,
      disposed: false,
      frameId: 0,
      scene: null,
      renderer: null
    };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f0f0f, 0.008);
    state.scene = scene;

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 800);
    camera.position.set(0, 0, 80);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 0);
    state.renderer = renderer;

    /* Particles */
    const particleCount = window.innerWidth < 768 ? 220 : 480;
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const wireGeo = new THREE.WireframeGeometry(geo);
    geo.dispose(); /* base geometry no longer needed; wireframe holds its own */

    const matBright = new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.34 });
    const matDim    = new THREE.LineBasicMaterial({ color: 0x6e6e68, transparent: true, opacity: 0.24 });

    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const m = (i % 7 === 0) ? matBright : matDim;
      const p = new THREE.LineSegments(wireGeo, m);
      const r = 70 + Math.random() * 80;
      const t = Math.random() * Math.PI * 2;
      const f = (Math.random() - 0.5) * Math.PI;
      p.position.set(Math.cos(t) * r, Math.sin(f) * r * 0.6, Math.sin(t) * r - 60);
      const s = 0.2 + Math.random() * 0.7;
      p.scale.set(s, s, s);
      p.userData = {
        sx: (Math.random() - 0.5) * 0.0006,
        sy: (Math.random() - 0.5) * 0.0006,
        sz: (Math.random() - 0.5) * 0.0004,
        baseY: p.position.y,
        phase: Math.random() * Math.PI * 2
      };
      particleGroup.add(p);
      particles.push(p);
    }

    /* Background torus knot */
    const knotGeo = new THREE.TorusKnotGeometry(28, 5, 140, 14);
    const knotWire = new THREE.WireframeGeometry(knotGeo);
    knotGeo.dispose();
    const knotMat = new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.15 });
    const knot = new THREE.LineSegments(knotWire, knotMat);
    knot.position.set(0, 0, -40);
    scene.add(knot);

    /* Mouse parallax */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    function onMove(e) {
      const t = e.touches ? e.touches[0] : e;
      if (!t) return;
      mouse.tx = (t.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (t.clientY / window.innerHeight - 0.5) * 2;
    }
    on(state, window, 'mousemove', onMove, { passive: true });
    on(state, window, 'touchmove', onMove, { passive: true });

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }
    on(state, window, 'resize', onResize);

    /* Animation loop — runs continuously, NOT tied to scroll */
    function animate(now) {
      if (state.disposed) return;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      if (!REDUCED) {
        particleGroup.rotation.y += 0.00025;
        particleGroup.rotation.x += 0.00012;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i], u = p.userData;
          p.rotation.x += u.sx;
          p.rotation.y += u.sy;
          p.rotation.z += u.sz;
          p.position.y = u.baseY + Math.sin((now * 0.0004) + u.phase) * 1.2;
        }

        knot.rotation.x += 0.0005;
        knot.rotation.y += 0.0008;
      }

      camera.position.x += (mouse.x * 6 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 4 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      state.frameId = requestAnimationFrame(animate);
    }
    state.frameId = requestAnimationFrame(animate);

    /* NOTE: scroll-coupled fade is now handled in scroll.js via GSAP,
       and capped to a minimum opacity so the loop is never visually killed. */

    /* Pause when tab hidden, resume when visible — saves CPU but keeps state */
    function onVis() {
      if (document.hidden) {
        if (state.frameId) cancelAnimationFrame(state.frameId);
        state.frameId = 0;
      } else if (!state.frameId && !state.disposed) {
        state.frameId = requestAnimationFrame(animate);
      }
    }
    on(state, document, 'visibilitychange', onVis);

    scenes.push(state);
    return state;
  }

  /* ============================================================
     2 · Globe (about page)
     ============================================================ */
  function initGlobe() {
    const mount = document.getElementById('globe');
    if (!mount) return null;

    const state = {
      canvas: null,
      listeners: [],
      detachOnDispose: true,
      disposed: false,
      frameId: 0,
      scene: null,
      renderer: null
    };

    const w = mount.clientWidth || 400;
    const h = mount.clientHeight || 400;

    const scene = new THREE.Scene();
    state.scene = scene;
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    state.renderer = renderer;
    state.canvas = renderer.domElement;
    mount.appendChild(state.canvas);

    const globeGeo = new THREE.SphereGeometry(1.6, 36, 24);
    const wireGeo = new THREE.WireframeGeometry(globeGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0xd4a843, transparent: true, opacity: 0.55 });
    const wire = new THREE.LineSegments(wireGeo, wireMat);
    scene.add(wire);

    const innerMat = new THREE.MeshBasicMaterial({ color: 0x0f0f0f, transparent: true, opacity: 0.92 });
    const inner = new THREE.Mesh(globeGeo, innerMat);
    inner.scale.setScalar(0.99);
    scene.add(inner);

    const cities = [
      [48.78, 9.18],   // Stuttgart
      [48.52, 9.05],   // Tübingen
      [40.07, 9.28],   // Sardinia
      [41.72, 44.78],  // Tbilisi (Georgia)
      [59.43, 24.74],  // Tallinn
      [41.72, -72.83], // Farmington CT, USA
      [52.52, 13.41],  // Berlin
      [48.86, 2.35],   // Paris
      [51.05, 13.74]   // Dresden
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
    const markerGroup = new THREE.Group();
    const dotGeo = new THREE.SphereGeometry(0.045, 12, 8);
    cities.forEach(([la, lo]) => {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(ll(la, lo, 1.62));
      markerGroup.add(dot);
    });
    scene.add(markerGroup);

    function resize() {
      const w2 = mount.clientWidth, h2 = mount.clientHeight;
      camera.aspect = w2 / h2; camera.updateProjectionMatrix();
      renderer.setSize(w2, h2, false);
    }
    on(state, window, 'resize', resize);

    function loop() {
      if (state.disposed) return;
      const t = performance.now();
      const ry = t * 0.00025;
      wire.rotation.y = ry;
      inner.rotation.y = ry;
      markerGroup.rotation.y = ry;
      const rx = Math.sin(t * 0.0002) * 0.15;
      wire.rotation.x = rx;
      inner.rotation.x = rx;
      markerGroup.rotation.x = rx;
      renderer.render(scene, camera);
      state.frameId = requestAnimationFrame(loop);
    }
    state.frameId = requestAnimationFrame(loop);

    function onVis() {
      if (document.hidden) {
        if (state.frameId) cancelAnimationFrame(state.frameId);
        state.frameId = 0;
      } else if (!state.frameId && !state.disposed) {
        state.frameId = requestAnimationFrame(loop);
      }
    }
    on(state, document, 'visibilitychange', onVis);

    scenes.push(state);
    return state;
  }

  /* ============================================================
     Boot + cleanup
     ============================================================ */
  function boot() {
    initHeroScene();
    initGlobe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Memory disposal on unload (covers tab close, navigation, refresh) */
  window.addEventListener('pagehide', disposeAll);
  window.addEventListener('beforeunload', disposeAll);

  /* bfcache restore — full reload to reinitialise cleanly */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) window.location.reload();
  });

  /* Expose for debugging */
  window.SHThree = { scenes, disposeAll };
})();
