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
window.isCreateRoom = false;
window.isFindDupRoom = false;
window.dupRoomID = 0;
window.dupRecordID = 0;
window.dupRecordIDSoi = 0;
window.nextGame = 0;
window.gg = null;
window.playerInRoom = []
window.boxCardBinhSource = []
window.autoPlayMode = false;

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
            window.cloneNotifyOnline();
            if (typeof window.wscHdl !== "undefined") {
                window.mba_init_done = 1;
                (function () {
                    const ad = wscHdl.onExtensionResponse;
                    wscHdl.onExtensionResponse = function (responseData, payloadData) {
                        ad.call(wscHdl, responseData, payloadData);
                        // console.log("responseData: ", responseData);
                        if (payloadData.cmd == 5) {
                            // addPlayerToRoom(payloadData, payloadData.cmd);return;
                            return;
                        }

                        if (payloadData.cmd == 200){
                            if (payloadData.t == 1)
                            {
                                addPlayerToRoom(payloadData, payloadData.cmd);
                                return;
                            }

                            if (payloadData.t == 2){
                                removePlayerInRoom(payloadData, payloadData.cmd);
                                return;
                            }

                            return;
                        }

                        if (payloadData.cmd == 202) {
                            console.log("LOL202", payloadData.ps);
                            console.log("Joined room ID: ", mba_gm.roomID);
                            // window.indexCard = payloadData.ps.length - 1;
                            reSetPlayerInRoom(payloadData, payloadData.cmd);
                            return
                        }

                        if (payloadData.cmd == 600) {
                            // document.getElementById("boxSoi").children[0].style.display = 'none';
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
                            // window.indexCard = -1;
                            let tempIndex = window.indexCard;
                            window.nextGame = 0;
                            updateMyPosition(arrPlay.findIndex(player => player.uid == mba_gm.userID), payloadData.cmd);

                            //return
                            if (window.indexCard == -1) {
                                window.indexCard = tempIndex;
                                window.nextGame = 1;
                                return;
                            } else {
                                (async function (){
                                    await delay(3000);
                                    sapBaiMinh();
                                })();
                            }

                            console.log(arrPlay);
                            window.getCard(window.myCard, window.numPlayers, window.arrPlay, window.indexCard, window.nextGame);
                            let boxSoi = document.getElementById("boxSoi");
                            if (boxSoi.style.display != 'none') {
                                showHideBoxSoi();
                            }
                            if (numPlayers < 4){
                                delay(2000).then(sapBai2());
                            }

                            return;
                        }

                        if (payloadData.cmd == 602){
                            // document.getElementById("boxControl").children[0].style.display = 'block';
                            return;
                        }

                        if (payloadData.cmd == 700 || payloadData.cmd == 750) {
                            let cardArray = payloadData.cs;
                            window.myCard = cardArray.toString();
                            window.numPlayers = payloadData.ps.length;
                            window.arrPlay = [];
                            payloadData.ps.forEach(player => {
                                const _player = {uid: player.uid, dn: ""};
                                playerInRoom.forEach(player => {
                                    if (player.uid == player.uid) {
                                        _player.dn = player.dn;
                                    }
                                });

                                window.arrPlay.push(_player);
                            });

                            updateMyPosition();
                            window.getCard(window.myCard, window.numPlayers, window.arrPlay, window.indexCard);
                            return;
                        }

                        if (payloadData.cmd == 702 || payloadData.cmd == 752 || payloadData.cmd == 205) {
                            payloadData.ps.forEach(player => {
                                if (window.indexCard !== -1 && player.uid == window.arrPlay[window.indexCard].uid) {
                                    window.money = player.m;
                                    console.log("Money: ", window.money);
                                }
                            });
                            // playerInRoom = [];
                            return;
                        }

                    };
                }());
            }
        } catch (e) {
        }
    }
}

