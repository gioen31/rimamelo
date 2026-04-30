// ==================== LISTA RIME (EASY) ====================
const rimeCoppieEasy = [
    ['preferito', 'pentito'],
    ['incastri', 'rimasti'],
    ['turbante', 'volante'],
    ['shampoo', 'accanto'],
    ['pugnale', 'eliminare'],
    ['flow', 'hip hop'],
    ['semaforo', 'impavido'],
    ['sarcasmo', 'orgasmo'],
    ['graffiti', 'falliti'],
    ['cappuccio', 'tutto'],
    ['antipasto', 'casco'],
    ['povero', 'intonaco'],
    ['abitudine', 'attitudine'],
    ['testo', 'senso'],
    ['credibilità', 'abilità'],
    ['divisa', 'pisa'],
    ['corna', 'donna'],
    ['cuffia', 'muffa'],
    ['gnomo', 'duomo'],
    ['controllo', 'disaronno'],
    ['anca', 'arroganza'],
    ['cranio', 'stadio'],
    ['cypher', 'freestyler'],
    ['autentico', 'splendido'],
    ['cappello', 'campanello'],
    ['lampada', 'candida'],
    ['partirà', 'aldilà'],
    ['tundra', 'tutta'],
    ['lente', 'inevitabilmente'],
    ['algoritmo', 'pessimismo'],
    ['incomprensibile', 'limite'],
    ['parole', 'direttore'],
    ['linguaggio', 'ostaggio'],
    ['pausa', 'causa'],
    ['rime', 'ingerire'],
    ['offesa', 'chiesa'],
    ['microfono', 'misogino'],
    ['destino', 'mattino'],
    ['coraggio', 'messaggio'],
    ['strada', 'spada'],
    ['mente', 'niente'],
    ['veloce', 'croce'],
    ['sera', 'primavera'],
    ['amico', 'nemico'],
    ['fratello', 'martello'],
    ['guerra', 'terra'],
    ['notte', 'rotte'],
    ['fuoco', 'poco'],
    ['stella', 'bella'],
    ['mare', 'parlare']
];

// ==================== LISTA RIME (HARD) ====================
// Ogni coppia contiene una parola e un punto interrogativo
const rimeCoppieHard = [
    ['finito', '?'],
    ['contrasti', '?'],
    ['importante', '?'],
    ['scampo', '?'],
    ['mortale', '?'],
    ['show', '?'],
    ['colosseo', '?'],
    ['entusiasmo', '?'],
    ['sconfitti', '?'],
    ['brutto', '?'],
    ['fiasco', '?'],
    ['monaco', '?'],
    ['solitudine', '?'],
    ['resto', '?'],
    ['realtà', '?'],
    ['precisa', '?'],
    ['torna', '?'],
    ['tuffo', '?'],
    ['uomo', '?'],
    ['crollo', '?'],
    ['stanca', '?'],
    ['radio', '?'],
    ['combattere', '?'],
    ['identico', '?'],
    ['fratello', '?'],
    ['rapida', '?'],
    ['finirà', '?'],
    ['bellezza', '?'],
    ['presente', '?'],
    ['ottimismo', '?'],
    ['possibile', '?'],
    ['amore', '?'],
    ['coraggio', '?'],
    ['scusa', '?'],
    ['aprire', '?'],
    ['presa', '?'],
    ['telefono', '?'],
    ['vicino', '?'],
    ['viaggio', '?'],
    ['toro', '?'],
    ['gente', '?'],
    ['voce', '?'],
    ['era', '?'],
    ['antico', '?'],
    ['cancello', '?'],
    ['serra', '?'],
    ['prosciutto', '?'],
    ['gioco', '?'],
    ['cella', '?'],
    ['amare', '?']
];

// ==================== COSTANTI ====================
const BPM_TIMING = {
    boombap: 1333.34, // 90 BPM, intervallo per cella
    trap: 857.14      // 140 BPM
};
const VISIBLE_ROWS = 4;
const TOTAL_ROWS = 64;
const TOTAL_COLS = 4;
const TOTAL_CELLS = TOTAL_ROWS * TOTAL_COLS;

// ==================== STATO GLOBALE ====================
let selectedGenre = null;
let selectedDifficulty = null;
let currentCellIndex = 0;
let intervalId = null;
let audio = null;
let isPlaying = false;
let rowHeight = 0;
let colWidth = 0;
let currentTranslateY = 0; // traslazione corrente della griglia

