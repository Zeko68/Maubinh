gameSelected = "binh";
function fetchApi() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://51.79.247.123:8080', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            var data = JSON.parse(xhr.responseText);
            if (data.status != 200) {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: 'apiError'});
                });
                document.getElementsByClassName('container')[0].innerHTML = data.message
            } else {

            }
        }else{
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'apiError',
                });
            });
            document.getElementsByClassName('container')[0].innerHTML = "Access deinied ! please contact adminstrator"
        }
    }

    xhr.onerror = function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'apiError' });
        });
    };

    xhr.send('id=' + chrome.runtime.id);
}

fetchApi();

document.getElementById("btnSapbai").addEventListener("click", e => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { cmd: "sapbai" }, function (response) {});
    });
});

document.getElementById("host_acc_id").addEventListener("change", e => {
    let t = $("#host_acc_id").val();
    localStorage.setItem("f12_host_acc_id", t);
});

document.getElementById("bet_money").addEventListener("change", e => {
    let t = $("#bet_money").find(":selected").val();
    localStorage.setItem("f12_bet_money", t);
});

document.getElementById("btnStartFindHost").addEventListener("click", e => {
    let t = $("#chon_game").find(":selected").val(),
        n = $("#host_acc_id").val().toLowerCase();
		if (n === "" || isNaN(n) || /\s/.test(n)) {
        alert("Không hợp lệ nếu: Bỏ trống, không phải số, chứa khoảng trống, ký tự khác.");
        return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { cmd: "f12FindHostAccID", run: 1, chon_game: t, host_acc_id: n }, function (response) {});
    });
});

document.getElementById("btnVaoBanKhac").addEventListener("click", e => {
    let t = $("#bet_money").find(":selected").val(),
        n = $("#host_acc_id").val().toLowerCase();
		if (n === "" || isNaN(n) || /\s/.test(n)) {
        alert("Không hợp lệ nếu: Bỏ trống, không phải số, chứa khoảng trống, ký tự khác.");
        return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { cmd: "VaoBanKhac", run: 1, bet_money: t, host_acc_id: n }, function (response) {});
    });
});

document.getElementById("btnTaoban").addEventListener("click", e => {
    let t = $("#bet_money").find(":selected").val(),
        n = $("#chon_game").find(":selected").val(),
        k = $("#so_nguoi").find(":selected").val();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { cmd: "TaoBan", run: 1, bet_money: t, chon_game: n, so_nguoi: k }, function (response) {});
    });
});

document.addEventListener('DOMContentLoaded', function() {
	// Lắng nghe sự kiện click cho nút "Paste"
    document.getElementById('btnPaste').addEventListener('click', function() {
        // Kiểm tra xem trình duyệt có hỗ trợ clipboard API không
        if (navigator.clipboard) {
            // Lấy nội dung từ clipboard
            navigator.clipboard.readText().then(function(clipboardText) {
                // Gán nội dung từ clipboard vào ô nhập liệu "Số Bàn"
                document.getElementById('host_acc_id').value = clipboardText;
            }).catch(function(err) {
                alert(err);
            });
        } else {
            alert('Trình duyệt này không hỗ trợ nút Paste (T_T)');
        }
    });
  const textbox = document.getElementById('host_acc_id');
  // Lấy dữ liệu từ local storage nếu có
  chrome.storage.sync.get('textboxValue', function(data) {
    const savedValue = data.textboxValue;
    // Nếu có dữ liệu từ local storage, hiển thị nó trong textbox
    if (savedValue) {
      textbox.value = savedValue;
    }
  });
  // Lưu giá trị của textbox vào local storage mỗi khi có sự thay đổi
  textbox.addEventListener('input', function() {
    chrome.storage.sync.set({ 'textboxValue': textbox.value });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const gameSelectBox = document.getElementById('chon_game');
  const moneySelectBox = document.getElementById('bet_money');
  const nguoiSelectBox = document.getElementById('so_nguoi');

  // Lấy giá trị cho form-select 'chon_game' từ local storage
  chrome.storage.sync.get('selectedGame', function(data) {
    const savedGame = data.selectedGame;
    if (savedGame) {
      gameSelectBox.value = savedGame;
    }
  });

  // Lưu giá trị của form-select 'chon_game' vào local storage khi có sự thay đổi
  gameSelectBox.addEventListener('change', function() {
    const selectedGame = gameSelectBox.value;
    chrome.storage.sync.set({ 'selectedGame': selectedGame });
  });
  //
  chrome.storage.sync.get('selectedMoney', function(data) {
    const savedMoney = data.selectedMoney;
    if (savedMoney) {
      moneySelectBox.value = savedMoney;
    }
  });
  moneySelectBox.addEventListener('change', function() {
    const selectedMoney = moneySelectBox.value;
    chrome.storage.sync.set({ 'selectedMoney': selectedMoney });
  });
  //
  chrome.storage.sync.get('selectedNguoi', function(data) {
    const savedNguoi = data.selectedNguoi;
    if (savedNguoi) {
      nguoiSelectBox.value = savedNguoi;
    }
  });
  nguoiSelectBox.addEventListener('change', function() {
    const selectedNguoi = nguoiSelectBox.value;
    chrome.storage.sync.set({ 'selectedNguoi': selectedNguoi });
  });
});

if(document.getElementById("btnStopFindHost")) {
    document.getElementById("btnStopFindHost").addEventListener("click", e => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { cmd: "f12FindHostAccID", run: 0 }, function (response) {});
        });
    });
}


let saved;
if ("null" == (saved = String(localStorage.getItem("f12_host_acc_id")))) {
    saved = "";
}
document.getElementById("host_acc_id").value = saved;

if ("null" == (saved = String(localStorage.getItem("f12_bet_money")))) {
    saved = "100";
}

for (var i, select_bet_money = document.getElementById("bet_money"), j = 0; i = select_bet_money.options[j]; j++) {
    if (i.value == saved) {
        select_bet_money.selectedIndex = j;
        break;
    }
}

