/*!
=========================================================
* Chess Puzzle - Progressive difficulty puzzles
* For Marcos Rodrigo's portfolio
=========================================================
*/
(function() {
    'use strict';

    // ── Puzzle Collection (curated from the Lichess puzzle database) ──
    // Ten puzzles of increasing rating (~740 → ~2480) and varied tactical
    // motifs: hanging piece, smothered mate, fork, discovered attack,
    // attraction, pin, skewer, sacrifice + promotion, mate in 3, mate in 4.
    // Moves with auto:true are opponent responses played automatically.
    var PUZZLES = [
        {
            // Puzzle 1 (Lichess 27K6c, rating 737) — Bxd2
            fen: '4r1k1/pp4bp/6p1/8/8/4B1QP/PP1q2PK/8 w - - 0 36',
            solution: [
                { from: 'e3', to: 'd2' }
            ],
            orientation: 'white',
            difficulty: 1,
            hint: 'An enemy piece is undefended. Win it.'
        },
        {
            // Puzzle 2 (Lichess 1TPIP, rating 850) — Nf7#
            fen: 'r1b3nk/1q1p2pp/p1nB3N/1p2p3/4P3/2P5/P1P2PPP/R3K2R w KQ - 0 20',
            solution: [
                { from: 'h6', to: 'f7' }
            ],
            orientation: 'white',
            difficulty: 2,
            hint: 'The king is hemmed in by its own pieces. A knight delivers the blow.'
        },
        {
            // Puzzle 3 (Lichess 0NBOG, rating 1050) — Ne6+ Kf7 Nxd8+
            fen: 'r1bq1b1r/pp1n2kp/2pp1np1/6N1/4P3/5Q2/PB3PPP/RN3RK1 w - - 4 12',
            solution: [
                { from: 'g5', to: 'e6' },
                { from: 'g7', to: 'f7', auto: true },
                { from: 'e6', to: 'd8' }
            ],
            orientation: 'white',
            difficulty: 3,
            hint: 'Find a single move that attacks two targets at once.'
        },
        {
            // Puzzle 4 (Lichess 0JTkd, rating 1250) — Nxe4 fxe4 Qxg5+
            fen: 'r2qrbk1/1pp2ppp/p1np1n2/6B1/2BPN3/5P2/PPP2QPP/2KR3R b - - 3 15',
            solution: [
                { from: 'f6', to: 'e4' },
                { from: 'f3', to: 'e4', auto: true },
                { from: 'd8', to: 'g5' }
            ],
            orientation: 'black',
            difficulty: 4,
            hint: 'Move one piece to unleash an attack from the piece behind it.'
        },
        {
            // Puzzle 5 (Lichess 0guSM, rating 1450) — Rh2+ Kxh2 Qg2#
            fen: '5Bk1/p1p3p1/8/3p2q1/3Qp3/1P2P2p/P4Pr1/2R2R1K b - - 0 28',
            solution: [
                { from: 'g2', to: 'h2' },
                { from: 'h1', to: 'h2', auto: true },
                { from: 'g5', to: 'g2' }
            ],
            orientation: 'black',
            difficulty: 5,
            hint: 'Lure the enemy king or piece onto a fatal square.'
        },
        {
            // Puzzle 6 (Lichess 0UN6k, rating 1650) — Rxd6 Qxd6 Bb4
            fen: '5k2/p2q2p1/2pbRn2/1p6/3P3p/PQ5P/KPPB2P1/5r2 w - - 0 31',
            solution: [
                { from: 'e6', to: 'd6' },
                { from: 'd7', to: 'd6', auto: true },
                { from: 'd2', to: 'b4' }
            ],
            orientation: 'white',
            difficulty: 6,
            hint: 'A defending piece cannot move. Pile on the pressure.'
        },
        {
            // Puzzle 7 (Lichess 0Z9Kk, rating 1803) — Rxf1+ Ke8 Qg8+ Kd7 Qxb8
            fen: '1r3k2/1b2p2p/pq1p2pP/2p3P1/2Q5/8/PPP5/2KR1r2 w - - 0 32',
            solution: [
                { from: 'd1', to: 'f1' },
                { from: 'f8', to: 'e8', auto: true },
                { from: 'c4', to: 'g8' },
                { from: 'e8', to: 'd7', auto: true },
                { from: 'g8', to: 'b8' }
            ],
            orientation: 'white',
            difficulty: 7,
            hint: 'Attack a valuable piece so that capturing it is forced, winning what stands behind.'
        },
        {
            // Puzzle 8 (Lichess 1DjQh, rating 1999) — Ne6+ Nxe6 c2 Nd4 c1=Q+
            fen: '8/4k3/8/2n1P3/3N1K2/2p5/8/8 b - - 1 58',
            solution: [
                { from: 'c5', to: 'e6' },
                { from: 'd4', to: 'e6', auto: true },
                { from: 'c3', to: 'c2' },
                { from: 'e6', to: 'd4', auto: true },
                { from: 'c2', to: 'c1', promotion: 'q' }
            ],
            orientation: 'black',
            difficulty: 8,
            hint: 'Give up material to open the path to a decisive attack.'
        },
        {
            // Puzzle 9 (Lichess 319Aa, rating 2201) — Rh2+ Kd3 Rg3+ Kc4 Rc2#
            fen: '8/pp6/4Qbk1/1B1Pp1p1/PP2Pp2/8/4K3/3R2rr b - - 1 39',
            solution: [
                { from: 'h1', to: 'h2' },
                { from: 'e2', to: 'd3', auto: true },
                { from: 'g1', to: 'g3' },
                { from: 'd3', to: 'c4', auto: true },
                { from: 'h2', to: 'c2' }
            ],
            orientation: 'black',
            difficulty: 9,
            hint: 'Forced mate in three.'
        },
        {
            // Puzzle 10 (Lichess 2uekG, rating 2483) — g4+ Kh4 Rh2+ Kg5 Bh6+ Kg6 Rg8#
            fen: '3r4/6b1/p1N1kn2/Pp1p2p1/1P1P4/3QB1NK/2r5/1R3R2 b - - 0 41',
            solution: [
                { from: 'g5', to: 'g4' },
                { from: 'h3', to: 'h4', auto: true },
                { from: 'c2', to: 'h2' },
                { from: 'h4', to: 'g5', auto: true },
                { from: 'g7', to: 'h6' },
                { from: 'g5', to: 'g6', auto: true },
                { from: 'd8', to: 'g8' }
            ],
            orientation: 'black',
            difficulty: 10,
            hint: 'Forced mate in four.'
        }
    ];

    var board = null;
    var game = null;
    var currentPuzzle = 0;
    var puzzleSolved = false;
    var selectedSquare = null;
    var moveIndex = 0;
    var waitingForAuto = false;  // True while an auto-response is being animated

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

        // Click handler for empty squares (pieces are handled by onDrop)
        boardEl.addEventListener('click', function(e) {
            var squareEl = e.target.closest('[data-square]');
            if (!squareEl) return;
            var sq = squareEl.getAttribute('data-square');
            if (selectedSquare && sq) {
                handleSquareClick(sq);
            }
        });

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
        moveIndex = 0;
        waitingForAuto = false;
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

        selectedSquare = null;
        clearSelection();
        updateInfo();
        clearFeedback();
    }

    function updateInfo() {
        var puzzle = PUZZLES[currentPuzzle];
        var infoEl = document.getElementById('chess-info');
        if (infoEl) {
            var sideToMove = game.turn() === 'w' ? 'White' : 'Black';
            infoEl.innerHTML = '<span class="chess-difficulty chess-difficulty-level-' + puzzle.difficulty + '">Level ' +
                puzzle.difficulty + '</span> &mdash; Puzzle ' + (currentPuzzle + 1) + '/' + PUZZLES.length +
                '<br><small class="text-muted">' + sideToMove + ' to move. Find the best move!</small>';
        }
    }

    function onDragStart(source, piece) {
        if (puzzleSolved) return false;
        if (game.game_over()) return false;
        if (waitingForAuto) return false;

        var turn = game.turn();
        var isOwn = (turn === 'w' && piece.search(/^w/) !== -1) ||
                    (turn === 'b' && piece.search(/^b/) !== -1);

        // If we have a selected piece and click on an opponent's piece,
        // treat it as a move attempt (capture)
        if (selectedSquare && !isOwn) {
            handleSquareClick(source);
            return false;
        }

        // Don't allow dragging opponent's pieces
        if (!isOwn) return false;

        // Clear selection when starting a real drag
        clearHintArrow();
    }

    function onDrop(source, target) {
        if (waitingForAuto) return 'snapback';

        // Click detection: user clicked a piece without dragging
        if (source === target) {
            handleSquareClick(source);
            return 'snapback';
        }

        // Real drag-and-drop move
        clearHintArrow();
        clearSelection();
        selectedSquare = null;

        return tryMove(source, target);
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    // ── Shared move attempt logic ────
    function tryMove(from, to) {
        var puzzle = PUZZLES[currentPuzzle];
        var expectedMove = puzzle.solution[moveIndex];
        if (!expectedMove) {
            return 'snapback';
        }

        if (from === expectedMove.from && to === expectedMove.to) {
            var move = game.move({
                from: from,
                to: to,
                promotion: expectedMove.promotion || 'q'
            });

            if (move === null) return 'snapback';

            moveIndex++;

            // Check if puzzle is complete
            if (moveIndex >= puzzle.solution.length) {
                onPuzzleSolved();
            } else {
                // Check if the next move is an auto-response
                var nextMove = puzzle.solution[moveIndex];
                if (nextMove && nextMove.auto) {
                    showFeedback('Good move!', 'success');
                    playAutoResponse();
                } else {
                    showFeedback('Good move! Continue...', 'success');
                    updateInfo();
                }
            }
            return;  // Accept the drop
        }

        showFeedback('Not quite. Try again!', 'error');
        return 'snapback';
    }

    // ── Play opponent's auto-response move ────
    function playAutoResponse() {
        var puzzle = PUZZLES[currentPuzzle];
        var autoMove = puzzle.solution[moveIndex];
        if (!autoMove || !autoMove.auto) return;

        waitingForAuto = true;

        setTimeout(function() {
            var move = game.move({
                from: autoMove.from,
                to: autoMove.to,
                promotion: autoMove.promotion || 'q'
            });

            if (move) {
                board.position(game.fen());
                moveIndex++;

                // Check if puzzle is complete after auto-response
                if (moveIndex >= puzzle.solution.length) {
                    waitingForAuto = false;
                    onPuzzleSolved();
                } else {
                    waitingForAuto = false;
                    showFeedback('Your turn!', 'success');
                    updateInfo();
                }
            } else {
                waitingForAuto = false;
            }
        }, 600);
    }

    // ── Puzzle completion ────
    function onPuzzleSolved() {
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
    }

    // ── Click-to-move handling logic ────
    function handleSquareClick(square) {
        if (puzzleSolved) return;
        if (game.game_over()) return;
        if (waitingForAuto) return;

        var puzzle = PUZZLES[currentPuzzle];
        var piece = game.get(square);
        var turn = game.turn();
        var isOwn = piece && piece.color === turn;

        if (selectedSquare) {
            if (square === selectedSquare) {
                // Click same square — deselect
                clearSelection();
                selectedSquare = null;
                return;
            }

            // If clicking another own piece, re-select it
            if (isOwn) {
                clearSelection();
                selectedSquare = square;
                highlightSquare(square);
                return;
            }

            // Try the move via click
            clearHintArrow();
            var result = tryMove(selectedSquare, square);
            if (result !== 'snapback') {
                // Move succeeded — update board
                board.position(game.fen());
            }
            clearSelection();
            selectedSquare = null;
        } else {
            // No piece selected yet — select one if it's the right color
            if (isOwn) {
                selectedSquare = square;
                highlightSquare(square);
            }
        }
    }

    function highlightSquare(square) {
        clearSelection();
        var el = document.querySelector('#chess-board [data-square="' + square + '"]');
        if (el) el.classList.add('chess-square-selected');
    }

    function clearSelection() {
        var els = document.querySelectorAll('.chess-square-selected');
        for (var i = 0; i < els.length; i++) {
            els[i].classList.remove('chess-square-selected');
        }
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

        var overlay = document.createElement('div');
        overlay.className = 'chess-victory-overlay';
        overlay.innerHTML =
            '<div class="chess-victory-trophy">&#9813;</div>' +
            '<div class="chess-victory-title">Grandmaster!</div>' +
            '<div class="chess-victory-subtitle">You solved all ' + PUZZLES.length + ' puzzles</div>';

        var boardEl = document.getElementById('chess-board');
        if (boardEl) {
            boardEl.style.position = 'relative';
            boardEl.appendChild(overlay);
            requestAnimationFrame(function() {
                overlay.classList.add('visible');
            });
        }

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
        if (waitingForAuto) return;
        clearHintArrow();

        var puzzle = PUZZLES[currentPuzzle];
        var boardEl = document.getElementById('chess-board');
        if (!boardEl) return;

        var boardRect = boardEl.getBoundingClientRect();
        var size = boardRect.width;
        var sqSize = size / 8;

        function squareToXY(sq) {
            var file = sq.charCodeAt(0) - 97;
            var rank = parseInt(sq[1], 10) - 1;
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

        // Show arrow for the current expected move (skip auto moves)
        var currentMove = puzzle.solution[moveIndex];
        if (!currentMove || currentMove.auto) return;

        var from = squareToXY(currentMove.from);
        var to = squareToXY(currentMove.to);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'chess-hint-arrow');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);

        var dx = to.x - from.x;
        var dy = to.y - from.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        var nx = dx / len;
        var ny = dy / len;
        var px = -ny;
        var py = nx;

        var bodyW = sqSize * 0.13;
        var headW = sqSize * 0.3;
        var headL = sqSize * 0.6;
        var margin = sqSize * 0.2;

        var sx = from.x + nx * margin;
        var sy = from.y + ny * margin;
        var bx = to.x - nx * (headL + margin * 0.3);
        var by = to.y - ny * (headL + margin * 0.3);
        var tx = to.x - nx * margin * 0.3;
        var ty = to.y - ny * margin * 0.3;

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
