const { Client } = require("discord.js");
const yt = require("ytdl-core");
const client = new Client();
const fs = require("fs-extra");

//server
const tokens = require("./tokens.json");

//command
const music = require("./command/music.js");
const autoRole = require("./command/autorole.js");
const addRoleByReact = require("./command/addrolebyreact.js");
const report = require("./command/report.js");
const clear = require("./command/clear.js");

//uttilites
require("./utilites/LoaderEvent.js")(client); // Запускает ready.js

// ready в консоль //

client.on("ready", () => {
  console.log("ready!");
  console.log(music);
  console.log(autoRole);
  console.log(addRoleByReact);
});

// music //

client.on("message", msg => {
  if (!msg.content.startsWith(tokens.prefix)) return; // если сообщение не начинается с префикса, выходим отсюда
  
  console.log(msg.content)

  /* музыка */
  if (
    music.hasOwnProperty(
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    )
  )
    music[
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    ](msg);
  
  /* добавить роль по реакции */

  if (
    addRoleByReact.hasOwnProperty(
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    )
  )
    addRoleByReact[
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    ](msg);
  
  /* репорт */

  if (
    report.hasOwnProperty(
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    )
  )
    report[
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    ](msg);
  
  if (
    clear.hasOwnProperty(
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    )
  )
    clear[
      msg.content
        .toLowerCase()
        .slice(tokens.prefix.length)
        .split(" ")[0]
    ](msg);
});

client.on("guildMemberAdd", member => {
  autoRole.addRole(member, "Member");
});

client.on("messageReactionAdd", (msgReact, user) => {
  console.log(msgReact.emoji.name)
  addRoleByReact.addrole(msgReact, user);
  console.log(msgReact.emoji)
});

client.on("messageReactionRemove", (msgReact, user) => {
  console.log(msgReact.emoji.name)
  addRoleByReact.takeRole(msgReact, user);
  console.log(msgReact.emoji)
});

// Токенн //

client.login(tokens.d_token); // Вводить Токен в tokens.json
