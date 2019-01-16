/**
 * game-of-life
 * ライフゲーム
 * @see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B2%E3%83%BC%E3%83%A0
 * 
 * ■がうねうねするやつ。初期状態だけ決めて、あとは■が繁殖したり滅亡したりをただひたすら眺めるゲーム。
 * ちゃんとした学者さんにとっては研究対象らしいが、ただうねうねするのを眺めるだけでも楽しい。
*/

/* global $ */
const LIVE = 1;
const DEAD = 0;
let constant = {
    width: 60,
    height: 60,
    clippedWidth: 40,
    clippedHeight: 40,
    tickMSec: 250,
    preset: {
        "none": [[0]],
        "pentadecathlon": [
            [0, 1, 0, 0, 0, 0, 1, 0],
            [1, 1, 0, 0, 0, 0, 1, 1],
            [0, 1, 0, 0, 0, 0, 1, 0],
        ],
        "galaxy": [
            [1, 1, 1, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 1, 1, 1, 1],
        ],
        "glider_gun": [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
        ],
        "puffer_train": [
            [0, 0, 0, 1, 0,],
            [0, 0, 0, 0, 1,],
            [1, 0, 0, 0, 1,],
            [0, 1, 1, 1, 1,],
            [0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0,],
            [1, 0, 0, 0, 0,],
            [0, 1, 1, 0, 0,],
            [0, 0, 1, 0, 0,],
            [0, 0, 1, 0, 0,],
            [0, 1, 0, 0, 0,],
            [0, 0, 0, 0, 0,],
            [0, 0, 0, 0, 0,],
            [0, 0, 0, 1, 0,],
            [0, 0, 0, 0, 1,],
            [1, 0, 0, 0, 1,],
            [0, 1, 1, 1, 1,],
        ],
    },
};
let state = {
    //各種ステージ。このデータを元にゲームが進行する。
    //処理の簡便さを重視して1次元配列で実装し、各々の処理の中で2次元配列系が必要になったらその都度変換する形にしてみたが、果たして本当に簡便になっているのかは疑問。
    nowStage: [],
    nextStage: [],
    previousStage: [],
    origin: [],
    isStarted: true,
    generationCount: 1,
    handleOfInterval: 0,
};

