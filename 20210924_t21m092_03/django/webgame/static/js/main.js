/**
 * **** **** **** **** **** **** **** ****
 * 定数
 * **** **** **** **** **** **** **** ****
 */
INTERVAL = 32;          // 30FPS（1フレームを32ms間隔で処理）

CELL_SIZE = 128;        // セルサイズ

// ステージの位置
STAGE_LEFT = 64;
STAGE_TOP = 80;
STAGE_WIDTH = 512;
STAGE_HEIGHT = 384;

/**
 * **** **** **** **** **** **** **** ****
 * クラス
 * **** **** **** **** **** **** **** ****
 */
/**
 * セルクラス
 */
class Cell {
    /**
     * @param left      左端のx座標
     * @param top       上端のy座標
     * @param width     セルの幅
     * @param height    セルの高さ
     */
    constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    }
    /**
     * x, y座標がセルの範囲内か判定
     * @param x x座標
     * @param y y座標
     */
    isWithin(x, y) {
        if (x < this.left || this.left + this.width < x) return false;
        if (y < this.top || this.top + this.height < y) return false;
        return true;
    }
}

/**
 * **** **** **** **** **** **** **** ****
 * グローバル変数
 * **** **** **** **** **** **** **** ****
 */
let canvas = null;              // キャンバス
let context = null;             // 描画用コンテキスト
let titleImage = null;          // タイトル画像Imageオブジェクト
let backgroundImage = null;     // 背景画像Imageオブジェクト

// フラグ
let phase = -1;                 // ゲームフェーズフラグ {0: タイトルフェーズ, 1: カウントダウンフェーズ, 2: タッチフェーズ, 3: ゲームオーバーフェーズ}
let isTitleGuide = true;        // タイトルガイド点滅用フラグ {true: 表示, false: 非表示}

// 時間制御用の最終取得時刻
let lastTitleTime = -1;         // タイトルガイド表示切替用
let lastCountDownTime = -1;     // カウントダウン表示用
let lastPutTime = -1;           // 配置用
let lastReducedTime = -1;       // 残り時間更新用
let lastTimeUpTime = -1;        // タイムアップ表示用

// ゲームデータ
let map = null;                 // マップデータ
let count = -1;                 // カウントダウン用の残りカウント
let remainingTime = -1;         // 残り時間
let score = 0;                  // スコア
let highScore = 0;              // ハイスコア

let cells = new Array(3);       // セル
for (let y = 0; y < cells.length; y++) {
    cells[y] = new Array(4);
}
for (let y = 0; y < cells.length; y++) {
    for (let x = 0; x < cells[y].length; x++) {
        cells[y][x] = new Cell(STAGE_LEFT + CELL_SIZE * x, STAGE_TOP + CELL_SIZE * y, CELL_SIZE, CELL_SIZE);
    }
}

/**
 * **** **** **** **** **** **** **** ****
 * メイン処理
 * **** **** **** **** **** **** **** ****
 */
/**
 * 全体の初期化処理
 */
function init() {
    // キャンバス要素の取得
    canvas = document.getElementById("a_canvas");
    // 描画用コンテキストの取得
    context = canvas.getContext("2d");

    // イベントリスナの追加
    canvas.addEventListener('click' , onCanvasClick , false);

    // Imageオブジェクトの生成
    titleImage = new Image();
    titleImage.src = titleSrc;
    titleImage.onload = function() {
        console.log(titleImage.src + " : ロード完了");
        drawTitle();
    }

    backgroundImage = new Image();
    backgroundImage.src = backgroundSrc;
    backgroundImage.onload = function() {
        console.log(backgroundImage.src + " : ロード完了");
        
    // ゲームデータのリセット
    resetData();
    }
}

/**
 * **** **** **** **** **** **** **** ****
 * イベント関連
 * **** **** **** **** **** **** **** ****
 */
/**
 * ページ読込み
 */
