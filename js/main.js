/**
 * game-of-life
 * ライフゲーム
 * @see https://ja.wikipedia.org/wiki/%E3%83%A9%E3%82%A4%E3%83%95%E3%82%B2%E3%83%BC%E3%83%A0
 * 
 * ■がうねうねするやつ。初期状態だけ決めて、あとは■が繁殖したり滅亡したりをただひたすら眺めるゲーム。
 * ちゃんとした学者さんにとっては研究対象らしいが、ただうねうねするのを眺めるだけでも楽しい。
*/

/* global $ */

let constant = {
    width: 60,
    height: 60,
    clippedWidth: 40,
    clippedHeight: 40,
    preset: {
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
    nowStage: [],
    nextStage: [],
    previousStage: [],
    origin: [],
    isStarted: true,
    handleOfInterval: 0,
};

/* モデル */
class Model {
    /**
     * 
     * @param {int} width 
     * @param {int} height 
     */
    static generateEmptyStage(width, height) {
        return new Array(width * height);
    }
    /**
     * 次世代を生成する。
     * @param {*} stage 
     * @param {*} width 
     * @param {*} height 
     * @return {Array}
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
     * @param {*} stage 
     * @param {*} idx 
     * @param {*} width 
     * @param {*} height 
     * @return {int} 0=死亡 1=誕生or維持
     */
    static whatComesNext(stage, idx, width, height) {
        return Math.round(Math.random());   //とりあえず適当に返す。
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
    
    static getOneDimIdxFrom(x, y, width) {
        return y * width + x;
    }
    static applyPreset(width, height, formation) {
        let stage = Model.generateEmptyStage(width, height);
        let formationWidth = formation[0].length;
        let formationHeight = formation.length;
        
        //プリセットの初期配置を、ステージの中央に配置する。
        //配置のための開始座標を決定する。
        
        
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
    //まずはじめに、初期状態を決める。天地創造！！

    //セルをクリックすると、色がついたりつかなかったりする。それに合わせてstateの該当箇所も置き換える。
    $("#stage")
        .on("click", ".stage__cell--live", (e) => {
            $(e.target).removeClass("stage__cell--live").addClass("stage__cell--dead");
            state.nowStage[$(this).data("idx")] = 0;
        })
        .on("click", ".stage__cell--dead", (e) => {
            $(e.target).removeClass("stage__cell--dead").addClass("stage__cell--live");
            state.nowStage[$(this).data("idx")] = 1;
        });
    //プリセットのローディング。
    $("#apply").on("click", (e) => {
        let selectedPreset = $("#preset").val();
        if (selectedPreset == "none") {
            state.nowStage = Model.generateEmptyStage(constant.width, constant.height);
        } else if (Object.keys(constant.preset).indexOf(selectedPreset) !== -1) {
            
        } else {
            return;
        }
        Drawer.buildAndDrawStage(state.nowStage, constant.width, constant.height, constant.clippedWidth, constant.clippedHeight);
    });
    //手で初期状態を入れてもらう。入れ終わったら「Launch」ボタンを押して始まる。
    $("button#launch").click((e) => {
        if (state.isStarted) {
            return false;
        }
        state.isStarted = true;
        state.handleOfInterval = setInterval(() => {
            state.previousStage = state.nowStage.slice(0);  //コピー
            state.nowStage = Model.buildNextGeneration(state.nowStage, constant.width, constant.height);
            Drawer.buildAndDrawStage(state.nowStage, constant.width, constant.height, constant.clippedWidth, constant.clippedHeight);
        }, 500);

        
    });
    //いつでもStopボタンで止められる。
    $("button#stop").click((e) => {
        if (!state.isStarted) {
            return false;
        }
        state.isStarted = false;
        clearInterval(state.handleOfInterval);
    });
});