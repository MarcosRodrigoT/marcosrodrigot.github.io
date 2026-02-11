/*!
=========================================================
* Neural Network Header Background
* Interactive canvas animation for Marcos Rodrigo's portfolio
=========================================================
*/
(function() {
    'use strict';

    // ── Configuration ───────────────────────────────────
    var CONFIG = {
        // Neural network
        layers: [4, 7, 10, 14, 10, 7, 4],
        networkSpreadX: 0.70,
        networkMarginX: 0.15,
        nodeRadius: 2.6,
        nodeRadiusRange: 1.4,
        oscillationAmp: 6,
        oscillationSpeed: 0.004,

        // Colors
        base: { r: 100, g: 160, b: 255 },
        signal: { r: 140, g: 220, b: 255 },
        active: { r: 248, g: 92, b: 112 },

        // Mouse
        mouseRadius: 180,
        mouseRadiusMobile: 110,

        // Signals
        signalSpeed: 0.012,
        signalSpawnChance: 0.15,     // per-frame chance to spawn one random signal
        signalRadius: 2.2,
        cascadeChance: 0.35,
        maxSignals: 120,
        maxSignalsMobile: 50,
        heatDecay: 0.965,

        // Background web (constellation)
        webCount: 80,
        webCountMobile: 35,
        webDistance: 130,
        webDistanceMobile: 100,
        webSpeed: 0.12,

        // Data streams
        streamCount: 10,
        streamCountMobile: 5,

        // Particles
        particleCount: 30,
        particleCountMobile: 10,
        particleSpeed: 0.2
    };

    var canvas, ctx, W, H;
    var nnNodes = [], nnConns = [];
    var webNodes = [];
    var signals = [];
    var streams = [];
    var particles = [];
    var mouse = { x: -1000, y: -1000 };
    var animId, time = 0;
    var isMobile = false, headerEl;
    var prefersReducedMotion = false;

    // ── Init ────────────────────────────────────────────
    function init() {
        canvas = document.getElementById('nn-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        headerEl = canvas.parentElement;
        isMobile = window.innerWidth < 768;
        prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        resize();
        buildAll();
        bindEvents();
        prefersReducedMotion ? drawStatic() : animate();
    }

    function resize() {
        var r = headerEl.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        canvas.style.width = r.width + 'px';
        canvas.style.height = r.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        W = r.width;
        H = r.height;
    }

    function buildAll() {
        buildNetwork();
        buildWeb();
        buildStreams();
        buildParticles();
        signals = [];
    }

    // ── Neural network ──────────────────────────────────
    function buildNetwork() {
        nnNodes = [];
        nnConns = [];
        var layers = CONFIG.layers, nL = layers.length;
        var mx = W * CONFIG.networkMarginX, uw = W * CONFIG.networkSpreadX;

        // Uniform spacing: use a fixed gap per node based on the largest layer
        var maxCnt = Math.max.apply(null, layers);
        var usableH = H * 0.76;
        var fixedGap = maxCnt > 1 ? usableH / (maxCnt - 1) : usableH;

        for (var l = 0; l < nL; l++) {
            var cnt = layers[l];
            var x = mx + uw * l / (nL - 1);
            // Center each layer vertically using the uniform gap
            var layerH = (cnt - 1) * fixedGap;
            var startY = (H - layerH) / 2;
            for (var n = 0; n < cnt; n++) {
                var y = cnt === 1 ? H / 2 : startY + fixedGap * n;
                var ox = (Math.random() - 0.5) * 6;
                var oy = (Math.random() - 0.5) * 4;
                nnNodes.push({
                    baseX: x + ox, baseY: y + oy,
                    x: x + ox, y: y + oy,
                    radius: CONFIG.nodeRadius + Math.random() * CONFIG.nodeRadiusRange,
                    layer: l,
                    phase: Math.random() * Math.PI * 2,
                    brightness: 0, activation: 0,
                    currentR: CONFIG.nodeRadius
                });
            }
        }
        for (var i = 0; i < nnNodes.length; i++) {
            for (var j = 0; j < nnNodes.length; j++) {
                if (nnNodes[j].layer === nnNodes[i].layer + 1) {
                    nnConns.push({
                        from: i, to: j,
                        weight: 0.3 + Math.random() * 0.7,
                        curve: (Math.random() - 0.5) * 0.25,
                        heat: 0
                    });
                }
            }
        }
    }

    // ── Background constellation web ────────────────────
    function buildWeb() {
        webNodes = [];
        var cnt = isMobile ? CONFIG.webCountMobile : CONFIG.webCount;
        for (var i = 0; i < cnt; i++) {
            // ~10% of nodes are brighter "stars"
            var isBright = Math.random() < 0.1;
            webNodes.push({
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * CONFIG.webSpeed,
                vy: (Math.random() - 0.5) * CONFIG.webSpeed,
                r: isBright ? (1.8 + Math.random() * 1.5) : (0.5 + Math.random() * 1.2),
                baseAlpha: isBright ? (0.35 + Math.random() * 0.25) : (0.08 + Math.random() * 0.18),
                alpha: 0,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.008 + Math.random() * 0.02
            });
        }
    }

    // ── Data streams ────────────────────────────────────
    function buildStreams() {
        streams = [];
        var cnt = isMobile ? CONFIG.streamCountMobile : CONFIG.streamCount;
        for (var i = 0; i < cnt; i++) streams.push(newStream(true));
    }

    function newStream(scatter) {
        return {
            x: scatter ? Math.random() * W * 1.5 - W * 0.25 : -Math.random() * W * 0.3,
            y: H * 0.08 + Math.random() * H * 0.84,
            speed: 0.6 + Math.random() * 0.8,
            len: 25 + Math.random() * 50,
            alpha: 0.06 + Math.random() * 0.12
        };
    }

    // ── Particles ───────────────────────────────────────
    function buildParticles() {
        particles = [];
        var cnt = isMobile ? CONFIG.particleCountMobile : CONFIG.particleCount;
        for (var i = 0; i < cnt; i++) {
            particles.push({
                x: Math.random() * W, y: Math.random() * H,
                r: 0.3 + Math.random() * 1.2,
                vx: (Math.random() - 0.5) * CONFIG.particleSpeed,
                vy: (Math.random() - 0.5) * CONFIG.particleSpeed,
                alpha: 0.05 + Math.random() * 0.18
            });
        }
    }

    // ── Signals ─────────────────────────────────────────
    function spawnRandomSignal() {
        var maxSig = isMobile ? CONFIG.maxSignalsMobile : CONFIG.maxSignals;
        if (signals.length >= maxSig) return;
        // Pick one random connection
        var idx = Math.floor(Math.random() * nnConns.length);
        signals.push({
            conn: idx, t: 0,
            speed: CONFIG.signalSpeed * (0.7 + Math.random() * 0.6)
        });
    }

    function updateSignals() {
        // Spawn individual signals at random with per-frame chance
        if (Math.random() < CONFIG.signalSpawnChance) {
            spawnRandomSignal();
        }

        for (var i = signals.length - 1; i >= 0; i--) {
            var s = signals[i];
            s.t += s.speed;
            // Heat the connection as the signal passes
            nnConns[s.conn].heat = Math.min(1, nnConns[s.conn].heat + 0.1);

            if (s.t >= 1) {
                var c = nnConns[s.conn];
                nnNodes[c.to].activation = Math.min(1, nnNodes[c.to].activation + 0.5);
                // Cascade forward along a single random connection (not a wave)
                var maxSig = isMobile ? CONFIG.maxSignalsMobile : CONFIG.maxSignals;
                if (Math.random() < CONFIG.cascadeChance && nnNodes[c.to].layer < CONFIG.layers.length - 1 && signals.length < maxSig) {
                    // Collect outgoing connections from this node
                    var outgoing = [];
                    for (var k = 0; k < nnConns.length; k++) {
                        if (nnConns[k].from === c.to) outgoing.push(k);
                    }
                    if (outgoing.length > 0) {
                        var pick = outgoing[Math.floor(Math.random() * outgoing.length)];
                        signals.push({ conn: pick, t: 0, speed: CONFIG.signalSpeed * (0.7 + Math.random() * 0.6) });
                    }
                }
                signals.splice(i, 1);
            }
        }
    }

    // ── Bezier helpers ──────────────────────────────────
    function cp(c) {
        var f = nnNodes[c.from], t = nnNodes[c.to];
        var mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
        var dx = t.x - f.x, dy = t.y - f.y;
        return { x: mx - dy * c.curve, y: my + dx * c.curve };
    }

    function bez(f, p, t, u) {
        var m = 1 - u;
        return { x: m * m * f.x + 2 * m * u * p.x + u * u * t.x,
                 y: m * m * f.y + 2 * m * u * p.y + u * u * t.y };
    }

    // ── Events ──────────────────────────────────────────
    function bindEvents() {
        headerEl.addEventListener('mousemove', function(e) {
            var r = headerEl.getBoundingClientRect();
            mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
        });
        headerEl.addEventListener('mouseleave', function() { mouse.x = mouse.y = -1000; });
        headerEl.addEventListener('touchmove', function(e) {
            var r = headerEl.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - r.left; mouse.y = e.touches[0].clientY - r.top;
        }, { passive: true });
        headerEl.addEventListener('touchend', function() { mouse.x = mouse.y = -1000; });

        var rto;
        window.addEventListener('resize', function() {
            clearTimeout(rto);
            rto = setTimeout(function() { isMobile = window.innerWidth < 768; resize(); buildAll(); }, 200);
        });
        document.addEventListener('visibilitychange', function() {
            if (prefersReducedMotion) return;
            document.hidden ? cancelAnimationFrame(animId) : animate();
        });
    }

    // ── Main loop ───────────────────────────────────────
    function animate() {
        time++;
        ctx.clearRect(0, 0, W, H);

        updateNNNodes();
        updateWebNodes();
        updateStreams();
        updateParticles();
        updateSignals();

        drawNebula();
        drawWeb();
        drawNNConns();
        drawSignalDots();
        drawNNNodes();
        drawStreams();
        drawParticles();
        drawVignette();

        animId = requestAnimationFrame(animate);
    }

    function drawStatic() {
        ctx.clearRect(0, 0, W, H);
        drawNebula();
        drawWeb();
        drawNNConns();
        drawNNNodes();
        drawVignette();
    }

    // ── Update ──────────────────────────────────────────
    function updateNNNodes() {
        var mR = isMobile ? CONFIG.mouseRadiusMobile : CONFIG.mouseRadius;
        for (var i = 0; i < nnNodes.length; i++) {
            var n = nnNodes[i];
            n.y = n.baseY + Math.sin(time * CONFIG.oscillationSpeed + n.phase) * CONFIG.oscillationAmp;
            n.x = n.baseX + Math.cos(time * CONFIG.oscillationSpeed * 0.7 + n.phase) * (CONFIG.oscillationAmp * 0.5);

            var dx = mouse.x - n.x, dy = mouse.y - n.y;
            var d = Math.sqrt(dx * dx + dy * dy);
            var tgt = d < mR ? 1 - d / mR : 0;
            n.brightness += (tgt - n.brightness) * (tgt > n.brightness ? 0.12 : 0.04);
            n.activation *= 0.92;
            n.currentR = n.radius + Math.sin(time * 0.02 + n.phase) * 0.5;
        }
        // Decay connection heat
        for (var j = 0; j < nnConns.length; j++) {
            nnConns[j].heat *= CONFIG.heatDecay;
        }
    }

    function updateWebNodes() {
        for (var i = 0; i < webNodes.length; i++) {
            var n = webNodes[i];
            n.x += n.vx; n.y += n.vy;
            if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
            if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
            // Twinkle: sinusoidal alpha modulation
            n.alpha = n.baseAlpha * (0.5 + 0.5 * Math.sin(time * n.twinkleSpeed + n.twinklePhase));
        }
    }

    function updateStreams() {
        for (var i = 0; i < streams.length; i++) {
            var s = streams[i];
            s.x += s.speed;
            if (s.x - s.len > W) streams[i] = newStream(false);
        }
    }

    function updateParticles() {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        }
    }

    // ── Draw: nebula color washes ───────────────────────
    function drawNebula() {
        var cx = W / 2, cy = H / 2;
        // Slow-orbiting color spots
        var t1 = time * 0.0008;
        var t2 = time * 0.0006;

        var spots = [
            { x: cx + Math.cos(t1) * W * 0.25, y: cy + Math.sin(t1) * H * 0.2, c: '60, 40, 120' },
            { x: cx + Math.cos(t2 + 2) * W * 0.3, y: cy + Math.sin(t2 + 2) * H * 0.25, c: '20, 60, 100' },
            { x: cx + Math.cos(t1 + 4) * W * 0.2, y: cy + Math.sin(t2 + 4) * H * 0.15, c: '40, 80, 110' }
        ];

        for (var i = 0; i < spots.length; i++) {
            var s = spots[i];
            var rad = Math.max(W, H) * 0.4;
            var g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad);
            g.addColorStop(0, 'rgba(' + s.c + ', 0.04)');
            g.addColorStop(1, 'rgba(' + s.c + ', 0)');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        }
    }

    // ── Draw: background constellation web ──────────────
    function drawWeb() {
        var dist = isMobile ? CONFIG.webDistanceMobile : CONFIG.webDistance;
        var mR = isMobile ? CONFIG.mouseRadiusMobile : CONFIG.mouseRadius;

        // Connections
        ctx.lineWidth = 0.5;
        for (var i = 0; i < webNodes.length; i++) {
            for (var j = i + 1; j < webNodes.length; j++) {
                var a = webNodes[i], b = webNodes[j];
                var dx = a.x - b.x, dy = a.y - b.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d < dist) {
                    var alpha = (1 - d / dist) * 0.08;
                    // Brighten near mouse
                    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
                    var md = Math.sqrt((mouse.x - mx) * (mouse.x - mx) + (mouse.y - my) * (mouse.y - my));
                    if (md < mR) alpha += (1 - md / mR) * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = 'rgba(100,160,255,' + alpha + ')';
                    ctx.stroke();
                }
            }
        }

        // Nodes (constellation stars)
        for (var k = 0; k < webNodes.length; k++) {
            var n = webNodes[k];
            var dm = Math.sqrt((mouse.x - n.x) * (mouse.x - n.x) + (mouse.y - n.y) * (mouse.y - n.y));
            var extra = dm < mR ? (1 - dm / mR) * 0.3 : 0;
            var drawAlpha = n.alpha + extra;

            // Subtle glow for brighter/larger stars
            if (n.r > 1.6 && drawAlpha > 0.15) {
                var sg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r + 4);
                sg.addColorStop(0, 'rgba(160,200,255,' + (drawAlpha * 0.4) + ')');
                sg.addColorStop(1, 'rgba(160,200,255,0)');
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + 4, 0, Math.PI * 2);
                ctx.fillStyle = sg;
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(160,200,255,' + drawAlpha + ')';
            ctx.fill();
        }
    }

    // ── Draw: NN connections (with heat glow) ───────────
    function drawNNConns() {
        for (var i = 0; i < nnConns.length; i++) {
            var c = nnConns[i];
            var f = nnNodes[c.from], t = nnNodes[c.to];
            var br = Math.max(f.brightness, t.brightness);
            var act = Math.max(f.activation, t.activation);
            var heat = c.heat;
            var w = c.weight;

            var alpha = 0.03 + w * 0.04;
            var r = CONFIG.base.r, g = CONFIG.base.g, b = CONFIG.base.b;

            if (br > 0.05) {
                alpha += br * 0.28;
                r = lerp(r, CONFIG.active.r, br);
                g = lerp(g, CONFIG.active.g, br);
                b = lerp(b, CONFIG.active.b, br);
            } else if (heat > 0.05) {
                alpha += heat * 0.22;
                r = lerp(r, CONFIG.signal.r, heat);
                g = lerp(g, CONFIG.signal.g, heat);
                b = lerp(b, CONFIG.signal.b, heat);
            } else if (act > 0.05) {
                alpha += act * 0.1;
            }

            var ctrl = cp(c);
            ctx.beginPath();
            ctx.moveTo(f.x, f.y);
            ctx.quadraticCurveTo(ctrl.x, ctrl.y, t.x, t.y);
            ctx.strokeStyle = 'rgba(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ',' + alpha + ')';
            ctx.lineWidth = (0.3 + w * 0.5) + br * 1 + heat * 0.8;
            ctx.stroke();
        }
    }

    // ── Draw: signal dots ───────────────────────────────
    function drawSignalDots() {
        var sr = CONFIG.signalRadius;
        var sc = CONFIG.signal;

        for (var i = 0; i < signals.length; i++) {
            var s = signals[i];
            var c = nnConns[s.conn];
            var f = nnNodes[c.from], t = nnNodes[c.to];
            var ctrl = cp(c);
            var pos = bez(f, ctrl, t, s.t);

            // Outer glow
            var gr = sr + 5;
            var g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, gr);
            g.addColorStop(0, 'rgba(' + sc.r + ',' + sc.g + ',' + sc.b + ',0.55)');
            g.addColorStop(1, 'rgba(' + sc.r + ',' + sc.g + ',' + sc.b + ',0)');
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, gr, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, sr, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(210,240,255,0.9)';
            ctx.fill();
        }
    }

    // ── Draw: NN nodes ──────────────────────────────────
    function drawNNNodes() {
        for (var i = 0; i < nnNodes.length; i++) {
            var n = nnNodes[i];
            var r = n.currentR || n.radius;
            var br = n.brightness, act = n.activation;
            var intensity = Math.max(br, act * 0.7);

            if (intensity > 0.04) {
                var glowR = r + 7 + intensity * 14;
                var gr, gg, gb;
                if (br > act * 0.7) {
                    gr = lerp(CONFIG.base.r, CONFIG.active.r, br);
                    gg = lerp(CONFIG.base.g, CONFIG.active.g, br);
                    gb = lerp(CONFIG.base.b, CONFIG.active.b, br);
                } else {
                    gr = CONFIG.signal.r; gg = CONFIG.signal.g; gb = CONFIG.signal.b;
                }
                var grd = ctx.createRadialGradient(n.x, n.y, r * 0.5, n.x, n.y, glowR);
                grd.addColorStop(0, 'rgba(' + Math.round(gr) + ',' + Math.round(gg) + ',' + Math.round(gb) + ',' + (0.35 * intensity) + ')');
                grd.addColorStop(1, 'rgba(' + Math.round(gr) + ',' + Math.round(gg) + ',' + Math.round(gb) + ',0)');
                ctx.beginPath();
                ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();
            }

            // Node core with subtle ring
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            if (br > 0.05) {
                ctx.fillStyle = 'rgba(' + Math.round(lerp(CONFIG.base.r, CONFIG.active.r, br)) + ',' +
                    Math.round(lerp(CONFIG.base.g, CONFIG.active.g, br)) + ',' +
                    Math.round(lerp(CONFIG.base.b, CONFIG.active.b, br)) + ',' + (0.8 + br * 0.2) + ')';
            } else if (act > 0.05) {
                ctx.fillStyle = 'rgba(' + CONFIG.signal.r + ',' + CONFIG.signal.g + ',' + CONFIG.signal.b + ',' + (0.5 + act * 0.5) + ')';
            } else {
                ctx.fillStyle = 'rgba(' + CONFIG.base.r + ',' + CONFIG.base.g + ',' + CONFIG.base.b + ',0.7)';
            }
            ctx.fill();

            // Faint outer ring on brighter nodes
            if (intensity > 0.15) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, r + 2 + intensity * 2, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(180,220,255,' + (intensity * 0.2) + ')';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    // ── Draw: data streams ──────────────────────────────
    function drawStreams() {
        for (var i = 0; i < streams.length; i++) {
            var s = streams[i];
            var g = ctx.createLinearGradient(s.x - s.len, s.y, s.x, s.y);
            g.addColorStop(0, 'rgba(140,220,255,0)');
            g.addColorStop(0.3, 'rgba(140,220,255,' + s.alpha + ')');
            g.addColorStop(1, 'rgba(140,220,255,0)');
            ctx.beginPath();
            ctx.moveTo(s.x - s.len, s.y);
            ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = g;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    // ── Draw: particles ─────────────────────────────────
    function drawParticles() {
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(100,160,255,' + p.alpha + ')';
            ctx.fill();
        }
    }

    // ── Draw: vignette ──────────────────────────────────
    function drawVignette() {
        var cx = W / 2, cy = H / 2;
        var outerR = Math.sqrt(cx * cx + cy * cy);
        var g = ctx.createRadialGradient(cx, cy, outerR * 0.35, cx, cy, outerR);
        g.addColorStop(0, 'rgba(10,10,26,0)');
        g.addColorStop(1, 'rgba(10,10,26,0.55)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    // ── Utility ─────────────────────────────────────────
    function lerp(a, b, t) { return a + (b - a) * t; }

    // ── Bootstrap ───────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
