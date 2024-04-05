"use strict";

window.addEventListener("load", init);

//#region CONTROLLER

function init() {
	console.log("Js kører");
	initModel();
	initBoard();
}
//#endregion

//#region VIEW
function initBoard() {
	const board = document.getElementById("board");
	for (let i = 7; i >= 0; i--) {
		for (let j = 0; j < 8; j++) {
			const newCell = document.createElement("div");
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
//#endregion

//#region MODEL
class Piece {
	constructor(color = "", value = "", row = 0, col = 0, icon) {
		this.color = color;
		this.value = value;
		this.row = row;
		this.col = col;
		this.icon = icon;
	}
}

const model = [];
function initModel() {
	let row = [];
	row.push(new Piece("w", "r", 0, 0, "Chess_pieces/WhiteRook.png"));
	row.push(new Piece("w", "kn", 0, 1, "Chess_pieces/WhiteKnight.png"));
	row.push(new Piece("w", "s", 0, 2, "Chess_pieces/WhiteBishop.png"));
	row.push(new Piece("w", "k", 0, 3, "Chess_pieces/WhiteKing.png"));
	row.push(new Piece("w", "q", 0, 4, "Chess_pieces/WhiteQueen.png"));
	row.push(new Piece("w", "s", 0, 5, "Chess_pieces/WhiteBishop.png"));
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
	row.push(new Piece("b", "r", 7, 0, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "kn", 7, 1, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "s", 7, 2, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "k", 7, 3, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "q", 7, 4, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "s", 7, 5, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "kn", 7, 6, "Chess_pieces/BlackPawn.png"));
	row.push(new Piece("b", "r", 7, 7, "Chess_pieces/BlackPawn.png"));
	model.push(row);
	row = [];
	row.push(new Piece("b", "p", 6, 0, "Chess_pieces/BlackRook.png"));
	row.push(new Piece("b", "p", 6, 1, "Chess_pieces/BlackKnight.png"));
	row.push(new Piece("b", "p", 6, 2, "Chess_pieces/BlackBishop.png"));
	row.push(new Piece("b", "p", 6, 3, "Chess_pieces/BlackKing.png"));
	row.push(new Piece("b", "p", 6, 4, "Chess_pieces/BlackQueen.png"));
	row.push(new Piece("b", "p", 6, 5, "Chess_pieces/BlackBishop.png"));
	row.push(new Piece("b", "p", 6, 6, "Chess_pieces/BlackKnight.png"));
	row.push(new Piece("b", "p", 6, 7, "Chess_pieces/BlackRook.png"));
	model.push(row);
}

//#endregion
