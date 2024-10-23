window.mba_init_done = 0;
type_game = "binh";
window.delay = lodia => {
    return new Promise(laurabeth => {
        return setTimeout(laurabeth, lodia);
    });
};
window.mba_host_acc_id = "";
window.boxPlayArrBinh = [];
window.indexCard = -1;
window.money = 0;
window.arrPlay = [];
window.myCard = "";
window.numPlayers = 2;
window.dupRoomID = 0;
window.dupRecordID = 0;
window.nextGame = 0;
window.gg = null;
window.playerInRoom = []
async function mba_init() {
    // let playerInRoom = [];
    while (!mba_init_done) {
        await delay(1e3);
        try {
            window.mba_gm = __require("GamePlayManager").default.getInstance();
            window.wscHdl = __require("WSCardGameHandle").default.getInstance();
            window.mba_JoinRoom = __require("GamePlayManager").default.getInstance();
            window.mba_GameController = __require('GameController').default.prototype;
            window.gameConfig = __require("GameConfigManager").default.getInstance();
            window.gameConfig.autoReady = false;
            if (typeof window.wscHdl !== "undefined") {
                window.mba_init_done = 1;
                (function () {
                    const ad = wscHdl.onExtensionResponse;
                    wscHdl.onExtensionResponse = function (responseData, payloadData) {
                        ad.call(wscHdl, responseData, payloadData);
                        // console.log("responseData: ", responseData);
                        if (payloadData.cmd == 700 || payloadData.cmd == 750) {
                            let cardArray = payloadData.cs;
                            window.myCard = cardArray.toString();
                            window.numPlayers = payloadData.ps.length;
                            window.arrPlay = [];
                            payloadData.ps.forEach(jainil => {
                                const _player = {uid: jainil.uid, dn: ""};
                                playerInRoom.forEach(player => {
                                    if (player.uid == jainil.uid) {
                                        _player.dn = player.dn;
                                    }
                                });

                                window.arrPlay.push(_player);
                            });

                            updateMyPosition();
                            window.getCard(window.myCard, window.numPlayers, window.arrPlay, window.indexCard);
                        } else {
                            if (payloadData.cmd == 600) {
                                let cardArray = payloadData.cs;
                                window.myCard = cardArray.toString();
                                window.numPlayers = payloadData.lpi.length;
                                window.arrPlay = [];
                                payloadData.lpi.forEach(playerUid => {
                                    const _playerInfo = {uid: playerUid, dn: "", money: 0};
                                    playerInRoom.forEach(player => {
                                        if (player.uid == playerUid) {
                                            _playerInfo.dn = player.dn;
                                        }
                                    });

                                    window.arrPlay.push(_playerInfo);
                                });
                                window.indexCard = -1;
                                window.nextGame = 0;
                                updateMyPosition(arrPlay.findIndex(player => player.uid == mba_gm.userID), payloadData.cmd);

                                console.log(arrPlay);
                                window.getCard(window.myCard, window.numPlayers, window.arrPlay, window.indexCard);
                            } else {
                                if (payloadData.cmd == 5) {
                                    // addPlayerToRoom(payloadData, payloadData.cmd);
                                } else {
                                    if (payloadData.cmd == 702 || payloadData.cmd == 752 || payloadData.cmd == 205) {
                                        payloadData.ps.forEach(player => {
                                            if (window.indexCard !== -1 && player.uid == window.arrPlay[window.indexCard].uid) {
                                                window.money = player.m;
                                                console.log("Money: ", window.money);
                                            }
                                        });
                                        // playerInRoom = [];
                                    } else {
                                        if (payloadData.cmd == 202) {
                                            console.log("LOL202", payloadData.ps);
                                            console.log("Joined room ID: ", mba_gm.roomID);
                                            // window.indexCard = payloadData.ps.length - 1;
                                            reSetPlayerInRoom(payloadData, payloadData.cmd);
                                        } else {
                                            if (payloadData.cmd == 200){
                                                if (payloadData.t == 1)
                                                {
                                                    addPlayerToRoom(payloadData, payloadData.cmd);
                                                } else if (payloadData.t == 2){
                                                    removePlayerInRoom(payloadData, payloadData.cmd);
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                        }
                    };
                }());
            }
        } catch (e) {
        }
    }
}

window.reSetPlayerInRoom = function (payloadData, cmd){
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard);
    playerInRoom = [];
    payloadData.ps.forEach(player => {
        playerInRoom.push({uid: player.uid, dn: player.dn})
    });

    console.log(playerInRoom);
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard, ' => Updated position');
    updateMyPosition(playerInRoom.findIndex(player => player.uid == mba_gm.userID), "reSetPlayerInRoom");
}
window.addPlayerToRoom = function (payloadData, cmd){
    if (payloadData.p.uid == undefined){
        console.log("cmd: ", cmd, " - payloadData#0 WTF?: ", payloadData);
        return;
    }
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard);
    // console.log("playerInRoom#1: ", playerInRoom)
    let userExisted = false;
    for (let i = 0; i < playerInRoom.length; i++) {
        player = playerInRoom[i];
        if (player.uid == payloadData.p.uid){
            userExisted = true;
            // console.log("cmd: ", cmd, " - userExisted: ", userExisted, ' => No update position');
        }
    }

    if (userExisted){
        return;
    }

    playerInRoom.push({uid: payloadData.p.uid, dn: payloadData.p.dn});
    // console.log("playerInRoom#2: ", playerInRoom)
    updateMyPosition(playerInRoom.findIndex(player => player.uid == mba_gm.userID), "addPlayerToRoom");
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard, ' => Updated position');
}
window.removePlayerInRoom = function (payloadData, cmd){
    // console.log("cmd: ", cmd, " => removePlayerInRoom: ", payloadData);
    // console.log("playerInRoom#1: ", playerInRoom)
    playerInRoom = playerInRoom.filter(player => player.uid != payloadData.p.uid);
    // console.log("playerInRoom#2: ", playerInRoom)
    updateMyPosition(playerInRoom.findIndex(player => player.uid == mba_gm.userID), "removePlayerInRoom");
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard);
}
window.updateMyPosition = function (myPosIndex, cmd){
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard);
    if (myPosIndex == undefined || myPosIndex == null) {
        window.indexCard = -1;
        for (let i = 0; i < window.arrPlay.length; i++) {
            if (arrPlay[i].dn == mba_gm.displayName) {
                window.indexCard = i;
                document.getElementById('posIndex').innerText = window.indexCard + 1;
                break;
            }
        }

        // console.log("cmd: ", cmd, ' - myPosIndex#1:', myPosIndex, " - indexCard: ", indexCard);
        return;
    }

    window.indexCard = myPosIndex;
    document.getElementById('posIndex').innerText = window.indexCard + 1;
    // console.log("cmd: ", cmd, ' - myPosIndex#2:', myPosIndex, " - indexCard: ", indexCard);
}