$(function() {
    // 全体の初期化処理
    init();
    // メインループの開始
    runMainLoop();
});

/**
 * **** **** **** **** **** **** **** ****
 * ビュー関連
 * **** **** **** **** **** **** **** ****
 */
/**
 * タイトル画面の描画
 */
function drawTitle() {
    context.drawImage(titleImage, 0, 0);
}

/**
 * ゲームデータのリセット
 */
function resetData() {
    resetMap();
    count = 3;
    remainingTime = 15;
    score = 0;
}
/**
 * マップデータのリセット
 */
function resetMap() {
    map = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ];
}
/**
 * メインループの開始
 */
function runMainLoop() {
    // ゲームフェーズをタイトルフェーズに移行する
    phase = 0;

	// メインループを開始する
    setTimeout(mainLoop, 0);
    lastTitleTime = Date.now();
}
/**
 * メインループ
 */
function mainLoop() {
    let mainLoopTimer = setTimeout(mainLoop, INTERVAL);
    let now = -1;

    switch (phase) {
    case 0:
        // タイトルフェーズ
        now = Date.now();
        if (now - lastTitleTime >= 500) {
            // 0.5秒に1回のタイミングでタイトルガイドを点滅させる。
            lastTitleTime = Date.now();
            isTitleGuide = !isTitleGuide;
        }
        drawTitle();
        drawScore();
        drawHighScore();
        break;
        
    case 1:
        // カウントダウンフェーズ
        now = Date.now();
        if (now - lastCountDownTime >= 1000) {
            // 1秒に1回カウントダウンする
            lastCountDownTime = Date.now();
            if (--count < 0) {
                // カウントダウンが終了したらタッチフェーズに移行する
                phase = 2;
                lastPutTime = Date.now();
                lastReducedTime = Date.now();
            }
        }
        drawBackground();
        drawScore();
        drawHighScore();
        drawCount();
        drawRemainingTime();
        break;
    
    case 2:
        // タッチフェーズ
        now = Date.now();
        if (now - lastPutTime >= 2000) {
            // 2秒に1回のタイミングでターゲットを配置する
            lastPutTime = Date.now();
            put();
        }
        if (now - lastReducedTime >= 1000) {
            // 1秒ごとに残り時間を減らす。
            lastReducedTime = Date.now();
            if (--remainingTime <= 0) {
                // 残り時間がなくなったらゲームオーバーフェーズに移行する。
                lastTimeUpTime = Date.now();
                phase = 3;
            }
        }
        drawBackground();
        drawScore();
        drawHighScore();
        drawMap();
        drawRemainingTime();
        break;
    
    case 3:     // 以下を追加
        // ゲームオーバーフェーズ
        now = Date.now();
        if (now - lastTimeUpTime >= 3000) {
            // タイムアップ表示後3秒後にタイトルフェーズに移行する。
            phase = 0;
        }
        drawBackground();
        drawScore();
        drawHighScore();
        drawMap();
        drawRemainingTime();
        drawTimeUp();
        break;
    }
}


/**
 * タイトル画面の描画
 */
function drawTitle() {
    context.drawImage(titleImage, 0, 0);

    if (isTitleGuide == false) return;

    context.fillStyle = "white";
    context.font = "32px arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
    context.shadowBlur = null;
    context.fillText("Click anywhere to start.", 320, 240);
}
/**
 * スコアの描画
 */
function drawScore() {
    context.fillStyle = "white";
    context.font = "16px arial";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.shadowColor = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
    context.shadowBlur = null;
    context.fillText("SCORE", 16, 16);

    context.fillStyle = "white";
    context.font = "16px arial";
    context.textAlign = "right";
    context.textBaseline = "top";
    context.shadowColor = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
    context.shadowBlur = null;
    context.fillText(String(score), 208, 32);
}
/**
 * ハイスコアの描画
 */
