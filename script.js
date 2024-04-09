"use strict";

window.addEventListener("load", init);

//#region CONTROLLER

let chosenPiece;

function init() {
	console.log("Js kører");
	initModel();
	showBoard();
	board.addEventListener("click", (event) => handleClicks(event));
}

function handleClicks(event) {
	const cell = event.target;
	if (cell.classList.contains("cell")) {
		if (cell.classList.contains("highlight")) {
			movePieceInModel(chosenPiece, cell);
			showBoard();
		} else {
			document
				.querySelectorAll(".highlight")
				.forEach((cell) => cell.classList.remove("highlight"));
			const index = event.target.getAttribute("data-index");
			chosenPiece = model[Math.floor(index / 8)][index % 8];
			console.log(chosenPiece);
			let moves = getAvailableMoves(chosenPiece);
			moves.forEach((move) => highlightMove(move));
		}
	}
}
//#endregion

//#region VIEW
function showBoard() {
	const board = document.getElementById("board");
	board.innerHTML = "";
	//Count down as css draws from top to bottom, and we want white to be bottom
	for (let i = 7; i >= 0; i--) {
		for (let j = 0; j < 8; j++) {
			let index = i * 8 + j;
			const newCell = document.createElement("div");
			newCell.setAttribute("data-index", index);
			//newCell.textContent = `${model[i][j].color}${model[i][j].value}`;
			newCell.classList.add("cell");
			(i + 1 * 8 + j) % 2 === 0
				? newCell.classList.add("black")
				: newCell.classList.add("white");
			if (model[i][j].icon != null) {
				newCell.style.backgroundImage = `url(${model[i][j].icon})`;
				newCell.style.backgroundSize = "cover";
			}
			board.appendChild(newCell);
		}
	}
}

function highlightMove(move) {
	const index = 63 - (7 - move[1]) - move[0] * 8;
	const cells = document.querySelectorAll(".cell");
	cells[index].classList.add("highlight");
}
//#endregion

//#region MODEL
class Piece {
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
function initModel() {
	let row = [];
	row.push(new Piece("w", "r", 0, 0, "Chess_pieces/WhiteRook.png"));
	row.push(new Piece("w", "kn", 0, 1, "Chess_pieces/WhiteKnight.png"));
	row.push(new Piece("w", "b", 0, 2, "Chess_pieces/WhiteBishop.png"));
	row.push(new Piece("w", "k", 0, 3, "Chess_pieces/WhiteKing.png"));
	row.push(new Piece("w", "q", 0, 4, "Chess_pieces/WhiteQueen.png"));
	row.push(new Piece("w", "b", 0, 5, "Chess_pieces/WhiteBishop.png"));
	row.push(new Piece("w", "kn", 0, 6, "Chess_pieces/WhiteKnight.png"));
	row.push(new Piece("w", "r", 0, 7, "Chess_pieces/WhiteRook.png"));
	model.push(row);
	row = [];
	row.push(new Piece("w", "p", 1, 0, "Chess_pieces/WhitePawn.png"));
	row.push(new Piece("w", "p", 1, 1, "Chess_pieces/WhitePawn.png"));
	row.push(new Piece("w", "p", 1, 2, "Chess_pieces/WhitePawn.png"));
	row.push(new Piece("w", "p", 1, 3, "Chess_pieces/WhitePawn.png"));
	row.push(new Piece("w", "p", 1, 4, "Chess_pieces/WhitePawn.png"));
	row.push(new Piece("w", "p", 1, 5, "Chess_pieces/WhitePawn.png"));
	row.push(new Piece("w", "p", 1, 6, "Chess_pieces/WhitePawn.png"));
	row.push(new Piece("w", "p", 1, 7, "Chess_pieces/WhitePawn.png"));
	model.push(row);
	for (let i = 0; i < 4; i++) {
		row = [];
		for (let j = 0; j < 8; j++) {
			row.push(new Piece());
		}
		model.push(row);
	}
	row = [];
	row.push(new Piece("b", "p", 6, 0, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "p", 6, 1, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "p", 6, 2, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "p", 6, 3, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "p", 6, 4, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "p", 6, 5, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "p", 6, 6, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "p", 6, 7, "Chess_pieces/BlackPawn.png"));
	model.push(row);
	row = [];
	row.push(new Piece("b", "r", 7, 0, "Chess_pieces/BlackRook.png"));
	row.push(new Piece("b", "kn", 7, 1, "Chess_pieces/BlackKnight.png"));
	row.push(new Piece("b", "b", 7, 2, "Chess_pieces/BlackBishop.png"));
	row.push(new Piece("b", "k", 7, 3, "Chess_pieces/BlackKing.png"));
	row.push(new Piece("b", "q", 7, 4, "Chess_pieces/BlackQueen.png"));
	row.push(new Piece("b", "b", 7, 5, "Chess_pieces/BlackBishop.png"));
	row.push(new Piece("b", "kn", 7, 6, "Chess_pieces/BlackKnight.png"));
	row.push(new Piece("b", "r", 7, 7, "Chess_pieces/BlackRook.png"));
	model.push(row);
}

function getAvailableMoves(piece) {
	let moves = [];
	switch (piece.value) {
		case "p":
			if (piece.color === "b") {
				if (model[piece.row - 1][piece.col].value === "") {
					moves.push([-1, 0]);
					if (
						piece.moves === 0 &&
						model[piece.row - 2][piece.col].value === ""
					) {
						moves.push([-2, 0]);
					}
				}
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
				if (
					piece.col + colCounter != 0 &&
					model[piece.row + rowCounter][piece.col + colCounter - 1].color !==
						"" &&
					model[piece.row + rowCounter][piece.col + colCounter - 1].color !==
						piece.color
				) {
					moves.push([rowCounter, colCounter - 1]);
				}
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
			break;
		}
		case "kn": {
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
	moves = moves.map((move) => {
		move[0] += piece.row;
		move[1] += piece.col;
		return move;
	});
	console.log(moves);
	return moves;
}

function movePieceInModel(piece, cell) {
	const index = cell.getAttribute("data-index");
	const modelCpy = model.map((element) => ({ ...element }));
	modelCpy[piece.row][piece.col] = new Piece();
	piece.row = Math.floor(index / 8);
	piece.col = index % 8;
	modelCpy[piece.row][piece.col] = piece;
	model = modelCpy.map((element) => ({ ...element }));
	piece.moves++;
}

//#endregion
