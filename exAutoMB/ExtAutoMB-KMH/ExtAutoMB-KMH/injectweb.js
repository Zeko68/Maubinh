try {
    var f12_data = document.getElementById('injectwebjs').getAttribute('f12-data');
    var info = f12_data.split('|');
    var action = info[0];
    var params = info.slice(1);
    switch (action) {
        case 'setTypeGame':
            setTypeGame(params[0]);
            break;
        case 'TaoBan':
            TaoBan(params[0], params[1], params[2]);
            break;
        case 'f12FindHostAccID':
            f12FindHostAccID(params[0], params[1]);
            break;
		case 'VaoBanKhac':
            VaoBanKhac(params[0], params[1]);
            break;
        case 'f12StopFindHostAccID':
            f12StopFindHostAccID();
            break;
        default:
            // Handle unknown action
            break;
    }
} catch (e) {
    // Handle any errors
}
