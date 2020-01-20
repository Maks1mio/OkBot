const yt = require("ytdl-core");
const request = require("request");
const tokens = require("./../tokens.json");

let queue = [];

const play = msg => {
  try {
    let arg = msg.content.split(' ')[1]
    add(msg)
  } catch {
    console.log("В команду play не были переданы аргументы")
  }
  if (queue[msg.guild.id] === undefined)
    return msg.channel.sendMessage(
      `Сначала добавьте несколько песен в очередь с помощью ${tokens.prefix}add`
    );
  if (!msg.guild.voiceConnection) return join(msg).then(() => play(msg));
  if (queue[msg.guild.id].playing) return msg.channel.sendMessage("Уже играю");
  let dispatcher;
  queue[msg.guild.id].playing = true;

  console.log(queue);
  (function play(song) {
    console.log(song);
    if (song === undefined)
      return msg.channel.sendMessage("Очередь пуста").then(() => {
        queue[msg.guild.id].playing = false;
        msg.member.voiceChannel.leave();
      });
    msg.channel.sendMessage(
      `Играет: **${song.title}** по запросу: **${song.requester}**`
    );
    dispatcher = msg.guild.voiceConnection.playStream(
      yt(song.url, { audioonly: true }),
      { passes: tokens.passes }
    );
    let collector = msg.channel.createCollector(m => m);
    collector.on("message", m => {
      if (m.content.startsWith(tokens.prefix + "pause")) {
        msg.channel.sendMessage("Пауза").then(() => {
          dispatcher.pause();
        });
      } else if (m.content.startsWith(tokens.prefix + "resume")) {
        msg.channel.sendMessage("Возобновлено").then(() => {
          dispatcher.resume();
        });
      } else if (m.content.startsWith(tokens.prefix + "skip")) {
        msg.channel.sendMessage("Пропускаются").then(() => {
          dispatcher.end();
        });
      } else if (m.content.startsWith(tokens.prefix + "s")) {
        msg.channel.sendMessage("Пропускаются").then(() => {
          dispatcher.end();
        });  

        /*
      } else if (m.content.startsWith("volume+")) {
        if (Math.round(dispatcher.volume * 50) >= 100)
          return msg.channel.sendMessage(
            `Volume: ${Math.round(dispatcher.volume * 50)}%`
          );
        dispatcher.setVolume(
          Math.min(
            (dispatcher.volume * 50 + 2 * (m.content.split("+").length - 1)) /
              50,
            2
          )
        );
        msg.channel.sendMessage(
          `Volume: ${Math.round(dispatcher.volume * 50)}%`
        );
      } else if (m.content.startsWith("volume-")) {
        if (Math.round(dispatcher.volume * 50) <= 0)
          return msg.channel.sendMessage(
            `Volume: ${Math.round(dispatcher.volume * 50)}%`
          ); 
        dispatcher.setVolume(
          Math.max(
            (dispatcher.volume * 50 - 2 * (m.content.split("-").length - 1)) /
              50,
            0
          )
        );
        msg.channel.sendMessage(
          `Volume: ${Math.round(dispatcher.volume * 50)}%`
        );*/
      } else if (m.content.startsWith(tokens.prefix + "time")) {
        msg.channel.sendMessage(
          `time: ${Math.floor(dispatcher.time / 60000)}:${
            Math.floor((dispatcher.time % 60000) / 1000) < 10
              ? "0" + Math.floor((dispatcher.time % 60000) / 1000)
              : Math.floor((dispatcher.time % 60000) / 1000)
          }`
        );
      }
    });
    dispatcher.on("end", () => {
      collector.stop();
      play(queue[msg.guild.id].songs.shift());
    });
    dispatcher.on("error", err => {
      return msg.channel.sendMessage("ошибка: " + err).then(() => {
        collector.stop();
        play(queue[msg.guild.id].songs.shift());
      });
    });
  })(queue[msg.guild.id].songs.shift());
};

const join = msg => {
  return new Promise((resolve, reject) => {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel || voiceChannel.type !== "voice")
      return msg.reply("Я не могу подключиться к вашему голосовому каналу...");
    voiceChannel
      .join()
      .then(connection => resolve(connection))
      .catch(err => reject(err));
  });
};

