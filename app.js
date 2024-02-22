document.addEventListener('DOMContentLoaded', () => {
	const grid = document.querySelector('.grid');
	const width = 10;
	let nextRandom = 0;
	let squares = Array.from(document.querySelectorAll('.grid div'));
	const scoreDisplay = document.querySelector('#score');
	const gameOverDisplay = document.querySelector('#gameOver');
	const startBtn = document.querySelector('#start');
	const startAgain = document.querySelector('#startAgain');
	const mute = document.querySelector('#mute');
	const nextMusic = document.querySelector('#nextMusic');
	let timerId;
	let score = 0;
	const colors = [
		'Orchid',
		'OrangeRed',
		'RoyalBlue',
		'SandyBrown',
		'LightSalmon',
	];
	const levelDisplay = document.getElementById('levelDisplay');
	const hiScoreLine = document.getElementById('hiScoreLine');
	const tap = document.getElementById('tap');
	const mainContainer = document.querySelector('.mainContainer');
	let level = 0;

	//=================TOUCH CTRLS==================

	const leftBtn = document.getElementById('leftBtn');
	const rotateBtn = document.getElementById('rotateBtn');
	const rightBtn = document.getElementById('rightBtn');
	const downBtn = document.getElementById('downBtn');

	//========================SOUNDS==========================
	const ambient = document.getElementById('ambient');
	const ambient2 = document.getElementById('ambient2');
	const ambient3 = document.getElementById('ambient3');
	const over = document.getElementById('over');
	const levelUp = document.getElementById('levelUp');
	const lineFill = document.getElementById('lineFill');

	//The tetrominos
	const lTetromino = [
		[1, width + 1, width * 2 + 1, 2],
		[width, width + 1, width + 2, width * 2 + 2],
		[1, width + 1, width * 2 + 1, width * 2],
		[width, width * 2, width * 2 + 1, width * 2 + 2],
	];

	const zTetromino = [
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1],
		[0, width, width + 1, width * 2 + 1],
		[width + 1, width + 2, width * 2, width * 2 + 1],
	];

	const tTetromino = [
		[1, width, width + 1, width + 2],
		[1, width + 1, width + 2, width * 2 + 1],
		[width, width + 1, width + 2, width * 2 + 1],
		[1, width, width + 1, width * 2 + 1],
	];

	const oTetromino = [
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
		[0, 1, width, width + 1],
	];

	const iTetromino = [
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
		[1, width + 1, width * 2 + 1, width * 3 + 1],
		[width, width + 1, width + 2, width + 3],
	];

	const theTetrominoes = [
		lTetromino,
		zTetromino,
		tTetromino,
		oTetromino,
		iTetromino,
	];

	//random tetrominos
	let currentPosition = 4;
	let currentRotation = 0;

	let random = Math.floor(Math.random() * theTetrominoes.length);
	// console.log(random);

	let current = theTetrominoes[random][currentRotation];
	// console.log(current);

	//draw
	function draw() {
		current.forEach(index => {
			squares[currentPosition + index].classList.add('tetromino');
			squares[currentPosition + index].style.backgroundColor = colors[random];
		});
	}

	draw();

	//undraw
	function undraw() {
		current.forEach(index => {
			squares[currentPosition + index].classList.remove('tetromino');
			squares[currentPosition + index].style.backgroundColor = '';
		});
	}

	//go down
	function moveDown() {
		undraw();
		currentPosition += width;
		draw();
		freeze();
	}

	//freeze
	function freeze() {
		if (
			current.some(index =>
				squares[currentPosition + index + width].classList.contains('taken'),
			)
		) {
			current.forEach(index =>
				squares[currentPosition + index].classList.add('taken'),
			);
			//anther tetromino falling
			random = nextRandom;
			nextRandom = Math.floor(Math.random() * theTetrominoes.length);
			current = theTetrominoes[random][currentRotation];
			currentPosition = 4;
			addScore();
			draw();
			displayShape();
			gameOver();
		}
	}

	function quickDown(e) {
		if (e.keyCode === 40 || e.target === downBtn) {
			moveDown();
		}
	}

	//left border for theTetrominoes and moveLeft
	function moveLeft() {
		undraw();
		const isAtLeftEdge = current.some(
			index => (currentPosition + index) % width === 0,
		);
		if (!isAtLeftEdge) {
			currentPosition -= 1;
		}
		if (
			current.some(index =>
				squares[currentPosition + index].classList.contains('taken'),
			)
		) {
			currentPosition += 1;
		}
		draw();
	}

	//right border for theTetrominoes and moveRight
	function moveRight() {
		undraw();
		const isAtRightEdge = current.some(
			index => (currentPosition + index) % width === width - 1,
		);
		if (!isAtRightEdge) {
			currentPosition += 1;
		}
		if (
			current.some(index =>
				squares[currentPosition + index].classList.contains('taken'),
			)
		) {
			currentPosition -= 1;
		}
		draw();
	}

	//rotate
	function rotate() {
		undraw();
		currentRotation++;
		if (currentRotation === current.length) {
			currentRotation = 0;
		}
		current = theTetrominoes[random][currentRotation];
		draw();
	}

	//assign functions to keyCodes
	document.addEventListener('keyup', control);
	document.addEventListener('click', control);
	document.addEventListener('keydown', quickDown);

	let doubleTouchStartTimestamp = 0;
	document.addEventListener('touchstart', function (e) {
		let now = +new Date();
		if (doubleTouchStartTimestamp + 500 > now) {
			e.preventDefault();
		}
		doubleTouchStartTimestamp = now;
	});

	function control(e) {
		tap.play();

		if (
			e.keyCode === 37 || // Left arrow key
			(e.target === leftBtn && e.type === 'click')
		) {
			moveLeft();
		} else if (
			e.keyCode === 38 || // Up arrow key
			(e.target === rotateBtn && e.type === 'click')
		) {
			rotate();
		} else if (
			e.keyCode === 39 || // Right arrow key
			(e.target === rightBtn && e.type === 'click')
		) {
			moveRight();
		} else if (
			e.keyCode === 40 || // Down arrow key
			(e.target === downBtn && e.type === 'click')
		) {
			moveDown();
		}
	}

	//show next
	const displaySquares = document.querySelectorAll('.mini-grid div');
	const displayWidth = 4;
	const displayIndex = 0;

	//Tetrominoes without rotations
	const upNextTetrominoes = [
		[1, displayWidth + 1, displayWidth * 2 + 1, 2], //L
		[0, displayWidth, displayWidth + 1, displayWidth * 2 + 1], //Z
		[1, displayWidth, displayWidth + 1, displayWidth + 2], //T
		[0, 1, displayWidth, displayWidth + 1], //O
		[1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1], //I
	];

	//display next
	function displayShape() {
		displaySquares.forEach(square => {
			square.classList.remove('tetromino');
			square.style.backgroundColor = '';
		});
		upNextTetrominoes[nextRandom].forEach(index => {
			displaySquares[displayIndex + index].classList.add('tetromino');
			displaySquares[displayIndex + index].style.backgroundColor =
				colors[nextRandom];
		});
	}

	//ambient
	const ambientMusic = [ambient, ambient2, ambient3];
	let ambIdx = 0;

	//next music
	nextMusic.addEventListener('click', () => {
		ambientMusic[ambIdx].muted = true;
		ambIdx = ambIdx + 1;
		if (ambIdx === ambientMusic.length) {
			ambIdx = 0;
		}
		ambientMusic[ambIdx].muted = false;
		ambientMusic[ambIdx].play();
	});

	//add score
	function addScore() {
		for (let i = 0; i < 199; i += width) {
			const row = [
				i,
				i + 1,
				i + 2,
				i + 3,
				i + 4,
				i + 5,
				i + 6,
				i + 7,
				i + 8,
				i + 9,
			];

			if (row.every(index => squares[index].classList.contains('taken'))) {
				score += 10;
				scoreDisplay.innerHTML = score;

				if ((score += 10)) {
					lineFill.play();
				}

				//=====================LEVELS=================================
				const levelUpFunc = () => {
					clearInterval(timerId);
					levelUp.play();
					levelDisplay.innerHTML = level += 1;
				};

				if (score === 100) {
					levelUpFunc();
					timerId = setInterval(moveDown, 900);
					ambientMusic[ambIdx].playbackRate = 1.1;
				}
				if (score === 200) {
					levelUpFunc();
					timerId = setInterval(moveDown, 800);
					ambientMusic[ambIdx].playbackRate = 1.2;
				}
				if (score === 300) {
					levelUpFunc();
					timerId = setInterval(moveDown, 700);
					ambientMusic[ambIdx].playbackRate = 1.3;
				}
				if (score === 400) {
					levelUpFunc();
					timerId = setInterval(moveDown, 600);
					ambientMusic[ambIdx].playbackRate = 1.4;
				}
				if (score === 500) {
					levelUpFunc();
					timerId = setInterval(moveDown, 500);
					ambientMusic[ambIdx].playbackRate = 1.5;
				}
				if (score === 600) {
					levelUpFunc();
					timerId = setInterval(moveDown, 400);
					ambientMusic[ambIdx].playbackRate = 1.6;
				}
				if (score === 700) {
					levelUpFunc();
					timerId = setInterval(moveDown, 300);
					ambientMusic[ambIdx].playbackRate = 1.7;
				}
				if (score === 800) {
					levelUpFunc();
					timerId = setInterval(moveDown, 200);
					ambientMusic[ambIdx].playbackRate = 1.8;
				}
				if (score === 900) {
					levelUpFunc();
					timerId = setInterval(moveDown, 100);
					ambientMusic[ambIdx].playbackRate = 1.9;
				}
				if (score === 1000) {
					levelUpFunc();
					timerId = setInterval(moveDown, 50);
					ambientMusic[ambIdx].playbackRate = 2;
				}
				//=====================LEVELS END=================================

				row.forEach(index => {
					squares[index].classList.remove('taken');
					squares[index].classList.remove('tetromino');
					squares[index].style.backgroundColor = '';
				});
				const squaresRemoved = squares.splice(i, width);

				squares = squaresRemoved.concat(squares);
				squares.forEach(cell => grid.appendChild(cell));
			}
		}
	}

	//colorize display
	let color = 0;
	setInterval(() => {
		color = color + (1 % 360);
		gameOverDisplay.style.color = 'hsl(' + color + ', 100%, 50%)';
	}, 50);

	//Game over
	function gameOver() {
		if (
			current.some(index =>
				squares[currentPosition + index].classList.contains('taken'),
			)
		) {
			gameOverDisplay.innerHTML = 'GAME OVER';
			clearInterval(timerId);
			ambientMusic[ambIdx].pause();
			over.play();

			//HI SCORE
			localStorage.getItem('score') > score
				? localStorage.setItem('score', localStorage.getItem('score'))
				: localStorage.setItem('score', score);
		}
		setTimeout(() => {
			over.pause();
		}, 10000);
	}
	hiScoreLine.innerHTML = localStorage.getItem('score');

	//start/pause
	startBtn.addEventListener('click', () => {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
			gameOverDisplay.innerHTML = 'GAME PAUSED';
			ambientMusic[ambIdx].pause();
		} else {
			draw();
			timerId = setInterval(moveDown, 1000);
			nextRandom = Math.floor(Math.random() * theTetrominoes.length);
			displayShape();
			gameOverDisplay.innerHTML = 'GAME STARTED';
			ambientMusic[ambIdx].play();
		}
	});

	startAgain.addEventListener('click', () => {
		window.location.reload();
	});

	//mute
	mute.addEventListener('click', () => {
		if (!levelUp.muted) {
			levelUp.muted = true;
			lineFill.muted = true;
			tap.muted = true;
			ambientMusic[ambIdx].muted = true;

			mute.textContent = 'Muted';
			mute.style.textDecoration = 'line-through';
			mainContainer.style.backgroundImage = 'url("./images/bg.jpg")';
		} else {
			levelUp.muted = false;
			lineFill.muted = false;
			tap.muted = false;
			ambientMusic[ambIdx].muted = false;

			mute.textContent = 'Mute';
			mute.style.textDecoration = 'none';
			mainContainer.style.backgroundImage = 'url("./images/bg.png")';
		}
	});

	//END
});
