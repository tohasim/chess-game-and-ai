"use strict";

window.addEventListener("load", init);

//#region CONTROLLER

// Currently chosen piece
let chosenPiece;

//White player starts
let currentPlayer = "w";
let moveCounter = 0;
let gameOver = false;

function init() {
	// Initialize model
	setModelState();
	// Render model to view
	showBoard();
	// Listen for clicks
	board.addEventListener("click", (event) => handleClicks(event));
	document.getElementById("game-state-button").addEventListener("click", () => {
		const fen = document.getElementById("game-state-input").value;
		setModelState(fen);
		showBoard();
	});
}
function handleClicks(event) {
	// Get clicked element, and check whether it's a cell
	const cell = event.target;
	if (cell.classList.contains("cell") && gameOver === false) {
		// If the clicked cell is highlighted we move there
		if (cell.classList.contains("highlight")) {
			//Get index from cell
			const index = cell.getAttribute("data-index");
			movePieceInModel(chosenPiece, index);
			showBoard();
			moveCounter++;
			showMoveCounter();
			//console.log(chosenPiece);
			if (checkCheck(chosenPiece)) {
				checkMate();
			}
		}
		// Otherwise we get the selected piece from the model, and highlight its available moves
		else {
			document
				.querySelectorAll(".highlight")
				.forEach((cell) => cell.classList.remove("highlight"));
			const index = event.target.getAttribute("data-index");
			chosenPiece = model[Math.floor(index / 8)][index % 8];
			let moves = getAvailableMoves(chosenPiece);
			moves.forEach((move) => highlightMove(move));
		}
	}
	if (moveCounter === 100) {
		$("#exampleModalToggle").modal("show");
		gameOver = true;
		document.getElementById("center-button").style.display = "flex";
		showHowManyTimesEachPieceHasMoved();
	}
}

//#endregion

//#region VIEW
function showBoard() {
	// Get the board container div, remove current board
	const board = document.getElementById("board");
	board.innerHTML = "";
	//Count down as css draws from top to bottom, and we want white to be bottom
	for (let i = 7; i >= 0; i--) {
		for (let j = 0; j < 8; j++) {
			// Get the current index, and create new div with the index as data-index attribute
			let index = i * 8 + j;
			const newCell = document.createElement("div");
			newCell.setAttribute("data-index", index);
			// TODO: For debugging, could probably be removed
			//newCell.textContent = `${model[i][j].color}${model[i][j].value}`;
			newCell.classList.add("cell");
			// Create the chess pattern
			(i + 1 * 8 + j) % 2 === 0
				? newCell.classList.add("black")
				: newCell.classList.add("white");
			// If the model has a piece at current position
			if (model[i][j].icon != null) {
				// Insert the icon
				newCell.style.backgroundImage = `url(${model[i][j].icon})`;
				newCell.style.backgroundSize = "cover";
			}
			// Add new cell to board
			board.appendChild(newCell);
		}
	}
}

function highlightMove(move) {
	// Calculate which index we want to highlight, necessary since the board is upside down compared to the model
	const index = 63 - (7 - move[1]) - move[0] * 8;
	// Highlight the cell
	const cells = document.querySelectorAll(".cell");
	cells[index].classList.add("highlight");
}

function showMoveCounter() {
	let moveCounterElement = document.getElementById("moveCounter");
	moveCounterElement.textContent = "Move nr. " + moveCounter / 2;
}

function showHowManyTimesEachPieceHasMoved() {
	let pieceMovesHistory = document.getElementById("piece");
	let pluralOrSingle = "times";
	if (chosenPiece.moves === 1) {
		pluralOrSingle = "time";
	}
	const pieceMoves =
		chosenPiece.color +
		" " +
		chosenPiece.value +
		" has moved " +
		chosenPiece.moves +
		" " +
		pluralOrSingle;
	pieceMovesHistory.textContent = pieceMoves;
}

//#endregion

//#region MODEL
class Piece {
	// Constructor for the Piece class,
	constructor(color = "", value = "", row = 0, col = 0, icon) {
		this.color = color;
		this.value = value;
		this.row = row;
		this.col = col;
		this.icon = icon;
		this.moves = 0;
	}
}

let model = [];