const add = msg => {
  let url = msg.content.split(" ")[1];
  if (url == "" || url === undefined)
    return msg.channel.sendMessage(
      `Вы должны добавить URL видео YouTube или идентификатор после ${tokens.prefix}add`
    );
  // if (!(url.includes("youtube.com/") && url.includes("youtu.be/"))){
  //   try {
  //     url = search(msg);
  //   } catch {
  //     console.log(search(msg))
  //     return msg.channel.sendMessage("Ошибка")
  //   }
  // }
  yt.getInfo(url, (err, info) => {
    if (err)
      return msg.channel.sendMessage("Неверная ссылка на YouTube: " + err);
    if (!queue.hasOwnProperty(msg.guild.id))
      (queue[msg.guild.id] = {}),
        (queue[msg.guild.id].playing = false),
        (queue[msg.guild.id].songs = []);
    queue[msg.guild.id].songs.push({
      url: url,
      title: info.title,
      requester: msg.author.username
    });
    msg.channel.sendMessage(`Добавлено **${info.title}** в очередь`);
  });
};

const queue_show = msg => {
  if (queue[msg.guild.id] === undefined)
    return msg.channel.sendMessage(
      `Сначала добавьте несколько песен в очередь с помощью ${tokens.prefix}add`
    );
  let tosend = [];
  queue[msg.guild.id].songs.forEach((song, i) => {
    tosend.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`);
  });
  msg.channel.sendMessage(
    `__**${msg.guild.name}' Музыкальная очередь: **__ В настоящее время **${
      tosend.length
    }** песня(и) в очереди ${
      tosend.length > 15 ? "*[Показываются только следующие 15]*" : ""
    }\n\`\`\`${tosend.slice(0, 15).join("\n")}\`\`\``
  );
};

const help = msg => {
  const args = msg.content
    .slice(tokens.prefix.length)
    .trim()
    .split(/ +/g);
  if (args[1] === "music") {
    let tosend = [
      "```xl",
      tokens.prefix +
        'join : "Присоединиться к голосовому каналу отправителя сообщения"',
      tokens.prefix +
        'add : "Добавьте действительную ссылку на YouTube в очередь"',
      tokens.prefix +
        'queue : "Показывает текущую очередь, показывается до 15 песен."',
      tokens.prefix +
        'play : "Воспроизведите музыкальную очередь, если вы уже подключены к голосовому каналу"',
      "",
      "cледующие команды работают только во время выполнения команды воспроизведения:".toUpperCase(),
      tokens.prefix + 'pause : "Приостанавливает музыку"',
      tokens.prefix + 'resume : "Возобновляет музыку"',
      tokens.prefix + 'skip : "Пропускает песню"',
      tokens.prefix + 'time : "Показывает время воспроизведения песни."',
      // 'volume+(+++) : "Увеличивает громкость на 2%/+"',
      // 'volume-(---) : "Уменьшает громкость на 2%/-"',
      "```"
    ];
    msg.channel.sendMessage(tosend.join("\n"));
  }
};

const reboot = msg => {
  if (msg.author.id == tokens.adminID) process.exit(); //Requires a node module like Forever to work.
};

const search = (msg, VID = undefined) => {
  const query = msg.content
    .split(" ")
    .slice(1, 2)
    .join(" ");
  if (VID === undefined) {
    const url = encodeURI(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${tokens.YTApiKey}`
    );
    console.log(url);
    console.log(typeof VID);
    request(url, (e, r, b) => {
      // console.log(b);
      try {
        return search(msg, JSON.parse(b)["items"][0]["id"]["videoId"]);
      } catch {
        return msg.channel.sendMessage(
          "Дневной лимит использования Youtube API закончился"
        );
      }
    });
  } else {
    console.log(VID);
    msg.channel.sendMessage("123test");
    return "https://youtu.be/" + VID;
  }
};

exports.play = play;
exports.join = join;
exports.queue = queue_show;
exports.help = help;
exports.reboot = reboot;
exports.add = add;
// exports.search = search;

// AIzaSyCQWegVo6ooHrSQK2ZOYXrEWSP4FcUHCto
// https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=%D0%BA%D1%82%D0%BE%20%D0%BF%D1%87%D0%B5%D0%BB%D0%BE%D0%BA%20%D1%83%D0%B2%D0%B0%D0%B6%D0%B0%D0%B5%D1%82&key=[YOUR_API_KEY]
