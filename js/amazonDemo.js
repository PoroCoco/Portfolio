let game; // The global var that hold the current game state
let selectedPiece = 0; // Variable to store the selected piece index
let destinationPiece = 0; // Variable to store the selected piece destination index
let clickCount = 0; // Variable to track the click count
let demoInteracted = 0; // 0 display interaction text, 1 display the rules, >1, nothing
let canPlay = true;
const playedMoves = [];

const queen_white = new Image()
queen_white.src = "../ressources/images/amazons_queen_white.png"

const queen_black = new Image()
queen_black.src = "../ressources/images/amazons_queen_black.png"

const startAmazonDemo = () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentNode;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    // Other browser (Chrome/Edge) seems to never call Module.onRuntimeInitialized and seems to work even without it
    // Firefox will fail without the onRuntimeInitialized. This should be the correct usage, need to investigate Chrome Edge
    if (navigator.userAgent.indexOf("Firefox") != -1){ 
        Module.onRuntimeInitialized = () => {
            launchNewGame(8, "s", canvas, ctx);
            window.addEventListener("resize", updateCanvasDimensions); // Updating the dimension means drawing, which means that the game must be started
        }
    }else{
        launchNewGame(8, "s", canvas, ctx);
        window.addEventListener("resize", updateCanvasDimensions); // Updating the dimension means drawing, which means that the game must be started
    }
}

const playMove = (board, move) => {
    Module._web_play_move(board, move.queen_src, move.queen_dst, move.arrow_dst);
    playedMoves.push(move);
    // console.log(playedMoves);
};

const undoMove = (canvas, ctx, board, move) => {
    
};

function displayText(canvas, ctx, text) {
    ctx.fillStyle = "rgba(128, 128, 128, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgb(0, 0, 0)";
    let fontSize = Math.min(Math.round(canvas.height/9), Math.round(canvas.width/9));
    ctx.font = fontSize + "px serif";
    let textSize = ctx.measureText(text);
    ctx.fillText(text, Math.max(canvas.width/2 - textSize.width/2, 0), canvas.height/2 + (textSize.actualBoundingBoxDescent)/2, canvas.width);
}

function highlight_cells_arrow_moves(canvas, ctx, board, queen_src, queen_dst){
    const height = Module._web_nb_row(board);
    const width = Module._web_nb_col(board);
    const cellSizeX = canvas.width / width;
    const cellSizeY = canvas.height / height;

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if(Module._web_can_queen_move_at_and_fire_at(board, queen_src, queen_dst, (col + (row*width)))){
                const x = col * cellSizeX ;
                const y = row * cellSizeY ;
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fillRect(x + cellSizeX/4, y+ cellSizeY/4, cellSizeX/2, cellSizeY/2);
                ctx.fillStyle = 'black';
            }
        }
    }
}


function highlight_cells_queen_moves(canvas, ctx, board, queen_src){
    const height = Module._web_nb_row(board);
    const width = Module._web_nb_col(board);
    const cellSizeX = canvas.width / width;
    const cellSizeY = canvas.height / height;

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            if(Module._web_can_queen_move_at(board, queen_src, (col + (row*width)))){
                const x = col * cellSizeX ;
                const y = row * cellSizeY ;
                ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.fillRect(x + cellSizeX/4, y+ cellSizeY/4, cellSizeX/2, cellSizeY/2);
                ctx.fillStyle = 'black';
            }
        }
    }
}

function drawBoard(canvas, ctx, board){
    const height = Module._web_nb_row(board);
    const width = Module._web_nb_col(board);
    const cellSizeX = canvas.width / width;
    const cellSizeY = canvas.height / height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
        const cell_state = Module._web_get_cell_state(board, (col + (row*width)));
        const x = col * cellSizeX;
        const y = row * cellSizeY;


        if((col % 2 + row %2)%2 == 0){
            ctx.fillStyle = "rgb(248, 224, 175)";
            ctx.fillRect(x, y, cellSizeX, cellSizeY);
        }else{
            ctx.fillStyle = "rgb(164, 112, 68)";
            ctx.fillRect(x, y, cellSizeX, cellSizeY);
        }
        ctx.fillStyle = "black";
        

        if (cell_state === 1){ //Add white queen 
            ctx.drawImage(queen_white, x, y, cellSizeX, cellSizeY);
        }else if (cell_state === 2){ //Add black queen 
            ctx.drawImage(queen_black, x, y, cellSizeX, cellSizeY);
        }else if (cell_state === 3){ //Add arrow 
            ctx.beginPath();
            let radius = Math.min(cellSizeX/4, cellSizeY/2);
            ctx.arc(x + cellSizeX/2, y + cellSizeY/2, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "black";
            ctx.fill();
        }
        
        ctx.strokeRect(x, y, cellSizeX, cellSizeY);
        }
    }
    if (demoInteracted === 0){
        displayText(canvas, ctx, "Click to play !");
    }else if (demoInteracted === 1){
        displayText(canvas, ctx, "Last player to move wins !");
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }

