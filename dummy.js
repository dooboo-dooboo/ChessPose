const originalNewPiece = document.getElementById('new-piece');
const cloneNewPiece = originalNewPiece.cloneNode(true);
const newPieceParent = document.getElementById('new-piece-parent');
const pieceSquares = document.querySelectorAll('.square');
const originalPieces = document.querySelectorAll('.original-piece');
const clonePieces = [];
originalPieces.forEach((piece) => {
    const clone = piece.cloneNode(true);
    clonePieces.push(clone);
});
const pieceCode = ['k', 'q', 'r', 'n', 'b', 'p', 'K', 'Q', 'R', 'N', 'B', 'P'];
const fenInput = document.getElementById('fen-input');
const currentFENDisplay = document.getElementById('current-fen');
const clearBoardBtn = document.getElementById('clearBoard');
const resetBoardBtn = document.getElementById('resetBoard');
const loadFenBtn = document.getElementById('loadFen');

clearBoardBtn.addEventListener('click', clearBoard);
resetBoardBtn.addEventListener('click', resetBoard);
loadFenBtn.addEventListener('click', loadFEN);

let fenCode = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

let pieceIdCount = 32;

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("Text");
    console.log(data);
    const newPiece = document.getElementById(data);
    newPiece.id = `piece-${++pieceIdCount}`;
    event.target.closest('.square').replaceChildren(newPiece);
    newPieceParent.replaceChildren(cloneNewPiece.cloneNode(true));
    updateCurrentFEN();
}

function importFromFEN(fen) {
    for (let i = 0; i < pieceSquares.length; i++) {
        pieceSquares[i].replaceChildren();
    }
    const positionCode = fen.split(' ')[0];
    const rows = positionCode.split('/');
    let nowSquare = 0;
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].length; j++) {
            if (Number.isInteger(parseInt(rows[i][j]))) {
                nowSquare += parseInt(rows[i][j]);
                continue;
            }
            if (pieceCode.includes(rows[i][j])) {
                const pieceIndex = pieceCode.indexOf(rows[i][j]);
                const newPiece = clonePieces[pieceIndex].cloneNode(true);
                newPiece.id = `piece-${++pieceIdCount}`;
                pieceSquares[nowSquare].replaceChildren(newPiece);
                nowSquare++;
            }
        }
    }
}

function exportToFEN() {
    let fen = '';

    for (let i = 0; i < pieceSquares.length; i++) {
        if (pieceSquares[i].children.length === 0) {
            fen += " ";
        } else {
            fen += pieceSquares[i].firstElementChild.dataset.pieceType;
        }

        if ((i + 1) % 8 === 0 && i + 1 < 64) {
            fen += '/';
        }
    }

    fen = fen.replaceAll("        ", 8).replaceAll("       ", 7).replaceAll("      ", 6).replaceAll("     ", 5).replaceAll("    ", 4).replaceAll("   ", 3).replaceAll("  ", 2).replaceAll(" ", 1);

    return fen;
}

function clearBoard() {
    importFromFEN('8/8/8/8/8/8/8/8');
    updateCurrentFEN();
}

function resetBoard() {
    importFromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    updateCurrentFEN();
}

function loadFEN() {
    importFromFEN(fenInput.value);
    updateCurrentFEN();
}

function updateCurrentFEN() {
    currentFENDisplay.innerHTML = exportToFEN();
}

importFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
