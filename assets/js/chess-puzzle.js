/*!
=========================================================
* Chess Puzzle - Progressive difficulty puzzles
* For Marcos Rodrigo's portfolio
=========================================================
*/
(function() {
    'use strict';

    // ── Puzzle Collection (increasing difficulty) ──────
    var PUZZLES = [
        {
            // Puzzle 1 - Easy: Back rank mate in 1
            // White Rook delivers mate on the back rank
            fen: '6k1/5ppp/8/8/8/8/5PPP/R3K3 w - - 0 1',
            solutionFrom: 'a1',
            solutionTo: 'a8',
            orientation: 'white',
            difficulty: 'Easy',
            hint: 'The back rank is undefended!'
        },
        {
            // Puzzle 2 - Easy: Knight fork winning the queen
            fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 5',
            solutionFrom: 'f3',
            solutionTo: 'g5',
            orientation: 'white',
            difficulty: 'Easy',
            hint: 'Attack two pieces at once!'
        },
        {
            // Puzzle 3 - Intermediate: Smothered mate setup
            // White sacrifices queen then delivers knight mate
            fen: 'r5rk/5Npp/8/8/8/8/1Q3PPP/6K1 w - - 0 1',
            solutionFrom: 'b2',
            solutionTo: 'g7',
            orientation: 'white',
            difficulty: 'Intermediate',
            hint: 'A queen sacrifice leads to mate!'
        },
        {
            // Puzzle 4 - Intermediate: Fried Liver knight fork
            // Nxf7 forks the Black queen on d8 and rook on h8
            fen: 'r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6',
            solutionFrom: 'g5',
            solutionTo: 'f7',
            orientation: 'white',
            difficulty: 'Intermediate',
            hint: 'The f7 square is weak — exploit it with a fork!'
        },
        {
            // Puzzle 5 - Hard: Morphy's Opera Game queen sacrifice
            // Qb8+! Nxb8 Rd8# — a legendary combination
            fen: '4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w - - 0 16',
            solutionFrom: 'b3',
            solutionTo: 'b8',
            orientation: 'white',
            difficulty: 'Hard',
            hint: 'Think like Morphy! Sometimes the queen must be sacrificed.'
        }
    ];

    var board = null;
    var game = null;
    var currentPuzzle = 0;
    var puzzleSolved = false;

    function init() {
        var boardEl = document.getElementById('chess-board');
        if (!boardEl) return;

        loadPuzzle(0);

        var resetBtn = document.getElementById('chess-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetPuzzle);
        }

        var solutionBtn = document.getElementById('chess-solution');
        if (solutionBtn) {
            solutionBtn.addEventListener('click', showSolution);
        }

        $(window).on('resize', function() {
            if (board) board.resize();
        });
    }

    function loadPuzzle(index) {
        if (index >= PUZZLES.length) {
            showAllSolved();
            return;
        }

        currentPuzzle = index;
        puzzleSolved = false;
        var puzzle = PUZZLES[index];

        game = new Chess(puzzle.fen);

        var boardConfig = {
            draggable: true,
            position: puzzle.fen,
            orientation: puzzle.orientation,
            onDragStart: onDragStart,
            onDrop: onDrop,
            onSnapEnd: onSnapEnd,
            pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
        };

        if (board) {
            board.destroy();
        }
        board = Chessboard('chess-board', boardConfig);

        // Clean up any victory overlay or hint arrow from previous state
        var oldOverlay = document.querySelector('.chess-victory-overlay');
        if (oldOverlay) oldOverlay.parentNode.removeChild(oldOverlay);
        clearHintArrow();

        var solutionBtn = document.getElementById('chess-solution');
        if (solutionBtn) solutionBtn.style.display = '';

        updateInfo();
        clearFeedback();
    }

    function updateInfo() {
        var puzzle = PUZZLES[currentPuzzle];
        var infoEl = document.getElementById('chess-info');
        if (infoEl) {
            var sideToMove = puzzle.orientation === 'white' ? 'White' : 'Black';
            infoEl.innerHTML = '<span class="chess-difficulty chess-difficulty-' + puzzle.difficulty.toLowerCase() + '">' +
                puzzle.difficulty + '</span> &mdash; Puzzle ' + (currentPuzzle + 1) + '/' + PUZZLES.length +
                '<br><small class="text-muted">' + sideToMove + ' to move. Find the best move!</small>';
        }
    }

    function onDragStart(source, piece) {
        if (puzzleSolved) return false;
        if (game.game_over()) return false;

        var puzzle = PUZZLES[currentPuzzle];
        if (puzzle.orientation === 'white' && piece.search(/^b/) !== -1) return false;
        if (puzzle.orientation === 'black' && piece.search(/^w/) !== -1) return false;
    }

    function onDrop(source, target) {
        clearHintArrow();
        var puzzle = PUZZLES[currentPuzzle];

        if (source === puzzle.solutionFrom && target === puzzle.solutionTo) {
            var move = game.move({
                from: source,
                to: target,
                promotion: 'q'
            });

            if (move === null) return 'snapback';

            puzzleSolved = true;

            if (currentPuzzle < PUZZLES.length - 1) {
                showFeedback('Correct! Loading next puzzle...', 'success');
                setTimeout(function() {
                    loadPuzzle(currentPuzzle + 1);
                }, 2000);
            } else {
                showFeedback('Brilliant! You solved all puzzles!', 'success');
                showAllSolved();
            }
            return;
        }

        showFeedback('Not quite. Try again!', 'error');
        return 'snapback';
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    function showFeedback(message, type) {
        var feedbackEl = document.getElementById('chess-feedback');
        if (!feedbackEl) return;

        feedbackEl.innerHTML = '';
        var span = document.createElement('span');
        span.textContent = message;
        span.className = 'chess-feedback-msg chess-feedback-' + type;
        feedbackEl.appendChild(span);

        if (type === 'error') {
            setTimeout(function() {
                if (feedbackEl.contains(span)) {
                    span.style.opacity = '0';
                    setTimeout(function() {
                        if (feedbackEl.contains(span)) {
                            feedbackEl.removeChild(span);
                        }
                    }, 300);
                }
            }, 2000);
        }
    }

    function clearFeedback() {
        var feedbackEl = document.getElementById('chess-feedback');
        if (feedbackEl) feedbackEl.innerHTML = '';
    }

    function showAllSolved() {
        var infoEl = document.getElementById('chess-info');
        if (!infoEl || currentPuzzle < PUZZLES.length - 1 || !puzzleSolved) return;

        infoEl.innerHTML = '';

        var resetBtn = document.getElementById('chess-reset');
        if (resetBtn) {
            resetBtn.textContent = 'Restart All Puzzles';
            resetBtn.onclick = function() {
                resetBtn.textContent = 'Reset Puzzle';
                resetBtn.onclick = resetPuzzle;
                loadPuzzle(0);
            };
        }

        var solutionBtn = document.getElementById('chess-solution');
        if (solutionBtn) solutionBtn.style.display = 'none';

        launchCelebration();
    }

    // ── Celebration: confetti + trophy overlay ──────────
    function launchCelebration() {
        var card = document.querySelector('.chess-puzzle-card');
        if (!card) return;

        // Trophy overlay on top of the board
        var overlay = document.createElement('div');
        overlay.className = 'chess-victory-overlay';
        overlay.innerHTML =
            '<div class="chess-victory-trophy">&#9813;</div>' +
            '<div class="chess-victory-title">Grandmaster!</div>' +
            '<div class="chess-victory-subtitle">You solved all 5 puzzles</div>';

        var boardEl = document.getElementById('chess-board');
        if (boardEl) {
            boardEl.style.position = 'relative';
            boardEl.appendChild(overlay);
            // Trigger animation after a frame
            requestAnimationFrame(function() {
                overlay.classList.add('visible');
            });
        }

        // Confetti canvas scoped to the card
        card.style.position = 'relative';
        card.style.overflow = 'hidden';

        var canvas = document.createElement('canvas');
        canvas.className = 'chess-confetti-canvas';
        canvas.width = card.offsetWidth * (window.devicePixelRatio || 1);
        canvas.height = card.offsetHeight * (window.devicePixelRatio || 1);
        canvas.style.width = card.offsetWidth + 'px';
        canvas.style.height = card.offsetHeight + 'px';
        card.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;
        var W = canvas.width;
        var H = canvas.height;

        var colors = ['#F85C70', '#A3C14A', '#17a2b8', '#FFD700', '#A16AE8', '#FF8C42'];
        var pieces = [];
        var TOTAL = 80;

        for (var i = 0; i < TOTAL; i++) {
            pieces.push({
                x: W * 0.5 + (Math.random() - 0.5) * W * 0.3,
                y: H * 0.4,
                vx: (Math.random() - 0.5) * 14 * dpr,
                vy: (Math.random() * -12 - 4) * dpr,
                size: (Math.random() * 6 + 3) * dpr,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                shape: Math.random() < 0.4 ? 'circle' : (Math.random() < 0.5 ? 'rect' : 'star'),
                opacity: 1
            });
        }

        var gravity = 0.25 * dpr;
        var frame = 0;
        var maxFrames = 180;

        function animate() {
            frame++;
            ctx.clearRect(0, 0, W, H);

            for (var j = 0; j < pieces.length; j++) {
                var p = pieces[j];
                p.vy += gravity;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotSpeed;
                p.vx *= 0.99;

                if (frame > maxFrames * 0.6) {
                    p.opacity = Math.max(0, p.opacity - 0.02);
                }

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation * Math.PI / 180);
                ctx.fillStyle = p.color;

                if (p.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.shape === 'rect') {
                    ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
                } else {
                    drawStar(ctx, 0, 0, p.size);
                }

                ctx.restore();
            }

            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                canvas.parentNode.removeChild(canvas);
            }
        }

        function drawStar(c, cx, cy, r) {
            c.beginPath();
            for (var s = 0; s < 5; s++) {
                var angle = (s * 4 * Math.PI / 5) - Math.PI / 2;
                var method = s === 0 ? 'moveTo' : 'lineTo';
                c[method](cx + r * Math.cos(angle), cy + r * Math.sin(angle));
            }
            c.closePath();
            c.fill();
        }

        animate();
    }

    function showSolution() {
        if (puzzleSolved) return;
        clearHintArrow();

        var puzzle = PUZZLES[currentPuzzle];
        var boardEl = document.getElementById('chess-board');
        if (!boardEl) return;

        var boardRect = boardEl.getBoundingClientRect();
        var size = boardRect.width;
        var sqSize = size / 8;

        // Convert algebraic square (e.g. 'g5') to pixel center
        function squareToXY(sq) {
            var file = sq.charCodeAt(0) - 97; // a=0 .. h=7
            var rank = parseInt(sq[1], 10) - 1; // 1=0 .. 8=7
            var x, y;
            if (puzzle.orientation === 'white') {
                x = file * sqSize + sqSize / 2;
                y = (7 - rank) * sqSize + sqSize / 2;
            } else {
                x = (7 - file) * sqSize + sqSize / 2;
                y = rank * sqSize + sqSize / 2;
            }
            return { x: x, y: y };
        }

        var from = squareToXY(puzzle.solutionFrom);
        var to = squareToXY(puzzle.solutionTo);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'chess-hint-arrow');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

        // Lichess-style thick filled arrow shape
        var dx = to.x - from.x;
        var dy = to.y - from.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        var nx = dx / len;  // unit vector along arrow
        var ny = dy / len;
        var px = -ny;       // perpendicular vector
        var py = nx;

        var bodyW = sqSize * 0.13;  // shaft half-width
        var headW = sqSize * 0.3;   // arrowhead half-width
        var headL = sqSize * 0.6;   // arrowhead length
        var margin = sqSize * 0.2;  // inset from square centers

        // Shaft start (inset from source center)
        var sx = from.x + nx * margin;
        var sy = from.y + ny * margin;
        // Shaft end / arrowhead base (headL back from destination)
        var bx = to.x - nx * (headL + margin * 0.3);
        var by = to.y - ny * (headL + margin * 0.3);
        // Arrowhead tip (inset from destination center)
        var tx = to.x - nx * margin * 0.3;
        var ty = to.y - ny * margin * 0.3;

        // 7-point polygon: shaft (4 corners) + arrowhead (3 points)
        var points = [
            (sx + px * bodyW) + ',' + (sy + py * bodyW),
            (bx + px * bodyW) + ',' + (by + py * bodyW),
            (bx + px * headW) + ',' + (by + py * headW),
            tx + ',' + ty,
            (bx - px * headW) + ',' + (by - py * headW),
            (bx - px * bodyW) + ',' + (by - py * bodyW),
            (sx - px * bodyW) + ',' + (sy - py * bodyW)
        ].join(' ');

        svg.innerHTML =
            '<polygon points="' + points + '" fill="rgba(0, 140, 72, 0.65)"/>';

        boardEl.style.position = 'relative';
        boardEl.appendChild(svg);
    }

    function clearHintArrow() {
        var arrow = document.querySelector('.chess-hint-arrow');
        if (arrow) arrow.parentNode.removeChild(arrow);
    }

    function resetPuzzle() {
        loadPuzzle(currentPuzzle);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