/* モデル */
class Model {
    /**
     * 空のステージを作る。
     * @param {int} width 
     * @param {int} height 
     */
    static generateEmptyStage(width, height) {
        let result = new Array(width * height);
        for (let i = 0; i < result.length; i++) {
            result[i] = DEAD;   //初期状態はDEADから。
        }
        return result;
    }
    /**
     * 次世代を生成する。
     * @param {Array} stage 
     * @param {int} width 
     * @param {int} height 
     * @return {Array}  次世代のステージ
     */
    static buildNextGeneration(stage, width, height) {
        let result = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let nowIdx = Model.getOneDimIdxFrom(x, y, width);
                result[nowIdx] = Model.whatComesNext(stage, nowIdx, width, height);
            }
        }

        return result;
    }
    /**
     * 対象セルの次の状態はどうなるのか返す。
     * @param {Array} stage 
     * @param {int} idx 
     * @param {int} width 
     * @param {int} height 
     * @return {int} DEAD or LIVE
     */
    static whatComesNext(stage, idx, width) {
        //ここがライフゲームの肝ですです。ルールを適用して、対象セルは次世代には生きている(or生まれる)のか、それとも死んでいるのかを判別します。
        //ルールは以下の通り。すべて回りの隣接8セルを見て判断します。
        let neighborhoods = Model.getNeighborhoods(stage, idx, width);
        
        let livingNeighborhoods = neighborhoods.reduce((acc, cur) => acc + cur, 0);
        
        if (stage[idx] === DEAD) {
            //ルール1、隣接セルに生きているセルがちょうど3個あったら誕生。なければ死亡。(これだけ死亡セルに対するルール)
            return Number((livingNeighborhoods === 3));
        } else {
            if (livingNeighborhoods === 2 | livingNeighborhoods === 3) {
                //ルール2、生きているセルに隣接する生きたセルが2個か3個なら、生存。
                return LIVE;
            } else if (livingNeighborhoods <= 1) {
                //ルール3、生きているセルに隣接する生きたセルが1個以下なら、死亡。
                return DEAD;
            } else if (livingNeighborhoods >= 4) {
                //ルール4、生きているセルに隣接する生きたセルが4個以上なら、死亡。
                return DEAD;
            }
        }
        
    }
    /**
     * 対象セルに隣接するセルを取得する。
     * @param {Array} stage
     * @param {int} idx
     * @param {int} width ステージの幅
     */
    static getNeighborhoods(stage, idx, width) {
        let neighborhoods = [];
        //隣接要素の存在確認をしながら、一つづつピックアップしていく。
        if (stage[idx - width - 1] !== undefined) neighborhoods.push(stage[idx - width - 1]);
        if (stage[idx - width] !== undefined) neighborhoods.push(stage[idx - width]);
        if (stage[idx - width + 1] !== undefined) neighborhoods.push(stage[idx - width + 1]);
        if (stage[idx - 1] !== undefined) neighborhoods.push(stage[idx - 1]);
        if (stage[idx + 1] !== undefined) neighborhoods.push(stage[idx + 1]);
        if (stage[idx + width - 1] !== undefined) neighborhoods.push(stage[idx + width - 1]);
        if (stage[idx + width] !== undefined) neighborhoods.push(stage[idx + width]);
        if (stage[idx + width + 1] !== undefined) neighborhoods.push(stage[idx + width + 1]);

        return neighborhoods;
    }
    /**
     * 全滅したか。
     * @param {Array} stage 
     */
    static isDestroyed(stage) {
        //生存(1)の要素が見つからなかったときにtrueを返す。
        return (stage.indexOf(1) === -1);
    }
    /**
     * 停滞しているか。
     * @param {Array} stage 
     * @param {Array} previousStage
     */
    static isStagnating(stage, previousStage) {
        //この判別はめんどくさい・・・やめよっかな
    }
    /**
     * 2次元座標系を元に、ステージ上のインデックスを求める。
     * ステージ自体は1次元配列で実装されているため、このような変換処理が必要になる。
     * @param {int} x 
     * @param {int} y 
     * @param {int} width 
     */
    static getOneDimIdxFrom(x, y, width) {
        return y * width + x;
    }
    static applyPreset(width, height, formation) {
        let stage = Model.generateEmptyStage(width, height);
        let formationWidth = formation[0].length;
        let formationHeight = formation.length;
        
        //プリセットの初期配置を、ステージの中央に配置する。
        //プリセットがステージの真ん中に来るようにしたときの、開始座標を割り出す。
        let startX = Math.floor(width / 2) - Math.floor(formationWidth / 2);
        let startY = Math.floor(height / 2) - Math.floor(formationHeight / 2);
        //プリセット配置図の中にあるセルを、ステージの真ん中に位置するように配置する。
        for (let y = 0; y < formation.length; y++) {
            for (let x = 0; x < formation[y].length; x++) {
                let targetIdx = Model.getOneDimIdxFrom(startX + x, startY + y, width);
                stage[targetIdx] = formation[y][x];
            }
        }

        return stage;
    }
}