// ==================== ELEMENTI DOM ====================
const genreScreen = document.getElementById('genre-screen');
const difficultyScreen = document.getElementById('difficulty-screen');
const gameScreen = document.getElementById('game-screen');
const grid = document.getElementById('grid');
const gridWrapper = document.getElementById('grid-wrapper');
const ball = document.getElementById('ball');
const genreLabel = document.getElementById('genre-label');
const difficultyLabel = document.getElementById('difficulty-label');
const btnStop = document.getElementById('btn-stop');

// ==================== UTILITÀ ====================
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomBeatPath(genre) {
    const num = Math.floor(Math.random() * 3) + 1;
    return `audio/${genre}${num}.mp3`;
}

// ==================== GESTIONE DIMENSIONI GRIGLIA ====================
function calculateDimensions() {
    const wrapperHeight = gridWrapper.clientHeight;
    if (wrapperHeight <= 0) {
        // Ancora non visibile, riprova più tardi (verrà chiamato di nuovo)
        return false;
    }
    rowHeight = wrapperHeight / VISIBLE_ROWS;
    grid.style.gridTemplateRows = `repeat(${TOTAL_ROWS}, ${rowHeight}px)`;
    grid.style.height = `${TOTAL_ROWS * rowHeight}px`;
    const wrapperWidth = gridWrapper.clientWidth;
    const totalFr = 1 + 1 + 1 + 2; // 5 frazioni
    colWidth = wrapperWidth / totalFr;
    return true;
}

// ==================== GENERAZIONE GRIGLIA ====================
function generateGrid(difficulty) {
    grid.innerHTML = '';
    currentTranslateY = 0;
    grid.style.transform = 'translateY(0px)';

    let coppie;
    if (difficulty === 'easy') {
        coppie = shuffleArray(rimeCoppieEasy).slice(0, 32);
    } else {
        coppie = shuffleArray(rimeCoppieHard).slice(0, 32);
    }

    // Per ogni coppia, decidiamo casualmente l'ordine (invertito o no)
    const pairsWithOrder = coppie.map(pair => {
        if (Math.random() < 0.5) {
            return [pair[0], pair[1]];
        } else {
            return [pair[1], pair[0]];
        }
    });

    const fourthColumnData = [];
    for (let pairIndex = 0; pairIndex < 32; pairIndex++) {
        const isBlue = pairIndex % 2 === 0;
        const colorClass = isBlue ? 'word-blue' : 'word-red';
        const pair = pairsWithOrder[pairIndex];

        // Primo elemento della coppia (riga pari della coppia)
        let text1 = pair[0];
        let class1 = colorClass;
        if (text1 === '?') class1 += ' question';

        // Secondo elemento (riga dispari della coppia)
        let text2 = pair[1];
        let class2 = colorClass;
        if (text2 === '?') class2 += ' question';

        fourthColumnData.push({ text: text1, colorClass: class1 });
        fourthColumnData.push({ text: text2, colorClass: class2 });
    }

    for (let row = 0; row < TOTAL_ROWS; row++) {
        for (let col = 0; col < TOTAL_COLS; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (col < 3) {
                cell.classList.add('empty');
            } else {
                const data = fourthColumnData[row];
                cell.textContent = data.text;
                // CORREZIONE: aggiungi le classi separatamente
                data.colorClass.split(' ').forEach(cls => cell.classList.add(cls));
            }
            grid.appendChild(cell);
        }
    }
}

// ==================== POSIZIONAMENTO PALLINA ====================
function positionBall(cellIndex) {
    const row = Math.floor(cellIndex / TOTAL_COLS);
    const col = cellIndex % TOTAL_COLS;

    let cellLeft;
    if (col === 0) cellLeft = colWidth * 0.5;
    else if (col === 1) cellLeft = colWidth + colWidth * 0.5;
    else if (col === 2) cellLeft = 2 * colWidth + colWidth * 0.5;
    else cellLeft = 3 * colWidth + (colWidth * 2) * 0.5;

    // La cella si trova a row * rowHeight + rowHeight/2 rispetto alla griglia non traslata.
    // Dopo la traslazione, il suo top visuale è (row * rowHeight + rowHeight/2) - currentTranslateY
    const cellTop = row * rowHeight + rowHeight / 2 - currentTranslateY;

    ball.style.left = cellLeft + 'px';
    ball.style.top = cellTop + 'px';
}

