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
	initModel();
	// Render model to view
	showBoard();
	// Listen for clicks
	board.addEventListener("click", (event) => handleClicks(event));
}

function handleClicks(event) {
	// Get clicked element, and check whether it's a cell
	const cell = event.target;
	if (cell.classList.contains("cell") && gameOver === false) {
		// If the clicked cell is highlighted we move there
		if (cell.classList.contains("highlight")) {
			movePieceInModel(chosenPiece, cell);
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
	let whitePieceMovesHistory = document.getElementById("whitePiece");
	let blackPieceMovesHistory = document.getElementById("blackPiece");

	//WhitePiece Loop
	for (let i = 0; i < whitePieces.length; i++) {
		const piece = whitePieces[i];
		console.log(whitePieces[i])
		let pluralOrSingle = "times";
		if (chosenPiece.moves === 1) {
			pluralOrSingle = "time";
		}

		const pieceMoves =
			"white " +
			piece.value +
			" has moved " +
			piece.moves +
			" " +
			pluralOrSingle;

		let pieceMovesItem = document.createElement("li");
		pieceMovesItem.textContent = pieceMoves;
		whitePieceMovesHistory.appendChild(pieceMovesItem);
	}

	//BlackPiece Loop
	for (let i = 0; i < blackPieces.length; i++) {
		const piece = blackPieces[i];
		console.log(blackPieces[i])
		let pluralOrSingle = "times";
		if (chosenPiece.moves === 1) {
			pluralOrSingle = "time";
		}

		const pieceMoves =
			"black " +
			piece.value +
			" has moved " +
			piece.moves +
			" " +
			pluralOrSingle;

		let pieceMovesItem = document.createElement("li");
		pieceMovesItem.textContent = pieceMoves;
		blackPieceMovesHistory.appendChild(pieceMovesItem);
	}

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
const blackPieces = [];
const whitePieces = [];

function initModel() {
	// 1st row should be white officers
	let row = []; 

	const whiteRook1 = new Piece("w", "r", 0, 0, "Chess_pieces/WhiteRook.png");
	row.push(whiteRook1);
	whitePieces.push(whiteRook1);

	const whiteKnight1 = new Piece("w", "kn", 0, 1, "Chess_pieces/WhiteKnight.png");
	row.push(whiteKnight1);
	whitePieces.push(whiteKnight1)

	const whiteBishop1 = new Piece("w", "b", 0, 2, "Chess_pieces/WhiteBishop.png");
	row.push(whiteBishop1);
	whitePieces.push(whiteBishop1);

	const whiteKing = new Piece("w", "k", 0, 3, "Chess_pieces/WhiteKing.png");
	row.push(whiteKing);
	whitePieces.push(whiteKing);

	const whiteQueen = new Piece("w", "q", 0, 4, "Chess_pieces/WhiteQueen.png");
	row.push(whiteQueen);
	whitePieces.push(whiteQueen);

	const whiteBishop2 = new Piece("w", "b", 0, 5, "Chess_pieces/WhiteBishop.png")
	row.push(whiteBishop2);
	whitePieces.push(whiteBishop2);

	const whiteKnight2 = new Piece("w", "kn", 0, 6, "Chess_pieces/WhiteKnight.png");
	row.push(whiteKnight2);
	whitePieces.push(whiteKnight2);

	const whiteRook2 = new Piece("w", "r", 0, 7, "Chess_pieces/WhiteRook.png");
	row.push(whiteRook2);
	whitePieces.push(whiteRook2);

	model.push(row);
	// Then the white pawns
	row = [];

	const whitePawn1 = new Piece("w", "p", 1, 0, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn1);
	whitePieces.push(whitePawn1);

	const whitePawn2 = new Piece("w", "p", 1, 1, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn2);
	whitePieces.push(whitePawn2);

	const whitePawn3 = new Piece("w", "p", 1, 2, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn3);
	whitePieces.push(whitePawn3);

	const whitePawn4 = new Piece("w", "p", 1, 3, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn4);
	whitePieces.push(whitePawn4);

	const whitePawn5 = new Piece("w", "p", 1, 4, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn5);
	whitePieces.push(whitePawn5);

	const whitePawn6 = new Piece("w", "p", 1, 5, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn6);
	whitePieces.push(whitePawn6);

	const whitePawn7 = new Piece("w", "p", 1, 6, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn7);
	whitePieces.push(whitePawn7);

	const whitePawn8 = new Piece("w", "p", 1, 7, "Chess_pieces/WhitePawn.png");
	row.push(whitePawn8);
	whitePieces.push(whitePawn8);
	
	model.push(row);
	// Then 4 empty rows
	for (let i = 0; i < 4; i++) {
		row = [];
		for (let j = 0; j < 8; j++) {
			row.push(new Piece());
		}
		model.push(row);
	}
	//Black pawns
	row = [];

	const blackPawn1 = new Piece("b", "p", 6, 0, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn1);
	blackPieces.push(blackPawn1);
	
	const blackPawn2 = new Piece("b", "p", 6, 1, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn2);
	blackPieces.push(blackPawn2);
	
	const blackPawn3 = new Piece("b", "p", 6, 2, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn3);
	blackPieces.push(blackPawn3);
	
	const blackPawn4 = new Piece("b", "p", 6, 3, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn4);
	blackPieces.push(blackPawn4);
	
	const blackPawn5 = new Piece("b", "p", 6, 4, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn5);
	blackPieces.push(blackPawn5);
	
	const blackPawn6 = new Piece("b", "p", 6, 5, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn6);
	blackPieces.push(blackPawn6);
	
	const blackPawn7 = new Piece("b", "p", 6, 6, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn7);
	blackPieces.push(blackPawn7);
	
	const blackPawn8 = new Piece("b", "p", 6, 7, "Chess_pieces/BlackPawn.png");
	row.push(blackPawn8);
	blackPieces.push(blackPawn8);
	
	model.push(row);
	// Black officers
	row = [];

	const blackRook1 = new Piece("b", "r", 7, 0, "Chess_pieces/BlackRook.png");
	row.push(blackRook1);
	blackPieces.push(blackRook1);

	const blackKnight1 = new Piece("b", "kn", 7, 1, "Chess_pieces/BlackKnight.png");
	row.push(blackKnight1);
	blackPieces.push(blackKnight1);

	const blackBishop1 = new Piece("b", "b", 7, 2, "Chess_pieces/BlackBishop.png");
	row.push(blackBishop1);
	blackPieces.push(blackBishop1);

	const blackKing = new Piece("b", "k", 7, 3, "Chess_pieces/BlackKing.png");
	row.push(blackKing);
	blackPieces.push(blackKing);

	const blackQueen = new Piece("b", "q", 7, 4, "Chess_pieces/BlackQueen.png");
	row.push(blackQueen);
	blackPieces.push(blackQueen);

	const blackBishop2 = new Piece("b", "b", 7, 5, "Chess_pieces/BlackBishop.png");
	row.push(blackBishop2);
	blackPieces.push(blackBishop2);

	const blackKnight2 = new Piece("b", "kn", 7, 6, "Chess_pieces/BlackKnight.png");
	row.push(blackKnight2);
	blackPieces.push(blackKnight2);

	const blackRook2 = new Piece("b", "r", 7, 7, "Chess_pieces/BlackRook.png");
	row.push(blackRook2);
	blackPieces.push(blackRook2);

	model.push(row);
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

function movePieceInModel(piece, cell) {
	//Get index from cell
	const index = cell.getAttribute("data-index");
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
	console.log(model);
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

function checkMate() {
	// Check all moves the enemy can make
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			const piece = model[i][j];
			if (piece.color !== currentPlayer) {
				const moves = getAvailableMoves(piece);
				for (const move of moves) {
					const targetPiece = model[move[0]][move[1]];
					// Simulate the move
					const originalPiece = model[piece.row][piece.col];
					model[piece.row][piece.col] = new Piece();
					model[move[0]][move[1]] = piece;
					piece.row = move[0];
					piece.col = move[1];
					// Check if the move removes the check
					if (!checkCheck(getKing(currentPlayer))) {
						// Undo the move
						model[piece.row][piece.col] = originalPiece;
						model[move[0]][move[1]] = targetPiece;
						piece.row = i;
						piece.col = j;
						return false;
					}
					// Undo the move
					model[piece.row][piece.col] = originalPiece;
					model[move[0]][move[1]] = targetPiece;
					piece.row = i;
					piece.col = j;
				}
			}
		}
	}
	return true;
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