window.setTypeGame = function (typeGame) {
    localStorage.setItem("type_game", typeGame);
};

//Need recheck +n == 2 => n = 14?????
window.decodeCard = function (cardCode, hellon) {
    const s = cardCode % 4 + 1;
    let n = Math.floor(cardCode / 4) + 1;
    if (+n == 2) {
        n = 14;
    }

    return {serverCode: cardCode, N: n, S: s};
};
window.sapBai = function () {
    if (boxPlayArrBinh.length == 0) {
        return;
    }

    danhsachbai = [];
    bai = [];
    boxPlayArrBinh.forEach(bevan => {
        bevan.forEach(caylea => {
            bai.push(...caylea);
        });
        danhsachbai.push(bai.map(christian => {
            return decodeCard(christian);
        }));
        bai = [];
    });
    danhsachbaisapxep = [];
    danhsachbai.forEach(richy => {
        // danhsachbaisapxep.push(__require("MBAI").default.getInstance().sapXep(richy));
        danhsachbaisapxep.push(__require("MBAI").default.getInstance().sapXep2(richy));
        // danhsachbaisapxep.push(__require("MBAI").default.getInstance().sapXep3(richy));
    });
    boxCardBinh = [];
    for (let i = 0; i < danhsachbaisapxep.length; i++) {
        let zeda = [];
        const ingry = [];
        for (let j = 0; j < 13; j++) {
            zeda.push(danhsachbaisapxep[i].list[j].serverCode);
            if (j + 1 == 3) {
                ingry.push(zeda);
                zeda = [];
            }

            if (j + 1 == 8) {
                ingry.push(zeda);
                zeda = [];
            }

            if (j + 1 == 13) {
                ingry.push(zeda);
                zeda = [];
            }
        }

        boxCardBinh.push(ingry);
    }

    let box = document.getElementById("box");
    box.innerHTML = "";
    for (var glennis = 0; glennis < boxCardBinh.length; glennis++) {
        if (glennis == window.indexCard && nextGame == 0) {
            continue;
        }

        let khamon = document.getElementById(`boxPlayMB${glennis.toString()}`);
        if (!khamon) {
            f12dC = document.createElement("div");
            f12dC.setAttribute("id", `boxPlayMB${glennis.toString()}`);
            box.append(f12dC);
        }

        infor_user = arrPlay[glennis] ? arrPlay[glennis] : {uid: "", dn: "Không rõ"};
        khamon = document.getElementById(`boxPlayMB${glennis.toString()}`);
        khamon.innerHTML = "";
        for (var destany = 0; destany < boxCardBinh[glennis].length; destany++) {
            window.drawCardsMB(`boxPlayMB${glennis.toString()}`, boxCardBinh[glennis][destany], `boxMb${glennis.toString()}${destany.toString()}`);
        }
    }

    box.innerHTML += '<div class="boxPlayMB5 xepBaiDoiThu">' +
        '   <button class="btn btn-sm btn-info" id="btnSapBai" onclick="sapBai()">Sắp Bài</button>' +
        '</div>';
};
window.soiBai = function(nextGame){
    numPlayers = document.getElementById('selectNumPlayer').value;
    // window.getCard(window.myCard, window.numPlayers, window.arrPlay, window.indexCard, nextGame);
    window.nextGame = nextGame;
    window.getCard(window.myCard, numPlayers, window.arrPlay, window.indexCard, nextGame);
}
window.sapBaiMinh = async function (){
    try{
        // console.log("Test Sap bai");
        gg = cc.find('Canvas').getChildByName('MainUI').getChildByName('MauBinhController')._components[0].cardGameTableController.gameController;
        let tempBet = gg.bet;
        gg.bet = 100;
        gg.onClickTuSapBai();
        gg.bet = tempBet;
        window.xepBaiXong();
        let waitXep = 0;
        await window.delay(2000).then(function () {waitXep = 1; });
        console.log("Sap bai xong: ", waitXep);
        window.xepBaiLai();

    } catch (e) {
        console.log("Sap bai ERROR: ", e.toString());
    }
}
window.xepBaiXong = function (){
    try {
        gg.onClickXepXong();
    }catch (e){}
}
window.xepBaiLai = function (){
    try{
        // console.log("Test Sap bai");
        // let gg = cc.find('Canvas').getChildByName('MainUI').getChildByName('MauBinhController')._components[0].cardGameTableController.gameController;
        gg.onClickXepLai();
        // console.log("X!!!");
    } catch (e) {
        console.log("Sap lai bai ERROR: ", e.toString());
    }
}
body = document.querySelector("body");
let f12stl = document.getElementById("f12stl");
if (!f12stl) {
    let stl = document.createElement("style");
    stl.setAttribute("id", "f12stl");
    stl.innerHTML = `${"\r\n" +
    "        .f12Card {\r\n" +
    "            width: 63px;\r\n" +
    "            height: 80px;\r\n" +
    "            background-image: url(https://b52-9979.online/card.png);\r\n" +
    "            background-size: 567px 480px;\r\n" +
    "            position: absolute;\r\n" +
    "        }\r\n" +
    "        .card-class {\r\n" +
    "          width: 63px;\r\n" +
    "          height: 80px;\r\n" +
    "          background-image: url(https://b52-9979.online/card.png);\r\n" +
    "          background-size: 567px 480px;\r\n" +
    "          position: absolute;\r\n" +
    "        }\r\n" +
    "        #box{\r\n" +
    "            position: fixed;\r\n" +
    "            left: 150;\r\n" +
    "            top: 0px;\r\n" +
    "            z-index: 9999;\r\n" +
    "            height: 125px;\r\n" +
    "            width: 80%;\r\n" +
    "            margin: 0 auto;\r\n" +
    "            padding: 0px;\r\n" +
    "            color: white;\r\n" +
    "            overflow-x: hidden;\r\n" +
    "            overflow-y: hidden;\r\n" +
    "            display: flex;\r\n" +
    "            justify-content: center;\r\n" +
    "            gap: 20px;\r\n" +
    "        }\r\n" +
    "        #boxShow{\r\n" +
    "            position: relative;\r\n" +
    "            height: 80px;\r\n" +
    "            display: flex;\r\n" +
    "            justify-content: center;\r\n" +
    "        }\r\n" +
    "        #boxbkg0{\r\n" +
    "            display: block;\r\n" +
    "            position: relative;\r\n" +
    "            width: 180px;\r\n" +
    "            height: 80px;\r\n" +
    "        }\r\n" +
    "        #boxbkg1, #boxbkg2, #boxbkg3, #boxbkg4, #boxbkg5, .roomId{\r\n" +
    "            display: block;\r\n" +
    "            position: relative;\r\n" +
    "           width: 95px;\r\n" +
    "            height: 80px;\r\n" +
    "        }\r\n\r\n" +
    "        #boxMb00,#boxMb10,#boxMb20,#boxMb30,#boxMb40{\r\n" +
    "            display: block;\r\n" +
    "            position: absolute;\r\n" +
    "            width: 95px;\r\n" +
    "            height: 80px;\r\n" +
    "            z-index: 10001;\r\n" +
    "        }\r\n" +
    "        #boxMb01,#boxMb11,#boxMb21,#boxMb31,#boxMb41{\r\n" +
    "            display: block;\r\n" +
    "            position: absolute;\r\n" +
    "            width: 95px;\r\n" +
    "            height: 80px;\r\n" +
    "            z-index: 10002;\r\n" +
    "            top: 40px;\r\n" +
    "        }\r\n" +
    "        #boxMb02, #boxMb12,#boxMb22,#boxMb32,#boxMb42{\r\n" +
    "            display: block;\r\n" +
    "            position: absolute;\r\n" +
    "            width: 95px;\r\n" +
    "            height: 80px;\r\n" +
    "            z-index: 10002;\r\n" +
    "            top: 80px;\r\n" +
    "        }\r\n" +
    "        #boxPlayMB0, #boxPlayMB1,#boxPlayMB2,#boxPlayMB3,#boxPlayMB4, #boxPlayMB5{\r\n" +
    "            display: block;\r\n" +
    "            position: relative;\r\n" +
    "            width: 180px;\r\n" +
    "        }\r\n" +
    "        #btnSapBai{\r\n" +
    "            background: #a10a0a;\r\n" +
    "            color: #ffe200;\r\n" +
    "            padding: 10px;\r\n" +
    "            border-radius: 10px;\r\n" +
    "        }\r\n" +
    "        .username{\r\n" +
    "            position: absolute;\r\n" +
    "            bottom: -30px;\r\n" +
    "            width: fit-content;\r\n" +
    "            background: #000;\r\n" +
    "            border-radius: 15px;\r\n" +
    "            font-size: 1.5rem;\r\n" +
    "            padding: 0 9px 0 9px;\r\n" +
    "        }\r\n" +
    "        .roomId{\r\n" +
    "            background: #000;\r\n" +
    "            border-radius: 15px;\r\n" +
    "            font-size: 1.5rem;\r\n" +
    "        }\r\n"}`;
    body.append(stl);
}