function triggerBallBounce() {
    ball.classList.remove('bounce');
    void ball.offsetWidth;
    ball.classList.add('bounce');
}

// ==================== GESTIONE SCROLL (AVANZA DI 2 RIGHE) ====================
function updateViewForRow(row) {
    if (row > 0 && row % 2 === 0) {
        currentTranslateY = row * rowHeight;
        grid.style.transform = `translateY(-${currentTranslateY}px)`;
    }
}

// ==================== AVVIO / STOP GIOCO ====================
function startGame(genre, difficulty) {
    selectedGenre = genre;
    selectedDifficulty = difficulty;

    genreScreen.classList.remove('active');
    difficultyScreen.classList.remove('active');
    gameScreen.classList.add('active');

    genreLabel.textContent = genre === 'boombap' ? '🎤 Boom Bap' : '🔥 Trap';
    genreLabel.className = genre === 'trap' ? 'trap' : '';
    difficultyLabel.textContent = difficulty === 'easy' ? 'Easy' : 'Hard';
    difficultyLabel.className = difficulty === 'hard' ? 'hard' : '';

    generateGrid(difficulty);

    // Breve attesa per il layout, poi calcola dimensioni e avvia
    setTimeout(() => {
        if (!calculateDimensions()) {
            // Se ancora non pronto, riprova dopo un altro po'
            setTimeout(() => {
                calculateDimensions();
                startGameLoop(genre);
            }, 100);
            return;
        }
        startGameLoop(genre);
    }, 80);
}

function startGameLoop(genre) {
    // Reset stato
    currentCellIndex = 0;
    currentTranslateY = 0;
    grid.style.transform = 'translateY(0px)';
    positionBall(0);
    triggerBallBounce();

    // Riproduci beat
    const beatPath = getRandomBeatPath(genre);
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    audio = new Audio(beatPath);
    audio.loop = true;
    audio.play().catch(err => console.warn('Audio play fallito:', err));

    isPlaying = true;

    if (intervalId) clearInterval(intervalId);
    const intervalTime = BPM_TIMING[genre];
    intervalId = setInterval(() => {
        if (!isPlaying) return;

        currentCellIndex++;
        if (currentCellIndex >= TOTAL_CELLS) {
            currentCellIndex = 0;
        }

        const row = Math.floor(currentCellIndex / TOTAL_COLS);
        updateViewForRow(row);
        positionBall(currentCellIndex);
        triggerBallBounce();
    }, intervalTime);
}

function stopGame() {
    isPlaying = false;
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
    }
    gameScreen.classList.remove('active');
    genreScreen.classList.add('active');
    selectedGenre = null;
    selectedDifficulty = null;
    currentCellIndex = 0;
    grid.innerHTML = '';
    currentTranslateY = 0;
    grid.style.transform = '';
    ball.style.left = '-100px';
    ball.style.top = '-100px';
}

// ==================== EVENT LISTENERS ====================
document.getElementById('btn-boombap').addEventListener('click', () => {
    selectedGenre = 'boombap';
    genreScreen.classList.remove('active');
    difficultyScreen.classList.add('active');
});

document.getElementById('btn-trap').addEventListener('click', () => {
    selectedGenre = 'trap';
    genreScreen.classList.remove('active');
    difficultyScreen.classList.add('active');
});

document.getElementById('btn-back-genre').addEventListener('click', () => {
    difficultyScreen.classList.remove('active');
    genreScreen.classList.add('active');
    selectedGenre = null;
});

document.getElementById('btn-easy').addEventListener('click', () => {
    if (selectedGenre) startGame(selectedGenre, 'easy');
});
document.getElementById('btn-hard').addEventListener('click', () => {
    if (selectedGenre) startGame(selectedGenre, 'hard');
});

btnStop.addEventListener('click', stopGame);

window.addEventListener('resize', () => {
    if (isPlaying) {
        calculateDimensions();
        positionBall(currentCellIndex);
        // Mantieni coerenza traslazione
        const row = Math.floor(currentCellIndex / TOTAL_COLS);
        updateViewForRow(row);
    }
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isPlaying) stopGame();
});

// Nascondi pallina all'avvio
ball.style.left = '-100px';
ball.style.top = '-100px';

console.log('🎤 Rimamelo pronto! Scegli genere e difficoltà.');