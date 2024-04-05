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
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			const newCell = document.createElement("div");
			newCell.classList.add("cell");
			(i + 1 * 8 + j) % 2 === 0
				? newCell.classList.add("black")
				: newCell.classList.add("white");
			newCell.textContent = `${model[i][j].color}${model[i][j].value}`;
			board.appendChild(newCell);
		}
	}
}
//#endregion

//#region MODEL
class Piece {
	constructor(color = "", value = "", row = 0, col = 0) {
		this.color = color;
		this.value = value;
		this.row = row;
		this.col = col;
	}
}

const model = [];
function initModel() {
	let row = [];
	row.push(new Piece("w", "r", 0, 0));
	row.push(new Piece("w", "kn", 0, 1));
	row.push(new Piece("w", "s", 0, 2));
	row.push(new Piece("w", "k", 0, 3));
	row.push(new Piece("w", "q", 0, 4));
	row.push(new Piece("w", "s", 0, 5));
	row.push(new Piece("w", "kn", 0, 6));
	row.push(new Piece("w", "r", 0, 7));
	model.push(row);
	row = [];
	row.push(new Piece("w", "p", 1, 0));
	row.push(new Piece("w", "p", 1, 1));
	row.push(new Piece("w", "p", 1, 2));
	row.push(new Piece("w", "p", 1, 3));
	row.push(new Piece("w", "p", 1, 4));
	row.push(new Piece("w", "p", 1, 5));
	row.push(new Piece("w", "p", 1, 6));
	row.push(new Piece("w", "p", 1, 7));
	model.push(row);
	for (let i = 0; i < 4; i++) {
		row = [];
		for (let j = 0; j < 8; j++) {
			row.push(new Piece());
		}
		model.push(row);
	}
	row = [];
	row.push(new Piece("b", "p", 6, 0));
	row.push(new Piece("b", "p", 6, 1));
	row.push(new Piece("b", "p", 6, 2));
	row.push(new Piece("b", "p", 6, 3));
	row.push(new Piece("b", "p", 6, 4));
	row.push(new Piece("b", "p", 6, 5));
	row.push(new Piece("b", "p", 6, 6));
	row.push(new Piece("b", "p", 6, 7));
	model.push(row);
	row = [];
	row.push(new Piece("b", "r", 7, 0));
	row.push(new Piece("b", "kn", 7, 1));
	row.push(new Piece("b", "s", 7, 2));
	row.push(new Piece("b", "k", 7, 3));
	row.push(new Piece("b", "q", 7, 4));
	row.push(new Piece("b", "s", 7, 5));
	row.push(new Piece("b", "kn", 7, 6));
	row.push(new Piece("b", "r", 7, 7));
	model.push(row);
}

//#endregion