window.setTypeGame = function (typeGame) {
    localStorage.setItem("type_game", typeGame);
};
window.createButton = function(box){
    box.innerHTML = '' +
        '<div class="boxPlayMB5 xepBaiDoiThu">' +
        //'    <label for="selectNumPlayer" style="color: darksalmon;">Players</label>' +
        '    <select class="btn btn-sm btn-info" hidden id="selectNumPlayer">' +
        '       <option value="2">2</option>' +
        '       <option value="3">3</option>' +
        '       <option value="4">4</option>' +
        '    </select>' +
        '    <button class="btn btn-sm btn-info" id="btnSoiBai1" hidden onclick="soiBai(1)">Soi Bài 1</button>' +
        '    <button class="btn btn-sm btn-info" id="btnSoiBai2" hidden onclick="soiBai(2)">Soi Bài 2</button>' +
        '    <button class="btn btn-sm btn-info" id="btnSoiBai3" hidden onclick="soiBai(3)">Soi Bài 3</button>' +
        '    <button class="btn btn-sm btn-info" id="btnGetListDupRoom" hidden onclick="getListDupRoom()">Get List</button>' +
		'    <button class="btn btn-sm btn-info" id="btnSapBai" hidden onclick="sapBai()">Sắp Bài</button>' +
        '    <label class="btn btn-sm btn-info input-text lbl-info" id="lbldupRecordRemain" hidden/>0</label>' +
        '    <input class="btn btn-sm btn-info input-text" id="dupRoomID" hidden onchange="setCurrentDupRecordRoom()"/>' +
        '    <input class="btn btn-sm btn-info input-text" id="dupRecordID" hidden type="number" onchange="setCurrentDupRecordID(true)"/>' +
        '    <input class="btn btn-sm btn-info input-text" id="dupRecordIDSoi" hidden ondblclick="setCurrentDupRecordID()"/>' +
        '    <label class="btn btn-sm btn-info" id="currentDupRoomPlayers" hidden></label>' +
        '    <button class="btn btn-sm btn-info" id="btnSapBai2" hidden onclick="sapBai2()">Sắp Bài</button>' +
        '    <button class="btn btn-sm btn-info" id="btnSapBai2" hidden onclick="sapBaiSoi1()">Sắp Bài Soi 1</button>' +
        '    <button class="btn btn-sm btn-info" id="btnSapBai2" hidden onclick="sapBaiSoi2()">Sắp Bài Soi 2</button>' +
        '</div>' +
        '<div class="boxPlayMB5">' +
        '   <button class="btn btn-sm btn-info" id="btnCreateDupRoom" hidden onclick="createDupRoom()">Tạo Phòng</button>' +
        '   <button class="btn btn-sm btn-info" id="btnStopCreateDupRoom" onclick="stopCreateDupRoom()">Copy ID Phòng</button>' +
        '   <button class="btn btn-sm btn-info" id="btnFindDupRoom" hidden onclick="findDupRoom()">Tìm Phòng</button>' +
        '   <input type="number" min="1" max="100000000" step="1" class="btn btn-sm btn-info" id="roomID" style="width: 85px; background-color: #004607;"/>' +
        '   <button class="btn btn-sm btn-info" id="btnJoinRoom" onclick="joinRoom()">Vào Phòng</button>' +
        '   <button class="btn btn-sm btn-info" id="btnOutRoom" onclick="outRoom()">Rời Phòng</button>' +
        '   <label class="btn btn-sm btn-info">Số người:</label>' +
        '   <label class="btn btn-sm btn-info" id="posIndex">-1</label>' +
        '</div>' +
        '<div class="boxPlayMB5 clone-control">' +
        '       <select class="btn btn-sm btn-info" id="selectClone" hidden onmousedown="cloneGetList()"></select>' +
        '   <button class="btn btn-sm btn-info" id="btnInviteClone" hidden onclick="cloneComeIn()">Clone Vào</button>' +
        '   <button class="btn btn-sm btn-info" id="btnKichClone" hidden onclick="cloneComeOut()">Clone Ra</button>' +
        '</div>' +
        '<div class="boxPlayMB5 btnControlCard">' +
        '   <button class="btn btn-sm btn-info" id="btnSapBaiMinh" hidden onclick="sapBaiMinh()">Xếp Bài</button>' +
        '   <button class="btn btn-sm btn-info" id="btnSetAutoMode" hidden onclick="SetAutoPlayMode()">Auto (Off)</button>' +
        '</div>';
    document.getElementById('selectNumPlayer').value = numPlayers;
}
window.showHideControls = function (button) {
    let box = document.getElementById("box");
    let _div = document.getElementById('boxControl');
    let _boxStyle = _div.style;
    if (_boxStyle.display == 'none'){
        _boxStyle.display = 'block';
        box.style.display = 'block';
        button.value = 'Hide';
        return;
    }

    box.style.display = 'none';
    _boxStyle.display = 'none';
    button.value = 'Show';
};
window.showHideBoxSoi = function () {
    let box = document.getElementById("boxSoi");
    let button = document.getElementById('btnShowBoxSoi');
    if (box.style.display == 'none'){
        box.style.display = 'block';
        button.value = 'Hide BoxSoi';
        return;
    }

    box.style.display = 'none';
    button.value = 'Show BoxSoi';
};
window.reSetPlayerInRoom = function (payloadData, cmd){
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard);
    playerInRoom = [];
    payloadData.ps.forEach(player => {
        playerInRoom.push({uid: player.uid, dn: player.dn})
    });

    console.log(playerInRoom);
    // console.log("cmd: ", cmd, " - indexCard: ", indexCard, ' => Updated position');
    updateMyPosition(playerInRoom.findIndex(player => player.uid == mba_gm.userID), "reSetPlayerInRoom");
	window.stopCreateDupRoom();
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