/* 描画関数群 */
class Drawer {
    /**
     * ステージを描画する。
     * @param {Array} stage 
     * @param {int} width 
     * @param {int} height 
     */
    static buildAndDrawStage(stage, width, height, clippedWidth, clippedHeight) {
        //stageの総数がwidth * heightと同じでなければエラー。
        if (stage.length !== width * height) {
            throw new Error("ステージの大きさ指定が不正です。");
        }
        //clipped~ がもとの長さを上回っていたらエラー。
        if (width < clippedWidth || height < clippedHeight) {
            throw new Error("clippedWidth, clippedHeightは元の大きさより小さくしてください。");
        }

        let $root = $("table#stage");
        $root.empty();
        
        //ステージから、中心部を起点に切り取るように描画する。そのための始点・終点の割り出しを行う。
        let startWidth = Math.floor((width - clippedWidth) / 2);
        let startHeight = Math.floor((height - clippedHeight) / 2);
        let endWidth = startWidth + clippedWidth;
        let endHeight = startHeight + clippedHeight;
        //HTML要素書き出し。
        let body = "";
        for (let y = startHeight; y < endHeight; y++) {
            let tmpElement = "<tr>";
            for (let x = startWidth; x < endWidth; x++) {
                let nowIdx = Model.getOneDimIdxFrom(x, y, width);
                if (stage[nowIdx] === 1) {
                    tmpElement += "<td class='stage__cell stage__cell--live' data-idx='" + nowIdx + "'></td>";
                } else {
                    tmpElement += "<td class='stage__cell stage__cell--dead' data-idx='" + nowIdx + "'></td>";
                }
            }
            tmpElement += "</tr>";
            body += tmpElement;
        }
        $root.html(body);
    }
}



function initialize() {
    //変数初期化、ステージ初期化
    state.nowStage = Model.generateEmptyStage(constant.width, constant.height);
    state.nextStage = [];
    state.previousStage = [];
    state.origin = [];
    state.isStarted = false;
    state.handleOfInterval = 0;
    //描画する。実際のステージよりだいぶ小さめに描画するようにしたい。40*40くらいで。
    Drawer.buildAndDrawStage(state.nowStage, constant.width, constant.height, constant.clippedWidth, constant.clippedHeight);
}

$(() => {
    //一番最初に初期化する。
    initialize();

    /////////////////////
    // イベントハンドラ
    /////////////////////

    //まずはじめに、初期状態を決める。天地創造！！
    //セルをクリックすると、色がついたりつかなかったりする。それに合わせてstateの該当箇所も置き換える。
    $("#stage")
        .on("click", ".stage__cell--live", (e) => {
            $(e.target).removeClass("stage__cell--live").addClass("stage__cell--dead");
            state.nowStage[$(e.target).data("idx")] = DEAD;
        })
        .on("click", ".stage__cell--dead", (e) => {
            $(e.target).removeClass("stage__cell--dead").addClass("stage__cell--live");
            state.nowStage[$(e.target).data("idx")] = LIVE;
        });
    
    //また、初期状態を自分で入れる他、プリセットをロードして、よく知られた盤面を再現することもできる。選定基準はにしふなの独断と偏見。
    $("#apply").on("click", (e) => {
        let selectedPreset = $("#preset").val();
        if (Object.keys(constant.preset).indexOf(selectedPreset) !== -1) {
            state.nowStage = Model.applyPreset(constant.width, constant.height, constant.preset[selectedPreset]);
        } else {
            return;
        }
        Drawer.buildAndDrawStage(state.nowStage, constant.width, constant.height, constant.clippedWidth, constant.clippedHeight);
    });

    //初期状態を入れ終わったら、「Launch」ボタンを押して始める。
    $("button#launch").click((e) => {
        if (state.isStarted) {
            return false;
        }

        state.isStarted = true;
        state.generationCount = 1;
        $("#now-generation").text(state.generationCount + "世代目");

        state.handleOfInterval = setInterval(() => {
            state.previousStage = state.nowStage.slice(0);  //コピー
            state.nowStage = Model.buildNextGeneration(state.nowStage, constant.width, constant.height);
            Drawer.buildAndDrawStage(state.nowStage, constant.width, constant.height, constant.clippedWidth, constant.clippedHeight);
            state.generationCount++;
            $("#now-generation").text(state.generationCount + "世代目");

            //終了判定。今の世代が全滅していたら終わらせる。
            if (Model.isDestroyed(state.nowStage)) {
                $("button#stop").click();
            }
        }, constant.tickMSec);

        $(e.target).addClass("control-panel__button--active");
    });
    //いつでもStopボタンで止められる。
    $("button#stop").click((e) => {
        if (!state.isStarted) {
            return false;
        }
        state.isStarted = false;
        clearInterval(state.handleOfInterval);

        $("button#launch").removeClass("control-panel__button--active");
        $("#now-generation").text(state.generationCount + "世代目(終了)");
    });
});