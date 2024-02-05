const gerarNumeroAleatorio = () => {
    var timestamp = new Date().getTime();
    return timestamp.toString().substring(timestamp.toString().length - 4, timestamp.toString().length);
}

module.exports = { gerarNumeroAleatorio }