function setModelState(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w") {
	model = [];
	const fenParts = fen.split(" ");
	const piecePlacement = fenParts[0];
	moveCounter =
		fenParts.length === 6 && fenParts[5] === "-" ? 0 : parseInt(fenParts[5]);
	const rows = piecePlacement.split("/");
	currentPlayer = fenParts[1] === "w" ? "w" : "b";

	for (let i = 7; i >= 0; i--) {
		const row = [];
		let j = 0;
		for (const char of rows[i]) {
			if (isNaN(char)) {
				// if char is a piece
				const color = char.toUpperCase() === char ? "w" : "b";
				const pieceType = char.toLowerCase();
				const imagePath = `Chess_pieces/${color.toUpperCase()}${pieceType.toUpperCase()}.png`;
				row.push(new Piece(color, pieceType, 7 - i, j, imagePath));
				j++;
			} else {
				for (let k = 0; k < parseInt(char); k++) {
					row.push(new Piece());
					j++;
				}
			}
		}
		model.push(row);
	}

	return model;
}

function getAvailableMoves(piece) {
	let moves = [];
	//Find out which piece we want to move
	switch (piece.value) {
		case "p":
			//Check whether pawn is black or white
			if (piece.color === "b") {
				//If the move is available, push move to list
				if (model[piece.row - 1][piece.col].value === "") {
					moves.push([-1, 0]);
					// If the pawn haven't been moved, we add an extra move
					if (
						piece.row === 6 &&
						piece.moves === 0 &&
						model[piece.row - 2][piece.col].value === ""
					) {
						moves.push([-2, 0]);
					}
				}
				//If there is an enemy at attacking positions, add them to move list
				if (
					piece.col !== 0 &&
					model[piece.row - 1][piece.col - 1].color === "w"
				) {
					moves.push([-1, -1]);
				}
				if (
					piece.col !== 7 &&
					model[piece.row - 1][piece.col + 1].color === "w"
				) {
					moves.push([-1, 1]);
				}
			} else {
				//Same as above, but for white pawns
				if (model[piece.row + 1][piece.col].value === "") {
					moves.push([1, 0]);
					if (
						piece.row === 1 &&
						piece.moves === 0 &&
						model[piece.row + 2][piece.col].value === ""
					) {
						moves.push([2, 0]);
					}
				}
				if (
					piece.col !== 0 &&
					model[piece.row + 1][piece.col - 1].color === "b"
				) {
					moves.push([1, -1]);
				}
				if (
					piece.col !== 7 &&
					model[piece.row + 1][piece.col + 1].color === "b"
				) {
					moves.push([1, 1]);
				}
			}
			break;
		case "r": {
			//Add all north moves
			let rowCounter = 0;
			let colCounter = 0;
			while (
				rowCounter + piece.row < 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter].value === ""
			) {
				rowCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter].color !==
					"" &&
				model[piece.row + rowCounter + 1][piece.col + colCounter].color !==
					piece.color
			) {
				moves.push([rowCounter + 1, colCounter]);
			}
			//Add all west moves
			rowCounter = 0;
			colCounter = 0;
			while (
				colCounter + piece.col > 0 &&
				model[piece.row + rowCounter][piece.col + colCounter - 1].value === ""
			) {
				colCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.col + colCounter != 0 &&
				model[piece.row + rowCounter][piece.col + colCounter - 1].color !==
					"" &&
				model[piece.row + rowCounter][piece.col + colCounter - 1].color !==
					piece.color
			) {
				moves.push([rowCounter, colCounter - 1]);
			}
			//Add all south moves
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row > 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter].value === ""
			) {
				rowCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter].color !==
					"" &&
				model[piece.row + rowCounter - 1][piece.col + colCounter].color !==
					piece.color
			) {
				moves.push([rowCounter - 1, colCounter]);
			}
			//Add all east moves
			rowCounter = 0;
			colCounter = 0;
			while (
				colCounter + piece.col < 7 &&
				model[piece.row + rowCounter][piece.col + colCounter + 1].value === ""
			) {
				colCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.col + colCounter != 7 &&
				model[piece.row + rowCounter][piece.col + colCounter + 1].color !==
					"" &&
				model[piece.row + rowCounter][piece.col + colCounter + 1].color !==
					piece.color
			) {
				moves.push([rowCounter, colCounter + 1]);
			}
			break;
		}
		case "kn": {
			// All available knight moves
			const offsets = [
				[-2, -1],
				[-2, 1],
				[-1, -2],
				[-1, 2],
				[1, -2],
				[1, 2],
				[2, -1],
				[2, 1],
			];
			//Check whether each move is valid
			offsets.forEach((offset) => {
				const newRow = piece.row + offset[0];
				const newCol = piece.col + offset[1];

				if (
					newRow >= 0 &&
					newRow <= 7 &&
					newCol >= 0 &&
					newCol <= 7 &&
					(model[newRow][newCol].value === "" ||
						(model[newRow][newCol].color !== "" &&
							model[newRow][newCol].color !== piece.color))
				) {
					moves.push([offset[0], offset[1]]);
				}
			});

			break;
		}
		case "b": {
			//This has same logic as rook, but just diagonally
			let rowCounter = 0;
			let colCounter = 0;
			while (
				rowCounter + piece.row < 7 &&
				colCounter + piece.col < 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter + 1].value ===
					""
			) {
				rowCounter++;
				colCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 7 &&
				piece.col + colCounter != 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter + 1].color !==
					"" &&
				model[piece.row + rowCounter + 1][piece.col + colCounter + 1].color !==
					piece.color
			) {
				moves.push([rowCounter + 1, colCounter + 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row < 7 &&
				colCounter + piece.col > 0 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter - 1].value ===
					""
			) {
				rowCounter++;
				colCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 7 &&
				piece.col + colCounter != 0 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter - 1].color !==
					"" &&
				model[piece.row + rowCounter + 1][piece.col + colCounter - 1].color !==
					piece.color
			) {
				moves.push([rowCounter + 1, colCounter - 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row > 0 &&
				colCounter + piece.col > 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter - 1].value ===
					""
			) {
				rowCounter--;
				colCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 0 &&
				piece.col + colCounter != 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter - 1].color !==
					"" &&
				model[piece.row + rowCounter - 1][piece.col + colCounter - 1].color !==
					piece.color
			) {
				moves.push([rowCounter - 1, colCounter - 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row > 0 &&
				colCounter + piece.col < 7 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter + 1].value ===
					""
			) {
				rowCounter--;
				colCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 0 &&
				piece.col + colCounter != 7 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter + 1].color !==
					"" &&
				model[piece.row + rowCounter - 1][piece.col + colCounter + 1].color !==
					piece.color
			) {
				moves.push([rowCounter - 1, colCounter + 1]);
			}
			break;
		}
		case "k": {
			//All available king moves
			const offsets = [
				[0, -1],
				[1, -1],
				[1, 0],
				[1, 1],
				[0, 1],
				[-1, 1],
				[-1, 0],
				[-1, -1],
			];
			//Check if each move is valid
			offsets.forEach((offset) => {
				const newRow = piece.row + offset[0];
				const newCol = piece.col + offset[1];

				if (
					newRow >= 0 &&
					newRow <= 7 &&
					newCol >= 0 &&
					newCol <= 7 &&
					(model[newRow][newCol].value === "" ||
						(model[newRow][newCol].color !== "" &&
							model[newRow][newCol].color !== piece.color))
				) {
					moves.push([offset[0], offset[1]]);
				}
			});

			break;
		}
		case "q": {
			//Just a combination of rooks and bishops code
			let rowCounter = 0;
			let colCounter = 0;
			while (
				rowCounter + piece.row < 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter].value === ""
			) {
				rowCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter].color !==
					"" &&
				model[piece.row + rowCounter + 1][piece.col + colCounter].color !==
					piece.color
			) {
				moves.push([rowCounter + 1, colCounter]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				colCounter + piece.col > 0 &&
				model[piece.row + rowCounter][piece.col + colCounter - 1].value === ""
			) {
				colCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.col + colCounter != 0 &&
				model[piece.row + rowCounter][piece.col + colCounter - 1].color !==
					"" &&
				model[piece.row + rowCounter][piece.col + colCounter - 1].color !==
					piece.color
			) {
				moves.push([rowCounter, colCounter - 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row > 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter].value === ""
			) {
				rowCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter].color !==
					"" &&
				model[piece.row + rowCounter - 1][piece.col + colCounter].color !==
					piece.color
			) {
				moves.push([rowCounter - 1, colCounter]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				colCounter + piece.col < 7 &&
				model[piece.row + rowCounter][piece.col + colCounter + 1].value === ""
			) {
				colCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.col + colCounter != 7 &&
				model[piece.row + rowCounter][piece.col + colCounter + 1].color !==
					"" &&
				model[piece.row + rowCounter][piece.col + colCounter + 1].color !==
					piece.color
			) {
				moves.push([rowCounter, colCounter + 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row < 7 &&
				colCounter + piece.col < 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter + 1].value ===
					""
			) {
				rowCounter++;
				colCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 7 &&
				piece.col + colCounter != 7 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter + 1].color !==
					"" &&
				model[piece.row + rowCounter + 1][piece.col + colCounter + 1].color !==
					piece.color
			) {
				moves.push([rowCounter + 1, colCounter + 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row < 7 &&
				colCounter + piece.col > 0 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter - 1].value ===
					""
			) {
				rowCounter++;
				colCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 7 &&
				piece.col + colCounter != 0 &&
				model[piece.row + rowCounter + 1][piece.col + colCounter - 1].color !==
					"" &&
				model[piece.row + rowCounter + 1][piece.col + colCounter - 1].color !==
					piece.color
			) {
				moves.push([rowCounter + 1, colCounter - 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row > 0 &&
				colCounter + piece.col > 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter - 1].value ===
					""
			) {
				rowCounter--;
				colCounter--;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 0 &&
				piece.col + colCounter != 0 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter - 1].color !==
					"" &&
				model[piece.row + rowCounter - 1][piece.col + colCounter - 1].color !==
					piece.color
			) {
				moves.push([rowCounter - 1, colCounter - 1]);
			}
			rowCounter = 0;
			colCounter = 0;
			while (
				rowCounter + piece.row > 0 &&
				colCounter + piece.col < 7 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter + 1].value ===
					""
			) {
				rowCounter--;
				colCounter++;
				moves.push([rowCounter, colCounter]);
			}
			if (
				piece.row + rowCounter != 0 &&
				piece.col + colCounter != 7 &&
				model[piece.row + rowCounter - 1][piece.col + colCounter + 1].color !==
					"" &&
				model[piece.row + rowCounter - 1][piece.col + colCounter + 1].color !==
					piece.color
			) {
				moves.push([rowCounter - 1, colCounter + 1]);
			}
			break;
		}
	}
	//Convert relative moves to acutal indexes
	moves = moves.map((move) => {
		move[0] += piece.row;
		move[1] += piece.col;
		return move;
	});
	return moves;
}