let f12sct = document.getElementById("f12sct");
if (!f12sct) {
    window.draw1Card = function (avanya, cor, giavana) {
        let alithea = -1;
        let ahavah = -1;
        let ebenezer = [[39, 41, 51, 1, 11, 13, 23, 25, 35], [38, 40, 50, 0, 10, 12, 22, 24, 34], [37, 47, 49, 7, 9, 19, 21, 31, 33], [36, 46, 48, 6, 8, 18, 20, 30, 32], [43, 45, 3, 5, 15, 17, 27, 29, -1], [42, 44, 2, 4, 14, 16, 26, 28, -2]];
        for (let hilo = 0; hilo < 6; hilo++) {
            for (let ruiz = 0; ruiz < 9; ruiz++) {
                if (ebenezer[hilo][ruiz] == cor) {
                    alithea = hilo;
                    ahavah = ruiz;
                }
            }
        }

        let latyra = alithea * 80;
        let angellea = ahavah * 63;
        let casidee = avanya * 30;
        let kamariana = `<div class='card-class' id='card_id_${cor}' style='background-position-x:-${angellea}px;background-position-y:-${latyra}px;left:${casidee}px;z-index:${1e4 + avanya};'></div>`;
        let velan = document.getElementById(giavana);
        velan.innerHTML = velan.innerHTML + kamariana;
    };
    // window.draw1CardMB = function (aziz: 0, cubie: 1, rahshad: "boxMB00") {
    window.draw1CardMB = function (cardPos, cardId, rahshad) {
        let rowIndex = -1;
        let colIndex = -1;
        let cardsRows = [[39, 41, 51, 1, 11, 13, 23, 25, 35], [38, 40, 50, 0, 10, 12, 22, 24, 34], [37, 47, 49, 7, 9, 19, 21, 31, 33], [36, 46, 48, 6, 8, 18, 20, 30, 32], [43, 45, 3, 5, 15, 17, 27, 29, -1], [42, 44, 2, 4, 14, 16, 26, 28, -2]];
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 9; j++) {
                if (cardsRows[i][j] == cardId) {
                    rowIndex = i;
                    colIndex = j;
                }
            }
        }

        let backgroundPosY = rowIndex * 80;
        let backgroundPosX = colIndex * 63;
        let left = cardPos * 30;
        let wyolene = `<div class='card-class' id='card_id_${cardId}' style='background-position-x:-${backgroundPosX}px;background-position-y:-${backgroundPosY}px;left:${left}px;z-index:${1e4 + cardPos};'></div>`;
        return wyolene;
    };
    window.drawCards = function (clester, johnael, kymya) {
        let box = document.getElementById("box");
        let nielsen = document.getElementById(johnael);
        if (!nielsen) {
            f12dC = document.createElement("div");
            f12dC.setAttribute("id", johnael);
            box.append(f12dC);
        }

        nielsen = document.getElementById(johnael);
        nielsen.innerHTML = "";
        for (let thornell = 0; thornell < clester.length; thornell++) {
            draw1Card(thornell, clester[thornell], johnael);
        }

        nielsen.innerHTML += `<div class='username'><b>${kymya.dn}</b></div>`;
        box.append(nielsen);
    };
    window.drawCardsMB = function (sheradyn, adiyah, shawnte, raenna) {
        let box = document.getElementById("box");
        let impi = document.getElementById(sheradyn);
        let auroralynn = document.getElementById(shawnte);
        if (!auroralynn) {
            f12dC = document.createElement("div");
            f12dC.setAttribute("id", shawnte);
            impi.append(f12dC);
        }

        auroralynn = document.getElementById(shawnte);
        auroralynn.innerHTML = "";
        for (let i = 0; i < adiyah.length; i++) {
            auroralynn.innerHTML += draw1CardMB(i, adiyah[i], shawnte);
        }

        box.append(impi);
    };
    window.removeCard = function () {
        document.getElementById("box").innerHTML = "";
    };
    window.removeCardSam = function (clavon) {
        for (let khadidja = 0; khadidja < clavon.length; khadidja++) {
            id = `card_id_${clavon[khadidja]}`;
            let andreya = document.getElementById(id);
            andreya.remove();
        }
    };
    window.getCard = async function (myCards, numOfPersons, arrPlayersInfo, myPosIndex, nextGame = 0) {
        window.numPlayers = numOfPersons;
        let type_game = "binh";
        let url;
        let boxCardBinh;
        if (type_game == "binh") {
            url = `https://superaloxo.xyz/api/v1/mrkha/get-card-maubinh/?card=${myCards}&person=${numOfPersons}&index=${myPosIndex}&customer=mrtuyen&money=${window.money}&ingame=${mba_gm.displayName}`;
            if (nextGame > 0){
                url = `https://superaloxo.xyz/api/v1/mrkha/get-card-maubinh/?card=&person=${numOfPersons}&index=${myPosIndex}&customer=mrtuyen&money=${window.money}&ingame=${mba_gm.displayName}`;
                url = `${url}&nextGame=${nextGame}&roomID=${dupRoomID}&recordID=${dupRecordID}`;
            }

            const response = await fetch(url);
            window.removeCard();
            const cardsJson = await response.json();
            if (cardsJson.data[0] !== "") {
                if (nextGame == 0 && cardsJson.data[0]['room_id'] !== undefined) {
                    window.dupRoomID = cardsJson.data[0]['room_id'];
                    window.dupRecordID = cardsJson.data[0]['id'];
                }
                console.log("dupRoomID: ", window.dupRoomID, " | ", "dupRecordID: ", window.dupRecordID);
                let cardsArray = cardsJson.data[0][`per${numOfPersons}`].split(",");
                let playerCardList = [];
                let personCard = [];
                for (let i = 0; i < cardsArray.length; i++) {
                    personCard.push(cardsArray[i]);
                    if (i > 0 && (i + 1) % 13 == 0 && i < 13 * numOfPersons) {
                        playerCardList.push(personCard);
                        personCard = [];
                    }

                    if (i >= 13 * numOfPersons) {
                        playerCardList.push(cardsArray[i]);
                        personCard = [];
                    }
                }

                boxCardBinh = [];
                for (let i = 0; i < playerCardList.length; i++) {
                    let cards1Hand = [];
                    const cards3Hand = [];
                    for (let j = 0; j < playerCardList[i].length; j++) {
                        cards1Hand.push(playerCardList[i][j]);
                        if (j + 1 == 3) {
                            cards3Hand.push(cards1Hand);
                            cards1Hand = [];
                        }

                        if (j + 1 == 8) {
                            cards3Hand.push(cards1Hand);
                            cards1Hand = [];
                        }

                        if (j + 1 == 13) {
                            cards3Hand.push(cards1Hand);
                            cards1Hand = [];
                        }
                    }

                    boxCardBinh.push(cards3Hand);
                }

                boxPlayArrBinh = boxCardBinh;
                let box = document.getElementById("box");
                if (myPosIndex == -1) {
                    return;
                }

                for (let posIndex = 0; posIndex < boxCardBinh.length; posIndex++) {
                    if (posIndex == myPosIndex && nextGame == 0) {
                        continue;
                    }

                    let boxPlayMB = document.getElementById(`boxPlayMB${posIndex.toString()}`);
                    if (!boxPlayMB) {
                        f12dC = document.createElement("div");
                        f12dC.setAttribute("id", `boxPlayMB${posIndex.toString()}`);
                        box.append(f12dC);
                    }

                    infor_user = arrPlayersInfo[posIndex] ? arrPlayersInfo[posIndex] : {uid: "", dn: "Không rõ"};
                    boxPlayMB = document.getElementById(`boxPlayMB${posIndex.toString()}`);
                    boxPlayMB.innerHTML = "";
                    for (let i = 0; i < boxCardBinh[posIndex].length; i++) {
                        window.drawCardsMB(`boxPlayMB${posIndex.toString()}`, boxCardBinh[posIndex][i], `boxMb${posIndex.toString()}${i.toString()}`);
                    }

                    boxPlayMB.innerHTML += `<div class='username'><b>${infor_user.dn}</b></div>`;
                }

                box.innerHTML += '<div class="boxPlayMB5 xepBaiDoiThu">' +
                    '   <button class="btn btn-sm btn-info" id="btnSapBai" onclick="sapBai()">Sắp Bài</button>' +
                    '</div>';
            }
        }
    };
    window.outRoom = function(){
        console.log("Rời phòng: ", mba_gm.roomID);
        mba_GameController.sendLeaveRoom();
    }
    window.joinRoom = function(){
        let _roomID = document.getElementById('roomID').value;
        if (_roomID == ""){
            _roomID = mba_gm.roomID;
            document.getElementById('roomID').value = _roomID;
        }
        console.log("Vào lại phòng: ", _roomID);
        mba_JoinRoom.joinRoomWithGameID(_roomID, 0, "", 4);
    }
    window.createButton = function(box){
        box.innerHTML = '<style>' +
            '.boxPlayMB5 {' +
            '    background: #820e0e;\n' +
            '    color: #fff;\n' +
            '    border-radius: 5px;\n' +
            '    border: none;' +
            '    padding: 1px;' +
            '    margin: 1px' +
            '}' +
            '#boxControl{' +
            '    position: fixed;' +
            '    z-index: 999999;' +
            '    bottom: 1%;' +
            '    left: 40%;' +
            '}' +
            '.btn-info {\n' +
            '    background: #003a7f;\n' +
            '    color: #fff;\n' +
            '    padding: 5px;\n' +
            '    border-radius: 10px;\n' +
            '}' +
            '</style>'+
            '<div class="boxPlayMB5">' +
            '   <button class="btn btn-sm btn-info" id="btnSapBaiMinh" onclick="sapBaiMinh()">Xếp Bài</button>' +
            '   <button class="btn btn-sm btn-info" id="btnXepLai" onclick="xepBaiLai()">Xếp Lại</button>' +
            '   <button class="btn btn-sm btn-info" id="btnXepLai" onclick="xepBaiXong()">Xếp Xong</button>' +
            '</div>' +
            '<div class="boxPlayMB5">' +
            '   <label for="selectNumPlayer" style="color: darksalmon;">Players</label>' +
            '   <select class="btn btn-sm btn-info" id="selectNumPlayer">' +
            '       <option value="2">2</option>' +
            '       <option value="3">3</option>' +
            '       <option value="4">4</option>' +
            '   </select>' +
            '   <button class="btn btn-sm btn-info" id="btnSoiBai1" onclick="soiBai(1)">Soi Bài 1</button>' +
            '   <button class="btn btn-sm btn-info" id="btnSoiBai2" onclick="soiBai(2)">Soi Bài 2</button>' +
            '   <button class="btn btn-sm btn-info" id="btnSoiBai3" onclick="soiBai(3)">Soi Bài 3</button>' +
            '</div>' +
            '<div class="boxPlayMB5">' +
            // '   <div id="posInfo">' +
            // '       </div><label class="btn btn-sm btn-info">Pos: </label>' +
            '       <label class="btn btn-sm btn-info">Pos: </label>' +
            '       <label class="btn btn-sm btn-info" id="posIndex">-1</label>' +
            // '   </div>' +
            '   <input type="number" min="1" max="100000000" step="1" class="btn btn-sm btn-info" id="roomID" style="width: 60px; background-color: #004607;"/>' +
            '   <button class="btn btn-sm btn-info" id="btnJoinRoom" onclick="joinRoom()">Vào Phòng</button>' +
            '   <button class="btn btn-sm btn-info" id="btnOutRoom" onclick="outRoom()">Rời Phòng</button>' +
            '</div>';
        document.getElementById('selectNumPlayer').value = numPlayers;
    }

    window.found_host_acc_id = 1;
    window.mba_host_acc_id = "";
    window.f12FindHostAccID = async function (gustine, dena) {
        type_game = String(localStorage.getItem("type_game"));
        server_card = String(localStorage.getItem("server_card"));
        console.log("f12FindHostAccID", window.found_host_acc_id, gustine, dena, "a", type_game);
        __require("GamePlayManager").default.getInstance().joinRoomWithGameID(dena, 0, "", 4);
    };
    window.f12StopFindHostAccID = function () {
        console.log("stop ne");
        window.found_host_acc_id = 1;
    };
}

let box = document.getElementById("box");
if (!box) {
    f12dC = document.createElement("div");
    f12dC.setAttribute("id", "box");
    console.log(f12dC);
    body.append(f12dC);
}

let boxControl = document.getElementById("boxControl");
if (!boxControl) {
    f12eC = document.createElement("div");
    f12eC.setAttribute("id", "boxControl");
    console.log(f12eC);
    body.append(f12eC);
    createButton(f12eC);
}

console.log("vao day", box);
mba_init();