function drawHighScore() {
    context.fillStyle = "white";
    context.font = "16px arial";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.shadowColor = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
    context.shadowBlur = null;
    context.fillText("HIGH SCORE", 432, 16);

    context.fillStyle = "white";
    context.font = "16px arial";
    context.textAlign = "right";
    context.textBaseline = "top";
    context.shadowColor = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
    context.shadowBlur = null;
    context.fillText(String(highScore), 624, 32);
}
/**
 * キャンバスへのマウスクリック
 */
function onCanvasClick(e) {
    // ウィンドウ座標からキャンバス座標に変換する
    let loc = windowToCanvas(e.clientX, e.clientY); 

    switch (phase) {
    case 0:
	    // タイトルフェーズで画面がクリックされた
        lastCountDownTime = Date.now();
	    resetData();
	    // カウントダウンフェーズに移行する。
	    phase = 1;
	    break;
	    
	case 2:
        // タッチフェーズでセルがクリックされた
        for (let y = 0; y < cells.length; y++) {
            for (let x = 0; x < cells[y].length; x++) {
                if (cells[y][x].isWithin(loc.x, loc.y)) {
                    isTouched(x, y);
                }
            }
        }
        break;
    }
}
/**
 * 背景の描画
 */
function drawBackground() {
    context.drawImage(backgroundImage, 0, 0);
}
/**
 * カウントの描画
 */
function drawCount() {
    strCount = count <= 0 ? "GO!" : count;

    context.fillStyle = "white";
    context.font = "384px arial";
    context.textAlign = "center";
    context.textBaseline = "top";
    context.shadowColor = "black";
    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;
    context.shadowBlur = 20;
    context.fillText(strCount, canvas.width / 2, STAGE_TOP, STAGE_WIDTH);
}
/**
 * 残り時間の描画
 */
function drawRemainingTime() {
    context.fillStyle = remainingTime <= 5 ? "red" : "white";
    context.font = "48px arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
    context.shadowBlur = null;
    context.fillText(String(remainingTime), 320, 40);
}
/**
 * ランダムにターゲットを配置する。
 */
function put() {
    resetMap();
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            // セルごとに40%の確率でターゲットを配置する。
            if (Math.random() > 0.4) continue;
            map[y][x] = 1;
        }
    }
}
/**
 * マップの描画
 */
function drawMap() {
    context.shadowColor = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;
    context.shadowBlur = null;
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] == 0) continue;

            let left = STAGE_LEFT + CELL_SIZE * x;
            let top = STAGE_TOP + CELL_SIZE * y;
            context.strokeStyle = "white";
            context.fillStyle = "skyblue";
            context.strokeRect(left, top, CELL_SIZE, CELL_SIZE);
            context.fillRect(left, top, CELL_SIZE, CELL_SIZE);
        }
    }
}
/**
 * ウィンドウ座標からキャンバス座標に変換する
 * @param wx		ウィンドウ上のx座標
 * @param wy		ウィンドウ上のy座標
 */
function windowToCanvas(wx, wy) {
	let bbox = canvas.getBoundingClientRect();
	return {
		x: (wx - bbox.left) * (canvas.width / bbox.width),
		y: (wy - bbox.top)  * (canvas.height / bbox.height)
	};
}
/**
 * ターゲットがタッチされたか判定
 * @param x タッチされたx座標
 * @param y タッチされたy座標
 * @return true: 正解, false: ミス
 */
function isTouched(x, y) {
    if (map[y][x] == 1) {
        map[y][x] = 0;
        score += 100;
        highScore = score > highScore ? score : highScore;
        return true;
    } else {
        return false;
    }
}
/**
 * タイムアップの描画
 */
function drawTimeUp() {
    context.fillStyle = "white";
    context.font = "384px arial";
    context.textAlign = "center";
    context.textBaseline = "top";
    context.shadowColor = "black";
    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;
    context.shadowBlur = 20;
    context.fillText("TIME UP!", canvas.width / 2, STAGE_TOP, STAGE_WIDTH);
}