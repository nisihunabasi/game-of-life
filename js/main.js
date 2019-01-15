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

};
let state = {
    nowStage: [],
    nextStage: [],
    origin: []
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
                if (stage[x * y] === 1) {
                    tmpElement += "<td class='stage__cell stage__cell--live'></td>";
                } else {
                    tmpElement += "<td class='stage__cell stage__cell--dead'></td>";
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
    state.origin = [];
    //描画する。実際のステージよりだいぶ小さめに描画するようにしたい。40*40くらいで。
    Drawer.buildAndDrawStage(state.nowStage, constant.width, constant.height, constant.clippedWidth, constant.clippedHeight);
}

$(() => {
    //一番最初に初期化する。
    initialize();
    //まずはじめに、初期状態を決める。天地創造！！
    //手で入れてもらう。入れ終わったら「Start」ボタンを押して始まる。
    $("button#game-start").click((e) => {
        Drawer.buildStage();
    });
});