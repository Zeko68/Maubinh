function injectScriptV2(t, e = []) {
    let i = t.replace(/[^a-z0-9]/gi, "");
    var c = document.getElementById(i);
    c && c.remove();
    var n = document.getElementsByTagName("body")[0],
        r = document.createElement("script");
    r.setAttribute("type", "text/javascript");
    r.setAttribute("src", chrome.runtime.getURL(t));
    r.setAttribute("id", i);
    e.length && r.setAttribute("f12-data", e.join("|"));
    n.appendChild(r);
}

chrome.runtime.onMessage.addListener(function (t, e, i) { 
    i(t); 
    let c = []; 
    if ("setTypeGame" == t.cmd) {
        injectScriptV2("injectweb.js", c = [t.cmd, t.type_game]);
    } else if ("sapbai" == t.cmd) {
        injectScriptV2("injectweb.js", c = ["sapbai", t.flag]);
    } else if ("f12FindHostAccID" == t.cmd && void 0 !== t.run) {
        if (1 == t.run) {
            injectScriptV2("injectweb.js", c = ["f12FindHostAccID", t.chon_game, t.host_acc_id]);
        } else {
            injectScriptV2("injectweb.js", c = ["f12StopFindHostAccID"]);
        }
    } else if ("VaoBanKhac" == t.cmd && void 0 !== t.run) {
        if (1 == t.run) {
            injectScriptV2("injectweb.js", c = ["VaoBanKhac", t.bet_money, t.host_acc_id]);
        } else {
            injectScriptV2("injectweb.js", c = ["f12StopFindHostAccID"]);
        }
    } else if ("TaoBan" == t.cmd && void 0 !== t.run) {
        if (1 == t.run) {
            injectScriptV2("injectweb.js", c = ["TaoBan", t.bet_money, t.chon_game, t.so_nguoi]);
        }
    }
});

injectScriptV2("codeweb.js");
