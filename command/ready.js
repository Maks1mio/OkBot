const chalk = require('chalk');
const moment = require('moment');
const Discord = require('discord.js');
const tokens = require('./../tokens.json');

var prefix = tokens.prefix;


module.exports = client => {
  console.log(`Войти с именем ${client.user.username}!`);
  client.user.setStatus("dnd");
  //idle = Не активен
  //dnd = Не беспокоить
  //online = Онлайн
  console.log(`                                                                                                  {FBot Developer Team                                                                    `)
  client.user.setActivity(`| ${prefix}help | ${client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()} пользователей | Future North Official Bot |`, { type: "WATCHING"});
  //LISTENING = Слушает
  //WATCHING = Стримит
  //PLAYING = Играет
  console.log(`${client.user.username}: в настоящее время ` + client.channels.size + ` направить, ` + client.guilds.size + ` на сервер и ` + client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString() + ` обслуживая пользователя!`);
};