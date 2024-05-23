"use strict";

window.addEventListener("load", init);

//#region CONTROLLER

// Currently chosen piece
let chosenPiece;

//White player starts
let currentPlayer = "w";
let moveCounter = 0;
let fullMoveCounter = 1;
let gameOver = false;
let hasPawnMoved = false;
let hasPieceBeenCaptured = false;

function init() {
  // Initialize model
  setModelState();
  // Render model to view
  showBoard();
  initSearchModel();

  // Listen for clicks
  board.addEventListener("click", (event) => handleClicks(event));
  document.getElementById("game-state-button").addEventListener("click", () => {
    const fen = document.getElementById("game-state-input").value;
    setModelState(fen);
    showBoard();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function handleClicks(event) {
  // Get clicked element, and check whether it's a cell
  const cell = event.target;
  if (cell.classList.contains("cell") && gameOver === false) {
    // If the clicked cell is highlighted we move there
    if (cell.classList.contains("highlight")) {
      //Get index from cell
      const index = cell.getAttribute("data-index");
      if (chosenPiece.color === currentPlayer) {
        movePieceInModel(chosenPiece, index);
        showBoard();
        moveCounter++;
        showMoveCounter();
        if (checkCheck(chosenPiece)) {
          checkMate();
        }
        switchTurns();
      }
    }
    // Otherwise we get the selected piece from the model, and highlight its available moves
    else {
      document
        .querySelectorAll(".highlight")
        .forEach((cell) => cell.classList.remove("highlight"));
      const index = event.target.getAttribute("data-index");
      chosenPiece = model[Math.floor(index / 8)][index % 8];
      if (chosenPiece.color === currentPlayer) {
        let moves = getAvailableMoves(chosenPiece);
        moves.forEach((move) => highlightMove(move));
      } else {
        const notAllowedMessage = document.createElement("div");
        notAllowedMessage.textContent = "Not allowed";
        notAllowedMessage.id = "notAllowedMessage";
        document.body.appendChild(notAllowedMessage);

        setTimeout(() => {
          notAllowedMessage.style.opacity = 0;
          setTimeout(() => {
            notAllowedMessage.parentNode.removeChild(notAllowedMessage);
          }, 500);
        }, 600);
      }
    }
  }
  if (moveCounter === 100) {
    $("#exampleModalToggle").modal("show");
    gameOver = true;
    document.getElementById("center-button").style.display = "flex";
    document.getElementById("new-game").addEventListener("click", () => {
      const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w";
      setModelState(fen);
      showBoard();
      moveCounter = 0;
      showMoveCounter();
      gameOver = false;
      document.getElementById("center-button").style.display = "none";
    });
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
      //newCell.textContent = `${index}`;
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
      if (i == 0) {
        const text = document.createElement("div");
        text.textContent = String.fromCharCode(65 + j);
        text.classList.add("column-counter");
        text.classList.add("text-element");
        newCell.appendChild(text);
      }
      if (j == 0) {
        const text = document.createElement("div");
        text.textContent = i + 1;
        text.classList.add("row-counter");
        text.classList.add("text-element");
        newCell.appendChild(text);
      }
      // Add new cell to board
      board.appendChild(newCell);
    }
  }
}

function updateCapturedPieces(piece, targetPiece) {
  if (targetPiece) {
    const capturedPiecesContainer = document.getElementById(
      targetPiece.color === "w" ? "captured-white" : "captured-black"
    );
    const capturedPiece = document.createElement("img");
    capturedPiece.src = targetPiece.icon;
    capturedPiece.alt = `${targetPiece.color}_${targetPiece.value}`;
    capturedPiece.classList.add("captured-piece");
    capturedPiecesContainer.appendChild(capturedPiece);
    hasPieceBeenCaptured = true;
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
  moveCounterElement.textContent = "Move nr. " + Math.floor(moveCounter / 2);
  if (moveCounter === 100) {
    moveCounterElement.textContent = "Game over";
  }
}

const CHESS_PIECE_NAMES = {
  r: "Rook",
  n: "Knight",
  p: "Pawn",
  k: "King",
  q: "Queen",
  b: "Bishop",
};

function showHowManyTimesEachPieceHasMoved() {
  let whitePieceMovesHistory = document.getElementById("whitePiece");
  let blackPieceMovesHistory = document.getElementById("blackPiece");

  // WhitePiece Loop
  for (let i = 0; i < whitePieces.length; i++) {
    const piece = whitePieces[i];
    console.log(whitePieces[i]);
    let pluralOrSingle = piece.moves === 1 ? "time" : "times";

    const pieceMoves =
      `<span class="piece-icon"><img src="${piece.icon}" alt="${piece.value}"></span>` +
      ` white ${CHESS_PIECE_NAMES[piece.value]} has moved ${
        piece.moves
      } ${pluralOrSingle}`;

    let pieceMovesItem = document.createElement("li");
    pieceMovesItem.innerHTML = pieceMoves;
    whitePieceMovesHistory.appendChild(pieceMovesItem);
  }

  // BlackPiece Loop
  for (let i = blackPieces.length - 1; i >= 0; i--) {
    const piece = blackPieces[i];
    console.log(blackPieces[i]);
    let pluralOrSingle = piece.moves === 1 ? "time" : "times";

    const pieceMoves =
      `<span class="piece-icon"><img src="${piece.icon}" alt="${piece.value}"></span>` +
      ` black ${CHESS_PIECE_NAMES[piece.value]} has moved ${
        piece.moves
      } ${pluralOrSingle}`;

    let pieceMovesItem = document.createElement("li");
    pieceMovesItem.innerHTML = pieceMoves;
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
let availableCastling = "KQkq";
let availableEnPassant = "-";

function setModelState(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w") {
  model = [];
  const fenParts = fen.split(" ");
  const piecePlacement = fenParts[0];
  moveCounter =
    fenParts.length === 6 && fenParts[5] !== "-" ? parseInt(fenParts[5]) : 0;
  showMoveCounter();
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
        const piece = new Piece(color, pieceType, 7 - i, j, imagePath);
        row.push(piece);
        if (piece.color === "w") {
          whitePieces.push(piece);
        } else {
          blackPieces.push(piece);
        }

        j++;
      } else {
        for (let k = 0; k < parseInt(char); k++) {
          row.push(new Piece("", "", 7 - i, j, ""));
          j++;
        }
      }
    }
    model.push(row);
  }

  return model;
}

let castleMoves = [];
function getAvailableMoves(piece) {
  let moves = [];
  //Find out which piece we want to move
  switch (piece.value.toLowerCase()) {
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
        // en passant
        if (availableEnPassant != "-") {
          let coord = getCoordFromPositionString(availableEnPassant);
          let passantRow = coord.row;
          let passantCol = coord.col;
          if (passantRow === piece.row - 1 && passantCol === piece.col - 1) {
            moves.push([-1, -1]);
          } else if (
            passantRow === piece.row - 1 &&
            passantCol === piece.col + 1
          ) {
            moves.push([-1, 1]);
          }
        }
        // pawn promotion
        if (piece.row === 1) {
          moves = moves.map((move) => {
            move.push("q");
            return move;
          });
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
        // en passant
        if (availableEnPassant != "-") {
          let coord = getCoordFromPositionString(availableEnPassant);
          let passantRow = coord.row;
          let passantCol = coord.col;
          if (passantRow === piece.row + 1 && passantCol === piece.col - 1) {
            moves.push([1, -1]);
          } else if (
            passantRow === piece.row + 1 &&
            passantCol === piece.col + 1
          ) {
            moves.push([1, 1]);
          }
        }
        // pawn promotion
        if (piece.row === 6) {
          moves = moves.map((move) => {
            move.push("q");
            return move;
          });
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
    case "n": {
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
      // castling move check rook as well
      if (piece.moves === 0) {
        if (
          model[piece.row][0].moves === 0 &&
          model[piece.row][0].value.toLowerCase() === "r" &&
          model[piece.row][1].value === "" &&
          model[piece.row][2].value === "" &&
          model[piece.row][3].value === ""
        ) {
          moves.push([0, -2]);
          if (piece.color === "w") {
            castleMoves = castleMoves.filter((move) => move !== "wQ");
            castleMoves.push("wQ");
          } else {
            castleMoves = castleMoves.filter((move) => move !== "bq");
            castleMoves.push("bq");
          }
        }
        if (
          model[piece.row][7].moves === 0 &&
          model[piece.row][7].value.toLowerCase() === "r" &&
          model[piece.row][6].value === "" &&
          model[piece.row][5].value === ""
        ) {
          moves.push([0, 2]);
          if (piece.color === "w") {
            castleMoves = castleMoves.filter((move) => move !== "wK");
            castleMoves.push("wK");
          } else {
            castleMoves = castleMoves.filter((move) => move !== "bk");
            castleMoves.push("bk");
          }
        }
      }
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

function getCoordFromPositionString(positionString) {
  const col = positionString.charCodeAt(0) - 97;
  const row = parseInt(positionString.split("")[1] - 1);
  return { row, col };
}

function getPositionStringFromCoord(coord) {
  const row = coord[0];
  const col = coord[1];
  let letter = String.fromCharCode(97 + col);
  return `${letter}${row + 1}`;
}

function movePieceInModel(piece, index) {
  availableEnPassant = "-";
  //Make a copy of the current model
  const modelCpy = model.map((element) => [...element]);

  const targetPiece = model[Math.floor(index / 8)][index % 8];
  if (piece.value === "p" && Math.abs(targetPiece.row - piece.row) === 2) {
    if (piece.color === "w") {
      availableEnPassant = getPositionStringFromCoord([
        targetPiece.row - 1,
        targetPiece.col,
      ]);
    } else {
      availableEnPassant = getPositionStringFromCoord([
        targetPiece.row + 1,
        targetPiece.col,
      ]);
    }
  }
  if (targetPiece.value !== "") {
    updateCapturedPieces(piece, targetPiece);
  }
  //Remove piece from it's current position
  modelCpy[piece.row][piece.col] = new Piece();
  //Update piece attributes
  piece.row = Math.floor(index / 8);
  piece.col = index % 8;
  //Add piece to it's new position, based on the updated attributes
  modelCpy[piece.row][piece.col] = piece;
  //Update the real model
  model = modelCpy.map((element) => [...element]);
  //Add a move to the piece
  piece.moves++;
  // pawn promotion

  if (piece.value === "p") {
    hasPawnMoved = true;
  }

  checkIfMoveCounterCriteriaHasBeenFulFilled();

  if (piece.value === "p" && (piece.row === 0 || piece.row === 7)) {
    model[piece.row][piece.col].value = "q";
    if (piece.row === 0) {
      model[piece.row][piece.col].icon = "/Chess_pieces/BQ.png";
    } else {
      model[piece.row][piece.col].icon = "/Chess_pieces/WQ.png";
    }
  }
  // castling move. check castleMoves array for which rook to move
  // the big and small letters does the same, but indicate different color. consider deleting later.
  console.log(castleMoves, "castleMoves");
  if (piece.value.toLowerCase() === "k") {
    switch (parseInt(index)) {
      case 58:
        {
          model[piece.row][3] = model[piece.row][0];
          model[piece.row][3].col = 3;
          model[piece.row][0] = new Piece();
        }
        break;
      case 62:
        {
          model[piece.row][5] = model[piece.row][7];
          model[piece.row][5].col = 5;
          model[piece.row][7] = new Piece();
        }
        break;
      case 2:
        {
          model[piece.row][3] = model[piece.row][0];
          model[piece.row][3].col = 3;
          model[piece.row][0] = new Piece();
        }
        break;
      case 6:
        {
          model[piece.row][5] = model[piece.row][7];
          model[piece.row][5].col = 5;
          model[piece.row][7] = new Piece();
        }
        break;
    }
    castleMoves = [];
  }
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

function checkIfMoveCounterCriteriaHasBeenFulFilled() {
  if (hasPawnMoved === true && hasPieceBeenCaptured === true) {
    moveCounter = -1;
    hasPawnMoved = false;
    hasPieceBeenCaptured = false;
  }
}
function switchTurns() {
  currentPlayer = currentPlayer === "w" ? "b" : "w";

  const currColor = currentPlayer === "w" ? "white" : "black";
  const turnElement = document.getElementById("playerTurn");
  turnElement.textContent = currColor;
  turnElement.style.color = currColor;
  turnElement.style.textShadow =
    currColor === "white"
      ? "2px 2px 4px rgb(150, 150, 150)"
      : "2px 2px 4px #000000";
  if (currentPlayer === "b" && document.getElementById("ai-switch").checked) {
    sleep(10).then(() => {
      let bestMove = getBestMove();
      let bestPiece =
        model[bestMove.lastMove.piece.row][bestMove.lastMove.piece.col];
      let bestIndex = bestMove.lastMove.newRow * 8 + bestMove.lastMove.newCol;
      movePieceInModel(bestPiece, bestIndex);
      showBoard();
      moveCounter++;
      showMoveCounter();
      if (checkCheck(chosenPiece)) {
        checkMate();
      }
      switchTurns();
    });
  }
}
//#endregion

//#region AI
class GameState {
  constructor(
    searchModel,
    player = currentPlayer,
    castling = availableCastling,
    enPassant = availableEnPassant,
    halfMove = moveCounter,
    fullMove = fullMoveCounter
  ) {
    this.searchModel = searchModel;
    this.player = player;
    this.castling = castling;
    this.enPassant = enPassant;
    this.halfMove = halfMove;
    this.fullMove = fullMove;
    this.score = 0;
    this.whitePieces = [];
    this.blackPieces = [];
    this.lastMove = null;
    this.whiteKingPosition = null;
    this.blackKingPosition = null;
  }
}

function isAttacked(position, gameState) {
  if (gameState.player === "b") {
    // //check for pawn attacks
    const pawnAttacks = [
      [1, 1],
      [1, -1],
    ];
    for (const attack of pawnAttacks) {
      if (gameState.searchModel[attack[0] + position.row][attack[1] + position.col] === "P") {
        return true;
      }
    }
   
    //check for knight attacks
    const knightAttacks = getKnightMoves(position, gameState);
    for (const attack of knightAttacks) {
      if (gameState.searchModel[attack[0]][attack[1]] === "N") {
        return true;
      }
    }
    //check for bishop attacks
    const bishopAttacks = getBishopMoves(gameState, position.row, position.col);

    if (bishopAttacks) {
      for (const attack of bishopAttacks) {
        console.log(
          gameState.searchModel[position.row + attack[0]][
            position.col + attack[1]
          ]
        );
        if (
          gameState.searchModel[position.row + attack[0]][
            position.col + attack[1]
          ] === "B"
        ) {
          return true;
        }
      }
    }
    //check for rook attacks
    const rookAttacks = getRookMoves(gameState, position.row, position.col);
    for (const attack of rookAttacks) {
      if (gameState.searchModel[attack[0]][attack[1]] === "R") {
        return true;
      }
    }
    //check for queen attacks
    const queenAttacks = getQueenMoves(gameState, position.row, position.col);
    for (const attack of queenAttacks) {
      if (gameState.searchModel[attack[0]][attack[1]] === "Q") {
        return true;
      }
    }

  } else {
    //check for pawn attacks
    let pawnAttacks = [
      [-1, 1],
      [-1, -1],
    ];

      for (const attack of pawnAttacks) {
        if (gameState.searchModel[attack[0] + position.row][attack[1] + position.col] === "p") {
          return true;
        }
      }
   
    //check for knight attacks
    const knightAttacks = getKnightMoves(position, gameState);
    for (const attack of knightAttacks) {
      if (gameState.searchModel[attack[0]][attack[1]] === "n") {
        return true;
      }
    }
    //check for bishop attacks
    const bishopAttacks = getBishopMoves(gameState, position.row, position.col);
    if (bishopAttacks) {
      for (const attack of bishopAttacks) {
        if (
          gameState.searchModel[position.row + attack[0]][
            position.col + attack[1]
          ] === "b"
        ) {
          return true;
        }
      }
    }
    //check for rook attacks
    const rookAttacks = getRookMoves(gameState, position.row, position.col);
    for (const attack of rookAttacks) {
      if ( gameState.searchModel[attack[0] + position.row][attack[1] + position.col] === "r") {
        return true;
      }
    }
    //check for queen attacks
    const queenAttacks = getQueenMoves(gameState, position.row, position.col);
    for (const attack of queenAttacks) {
      if (gameState.searchModel[attack[0] + position.row][attack[1] + position.col] === "q") {
        return true;
      }
    }
  }
}

function checkForCheckedKing(gameState, color) {
  //get the king position and check if checked
  const kingPosition =
    color === "w" ? gameState.whiteKingPosition : gameState.blackKingPosition;
  return isAttacked(kingPosition, gameState);
}

let gameState = null;

function initSearchModel() {
  let searchModel = [];
  let whitePieces = [];
  let blackPieces = [];
  let whiteKingPosition = null;
  let blackKingPosition = null;
  model.forEach((row) => {
    searchModel.push(
      row.map((cell) => {
        let value = cell.value;
        if (cell.color === "w") {
          value = cell.value.toUpperCase();
          whitePieces.push({ value: value, row: cell.row, col: cell.col });
          if (value === "K") {
            whiteKingPosition = { row: cell.row, col: cell.col };
          }
        } else if (cell.color === "b") {
          blackPieces.push({ value: value, row: cell.row, col: cell.col });
          if (value === "k") {
            blackKingPosition = { row: cell.row, col: cell.col };
          }
        }
        return value;
      })
    );
  });
  gameState = new GameState(searchModel);
  gameState.whitePieces = whitePieces;
  gameState.blackPieces = blackPieces;
  gameState.whiteKingPosition = whiteKingPosition;
  gameState.blackKingPosition = blackKingPosition;
  gameState.score = staticEvaluation(gameState);
}

function getBestMove() {
  let bestMove = null;
  initSearchModel();
  const startTime = new Date().getTime();
  const endTime = startTime + 15000;
  let depth = 1;
  let maxDepth = 14;
  while (depth <= maxDepth && endTime > new Date().getTime()) {
    bestMove = alphaBeta(gameState, -Infinity, Infinity, depth, false, endTime);
    depth++;
  }
  console.log(depth - 1);
  return bestMove.state;
}

// function checkForCheckedKing(game, color) {
//   const kingPosition =
//     color === "w" ? game.whiteKingPosition : game.blackKingPosition;
//   const children = getAllChildrenStates(game, color === "w" ? "b" : "w");
//   for (const child of children) {
//     if (
//       child.searchModel[kingPosition.row][kingPosition.col].toLowerCase() !==
//         "k" &&
//       child.searchModel[kingPosition.row][kingPosition.col] !== ""
//     ) {
//       return true;
//     }
//   }
//   return false;
// }

// function checkForCheckMate(game, color) {
//   // Check if the king is under attack
//   if (checkForCheckedKing(game, color)) {
//     const children = getAllChildrenStates(game, color);
//     for (const child of children) {
//       if (!checkForCheckedKing(child, color)) {
//         return false;
//       }
//     }
//     return true;
//   }
// }

function alphaBeta(game, alpha, beta, depth, isMaximizingPlayer, endTime) {
  // If node is a leaf node, return the static evaluation
  if (depth === 0 || endTime < new Date().getTime()) {
    return { score: game.score, state: game };
  }
  if (checkForCheckedKing(game, isMaximizingPlayer ? "b" : "w")) {
    return { score: isMaximizingPlayer ? 10000 : -10000, state: game };
  }
  // If node is a max node
  if (isMaximizingPlayer) {
    let bestValue = { score: -Infinity, state: null };
    // Get all children
    let children = getAllChildrenStates(game, "w");
    // For each child
    for (let child of children) {
      // Value = alphaBeta(child, alpha, beta, depth - 1, false)
      let value = alphaBeta(child, alpha, beta, depth - 1, false, endTime);
      // alpha = max(alpha, value)
      alpha = Math.max(alpha, value.score);
      // If value.score > bestValue.score, update bestValue
      if (value.score > bestValue.score) {
        bestValue.score = value.score;
        bestValue.state = child;
      }
      // If beta <= alpha, prune remaining nodes
      if (beta <= alpha) {
        break;
      }
    }
    return bestValue;
  } else {
    // If node is a min node
    let bestValue = { score: Infinity, state: null };
    // Get all children
    let children = getAllChildrenStates(game, "b");
    // For each child
    for (let child of children) {
      // Value = alphaBeta(child, alpha, beta, depth - 1, true)
      let value = alphaBeta(child, alpha, beta, depth - 1, true, endTime);
      // beta = min(beta, value)
      beta = Math.min(beta, value.score);
      // If value.score < bestValue.score, update bestValue
      if (value.score < bestValue.score) {
        bestValue.score = value.score;
        bestValue.state = child;
      }
      // If beta <= alpha, prune remaining nodes
      if (beta <= alpha) {
        break;
      }
    }
    return bestValue;
  }
}

function staticEvaluation(gameState) {
  let score = 0;
  score += materialScore(gameState, score);
  score += positionalScore(gameState, score);
  return score;
}

function positionalScore(gameState, score) {
  const whitePieces = gameState.whitePieces;
  const blackPieces = gameState.blackPieces;
  const gamePhase = calculateGamePhase(gameState);
  whitePieces.forEach((piece) => {
    score += evaluatePieceSquare(piece.value, piece.row, piece.col, gamePhase);
  });
  blackPieces.forEach((piece) => {
    score += evaluatePieceSquare(piece.value, piece.row, piece.col, gamePhase);
  });
  return score;
}

function calculateGamePhase(gameState) {
  const allPieces = gameState.searchModel
    .flat()
    .map((piece) => piece.toLowerCase());
  const totalPieces = allPieces.length;

  // Count the number of each type of piece
  const pieceCounts = {
    p: 0, // Pawn
    n: 0, // Knight
    b: 0, // Bishop
    r: 0, // Rook
    q: 0, // Queen
  };

  allPieces.forEach((piece) => {
    if (pieceCounts.hasOwnProperty(piece)) {
      pieceCounts[piece]++;
    }
  });

  // Determine the game phase based on the number of pieces left
  if (totalPieces <= 10) {
    // Endgame phase
    return "endgame";
  } else if (
    totalPieces <= 20 ||
    (pieceCounts["q"] === 0 && pieceCounts["r"] === 0)
  ) {
    // Middlegame phase
    return "middlegame";
  } else {
    // Opening phase
    return "opening";
  }
}

function evaluatePieceSquare(piece, row, col, gamePhase) {
  switch (piece.toLowerCase()) {
    case "p":
      return evaluatePawnSquare(piece, row, col);
    case "n":
      return evaluateKnightSquare(piece, row, col);
    case "b":
      return evaluateBishopSquare(piece, row, col);
    case "r":
      return evaluateRookSquare(piece, row, col);
    case "q":
      return evaluateQueenSquare(piece, row, col);
    case "k":
      return evaluateKingSquare(piece, row, col, gamePhase);
    default:
      return 0; // Default value if the piece is not recognized
  }
}

function materialScore(gameState, score) {
  let allPieces = gameState.searchModel.flat();
  allPieces.forEach((piece) => {
    let pieceValue = 0;
    switch (piece.toLowerCase()) {
      case "p":
        pieceValue += 1;
        break;
      case "n":
        pieceValue += 3;
        break;
      case "b":
        pieceValue += 3;
        break;
      case "r":
        pieceValue += 5;
        break;
      case "q":
        pieceValue += 9;
        break;
      case "k":
        pieceValue += 100;
        break;
    }
    //White maximizes, black minimizes
    if (piece === piece.toUpperCase()) {
      score += pieceValue;
    } else {
      score -= pieceValue;
    }
  });
  return score;
}

function getAllChildrenStates(game, color) {
  let states = [];
  let pieceList = color === "w" ? game.whitePieces : game.blackPieces;
  for (let piece of pieceList) {
    const pieceMoves = getMovesForPiece(
      piece.value,
      piece.row,
      piece.col,
      game
    );
    for (let move of pieceMoves) {
      let gameCopy = deepCopy(game);
      gameCopy = movePieceInGame(gameCopy, piece, move[0], move[1]);
      states.push(gameCopy);
    }
  }
  // sorter states efter score
  states.sort((a, b) => {
    // White maximizes, black minimizes
    return color === "w" ? b.score - a.score : a.score - b.score;
  });
  return states;
}

function getColorOfPiece(piece) {
  return piece === piece.toUpperCase() ? "w" : "b";
}

function movePieceInGame(game, piece, newRow, newCol) {
  let previousePiece = game.searchModel[newRow][newCol];
  game.searchModel[newRow][newCol] = piece.value;
  game.searchModel[piece.row][piece.col] = "";
  //update castling
  switch (piece.value) {
    case "K":
      game.castling = game.castling.replace("Q", "");
      game.castling = game.castling.replace("K", "");
      game.whiteKingPosition = { row: newRow, col: newCol };
      break;
    case "k":
      game.castling = game.castling.replace("k", "");
      game.castling = game.castling.replace("q", "");
      game.blackKingPosition = { row: newRow, col: newCol };
      break;
    case "r":
    case "R":
      if (piece.row === 0 && piece.col === 0) {
        game.castling = game.castling.replace("Q", "");
      }
      if (piece.row === 0 && piece.col === 7) {
        game.castling = game.castling.replace("K", "");
      }
      if (piece.row === 7 && piece.col === 0) {
        game.castling = game.castling.replace("q", "");
      }
      if (piece.row === 7 && piece.col === 7) {
        game.castling = game.castling.replace("k", "");
      }
      break;
  }
  //update en passant
  if (piece.value === "P" && Math.abs(newRow - piece.row) === 2) {
    game.enPassant = getPositionStringFromCoord([newRow - 1, newCol]);
  } else {
    game.enPassant = "-";
  }
  //update halfmove
  if (piece.value.toLowerCase === "p" || previousePiece !== "") {
    game.halfMove = 0;
  } else {
    game.halfMove++;
  }
  //update fullmove
  if (game.player === "b") {
    game.fullMove++;
  }
  //update score
  game.score = staticEvaluation(game);
  //change player
  game.player = game.player === "w" ? "b" : "w";
  //update last move
  game.lastMove = { piece: piece, newRow: newRow, newCol: newCol };
  return game;
}

function getMovesForPiece(piece, row, col, game) {
  let moves = [];
  let color = piece === piece.toUpperCase() ? "w" : "b";
  switch (piece.toLowerCase()) {
    case "p":
      moves = getPawnMoves(game, row, col, color);
      break;
    case "n":
      moves = getKnightMoves(row, col, game);
      break;
    case "b":
      moves = getBishopMoves(game, row, col);
      break;
    case "r":
      moves = getRookMoves(game, row, col);
      break;
    case "q":
      moves = getQueenMoves(game, row, col);
      break;
    case "k":
      moves = getKingMoves(row, col, game);
      break;
  }

  // add the current position to the moves
  moves = moves.map((move) => {
    move[0] += row;
    move[1] += col;
    return move;
  });

  // filter out moves that are out of bounds
  moves = moves.filter((move) => {
    return move[0] >= 0 && move[0] <= 7 && move[1] >= 0 && move[1] <= 7;
  });
  return moves;
}

function addPawnAttacks(moves, game, row, col, color) {
  if (color === "w") {
    if (checkForEnemy(game, row + 1, col + 1, color)) {
      moves.push([1, 1]);
    }
    if (checkForEnemy(game, row + 1, col - 1, color)) {
      moves.push([1, -1]);
    }
  } else {
    if (checkForEnemy(game, row - 1, col + 1, color)) {
      moves.push([-1, 1]);
    }
    if (checkForEnemy(game, row - 1, col - 1, color)) {
      moves.push([-1, -1]);
    }
  }
  return moves;
}

function checkForEnemy(game, row, col, playerColor) {
  let target = game.searchModel[row][col];
  if (row >= 0 && row < 8 && col >= 0 && col < 8 && target != "") {
    let targetColor = target === target.toUpperCase() ? "w" : "b";
    return targetColor !== playerColor;
  }
}

function getPawnMoves(game, row, col, color) {
  let moves = [];
  // check if the pawn can move forward
  if (color === "w") {
    if (game.searchModel[row + 1][col] === "") {
      moves.push([1, 0]);
      if (row === 1 && game.searchModel[row + 2][col] === "") {
        moves.push([2, 0]);
      }
    }
  } else {
    if (game.searchModel[row - 1][col] === "") {
      moves.push([-1, 0]);
      if (row === 6 && game.searchModel[row - 2][col] === "") {
        moves.push([-2, 0]);
      }
    }
  }
  moves = addPawnAttacks(moves, game, row, col, color);
  //add en passant
  if (color === "w") {
    if (game.enPassant === getPositionStringFromCoord([row + 1, col + 1])) {
      moves.push([1, 1]);
    }
    if (game.enPassant === getPositionStringFromCoord([row + 1, col - 1])) {
      moves.push([1, -1]);
    }
  } else {
    if (game.enPassant === getPositionStringFromCoord([row - 1, col + 1])) {
      moves.push([-1, 1]);
    }
    if (game.enPassant === getPositionStringFromCoord([row - 1, col - 1])) {
      moves.push([-1, -1]);
    }
  }
  return moves;
}

function getKnightMoves(row, col, game) {
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
  let moves = [];
  offsets.forEach((offset) => {
    const newRow = row + offset[0];
    const newCol = col + offset[1];
    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      // Check if the destination cell is empty or contains an opponent's piece
      if (
        game.searchModel[newRow][newCol] === "" ||
        checkForEnemy(game, newRow, newCol, game.player)
      ) {
        moves.push(offset);
      }
    }
  });
  return moves;
}

function getBishopMoves(game, row, col) {
  let moves = [];
  moves = moves.concat(getNorthEastMoves(game, row, col));
  moves = moves.concat(getSouthEastMoves(game, row, col));
  moves = moves.concat(getSouthWestMoves(game, row, col));
  moves = moves.concat(getNorthWestMoves(game, row, col));
  return moves;
}

function getRookMoves(game, row, col) {
  let moves = [];
  moves = moves.concat(getNorthMoves(game, row, col));
  moves = moves.concat(getEastMoves(game, row, col));
  moves = moves.concat(getSouthMoves(game, row, col));
  moves = moves.concat(getWestMoves(game, row, col));
  return moves;
}

function getQueenMoves(game, row, col) {
  let moves = [];
  moves = moves.concat(getNorthEastMoves(game, row, col));
  moves = moves.concat(getSouthEastMoves(game, row, col));
  moves = moves.concat(getSouthWestMoves(game, row, col));
  moves = moves.concat(getNorthWestMoves(game, row, col));
  moves = moves.concat(getNorthMoves(game, row, col));
  moves = moves.concat(getEastMoves(game, row, col));
  moves = moves.concat(getSouthMoves(game, row, col));
  moves = moves.concat(getWestMoves(game, row, col));
  return moves;
}

function getKingMoves(row, col, game) {
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
  let moves = [];
  offsets.forEach((offset) => {
    const newRow = row + offset[0];
    const newCol = col + offset[1];
    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      // Check if the destination cell is empty or contains an opponent's piece
      if (
        game.searchModel[newRow][newCol] === "" ||
        checkForEnemy(game, newRow, newCol, game.player)
      ) {
        moves.push(offset);
      }
    }
  });

  // check castling string for castling moves, and whether we can actually castle
  if (
    game.player === "w" &&
    game.castling.includes("K") &&
    game.searchModel[row][5] === "" &&
    game.searchModel[row][6] === ""
  ) {
    moves.push([0, 2]);
  }
  if (
    game.player === "w" &&
    game.castling.includes("Q") &&
    game.searchModel[row][1] === "" &&
    game.searchModel[row][2] === "" &&
    game.searchModel[row][3] === ""
  ) {
    moves.push([0, -2]);
  }
  if (
    game.player === "b" &&
    game.castling.includes("k") &&
    game.searchModel[row][5] === "" &&
    game.searchModel[row][6] === ""
  ) {
    moves.push([0, 2]);
  }
  if (
    game.player === "b" &&
    game.castling.includes("q") &&
    game.searchModel[row][1] === "" &&
    game.searchModel[row][2] === "" &&
    game.searchModel[row][3] === ""
  ) {
    moves.push([0, -2]);
  }

  return moves;
}
function getNorthEastMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    row + rowCounter < 7 &&
    col + colCounter < 7 &&
    game.searchModel[row + rowCounter + 1][col + colCounter + 1] === ""
  ) {
    rowCounter++;
    colCounter++;
    moves.push([rowCounter, colCounter]);
  }
  if (
    row + rowCounter != 7 &&
    col + colCounter != 7 &&
    game.searchModel[row + rowCounter + 1][col + colCounter + 1] !== "" &&
    checkForEnemy(game, row + rowCounter + 1, col + colCounter + 1, game.player)
  ) {
    moves.push([rowCounter + 1, colCounter + 1]);
  }
  return moves;
}

function getSouthEastMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    row + rowCounter > 0 &&
    col + colCounter < 7 &&
    game.searchModel[row + rowCounter - 1][col + colCounter + 1] === ""
  ) {
    rowCounter--;
    colCounter++;
    moves.push([rowCounter, colCounter]);
  }
  if (
    row + rowCounter != 0 &&
    col + colCounter != 7 &&
    game.searchModel[row + rowCounter - 1][col + colCounter + 1] !== "" &&
    checkForEnemy(game, row + rowCounter - 1, col + colCounter + 1, game.player)
  ) {
    moves.push([rowCounter - 1, colCounter + 1]);
  }
  return moves;
}

function getSouthWestMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    row + rowCounter > 0 &&
    col + colCounter > 0 &&
    game.searchModel[row + rowCounter - 1][col + colCounter - 1] === ""
  ) {
    rowCounter--;
    colCounter--;
    moves.push([rowCounter, colCounter]);
  }
  if (
    row + rowCounter != 0 &&
    col + colCounter != 0 &&
    game.searchModel[row + rowCounter - 1][col + colCounter - 1] !== "" &&
    checkForEnemy(game, row + rowCounter - 1, col + colCounter - 1, game.player)
  ) {
    moves.push([rowCounter - 1, colCounter - 1]);
  }
  return moves;
}

function getNorthWestMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    row + rowCounter < 7 &&
    col + colCounter > 0 &&
    game.searchModel[row + rowCounter + 1][col + colCounter - 1] === ""
  ) {
    rowCounter++;
    colCounter--;
    moves.push([rowCounter, colCounter]);
  }
  if (
    row + rowCounter != 7 &&
    col + colCounter != 0 &&
    game.searchModel[row + rowCounter + 1][col + colCounter - 1] !== "" &&
    checkForEnemy(game, row + rowCounter + 1, col + colCounter - 1, game.player)
  ) {
    moves.push([rowCounter + 1, colCounter - 1]);
  }
  return moves;
}

function getNorthMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    row + rowCounter < 7 &&
    game.searchModel[row + rowCounter + 1][col] === ""
  ) {
    rowCounter++;
    moves.push([rowCounter, colCounter]);
  }
  if (
    row + rowCounter != 7 &&
    game.searchModel[row + rowCounter + 1][col] !== "" &&
    checkForEnemy(game, row + rowCounter + 1, col, game.player)
  ) {
    moves.push([rowCounter + 1, colCounter]);
  }
  return moves;
}

function getEastMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    col + colCounter < 7 &&
    game.searchModel[row][col + colCounter + 1] === ""
  ) {
    colCounter++;
    moves.push([rowCounter, colCounter]);
  }
  if (
    col + colCounter != 7 &&
    game.searchModel[row][col + colCounter + 1] !== "" &&
    checkForEnemy(game, row, col + colCounter + 1, game.player)
  ) {
    moves.push([rowCounter, colCounter + 1]);
  }
  return moves;
}

function getSouthMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    row + rowCounter > 0 &&
    game.searchModel[row + rowCounter - 1][col] === ""
  ) {
    rowCounter--;
    moves.push([rowCounter, colCounter]);
  }
  if (
    row + rowCounter != 0 &&
    game.searchModel[row + rowCounter - 1][col] !== "" &&
    checkForEnemy(game, row + rowCounter - 1, col, game.player)
  ) {
    moves.push([rowCounter - 1, colCounter]);
  }
  return moves;
}

function getWestMoves(game, row, col) {
  let moves = [];
  let rowCounter = 0;
  let colCounter = 0;
  while (
    col + colCounter > 0 &&
    game.searchModel[row][col + colCounter - 1] === ""
  ) {
    colCounter--;
    moves.push([rowCounter, colCounter]);
  }
  if (
    col + colCounter != 0 &&
    game.searchModel[row][col + colCounter - 1] !== "" &&
    checkForEnemy(game, row, col + colCounter - 1, game.player)
  ) {
    moves.push([rowCounter, colCounter - 1]);
  }
  return moves;
}

// prettier-ignore
const pawnTable = [
    [   0,   0,   0,   0,   0,   0,   0,   0],
    [  50,  50,  50,  50,  50,  50,  50,  50],
    [  10,  10,  20,  30,  30,  20,  10,  10],
    [   5,   5,  10,  25,  25,  10,   5,   5],
    [   0,   0,   0,  20,  20,   0,   0,   0],
    [   5,  -5, -10,   0,   0, -10,  -5,   5],
    [   5,  10,  10, -20, -20,  10,  10,   5],
    [   0,   0,   0,   0,   0,   0,   0,   0],
];

