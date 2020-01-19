const reqEvent = (event) => require(`../command/${event}`);
module.exports = client => {
  client.on('ready', () => reqEvent('ready')(client)); // Выполняет запуск 
};




