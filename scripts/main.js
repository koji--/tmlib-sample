/*
 * main.js
 */

/*
 * contant
 */
var SCREEN_WIDTH    = 680;              // スクリーン幅
var SCREEN_HEIGHT   = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

var PIECE_NUM_X     = 5;                // ピースの列数
var PIECE_NUM_Y     = 5;                // ピースの行数
var PIECE_NUM       = PIECE_NUM_X*PIECE_NUM_Y;  // ピース数
var PIECE_OFFSET_X  = 90;               // ピースオフセットX　
var PIECE_OFFSET_Y  = 240;              // ピースオフセットY
var PIECE_WIDTH     = 120;              // ピースの幅
var PIECE_HEIGHT    = 120;              // ピースの高さ
 
var FONT_FAMILY_FLAT= "'Helvetica-Light' 'Meiryo' sans-serif";  // フラットデザイン用フォント

// アセット
var ASSETS = {
    "bgm": "sounds/bgm.mp3",
    "booSE": "sounds/boo.mp3",
    "clearSE": "sounds/clear.mp3",
    "0001": "sounds/0000.mp3",
    "0002": "sounds/0001.mp3",
    "0003": "sounds/0002.mp3",
    "0004": "sounds/0003.mp3",
    "0005": "sounds/0004.mp3",
    "0006": "sounds/0005.mp3",
    "0007": "sounds/0006.mp3",
    "0008": "sounds/0007.mp3",
    "0009": "sounds/0008.mp3",
    "0010": "sounds/0009.mp3",
    "0011": "sounds/0010.mp3",
    "0012": "sounds/0011.mp3",
    "0013": "sounds/0012.mp3",
    "0014": "sounds/0013.mp3",
    "0015": "sounds/0014.mp3",
    "0016": "sounds/0015.mp3",
    "0017": "sounds/0016.mp3",
    "0018": "sounds/0017.mp3",
    "0019": "sounds/0018.mp3",
    "0020": "sounds/0019.mp3",
    "0021": "sounds/0020.mp3",
    "0022": "sounds/0021.mp3",
    "0023": "sounds/0022.mp3",
    "0024": "sounds/0023.mp3",
    "0025": "sounds/clear.mp3",
};

/*
 * main
 */
tm.main(function() {
        // アプリケーションセットアップ
        var app = tm.app.CanvasApp("#world");       // 生成
        app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);    // サイズ(解像度)設定
        app.fitWindow();                            // 自動フィッティング有効
        app.background = "rgba(250, 250, 250, 1.0)";// 背景色

        // ローディング
        var loading = tm.app.LoadingScene({
            width: SCREEN_WIDTH,    // 幅
            height: SCREEN_HEIGHT,  // 高さ
            assets: ASSETS,         // アセット
            nextScene: TitleScene,  // ローディング完了後のシーン
        });
        app.replaceScene( loading );    // シーン切り替え

        // 実行
        app.run();
});

/*
 * ゲームシーン
 */
tm.define("GameScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
        // bgm再生
        tm.asset.AssetManager.get("bgm").play();

        var self = this;
         
        // カレント数
        self.currentNumber = 1;

        // ピースグループ
        this.pieceGroup = tm.app.CanvasElement();
        this.addChild(this.pieceGroup);

        // 数字配列
        var nums = [].range(1, PIECE_NUM+1);  // 1~25
        nums.shuffle(); // シャッフル

        // ピースを作成
        for (var i=0; i<PIECE_NUM_Y; ++i) {
            for (var j=0; j<PIECE_NUM_X; ++j) {
                // 数値
                var number = nums[ i*PIECE_NUM_X+j ];
                // ピースを生成してピースグループに追加
                var piece = Piece(number).addChildTo(this.pieceGroup);
                // 座標を設定
                piece.x = j * 125 + PIECE_OFFSET_X;
                piece.y = i * 125 + PIECE_OFFSET_Y;
                // タッチ時のイベントリスナーを登録
                piece.onpointingstart = function() {
                    // 正解かどうかの判定
                    if (this.number === self.currentNumber) {
                        // クリアかどうかの判定
                        if (self.currentNumber === PIECE_NUM) {
                            // リザルト画面に遷移
                            self.app.replaceScene(ResultScene({
                                time: self.timerLabel.text,
                            }));
                            // クリアSE再生
                            tm.asset.AssetManager.get("clearSE").clone().play();
                        }
                        // 正解 SE 再生
                        var number_se = ("000" + self.currentNumber).substr(-4);
                        tm.asset.AssetManager.get(number_se).clone().play();
                        self.currentNumber += 1;// インクリメント
                        this.disable();         // ボタン無効
                    }
                    else {
                        // 不正解 SE 再生
                        tm.asset.AssetManager.get("booSE").clone().play();
                    }
                };
            }
        }

        // タイマーラベル
        this.timerLabel = tm.app.Label("").addChildTo(this);
        this.timerLabel
            .setPosition(650, 160)
            .setFillStyle("#444")
            .setAlign("right")
            .setBaseline("bottom")
            .setFontFamily(FONT_FAMILY_FLAT)
            .setFontSize(128);

        // タイトルボタン
        var titleBtn = tm.app.FlatButton({
            width: 300,
            height: 100,
            text: "TITLE",
            bgColor: "#888",
        }).addChildTo(this);
        titleBtn.position.set(180, 880);
        titleBtn.onpointingend = function() {
            self.app.replaceScene(TitleScene());
        };
        // リスタートボタン
        var restartBtn = tm.app.FlatButton({
            width: 300,
            height: 100,
            text: "RESTART",
            bgColor: "#888",
        }).addChildTo(this);
        restartBtn.position.set(500, 880);
        restartBtn.onpointingend = function() {
            self.app.replaceScene(GameScene());
        };
    },

    onenter: function(e) {
        e.app.pushScene(CountdownScene());
        this.onenter = null;
    },

    update: function(app) {
        // タイマー更新
        var time = ((app.frame/app.fps)*1000)|0;
        var timeStr = time + "";
        this.timerLabel.text = timeStr.replace(/(\d)(?=(\d\d\d)+$)/g, "$1.");
    }
});

