const scoreElement = document.getElementById("scorePoints");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "WHITE";

class canvas {
    constructor(id){
        this.cvs = document.getElementById(id);
        this.ctx = this.cvs.getContext("2d");
        this.board = [];
        // create a boards
        for(let i = 0; i< ROW; i++){
            this.board[i] = [];
            for(let j=0;j<COL;j++){
                this.board[i][j] = VACANT;
            }
        }
    }
    
    // draw a square
    drawSquare(x,y,color){
        this.ctx.fillStyle = color;  
        // define the fill color of the squre
        this.ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
        
        this.ctx.strokeStyle = "BLACK";
        // define the stroke color of the squre
        this.ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
    }
    

    // draw a board
    drawBoard(){
        for(let i=0;i<ROW;i++){
            for(let j=0;j<COL;j++){
                this.drawSquare(j,i,this.board[i][j]);
            }
        }
    }
}

let Tetris = new canvas("tetris");
let NextTetris = new canvas("next");

Tetris.drawBoard();
NextTetris.drawBoard();

// the pieces and there color

const pieces = [
    [Z,"red"],
    [S,"green"],
    [T,"yellow"],
    [O,"blue"],
    [L,"purple"],
    [I,"cyan"],
    [J,"orange"]
];

// generate a random piece
function randomPiece(){
    let r = randomN = Math.floor(Math.random()*pieces.length);
    // NextTetris.drawSquare(5,2,"BLUE");
    for(i=1;i<pieces[r][0][0].length+1;i++){
        for(j=1;j<pieces[r][0][0].length+1;j++){
            if(pieces[r][0][0][i-1][j-1] === 1){
            NextTetris.drawSquare(i,j,pieces[r][1]);
            }else{
                    NextTetris.drawSquare(i,j,VACANT);
                    NextTetris.drawSquare(2,0,VACANT);
            }
            if(pieces[r][1] === "cyan"){
                NextTetris.drawSquare(2,0,pieces[r][1])
            }   
        }
    }
    return new piece(pieces[r][0],pieces[r][1]);
}

let p = randomPiece();
let pnext =randomPiece();

function piece(tetromino,color){
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; // Select the first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];
    // this gives as the arrays of the shape of the tetrimino
    // run console.log(pieces[0][0][0]);


    // we need the control the piece
    this.x = 3;
    this.y = -2;
}

// prototype property allows you to add new properties to object constructors

piece.prototype.fill = function(color){
    for(i=0;i < this.activeTetromino.length; i++){
        for(j=0;j < this.activeTetromino.length; j++){
            if(this.activeTetromino[i][j]){
                Tetris.drawSquare(this.x + j,this.y + i, color);
            }
        }
    }
}

// draw a piece to the board

piece.prototype.draw = function(){
    this.fill(this.color);
}

// undraw a piece


piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// move Down the piece

piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
    this.unDraw();
    this.y++;
    this.draw();
    }else{
        // this.lock();
        p.lock();
        p = pnext; 
        pnext = randomPiece();
    }
}

piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

piece.prototype.collision = function(x,y,piece){
    for(i=0;i<piece.length; i++){
        for(j=0;j<piece.length; j++){

            if(!piece[i][j]){
                continue;
            }

            // coordinates of the piece after movement
            let newX = this.x + j + x;
            let newY = this.y + i + y;

            // conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }

            // skip newY < 0; board[-1] will crush the game
            if(newY < 0){
                continue;
            }

            // checks of there is a locked piece already in place
            if(Tetris.board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;

    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // we skip the vacant squares
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // pieces to lock on top = game over
            if(this.y + r < 0){
                alert("Game Over");
                // stop request animation frame
                gameOver = true;
                break;
            }
            // we lock the piece
            Tetris.board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (Tetris.board[r][c] != VACANT);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    Tetris.board[y][c] = Tetris.board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                Tetris.board[0][c] = VACANT;
            }
            // increment the score
            score += 10;
        }
    }
    // update the board
    Tetris.drawBoard();
    
    // update the score
    scoreElement.innerHTML = score;
}

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    switch(event.keyCode){
        case 37:
            p.moveLeft();
            break;
        case 38:
            p.rotate();
            break;
        case 39:
            p.moveRight();
            break;
        case 40:
            p.moveDown();
    }
    dropStart = Date.now();
}

// drop the piece every second

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 200){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();