//Need recheck +n == 2 => n = 14?????
window.decodeCard = function (cardCode, hellon) {
    const s = cardCode % 4 + 1;
    let n = Math.floor(cardCode / 4) + 1;
    let n1 = Math.floor(cardCode / 4) + 1;
    if (+n == 2) {
        n = 14;
        console.log(`decode#1: ${cardCode} => ${n1}.${s} => ${n}.${s}`)
    }

    return {serverCode: cardCode, N: n, S: s};
};
window.decodeCard2 = function (cardCode, hellon) {
    const s = cardCode % 4 + 1;
    let n = Math.floor(cardCode / 4) + 1;
    let n1 = Math.floor(cardCode / 4) + 1;
    if (+n < 2) {
        n = 14;
        // console.log(`decode#1: ${cardCode} => ${n1}.${s} => ${n}.${s}`)
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
};
window.sapBai2 = function () {
    if (boxPlayArrBinh.length == 0) {
        return;
    }

    danhsachbai = [];
    bai = [];
    boxPlayArrBinh.forEach(bevan => {
        bevan.forEach(caylea => {
            bai.push(...caylea);
        });
        danhsachbai.push(bai.map(cardCode => {
            return decodeCard2(cardCode);
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
            //Checking and writing RanhRong, ThungPhaSanh,TuQuy,CuLu,Thung,Sanh,Xam,Thu,Doi
            window.drawCardsMB(`boxPlayMB${glennis.toString()}`, boxCardBinh[glennis][destany], `boxMb${glennis.toString()}${destany.toString()}`);
        }
    }
};
window.mBaiSapXep = function (t){
    if (13 !== t.length)
        return [];
    for (var e = [], i = 0; i < t.length; ++i)
        e.push(decodeCard2(t[i]));
        // e.push(t[i]);
    var n = __require("MBAI").default.getInstance().sapXep2(e);
    if (n.mark3 > 544 || n.mark3 > 476)
        return n.list;
    if (n.mb > 0)
        return n.list;
    if (n.mark3 > 408 || n.mark3 > 340) {
        var o = [];
        for (i = 0; i < t.length; ++i)
            o.push(decodeCard2(t[i]));
            // o.push(t[i]);
        var a = -1;
        n.mark3 > 408 ? a = 1 : n.mark3 > 340 && (a = 2);
        var s = __require("MBAI").default.getInstance().sapXep2(o, a);
        if (s.p > n.p)
            return s.list;
        if (s.mb > 0)
            return s.list
    }
    return n.list
}
window.SetAutoPlayMode = function (t){
    let btnSetAutoMode = document.getElementById('btnSetAutoMode');
    if (btnSetAutoMode.innerText == "Auto (Off)") {
        window.autoPlayMode = true;
        console.log("Auto xep xong: ", autoPlayMode);
        btnSetAutoMode.innerText = "Auto (On)";
        return;
    }

    window.autoPlayMode = false;
    btnSetAutoMode.innerText = "Auto (Off)";
    console.log("Auto xep xong: ", autoPlayMode);
}

window.mBaiSapXepNew = function (t){
    if (13 !== t.length)
        return [];
    for (var e = [], i = 0; i < t.length; ++i)
        e.push(decodeCard2(t[i]));
        // e.push(t[i]);
    var n = __require("MBAI").default.getInstance().sapXep2(e);
    if (n.mark3 > 544 || n.mark3 > 476)
        return {list: n.list, mb: n.mb,marks: [n.mark1, n.mark2, n.mark3]};

    if (n.mb > 0)
        return {list: n.list, mb: n.mb,marks: [n.mark1, n.mark2, n.mark3]};

    if (n.mark3 > 408 || n.mark3 > 340) {
        var o = [];
        for (i = 0; i < t.length; ++i)
            o.push(decodeCard2(t[i]));
            // o.push(t[i]);
        var a = -1;
        n.mark3 > 408 ? a = 1 : n.mark3 > 340 && (a = 2);
        var s = __require("MBAI").default.getInstance().sapXep2(o, a);
        if (s.p > n.p)
            return {list: s.list, mb: s.mb,marks: [s.mark1, s.mark2, s.mark3]};
        if (s.mb > 0)
            return {list: s.list, mb: s.mb,marks: [s.mark1, s.mark2, s.mark3]};
    }

    return {list: n.list, mb: n.mb, marks: [n.mark1, n.mark2, n.mark3]};
}

window.sapBaiSoi1 = function () {
    if (boxCardBinhSource == undefined || boxCardBinhSource == null || boxCardBinhSource.length == 0) {
        return;
    }

    for (let num = 0; num < 3; num++)
    {
        danhsachbai = [];
        bai = [];
        boxCardBinhSource[num].forEach(bevan => {
            bevan.forEach(caylea => {
                bai.push(...caylea);
            });
            danhsachbai.push(bai.map(cardCode => {
                return decodeCard2(cardCode);
            }));
            bai = [];
        });
        danhsachbaisapxep = [];
        danhsachbai.forEach(cardArray => {
            let n = __require("MBAI").default.getInstance().sapXep2(cardArray);
            danhsachbaisapxep.push(n);
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

        let boxSoiNum = document.getElementById(`boxSoiNum${4 - num}`);
        boxSoiNum.innerHTML = "";
        for (var i = 0; i < boxCardBinh.length; i++) {
            let element = document.getElementById(`boxPlayMBSoi${4 - num}${i}`);
            if (!element) {
                f12dC = document.createElement("div");
                f12dC.setAttribute("id", `boxPlayMBSoi${4 - num}${i}`);
                boxSoiNum.append(f12dC);
            }

            infor_user = arrPlay[i] ? arrPlay[i] : {uid: "", dn: "Không rõ"};
            element = document.getElementById(`boxPlayMBSoi${4 - num}${i}`);
            element.innerHTML = "";
            for (var destany = 0; destany < boxCardBinh[i].length; destany++) {
                //Checking and writing RanhRong, ThungPhaSanh,TuQuy,CuLu,Thung,Sanh,Xam,Thu,Doi
                window.drawCardsMBSoi(`boxPlayMBSoi${4 - num}${i}`, boxCardBinh[i][destany], `boxMbSoi${4 - num}${i}${destany}`, `boxSoiNum${4 - num}`);
            }
        }
    }
};
window.sapBaiSoi2 = function () {
    if (boxCardBinhSource == undefined || boxCardBinhSource.length == 0) {
        return;
    }

    for (let num = 0; num < 3; num++)
    {
        let danhSachBai = [];
        let bai = [];
        boxCardBinhSource[num].forEach(bevan => {
            bevan.forEach(caylea => {
                bai.push(...caylea);
            });
            // danhsachbai.push(bai.map(cardCode => {
            //     return decodeCard2(cardCode);
            // }));
            danhSachBai.push(bai);/////////////
            bai = [];
        });
        let danhSachBaiSapXep = [];
        danhSachBai.forEach(cardArray => {
            let n = mBaiSapXepNew(cardArray);
            danhSachBaiSapXep.push(n);
        });
        let boxCardBinh = [];
        for (let i = 0; i < danhSachBaiSapXep.length; i++) {
            let oneChi = {list: [], mark: danhSachBaiSapXep[i].marks[0], mb: danhSachBaiSapXep[i].mb};
            const threeChi = [];
            for (let j = 0; j < 13; j++) {
                oneChi.list.push(danhSachBaiSapXep[i].list[j].serverCode);
                if (j + 1 == 3) {
                    threeChi.push(oneChi);
                    oneChi = {list: [], mark: danhSachBaiSapXep[i].marks[1]};
                }

                if (j + 1 == 8) {
                    threeChi.push(oneChi);
                    oneChi = {list: [], mark: danhSachBaiSapXep[i].marks[2]};
                }

                if (j + 1 == 13) {
                    threeChi.push(oneChi);
                    oneChi = [];
                }
            }

            boxCardBinh.push(threeChi);
        }

        let boxSoiNum = document.getElementById(`boxSoiNum${4 - num}`);
        boxSoiNum.innerHTML = "";
        for (let i = 0; i < boxCardBinh.length; i++) {
            let n1 = [...boxCardBinh[i][0].list, ...boxCardBinh[i][1].list, ...boxCardBinh[i][2].list]
            let t1 = [...boxCardBinh[i][0].list]
            let e1 = [...boxCardBinh[i][1].list]
            let ii1 = [...boxCardBinh[i][2].list]
            let n = [], t = [], e = [], ii = [];
            n1.forEach(ele => {
                n.push(decodeCard2(ele));
            });
            t1.forEach(ele => {
                t.push(decodeCard2(ele));
            });
            e1.forEach(ele => {
                e.push(decodeCard2(ele));
            });
            ii1.forEach(ele => {
                ii.push(decodeCard2(ele));
            });

            let listText = getTextBinh(boxCardBinh[i][0].mb, boxCardBinh[i][0].mark, boxCardBinh[i][1].mark, boxCardBinh[i][2].mark, n, t, e, ii);
            console.log(listText);
            let element = document.getElementById(`boxPlayMBSoi${4 - num}${i}`);
            if (!element) {
                f12dC = document.createElement("div");
                f12dC.setAttribute("id", `boxPlayMBSoi${4 - num}${i}`);
                boxSoiNum.append(f12dC);
            }

            let infor_user = arrPlay[i] ? arrPlay[i] : {uid: "", dn: "Không rõ"};
            element = document.getElementById(`boxPlayMBSoi${4 - num}${i}`);

            for (let j = 0; j < boxCardBinh[i].length; j++) {
                //Checking and writing RanhRong, ThungPhaSanh,TuQuy,CuLu,Thung,Sanh,Xam,Thu,Doi
                element.innerHTML += `<label class="textBinh${j}" for="boxPlayMBSoi${4 - num}${i}">${listText[j]}</label>`;
                window.drawCardsMBSoi(`boxPlayMBSoi${4 - num}${i}`, boxCardBinh[i][j], `boxMbSoi${4 - num}${i}${j}`, `boxSoiNum${4 - num}`);
            }
        }
    }
};

//n1 = card.serverCode
window.updateTextBinh = function (n1) {
    let listText = [];
    for (var t = [], e = [], i = [], n = [], o = 1, a = 0; a < 13; ++a) {
        let s = n1[a];
        1 === o ? t.push(s) : 2 === o ? e.push(s) : 3 === o && i.push(s), 2 !== a && 7 !== a || o++, n.push(s.serverCode)
    }

    let mauBinhCheckCard = __require('MauBinhCheckCard').default.getInstance();
    let r = mauBinhCheckCard.getMarkMauBinh(n, t, e, i);
    if (0 === r) {
        let c = mauBinhCheckCard.getMark(t), l = mauBinhCheckCard.getMark(e),
            h = mauBinhCheckCard.getMark(i);
        c > l || c > h || c === l && mauBinhCheckCard.soSanhMauThau(t, e) || l > h || h === l && mauBinhCheckCard.soSanhMauThau(e, i) ? (listText[0] = "", listText[0] = "Binh l\u1ee7ng", listText[0] = "") : (listText[0] = mauBinhCheckCard.getTextOfListCard(c), listText[1] = mauBinhCheckCard.getTextOfListCard(l), listText[2] = mauBinhCheckCard.getTextOfListCard(h))
    } else listText[0] = "", listText[1] = mauBinhCheckCard.getTextofMauBinh(r), listText[2] = ""

    return listText;
}
window.getTextBinhOld = function (n, t, e, i) {
    let listText = [];
    // for (let t = [], e = [], i = [], n = [], o = 1, a = 0; a < 13; ++a) {
    //     let s = n[a];
    //     1 === o ? t.push(s) : 2 === o ? e.push(s) : 3 === o && i.push(s), 2 !== a && 7 !== a || o++, n.push(s.serverCode)
    // }

    let mauBinhCheckCard = __require('MauBinhCheckCard').default.getInstance();
    let r = mauBinhCheckCard.getMarkMauBinh(n, t, e, i);
    if (0 === r) {
        let c = mauBinhCheckCard.getMark(t), l = mauBinhCheckCard.getMark(e),
            h = mauBinhCheckCard.getMark(i);
        c > l || c > h || c === l && mauBinhCheckCard.soSanhMauThau(t, e) || l > h || h === l && mauBinhCheckCard.soSanhMauThau(e, i) ? (listText[0] = "", listText[0] = "Binh l\u1ee7ng", listText[0] = "") : (listText[0] = mauBinhCheckCard.getTextOfListCard(c), listText[1] = mauBinhCheckCard.getTextOfListCard(l), listText[2] = mauBinhCheckCard.getTextOfListCard(h))
    } else listText[0] = "", listText[1] = mauBinhCheckCard.getTextofMauBinh(r), listText[2] = ""

    return listText;
}
window.getTextBinhOld2 = function (mb, mark1, mark2, mark3, n, t, e, i) {
    let listText = [];
    let mauBinhCheckCard = __require('MauBinhCheckCard').default.getInstance();
    if (0 === mb) {
        listText[0] = mauBinhCheckCard.getTextOfListCard(mark1);
        listText[1] = mauBinhCheckCard.getTextOfListCard(mark2);
        listText[2] = mauBinhCheckCard.getTextOfListCard(mark3);
    } else {
        listText[0] = "";
        listText[1] = mauBinhCheckCard.getTextofMauBinh(mb);
        listText[2] = "";
    }

    return listText;
}
window.getTextBinh = function (mb, mark1, mark2, mark3, n, t, e, i) {
    let listText = [];
    let mauBinhCheckCard = __require('MauBinhCheckCard').default.getInstance();
    mark1 > mark2 || mark1 > mark3 || mark1 === mark3 && mauBinhCheckCard.soSanhMauThau(t, e) || mark2 > mark3 || mark3 === mark2 && mauBinhCheckCard.soSanhMauThau(e, i) ? (listText[0] = "", listText[0] = "Binh l\u1ee7ng", listText[0] = "") : (listText[0] = mauBinhCheckCard.getTextOfListCard(mark1), listText[1] = mauBinhCheckCard.getTextOfListCard(mark2), listText[2] = mauBinhCheckCard.getTextOfListCard(mark3))
    if (0 === mb) {
        listText[0] = mauBinhCheckCard.getTextOfListCard(mark1);
        listText[1] = mauBinhCheckCard.getTextOfListCard(mark2);
        listText[2] = mauBinhCheckCard.getTextOfListCard(mark3);
    } else {
        listText[0] = "";
        listText[1] = mauBinhCheckCard.getTextofMauBinh(mb);
        listText[2] = "";
    }
    if (listText[0] == listText[1] && listText[1] == listText[2] && listText[2] == '') {
        // let n1 = [];
        // n.forEach(cardCode => {
        //     n1.push(decodeCard2(cardCode));
        // })
        return updateTextBinh(n);
    }
    return listText;
}

window.soiBai = function(nextGame){
    popupRoom = document.getElementById('popupRoom').style.display = 'none';
    numPlayers = document.getElementById('selectNumPlayer').value;
    // window.getCard(window.myCard, window.numPlayers, window.arrPlay, window.indexCard, nextGame);
    window.nextGame = nextGame;
    // const _playerInfo = {uid: mba_gm.uid, dn: "", money: 0};
    // const arrPlay2 = [{uid: 1, dn: "", money: 0},{uid: 2, dn: "", money: 0}];
    // window.getCardSoi(myCard, numPlayers, arrPlay2, indexCard, nextGame);
    // const arrPlay3 = [{uid: 1, dn: "", money: 0},{uid: 2, dn: "", money: 0},{uid: 3, dn: "", money: 0}];
    // window.getCardSoi(myCard, numPlayers, arrPlay3, indexCard, nextGame);
    const arrPlay4 = [{uid: 1, dn: "", money: 0},{uid: 2, dn: "", money: 0},{uid: 3, dn: "", money: 0},{uid: 4, dn: "", money: 0}];
    window.getCardSoi(myCard, numPlayers, arrPlay4, indexCard, nextGame);
    document.getElementById('dupRoomID').value = window.dupRoomID;
    document.getElementById('dupRecordID').value = window.dupRecordID;
    document.getElementById('dupRecordIDSoi').value = window.dupRecordIDSoi;
    let boxSoi = document.getElementById("boxSoi");
    if (boxSoi.style.display == 'none') {
        showHideBoxSoi();
    }
    // delay(2000).then(() => window.sapBai2());
}
window.sapBaiMinh = async function (){
    try{
        // console.log("Test Sap bai");
        gg = cc.find('Canvas').getChildByName('MainUI').getChildByName('MauBinhController')._components[0].cardGameTableController.gameController;
        let tempBet = gg.bet;
        gg.bet = 100;
        gg.onClickTuSapBai();
        gg.bet = tempBet;
        window.delay(Math.floor(Math.random() * 5000 + 35000)).then(function () {
            if (autoPlayMode) {
                window.xepBaiXong();
            }
        });

        // window.xepBaiXong();
        // let waitXep = 0;
        // await window.delay(2000).then(function () {waitXep = 1; });
        // console.log("Sap bai xong: ", waitXep);
        // window.xepBaiLai();

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
window.createDupRoom = async function () {
    isCreateRoom = true;
    document.getElementById('roomID').value = -1;
    while (isCreateRoom){
        try {
            const response = await fetch("https://superaloxo.xyz/api/v1/client/?action=createRoom");
            let content = await  response.text();
            if (content.includes('OK')){
                break;
            }
        } catch (e) {
            console.log(e);
        }

        await delay(1000);
    }

    await delay(10000);
    await findDupRoom();
}
window.stopCreateDupRoom = async function (){
    isCreateRoom = false;
    isFindDupRoom = false;
    document.getElementById('roomID').value = mba_gm.roomID;
	
	const roomIDInput = document.getElementById('roomID');
    roomIDInput.select();
    document.execCommand('copy');
    // while (true){
        // try {
            // const response = await fetch("https://superaloxo.xyz/api/v1/client/?action=stopCreateRoom");
            // let content = await  response.text();
            // if (content.includes('OK')){
                // return;
            // }
        // } catch (e) {
            // console.log(e);
        // }

        // await delay(1000);
    // }

}
window.findDupRoom = async function () {
    isFindDupRoom = true;
    document.getElementById('roomID').value = mba_gm.roomID;
    while (isFindDupRoom) {
        try {
            const response = await fetch("https://superaloxo.xyz/api/v1/client/?action=getDupRoom");
            let content = await response.text();
            if (content.includes('OK')){
                const roomInfo = content.replace('OK', '');
                if (roomInfo == 'creating'){
                    document.getElementById('roomID').value = -1;

                    await delay(1000);
                    continue;
                }

                document.getElementById('roomID').value = roomInfo;
                while (mba_JoinRoom.isInCardGame) {
                    await delay(1000);
                }

                await delay(2000);
                window.joinRoom();
                return;
            }
        } catch (e) {
            console.log(e);
        }

        await delay(1000);
    }
}
window.getListDupRoom = async function () {
    let boxSoi = document.getElementById('boxSoi');
    if (boxSoi.style.display != 'none'){
        showHideBoxSoi();
    }
    while (true) {
        try {
            const response = await fetch("https://superaloxo.xyz/api/v1/client/?action=getListDupRoom");
            let content = await response.json();
            if (content.length > 0) {
                let popupRoom = document.getElementById('popupRoom');
                if (popupRoom == undefined) {
                    popupRoom = document.createElement("div");
                    popupRoom.id = "popupRoom";
                    popupRoom.style.position = 'absolute';
                    popupRoom.style.top = '12%';
                    popupRoom.style.background = 'black';
                    document.getElementsByTagName('body')[0].append(popupRoom);
                }

                popupRoom = document.getElementById('popupRoom');
                popupRoom.style.display = 'block';
                popupRoom.innerHTML = '<style>.roomList{text-align: left}</style>';
                // popupRoom.innerHTML = JSON.stringify(content);

                for (let i = 0; i < content.length; i++) {
                    const roomInfo = content[i];
                    roomInfo.per2 = roomInfo.per2 == null ? "no" : "yes";
                    roomInfo.per3 = roomInfo.per3 == null ? "no" : "yes";
                    popupRoom.innerHTML += `<div class="roomList">` +
                     `    <input type="number" value="${+roomInfo.room_id}" onclick="setCurrentDupInfo(${+roomInfo.room_id}, ${roomInfo.id})"/>` +
                     `    <input type="number" value="${+roomInfo.id}"/>` +
                     `    <label>2: ${roomInfo.per2}</label>` +
                     `    <label>3: ${roomInfo.per3}</label>` +
                     `    <label>C: ${roomInfo.created_at}</label>` +
                     `    <label>U: ${roomInfo.ingame}</label>` +
                     `</div>`;
                }

                roomInfo = content[0];
                window.dupRoomID = roomInfo.room_id;
                window.dupRecordID = roomInfo.id;
                document.getElementById('dupRoomID').value = roomInfo.room_id;
                document.getElementById('dupRecordID').value = roomInfo.id;
                document.getElementById('currentDupRoomPlayers').innerText = roomInfo.per2 == null || roomInfo.per2.length > 0 ? 2 : 3;

                break;
            }

            await delay(3000);
        }
        catch (e) {
            console.log('Error get list duprom: ', e.toString());
        }
    }
};
window.setCurrentDupInfo = function (roomID, recordID) {
    document.getElementById('dupRoomID').value = roomID;
    document.getElementById('roomID').value = +roomID - 1;
    document.getElementById('dupRecordID').value = recordID;

    window.dupRoomID = roomID;
    window.dupRecordID = recordID;
};
window.setCurrentDupRecordRoom = function (roomID) {
    if (roomID != undefined) {
        document.getElementById('dupRoomID').value = roomID;
        return;
    }
    window.dupRoomID = document.getElementById('dupRoomID').value;
};
window.setCurrentDupRecordID = function (fromInput, recordID) {
    if (fromInput) {
        window.dupRecordID = document.getElementById('dupRecordID').value;
        return;
    }
    else if (recordID != null) {
        window.dupRecordID = recordID;
    } else {
        window.dupRecordID = dupRecordIDSoi;
    }
    document.getElementById('dupRecordID').value = dupRecordID;
};

window.outRoom = function (){
    if (!mba_gm.isInCardGame)
    {
        return;
    }
    console.log("Rời phòng: ", mba_gm.roomID);
    mba_GameController.sendLeaveRoom();
}
window.joinRoom = function(){
    let _roomID = document.getElementById('roomID').value;
    if (_roomID == ""){
        _roomID = mba_gm.roomID;
        document.getElementById('roomID').value = _roomID;
    }
    console.log("Vào phòng: ", _roomID);
    mba_JoinRoom.joinRoomWithGameID(_roomID, 0, "", 4);
}

window.cloneComeIn = async function () {
    let cloneName = document.getElementById('selectClone').value;
    while (true) {
        try {
            let result = await (await fetch(`https://superaloxo.xyz/api/v1/client/?action=callCloneIn&cloneName=${cloneName}&room_id=${mba_gm.roomID}`)).text();
            if (result.includes('OK')) {
                break;
            }
        } catch (e) {
            console.log('cloneComeIn error: ', e);
        }

        await delay(1000);
    }
}
window.cloneComeOut = async function () {
    let cloneName = document.getElementById('selectClone').value;
    while (true) {
        try {
            let result = await (await fetch(`https://superaloxo.xyz/api/v1/client/?action=callCloneOut&cloneName=${cloneName}`)).text();
            if (result.includes('OK')) {
                break;
            }
        } catch (e) {
            console.log('cloneComeOut error: ', e);
        }

        await delay(1000);
    }
}
window.cloneNotifyOnline = async function () {
    while (true) {
        try {
            if (mba_gm.displayName == undefined || mba_gm.displayName.length < 5){
                await delay(1000);
                continue;
            }

            let result = await (await fetch(`https://superaloxo.xyz/api/v1/client/?action=notifyClone&cloneName=${mba_gm.displayName}`)).text();
            if (result.includes('OK')) {
                console.log(mba_gm.displayName, ' is online');
                break;
            }
        } catch (e) {
            console.log('cloneNotifyOnline error: ', e);
        }

        await delay(1000);
    }

    await cloneCheckTask();
}
window.cloneGetList = async function () {
    while (true) {
        try {
        let result = await (await fetch(`https://superaloxo.xyz/api/v1/client/?action=listClone&cloneName=${mba_gm.displayName}`)).text();
            if (result.includes('OK')) {
                let listUsers = result.replace('OK', '').split(',')
                let selectBox = document.getElementById('selectClone');
                selectBox.innerHTML = '';
                listUsers.forEach(user => {
                    if (user.length > 5 && !selectBox.innerHTML.includes(user)) {
                        selectBox.innerHTML += `<option value='${user}'>${user}</option>`
                    }
                });
                break;
            }
        } catch (e) {
            console.log('cloneGetList error: ', e);
        }

        await delay(1000);
    }
}
window.cloneCheckTask = async function () {
    while (true) {
        try {
            let result = await (await fetch(`https://superaloxo.xyz/api/v1/client/?action=checkCloneTask&cloneName=${mba_gm.displayName}`)).text();
            if (result.includes('OK')) {
                let task = result.replace('OK', '');
                if (task.includes('ComeIn')){
                    if (!mba_JoinRoom.isInCardGame) {
                        document.getElementById('roomID').value = +task.replace('ComeIn', '');
                        joinRoom();
                    }
                }

                if (task.includes('ComeOut')){
                    if (mba_JoinRoom.isInCardGame) {
                        outRoom();
                    }
                }
            }
        } catch (e) {
            console.log('cloneCheckTask error: ', e);
        }

        await delay(1000);
    }
}
body = document.querySelector("body");
let f12stl = document.getElementById("f12stl");
if (!f12stl) {
    let stl = document.createElement("style");
    stl.setAttribute("id", "f12stl");
	stl.innerHTML = `
    .card-class,.f12Card {
        width: 63px;
        height: 80px;
        background-image: url(https://b52-9979.online/card2.png);
        background-size: 567px 480px;
        position: absolute;
    }

    #box,#boxSoi,.boxSoiNum {
        height: 125px;
        overflow-y: hidden;
    }

    .roomId,.username {
        background: #000;
        border-radius: 15px;
        font-size: 1.5rem;
    }

    #box,#boxSoi {
        position: fixed;
        top: 4%;
        z-index: 9999;
        zoom: 80%;
        padding: 0;
    }

    #boxSoi {
        display: block;
        top: 150px;
        height: auto;
        zoom: 80%;
    }

    .boxSoiNum {
        margin-top: 50px;
    }

    #boxShow {
        position: relative;
        height: 80px;
        display: flex;
        justify-content: center;
    }

    #boxbkg0 {
        display: block;
        position: relative;
        width: 180px;
        height: 80px;
    }

    #boxbkg1,#boxbkg2,#boxbkg3,#boxbkg4,#boxbkg5,.roomId {
        display: block;
        position: relative;
        width: 95px;
        height: 80px;
    }

    #boxMb00,#boxMb10,#boxMb20,#boxMb30,#boxMb40,#boxMbSoi200,#boxMbSoi210,#boxMbSoi220,#boxMbSoi230,#boxMbSoi240,#boxMbSoi300,#boxMbSoi310,#boxMbSoi320,#boxMbSoi330,#boxMbSoi340,#boxMbSoi400,#boxMbSoi410,#boxMbSoi420,#boxMbSoi430,#boxMbSoi440 {
        display: block;
        position: relative;
        width: 95px;
        height: 80px;
        z-index: 10001;
    }

    #boxMb01,#boxMb11,#boxMb21,#boxMb31,#boxMb41,#boxMbSoi201,#boxMbSoi211,#boxMbSoi231,#boxMbSoi241,#boxMbSoi301,#boxMbSoi311,#boxMbSoi321,#boxMbSoi331,#boxMbSoi341,#boxMbSoi401,#boxMbSoi411,#boxMbSoi421,#boxMbSoi431,#boxMbSoi441 {
        display: block;
        position: absolute;
        width: 95px;
        height: 80px;
        z-index: 10002;
        top: 40px;
    }

    #boxMb02,#boxMb12,#boxMb22,#boxMb32,#boxMb42,#boxMbSoi202,#boxMbSoi212,#boxMbSoi222,#boxMbSoi232,#boxMbSoi242,#boxMbSoi302,#boxMbSoi312,#boxMbSoi322,#boxMbSoi332,#boxMbSoi342,#boxMbSoi402,#boxMbSoi412,#boxMbSoi422,#boxMbSoi432,#boxMbSoi442 {
        display: block;
        position: absolute;
        width: 95px;
        height: 80px;
        z-index: 10002;
        top: 80px;
    }

    #boxPlayMB0,#boxPlayMB1,#boxPlayMB2,#boxPlayMB3,#boxPlayMB4,#boxPlayMB5,#boxPlayMBSoi20,#boxPlayMBSoi21,#boxPlayMBSoi22,#boxPlayMBSoi23,#boxPlayMBSoi24,#boxPlayMBSoi25,#boxPlayMBSoi30,#boxPlayMBSoi31,#boxPlayMBSoi32,#boxPlayMBSoi33,#boxPlayMBSoi34,#boxPlayMBSoi35,#boxPlayMBSoi40,#boxPlayMBSoi41,#boxPlayMBSoi42,#boxPlayMBSoi43,#boxPlayMBSoi44,#boxPlayMBSoi45 {
        display: block;
        position: relative;
        width: 200px;
        margin: 0 0 0 80px;
        z-index: 9999;
        float: left;
    }

    #btnSapBai {
        background: #a10a0a;
        color: #ffe200;
        padding: 10px;
        border-radius: 10px;
    }

    .username {
        position: absolute;
        bottom: -30px;
        width: fit-content;
        padding: 0 9px;
    }

    .boxPlayMB5 {
        color: #fff;
        border-radius: 5px;
        border: none;
        padding: 1px;
        margin: 1px;
        z-index: 999999;
    }

    .btn-info {
        background: #003a7f;
        color: #fff;
        padding: 5px;
        border-radius: 10px;
    }

    #boxControl {
        position: fixed;
        z-index: 999999;
        left: 40%;
    }

    .boxPlayMB5.xepBaiDoiThu {
        top: 0;
        left: 0;
        position: fixed;
    }

    .textBinh0,.textBinh2,.textbinh1 {
        position: absolute;
        color: #ff0;
        background: #684646;
        width: 80px;
        text-align: right;
        padding: 2px;
        left: -85px;
        z-index: 10004;
        font-weight: 700;
    }

    label.textBinh0 {
        top: 15px;
    }

    label.textBinh1 {
        top: 55px;
    }

    label.textBinh2 {
        top: 95px;
    }

    .input-text {
        width: auto;
        max-width: 85px;
    }

    input::-webkit-inner-spin-button,input::-webkit-outer-spin-button {
        -webkit-appearance: textfield;
        margin: 0;
    }
`;

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
        let div1Card = `<div class='card-class' id='card_id_${cardId}' style='background-position-x:-${backgroundPosX}px;background-position-y:-${backgroundPosY}px;left:${left}px;z-index:${1e4 + cardPos};'></div>`;
        return div1Card;
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

    //window.drawCardsMBSoi(idOfPlayerDiv, ThreeChiCards, idOfOneChiDiv, idOfBoxSoiDiv);
    //Draw 1 chi
    window.drawCardsMBSoi = function (boxPlayMBSoi, chiCards, boxChiId, boxId) {
        let chiInfo = {list: chiCards.list == undefined ? chiCards : chiCards.list, mark: chiCards.mark};
        let rootDiv = document.getElementById(boxId);
        let playerDiv = document.getElementById(boxPlayMBSoi);
        let chiIdDiv = document.getElementById(boxChiId);
        if (!chiIdDiv) {
            const _div = document.createElement("div");
            _div.setAttribute("id", boxChiId);
            _div.setAttribute("data", chiInfo.mark);
            playerDiv.append(_div);
        }

        chiIdDiv = document.getElementById(boxChiId);
        chiIdDiv.innerHTML = "";
        for (let i = 0; i < chiInfo.list.length; i++) {
            chiIdDiv.innerHTML += draw1CardMB(i, chiInfo.list[i], boxChiId);
        }

        rootDiv.append(playerDiv);
    };
    window.drawCardsMBSoiWithText = function (boxPlayMBSoi, chiCards, boxChiId, boxId, chiMark) {
        let rootDiv = document.getElementById(boxId);
        let playerDiv = document.getElementById(boxPlayMBSoi);
        let chiIdDiv = document.getElementById(boxChiId);
        if (!chiIdDiv) {
            const _div = document.createElement("div");
            _div.setAttribute("id", boxChiId);
            playerDiv.append(f12dC);
        }

        chiIdDiv = document.getElementById(boxChiId);
        chiIdDiv.innerHTML = "";
        for (let i = 0; i < chiCards.length; i++) {
            chiIdDiv.innerHTML += draw1CardMB(i, chiCards[i], boxChiId);
        }

        rootDiv.append(playerDiv);
    };
    window.getChiLabelMark = function (cardArray) {
        //n = full card, t = chi 1, e = chi 2, i = chi 3
        // var r = S.default.getInstance().getMarkMauBinh(n, t, e, i);
        // if (0 === r) {
        //     var c = S.default.getInstance().getMark(t), l = S.default.getInstance().getMark(e),
        //         h = S.default.getInstance().getMark(i);
        //     c > l || c > h || c === l && S.default.getInstance().soSanhMauThau(t, e) || l > h || h === l && S.default.getInstance().soSanhMauThau(e, i) ? (this.listPlayerXepBaiLabel[0].string = "", this.listPlayerXepBaiLabel[1].string = "Binh l\u1ee7ng", this.listPlayerXepBaiLabel[2].string = "") : (this.listPlayerXepBaiLabel[0].string = S.default.getInstance().getTextOfListCard(c), this.listPlayerXepBaiLabel[1].string = S.default.getInstance().getTextOfListCard(l), this.listPlayerXepBaiLabel[2].string = S.default.getInstance().getTextOfListCard(h)), this.btnBaoBinh.node.active = !1
        // } else this.listPlayerXepBaiLabel[0].string = "", this.listPlayerXepBaiLabel[1].string = S.default.getInstance().getTextofMauBinh(r), this.listPlayerXepBaiLabel[2].string = "", this.btnBaoBinh.interactable = !0, this.btnBaoBinh.node.active = !0
    }
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
                    //Show player in my index card
                    return;
                }

                // for (let posIndex = 0; posIndex < boxCardBinh.length; posIndex++) {
                    // if (posIndex == myPosIndex && nextGame == 0) {
                        // continue;
                    // }

                    // let boxPlayMB = document.getElementById(`boxPlayMB${posIndex.toString()}`);
                    // if (!boxPlayMB) {
                        // f12dC = document.createElement("div");
                        // f12dC.setAttribute("id", `boxPlayMB${posIndex.toString()}`);
                        // box.append(f12dC);
                    // }

                    // infor_user = arrPlayersInfo[posIndex] ? arrPlayersInfo[posIndex] : {uid: "", dn: "Không rõ"};
                    // boxPlayMB = document.getElementById(`boxPlayMB${posIndex.toString()}`);
                    // boxPlayMB.innerHTML = "";
                    // for (let i = 0; i < boxCardBinh[posIndex].length; i++) {
                        // window.drawCardsMB(`boxPlayMB${posIndex.toString()}`, boxCardBinh[posIndex][i], `boxMb${posIndex.toString()}${i.toString()}`);
                    // }

                    // boxPlayMB.innerHTML += `<div class='username'><b>${infor_user.dn}</b></div>`;
                // }
            }
        }
    };
    window.getCardSoi = async function (myCards, numOfPersons, arrPlayersInfo, myPosIndex, nextGame = 0) {
        numPlayers = numOfPersons;
        let type_game = "binh";
        let url;
        let boxCardBinh;
        if (type_game == "binh") {
            url = `https://superaloxo.xyz/api/v1/mrkha/get-card-maubinh/?card=&person=4&index=${myPosIndex}&customer=mrtuyen&money=0&ingame=mrSoi`;
            url += `&nextGame=${nextGame}&roomID=${dupRoomID}&recordID=${dupRecordID}`;

            const response = await fetch(url);
            document.getElementById("boxSoi").innerHTML = "";
            const cardsJson = await response.json();
            if (cardsJson.data[0] !== "") {
                window.boxCardBinhSource = [];
                window.dupRecordIDSoi = cardsJson.data[0]['id'];
                document.getElementById('dupRecordIDSoi').value = dupRecordIDSoi;
                document.getElementById('lbldupRecordRemain').innerText = cardsJson.data[0]['remain'];
                console.log("dupRoomID: ", dupRoomID, " | ", "dupRecordID: ", dupRecordIDSoi);
                let boxSoi = document.getElementById(`boxSoi`);
                for (let pNum = 4; pNum >= 2; pNum--) {
                    let boxSoiNum = document.createElement('div');
                    boxSoiNum.setAttribute('class', `boxSoiNum`)
                    boxSoiNum.setAttribute('id', `boxSoiNum${pNum}`)
                    boxSoi.append(boxSoiNum);
                    let cardsArray = cardsJson.data[0][`per${pNum}`].split(",");
                    let playerCardList = [];
                    let personCard = [];
                    for (let i = 0; i < cardsArray.length; i++) {
                        personCard.push(cardsArray[i]);
                        if (i > 0 && (i + 1) % 13 == 0 && i < 13 * pNum) {
                            playerCardList.push(personCard);
                            personCard = [];
                        }

                        if (i >= 13 * pNum) {
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

                    boxCardBinhSource.push(boxCardBinh);
                    for (let posIndex = 0; posIndex < boxCardBinh.length; posIndex++) {
                        let boxPlayMBSoi = document.getElementById(`boxPlayMBSoi${pNum}${posIndex.toString()}`);
                        if (!boxPlayMBSoi) {
                            f12dC = document.createElement("div");
                            f12dC.setAttribute("id", `boxPlayMBSoi${pNum}${posIndex.toString()}`);
                            boxSoi.append(f12dC);
                            boxPlayMBSoi = document.getElementById(`boxPlayMBSoi${pNum}${posIndex.toString()}`);
                        }

                        boxPlayMBSoi.innerHTML = "";
                        let infor_user = arrPlayersInfo[posIndex] ? arrPlayersInfo[posIndex] : {uid: "", dn: "Không rõ"};
                        for (let i = 0; i < boxCardBinh[posIndex].length; i++) {
                            // window.drawCardsMBSoi(`boxPlayMBSoi${pNum}${posIndex.toString()}`, boxCardBinh[posIndex][i], `boxMbSoi${pNum}${posIndex.toString()}${i.toString()}`, 'boxSoi');
                            window.drawCardsMBSoi(`boxPlayMBSoi${pNum}${posIndex.toString()}`, boxCardBinh[posIndex][i], `boxMbSoi${pNum}${posIndex.toString()}${i.toString()}`, `boxSoiNum${pNum}`);
                        }

                        boxPlayMBSoi.innerHTML += `<div class='username'><b>${infor_user.dn}</b></div>`;
                    }

                    // document.getElementById('box').innerHTML = boxSoi.innerHTML;
                }
            }

            await sapBaiSoi2();
        }
    };

    window.found_host_acc_id = 1;
    window.mba_host_acc_id = "";
    window.f12FindHostAccID = async function (gustine, dena) {
        type_game = String(localStorage.getItem("type_game"));
        server_card = String(localStorage.getItem("server_card"));
        console.log("f12FindHostAccID", window.found_host_acc_id, gustine, dena, "a", type_game);
        __require("GamePlayManager").default.getInstance().joinRoomWithGameID(dena, 0, "", gustine);
    };
	window.VaoBanKhac = async function (gustine, dena) {
        type_game = String(localStorage.getItem("type_game"));
        server_card = String(localStorage.getItem("server_card"));
        console.log("VaoBanKhac", window.found_host_acc_id, gustine, dena, "a", type_game);
        __require("GamePlayManager").default.getInstance().joinRoom(dena, 0, "", 1);
    };
	window.TaoBan = async function (n, e, r) {
        type_game = String(localStorage.getItem("type_game"));
        server_card = String(localStorage.getItem("server_card"));
        console.log("TaoBan", window.found_host_acc_id, n, e, r, "a", type_game);
        __require("GamePlayManager").default.getInstance().requestcreateRoom(e, n, r);
    };
    window.f12StopFindHostAccID = function () {
        console.log("stop ne");
        window.found_host_acc_id = 1;
    };
}

let box = document.getElementById("box");
if (!box) {
    _div = document.createElement("div");
    _div.setAttribute("id", "showHideBoxControl");
	_div.innerHTML = '<input type="button" onclick="showHideControls(this)" value="Hide"/>'; 
    _div.style.zIndex = '999999998';
    _div.style.position = 'fixed';
    _div.style.top = '0';
	_div.style.right = '0';
    body.append(_div);

    f12dC = document.createElement("div");
    f12dC.setAttribute("id", "box");
    console.log(f12dC);
    body.append(f12dC);
}

let boxSoi = document.getElementById("boxSoi");
if (!boxSoi) {
    _div = document.createElement("div");
    _div.setAttribute("id", "showHideBoxSoi");
    _div.innerHTML = '<input type="button" id="btnShowBoxSoi" hidden onclick="showHideBoxSoi()" value="Hide BoxSoi"/>';
    _div.style.zIndex = '999999999';
    _div.style.position = 'fixed';
    _div.style.top = '18px';
    body.append(_div);

    f12dC = document.createElement("div");
    f12dC.setAttribute("id", "boxSoi");
    console.log(f12dC);
    body.append(f12dC);
}

var boxControl = document.getElementById("boxControl");
if (!boxControl) {
    f12eC = document.createElement("div");
    f12eC.setAttribute("id", "boxControl");
    console.log(f12eC);
    body.append(f12eC);
    createButton(f12eC);
}

console.log("vao day", box);
mba_init();
