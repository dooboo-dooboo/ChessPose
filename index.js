import { uploadPost, loadPostByFen } from "./firebase.js";

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
const pieces = document.querySelectorAll('.piece');
const uploadBtn = document.getElementById('upload-post');
const findBtn = document.getElementById('find-post');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');
const postDisplay = document.getElementById('post-display');
const postModeSelect = document.getElementById('select-post-mode-parent');
const copyFenBtn = document.getElementById('copy-fen');

let isNewPostMode = true;

document.querySelectorAll('input[name="post-mode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            isNewPostMode = !isNewPostMode;
            findPostBtnClick();
        }
    });
});

copyFenBtn.addEventListener('click', (e) => {
    navigator.clipboard.writeText(exportToFEN()).then(() => {
        alert("FEN을 복사했습니다.");
    });
});

pieces.forEach((piece) => {
    piece.addEventListener('dragstart', drag);
});
pieceSquares.forEach((square) => {
    square.addEventListener('drop', drop);
    square.addEventListener('dragover', allowDrop);
});

clearBoardBtn.addEventListener('click', clearBoard);
resetBoardBtn.addEventListener('click', resetBoard);
loadFenBtn.addEventListener('click', loadFEN);
uploadBtn.addEventListener('click', uploadPostBtnClick);
findBtn.addEventListener('click', findPostBtnClick);


let fenCode = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

let pieceIdCount = 32;

let nowPieceNum = 0;

function uploadPostBtnClick() {
    if (postTitle.value === "" || postContent.value === "") {
        alert("제목과 내용을 모두 입력하세요.");
        return;
    }
    uploadPost(exportToFEN(), postTitle.value, postContent.value);
    alert("글을 업로드했습니다.");
    postTitle.value = "";
    postContent.value = "";
}

function findPostBtnClick() {
    postDisplay.replaceChildren();
    let foundPostLength = 0;
    loadPostByFen(exportToFEN()).then(nowData => {
        foundPostLength = Object.keys(nowData).length;
        if (foundPostLength == 0) {
            const noPost = document.createElement('h3');
            noPost.textContent = "아직 이 포지션에 관련된 글이 없습니다.";
            postDisplay.replaceChildren(noPost);
            return;
        }
        
        postModeSelect.hidden = false;
        if (isNewPostMode) {
            for (let i = foundPostLength - 1; i >= 0; i--) {
                const newDiv = document.createElement('div');
                const newDivTitle = document.createElement('h3');
                const newDivContent = document.createElement('p');
                newDivTitle.textContent = nowData[i].postTitle;
                newDivContent.textContent = nowData[i].postContent;
                newDiv.classList.add('post-div');
                newDivTitle.classList.add('post-title');
                newDivContent.classList.add('post-content');
                if (i == foundPostLength - 1) {
                    const recent = document.createElement('p');
                    recent.textContent = "가장 최근";
                    recent.classList.add('recent');
                    newDiv.append(recent);
                }
                newDiv.append(newDivTitle);
                newDiv.append(newDivContent);
                postDisplay.append(newDiv);
            }
        } else {
            for (let i = 0; i < foundPostLength; i++) {
                const newDiv = document.createElement('div');
                const newDivTitle = document.createElement('h3');
                const newDivContent = document.createElement('p');
                newDivTitle.textContent = nowData[i].postTitle;
                newDivContent.textContent = nowData[i].postContent;
                newDiv.classList.add('post-div');
                newDivTitle.classList.add('post-title');
                newDivContent.classList.add('post-content');
                if (i == 0) {
                    const recent = document.createElement('p');
                    recent.textContent = "가장 오래됨";
                    recent.classList.add('recent');
                    newDiv.append(recent);
                }
                newDiv.append(newDivTitle);
                newDiv.append(newDivContent);
                postDisplay.append(newDiv);
            }
        }
        
    });
    
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(event) {
    event.preventDefault();
    var data = event.dataTransfer.getData("Text");
    const newPiece = document.getElementById(data);
    newPiece.id = `piece-${++pieceIdCount}`;
    event.target.closest('.square').replaceChildren(newPiece);
    newPieceParent.replaceChildren(cloneNewPiece.cloneNode(true));
    newPieceParent.querySelectorAll('.piece').forEach((piece) => {
        piece.addEventListener('dragstart', drag);
        piece.addEventListener('drag', drag);
    });
    originalPieces.forEach((piece) => {
        const clone = piece.cloneNode(true);
        clonePieces.push(clone);
    });
    updateCurrentFEN();
}

function importFromFEN(fen) {
    for (let i = 0; i < pieceSquares.length; i++) {
        pieceSquares[i].replaceChildren();
    }
    pieceSquares.forEach((square) => {
        square.addEventListener('drop', drop);
        square.addEventListener('dragover', allowDrop);
    });
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
                pieceSquares[nowSquare].replaceChildren(newPiece);
                nowSquare++;
            }
        }
    }
    const piecesA = document.querySelectorAll('.piece');
    piecesA.forEach((piece) => {
        piece.id = `piece-${++pieceIdCount}`;
        piece.classList.remove('original-piece');
        piece.addEventListener('dragstart', drag);
    });
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

//importFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