/*
 * ピースクラス
 */
tm.define("Piece", {
    superClass: "tm.app.Shape",

    init: function(number) {
        this.superInit(PIECE_WIDTH, PIECE_HEIGHT);
        // 数値をセット
        this.number = number;

        this.setInteractive(true);
        this.setBoundingType("rect");

        var angle = tm.util.Random.randint(0, 360);
        this.canvas.clearColor("hsl({0}, 80%, 70%)".format(angle));

        this.label = tm.app.Label(number).addChildTo(this);
        this.label
            .setFontSize(70)
            .setFontFamily(FONT_FAMILY_FLAT)
            .setAlign("center")
            .setBaseline("middle");
    },

    disable: function() {
        this.setInteractive(false);

        var self = this;
        this.tweener
            .clear()
            .to({scaleX:0}, 100)
            .call(function() {
                    self.canvas.clearColor("rgb(100, 100, 100)");
                }.bind(this)
            )
            .to({scaleX:1, alpha:0.5}, 100)
    }
});

tm.define("CountdownScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
        var self = this;

        var filter = tm.app.Shape(SCREEN_WIDTH, SCREEN_HEIGHT).addChildTo(this);
        filter.origin.set(0, 0);
        filter.canvas.clearColor("rgba(250, 250, 250, 1.0)");

        var label = tm.app.Label(3).addChildTo(this);
        label.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y)
            .setFillStyle("#888")
            .setFontFamily(FONT_FAMILY_FLAT)
            .setFontSize(512)
            .setAlign("center")
            .setBaseline("middle");

        label.tweener
            .set({
                scaleX: 0.5,
                scaleY: 0.5,
                text: 3
            })
            .scale(1)
            .set({
                scaleX: 0.5,
                scaleY: 0.5,
                text: 2
            })
            .scale(1)
            .set({
                scaleX: 0.5,
                scaleY: 0.5,
                text: 1
            })
            .scale(1)
            .call(function() {
                self.app.frame = 0;
                self.app.popScene();
            });
    },
});

tm.define("TitleScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();

        this.fromJSON({
            children: [
                {
                    type: "Label",
                    name: "titleLabel",
                    text: "FlaTM Touch",
                    x: SCREEN_CENTER_X,
                    y: 200,
                    fillStyle: "#444",
                    fontSize: 60,
                    fontFamily: FONT_FAMILY_FLAT,
                    align: "center",
                    baseline: "middle",
                },
                {
                    type: "Label",
                    name: "nextLabel",
                    text: "TOUCH START",
                    x: SCREEN_CENTER_X,
                    y: 650,
                    fillStyle: "#444",
                    fontSize: 26,
                    fontFamily: FONT_FAMILY_FLAT,
                    align: "center",
                    baseline: "middle",
                }
            ]
        });

        this.nextLabel.tweener
            .fadeOut(500)
            .fadeIn(1000)
            .setLoop(true);
    },
    onpointingstart: function() {
        this.app.replaceScene(GameScene());
    },
});

tm.define("ResultScene", {
    superClass: "tm.app.Scene",

    init: function(param) {
        this.superInit();

        this.fromJSON({
            children: [
                {
                    type: "Label",
                    name: "timeLabel",
                    x: SCREEN_CENTER_X,
                    y: 320,
                    fillStyle: "#888",
                    fontSize: 128,
                    fontFamily: FONT_FAMILY_FLAT,
                    text: "99.999",
                    align: "center",
                },
                {
                    type: "FlatButton",
                    name: "tweetButton",
                    init: [
                        {
                            text: "TWEET",
                            bgColor: "hsl(240, 80%, 70%)",
                        }
                    ],
                    x: SCREEN_CENTER_X-160,
                    y: 650,
                },
                {   
                    type: "FlatButton",
                    name: "backButton",
                    init: [
                        {
                            text: "BACK",
                            bgColor: "hsl(240, 0%, 70%)",
                        }
                    ],
                    x: SCREEN_CENTER_X+160,
                    y: 650,
                },
            ]
        });

        this.timeLabel.text = param.time;

        var self = this;
        // tweet ボタン
        this.tweetButton.onclick = function() {
            var twitterURL = tm.social.Twitter.createURL({
                type    : "tweet",
                text    : "tmlib.js チュートリアルゲームです. Time: {time}".format(param),
                hashtags: "tmlib,javascript,game",
                url     : "http://tmlife.net/?p=9781", // or window.document.location.href
            });
            window.open(twitterURL);
        };
        // back ボタン
        this.backButton.onpointingstart = function() {
            self.app.replaceScene(TitleScene());
        };
    },
});