function movePieceInModel(piece, index) {
	//Make a copy of the current model
	const modelCpy = model.map((element) => ({ ...element }));
	//Remove piece from it's current position
	modelCpy[piece.row][piece.col] = new Piece();
	//Update piece attributes
	piece.row = Math.floor(index / 8);
	piece.col = index % 8;
	//Add piece to it's new position, based on the updated attributes
	modelCpy[piece.row][piece.col] = piece;
	//Update the real model
	model = modelCpy.map((element) => ({ ...element }));
	//Add a move to the piece
	piece.moves++;
}

function checkCheck(piece) {
	const opponentKing = getKing(currentPlayer === "w" ? "b" : "w");
	var moves = JSON.stringify(getAvailableMoves(piece));
	var kingPosition = JSON.stringify([opponentKing.row, opponentKing.col]);
	if (moves.indexOf(kingPosition) !== -1) {
		console.log("Checked");
		return true;
	}
	return false;
}

// Deep copy function for objects
function deepCopy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

function checkMate() {
	// Loop through each enemy piece
	// If a piece have a move that removes the check, return false
	// If no piece have a move that removes the check, return true
	const pieces = getAllPiecesOfColor(currentPlayer === "w" ? "b" : "w");
	for (let piece of pieces) {
		const moves = getAvailableMoves(piece);
		for (const move of moves) {
			const pieceCpy = deepCopy(piece);
			const modelCpy = deepCopy(model);
			movePieceInModel(piece, move[0] * 8 + move[1]);
			if (!checkIfKingIsChecked(currentPlayer === "w" ? "b" : "w")) {
				model = modelCpy;
				piece = pieceCpy;
				return false;
			}
			model = modelCpy;
			piece = pieceCpy;
		}
	}
	console.log("Checkmate");
	return true;
}

function checkIfKingIsChecked(color) {
	const king = getKing(color);
	const pieces = getAllPiecesOfColor(color === "w" ? "b" : "w");
	for (const piece of pieces) {
		const moves = getAvailableMoves(piece);
		for (const move of moves) {
			if (move[0] === king.row && move[1] === king.col) {
				return true;
			}
		}
	}
	return false;
}

function getAllPiecesOfColor(color) {
	const pieces = [];
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (model[i][j].color === color) {
				pieces.push(model[i][j]);
			}
		}
	}
	return pieces;
}

function getKing(color) {
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if (model[i][j].value === "k" && model[i][j].color === color) {
				return model[i][j];
			}
		}
	}
}
//#endregion