// prettier-ignore
const knightTable = [
    [ -50, -40, -30, -30, -30, -30, -40, -50],
    [ -40, -20,   0,   5,   5,   0, -20, -40],
    [ -30,   5,  10,  15,  15,  10,   5, -30],
    [ -30,   0,  15,  20,  20,  15,   0, -30],
    [ -30,   5,  15,  20,  20,  15,   5, -30],
    [ -30,   0,  10,  15,  15,  10,   0, -30],
    [ -40, -20,   0,   0,   0,   0, -20, -40],
    [ -50, -40, -30, -30, -30, -30, -40, -50],
];

// prettier-ignore
const bishopTable = [
    [ -20, -10, -10, -10, -10, -10, -10, -20],
    [ -10,   5,   0,   0,   0,   0,   5, -10],
    [ -10,  10,  10,  10,  10,  10,  10, -10],
    [ -10,   0,  10,  10,  10,  10,   0, -10],
    [ -10,   5,   5,  10,  10,   5,   5, -10],
    [ -10,   0,   5,  10,  10,   5,   0, -10],
    [ -10,   0,   0,   0,   0,   0,   0, -10],
    [ -20, -10, -10, -10, -10, -10, -10, -20],
];

// prettier-ignore
const rookTable = [
    [   0,   0,   0,   5,   5,   0,   0,   0],
    [  -5,   0,   0,   0,   0,   0,   0,  -5],
    [  -5,   0,   0,   0,   0,   0,   0,  -5],
    [  -5,   0,   0,   0,   0,   0,   0,  -5],
    [  -5,   0,   0,   0,   0,   0,   0,  -5],
    [  -5,   0,   0,   0,   0,   0,   0,  -5],
    [   5,  10,  10,  10,  10,  10,  10,   5],
    [   0,   0,   0,   0,   0,   0,   0,   0],
];

