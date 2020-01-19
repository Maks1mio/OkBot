const { Client } = require("discord.js");
const yt = require("ytdl-core");
const client = new Client();
const fs = require("fs-extra");

//server
const tokens = require("./tokens.json");

//command
const music = require("./command/music.js");
const autoRole = require("./command/autorole.js");

//uttilites
require("./utilites/LoaderEvent.js")(client); // Запускает ready.js

// ready в консоль //

client.on("ready", () => {
  console.log("ready!");
  console.log(music);
  console.log(autoRole)
  // console.log(music["search"]("кто пчелок уважает"))
  // music["search"]("кто пчелок уважает")
});

// music //

client.on("message", msg => {
  if (!msg.content.startsWith(tokens.prefix)) return;

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
});

client.on("guildMemberAdd", member => {
  autoRole["addRole"](member, "Member")
});

// Токенн //

client.login(tokens.d_token); // Вводить Токен в tokens.json
