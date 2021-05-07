const scoreElement1 = document.querySelector("#scoreP1 span");
const scoreElement2 = document.querySelector("#scoreP2 span");

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
        // define the color that will be inside the squre
        this.ctx.fillRect(x*SQ,y*SQ,SQ,SQ);
        
        // first argument is the starting point of the square the second square is the ending point,
        // the third parameter is the width of the square and the last argument is the height of the square 
        
        this.ctx.strokeStyle = "BLACK";
        
        // define the stroke color of the squre
        this.ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
        // the argument are the same as in fillRect
    }
    
    
    // draw the board board
    drawBoard(){
        for(let i=0;i<ROW;i++){
            for(let j=0;j<COL;j++){
                this.drawSquare(j,i,this.board[i][j]);
            }
        }
    }
}

let tetrisPlayerOne = new canvas("tetrisPlayerOne");
let nextTetrisPlayerOne = new canvas("nextPlayerOne");
let tetrisPlayerTwo = new canvas("tetrisPlayerTwo");
let nextTetrisPlayerTwo = new canvas("nextPlayerTwo");

tetrisPlayerOne.drawBoard();
nextTetrisPlayerOne.drawBoard(); // This is shows the next tetrimino to the first player
tetrisPlayerTwo.drawBoard();
nextTetrisPlayerTwo.drawBoard(); // This is shows the next tetrimino to the second player
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
function randomPiece(canvas){
    let r = Math.floor(Math.random()*pieces.length); // Get a random number form 0 to 7
    if(canvas === nextTetrisPlayerOne || canvas === nextTetrisPlayerTwo){ // Check if the giving canvas is one of the two canvases that displays the next tetromino
        for(let i=1;i<pieces[r][0][0].length+1;i++){ 
            for(let j=1;j<pieces[r][0][0].length+1;j++){ 
                if(pieces[r][0][0][i-1][j-1] === 1){
                    canvas.drawSquare(i,j,pieces[r][1]);
                }else{
                    canvas.drawSquare(i,j,VACANT);
                    canvas.drawSquare(2,0,VACANT);  
                }
                if(pieces[r][1] === "cyan"){    // if the color mathces cyan 
                    canvas.drawSquare(2,0,pieces[r][1])
                }   
            }
        }
    }
    return new piece(pieces[r][0],pieces[r][1]); // if statement if false return the tetromino and it's coler
}

let p1=randomPiece(tetrisPlayerOne);
let p2=randomPiece(tetrisPlayerTwo);
let pnext1=randomPiece(nextTetrisPlayerOne);
let pnext2=randomPiece(nextTetrisPlayerTwo);

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

piece.prototype.fill = function(color,canvas){
    for(i=0;i < this.activeTetromino.length; i++){
        for(j=0;j < this.activeTetromino.length; j++){
            if(this.activeTetromino[i][j]){
                canvas.drawSquare(this.x + j,this.y + i, color);
            }
        }
    }
}

// draw a piece to the board

piece.prototype.draw = function(canvas){
    this.fill(this.color,canvas);
}

// undraw a piece


piece.prototype.unDraw = function(canvas){
    this.fill(VACANT,canvas);
}

// move Down the piece

piece.prototype.moveDown = function(canvas){
    if(!this.collision(0,1,this.activeTetromino,canvas)){
        this.unDraw(canvas);
        this.y++;
        this.draw(canvas);
    }else{
        // this.lock();
        if(canvas === tetrisPlayerOne){
            p1.lock(canvas);
            p1 = pnext1; 
            pnext1 = randomPiece(nextTetrisPlayerOne);
        }else{
            p2.lock(canvas);
            p2 = pnext2; 
            pnext2 = randomPiece(nextTetrisPlayerTwo);
        }
    }
}

piece.prototype.moveLeft = function(canvas){
    if(!this.collision(-1,0,this.activeTetromino,canvas)){
        this.unDraw(canvas);
        this.x--;
        this.draw(canvas);
    }
}

piece.prototype.moveRight = function(canvas){
    if(!this.collision(1,0,this.activeTetromino,canvas)){
        this.unDraw(canvas);
        this.x++;
        this.draw(canvas);
    }
}

piece.prototype.collision = function(x,y,piece,canvas){
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
            if(canvas.board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

piece.prototype.rotate = function(canvas){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern,canvas)){
        if(this.x > COL/2){
            // it's the right wall
            kick = -1; // we need to move the piece to the left
        }else{
            // it's the left wall
            kick = 1; // we need to move the piece to the right
        }
    }
    
    if(!this.collision(kick,0,nextPattern,canvas)){
        this.unDraw(canvas);
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw(canvas);
    }
}

let score1 = 0;
let score2 = 0;

piece.prototype.lock = function(canvas){
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
                if(canvas === tetrisPlayerOne){
                    gameOver1 = true;
                    break;
                }else{
                    gameOver2 = true;
                    break;
                }
                
            }
            // we lock the piece
            canvas.board[this.y+r][this.x+c] = this.color;
        }
    }
    // remove full rows
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (canvas.board[r][c] != VACANT);
        }
        if(isRowFull){
            // if the row is full
            // we move down all the rows above it
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    canvas.board[y][c] = canvas.board[y-1][c];
                }
            }
            // the top row board[0][..] has no row above it
            for( c = 0; c < COL; c++){
                canvas.board[0][c] = VACANT;
            }
            // increment the score
            if(canvas === tetrisPlayerOne){
                score1 += 10;
            }else{
                score2 += 10;
            }
        }
    }
    // update the board
    canvas.drawBoard();
    
    // update the score
    scoreElement1.innerHTML = score1;
    scoreElement2.innerHTML = score2;
}

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    switch(event.keyCode){
        case 65:
            p1.moveLeft(tetrisPlayerOne);
            break;
            case 87:
                p1.rotate(tetrisPlayerOne);
                break;
                case 68:
                    p1.moveRight(tetrisPlayerOne);
                    break;
                    case 83:
                        p1.moveDown(tetrisPlayerOne);
                        break;
                        case 37:
                            p2.moveLeft(tetrisPlayerTwo);
                            break;
                            case 38:
                                p2.rotate(tetrisPlayerTwo);
                                break;
                                case 39:
                                    p2.moveRight(tetrisPlayerTwo);
                                    break;
                                    case 40:
                                        p2.moveDown(tetrisPlayerTwo);
                                        break;
                                        
                                    }
                                    dropStart = Date.now();
                                }
                                
                                // drop the piece every second
                                
                                let dropStart = Date.now();
                                let gameOver1 = false;
                                let gameOver2 = false;
                                function drop(x){
                                    let now = Date.now();
                                    let delta = now - dropStart;
                                    if(delta > 200){
                                        if(x === 3){
                                            p1.moveDown(tetrisPlayerOne);
                                            p2.moveDown(tetrisPlayerTwo);
                                        }else if(x === 2){
                                            p1.moveDown(tetrisPlayerOne);
                                        }else if(x === 1){
                                            p2.moveDown(tetrisPlayerTwo);
                                        }
                                        dropStart = Date.now();
                                    }
                                    
                                    if( !gameOver1 && !gameOver2){
                                        requestAnimationFrame(function(){
                                            drop(3);
                                        });
                                    }else if(!gameOver1){
                                        requestAnimationFrame(function(){
                                            drop(2);
                                        });
                                    }else if(!gameOver2){
                                        requestAnimationFrame(function(){
                                            drop(1);
                                        });
                                    }
                                };
                                drop(3);