async function translate_from_to(board, canvas, ctx, idx_src, idx_dst, playerId, arrow){
    const height = Module._web_nb_row(board);
    const width = Module._web_nb_col(board);



    const rect = canvas.getBoundingClientRect();
    const col_src = idx_src%width;
    const row_src = Math.floor(idx_src/width);
    const col_dst = idx_dst%width;
    const row_dst = Math.floor(idx_dst/width);

    const cellSizeX = canvas.width / width;
    const cellSizeY = canvas.height / height;
    const x_src = col_src*cellSizeX;
    const y_src = row_src*cellSizeY;
    const x_dst = col_dst*cellSizeX;
    const y_dst = row_dst*cellSizeY;

    const step_x = (x_dst - x_src) / 66;
    const step_y = (y_dst - y_src) / 66;

    for (let index = 0; index < 66; index++) {
        drawBoard(canvas, ctx, board);
        if (arrow){
            ctx.beginPath();
            let radius = Math.min(cellSizeX/4, cellSizeY/2);
            ctx.arc(x_src + cellSizeX/2 + step_x*index, y_src + cellSizeY/2 + step_y*index, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = "black";
            ctx.fill();
        }else{
            if (playerId == 0){
                ctx.drawImage(queen_white, x_src + index*step_x, y_src + index*step_y, cellSizeX, cellSizeY);
            }else{
                ctx.drawImage(queen_black, x_src + index*step_x, y_src + index*step_y, cellSizeX, cellSizeY);
            }
        }
        await sleep(10)
    }

    
}

async function handleClick(canvas, ctx, event, board){
    if (demoInteracted === 0){
        demoInteracted++;
        drawBoard(canvas, ctx, board);
        return;
    }else if (demoInteracted === 1){
        demoInteracted++;
        drawBoard(canvas, ctx, board);
        return;
    }
    if (!canPlay){
        return;
    }
    const height = Module._web_nb_row(board);
    const width = Module._web_nb_col(board);

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cellSizeX = canvas.width / width;
    const cellSizeY = canvas.height / height;
    const col = Math.floor(x / cellSizeX);
    const row = Math.floor(y / cellSizeY);

    //piece selection
    if (clickCount === 0){
        clickCount++;
        selectedPiece = col + (row*width);
        const selectedCellState = Module._web_get_cell_state(board, selectedPiece);
        if (selectedCellState != 1){
            clickCount = 0;
            // console.log("You must choose your piece");
        }else{
            highlight_cells_queen_moves(canvas, ctx, board, selectedPiece);
        }
    }//piece destination
    else if (clickCount === 1){
        clickCount++;
        destinationPiece = col + (row*width);
        if (!(Module._web_can_queen_move_at(board, selectedPiece, destinationPiece))){
            clickCount = 1;
            // console.log("You must choose a valid queen destination");
        }else{
            drawBoard(canvas, ctx, board);
            highlight_cells_arrow_moves(canvas, ctx, board, selectedPiece, destinationPiece);
        }
    }//arrow destination
    else if (clickCount === 2){
        clickCount = 0;
        const arrowDestination = col + (row*width);
        if (!(Module._web_can_queen_move_at_and_fire_at(board, selectedPiece, destinationPiece, arrowDestination))){
            clickCount = 2;
            // console.log("You must choose a valid arrow destination");
        }else{
            canPlay = false;
            playMove(board, {queen_src : selectedPiece, queen_dst : destinationPiece, arrow_dst : arrowDestination});
            await translate_from_to(board, canvas, ctx, selectedPiece, destinationPiece, 0, false);
            await translate_from_to(board, canvas, ctx, destinationPiece, arrowDestination, 0, true);
            drawBoard(canvas, ctx, board);
            Module._web_bot_play_move(board);
            await translate_from_to(board, canvas, ctx, Module._web_previous_move_queen_src(board), Module._web_previous_move_queen_dst(board), 1, false);
            await translate_from_to(board, canvas, ctx, Module._web_previous_move_queen_dst(board), Module._web_previous_move_arrow_dst(board), 1, true);
            drawBoard(canvas, ctx, board);
            canPlay = true;
        }

    }
    
};

function handleRightClick(canvas, ctx, event, board){
    event.preventDefault();
    clickCount = 0;
    drawBoard(canvas, ctx, board);
}

function launchNewGame(width, shape, canvas, ctx){
    if (!(shape === "s" || shape === "d" || shape === "8" || shape === "t" )){
        console.log("Tried to launch a game with a incorrect shape : ", shape, ". Defaulting to square.");
        shape = "s";
    }
    // Only allow correct size for the shape
    if ((shape === "d") && (width%3 != 0)) return;
    if ((shape === "8") && (width%4 != 0)) return;
    if ((shape === "t") && (width%5 != 0)) return;
    
    game = Module._web_new_game(width, shape.charCodeAt(0), 0);

    
    canvas.addEventListener('click', (event) => handleClick(canvas, ctx, event, game));
    canvas.addEventListener('contextmenu', (event) => handleRightClick(canvas, ctx, event, game));

    drawBoard(canvas, ctx, game);
}

function updateCanvasDimensions(){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentNode;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawBoard(canvas, ctx, game);
}



export { startAmazonDemo };