// prettier-ignore
const queenTable = [
    [ -20, -10, -10,  -5,  -5, -10, -10, -20],
    [ -10,   0,   0,   0,   0,   0,   0, -10],
    [ -10,   5,   5,   5,   5,   5,   0, -10],
    [  -5,   0,   5,   5,   5,   5,   0,  -5],
    [   0,   0,   5,   5,   5,   5,   0,  -5],
    [ -10,   0,   5,   5,   5,   5,   0, -10],
    [ -10,   0,   0,   0,   0,   0,   0, -10],
    [ -20, -10, -10,  -5,  -5, -10, -10, -20],
];

// prettier-ignore
const kingMiddleGameTable = [
	[ -30, -40, -40, -50, -50, -40, -40, -30],
	[ -30, -40, -40, -50, -50, -40, -40, -30],
	[ -30, -40, -40, -50, -50, -40, -40, -30],
	[ -30, -40, -40, -50, -50, -40, -40, -30],
	[ -20, -30, -30, -40, -40, -30, -30, -20],
	[ -10, -20, -20, -20, -20, -20, -20, -10],
	[  20,  20,   0,   0,   0,   0,  20,  20],
	[  20,  30,  10,   0,   0,  10,  30,  20],
];

// prettier-ignore
const kingEndGameTable = [
	[ -50, -40, -30, -20, -20, -30, -40, -50],
	[ -30, -20, -10,   0,   0, -10, -20, -30],
	[ -30, -10,  20,  30,  30,  20, -10, -30],
	[ -30, -10,  30,  40,  40,  30, -10, -30],
	[ -30, -10,  30,  40,  40,  30, -10, -30],
	[ -30, -10,  20,  30,  30,  20, -10, -30],
	[ -30, -30,   0,   0,   0,   0, -30, -30],
	[ -50, -30, -30, -30, -30, -30, -30, -50],
];

function evaluatePawnSquare(piece, row, col) {
  // Reverse the table for black pawns
  let table = piece === "P" ? pawnTable : pawnTable.slice().reverse();
  return table[row][col];
}

function evaluateKnightSquare(piece, row, col) {
  // Reverse the table for black knights
  let table = piece === "N" ? knightTable : knightTable.slice().reverse();
  return table[row][col];
}

function evaluateBishopSquare(piece, row, col) {
  // Reverse the table for black bishops
  let table = piece === "B" ? bishopTable : bishopTable.slice().reverse();
  return table[row][col];
}

function evaluateRookSquare(piece, row, col) {
  // Reverse the table for black rooks
  let table = piece === "R" ? rookTable : rookTable.slice().reverse();
  return table[row][col];
}

function evaluateQueenSquare(piece, row, col) {
  // Reverse the table for black queens
  let table = piece === "Q" ? queenTable : queenTable.slice().reverse();
  return table[row][col];
}

function evaluateKingSquare(piece, row, col, gamePhase) {
  let table =
    gamePhase === "middlegame" ? kingMiddleGameTable : kingEndGameTable;
  // Reverse the table for black kings
  table = piece === "K" ? table : table.slice().reverse();
  return table[row][col];
}
