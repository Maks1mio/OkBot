const yt = require("ytdl-core");
const request = require("request");
const tokens = require("./../tokens.json");

let queue = [];

const del_time = 90000;

const play = msg => {
  if (queue[msg.guild.id] === undefined)
    return msg.channel
      .sendMessage(
        `Сначала добавьте несколько песен в очередь с помощью ${tokens.prefix}add`
      )
      .then(m => {
        m.delete(del_time);
      });
  if (!msg.guild.voiceConnection) return join(msg).then(() => play(msg));
  if (queue[msg.guild.id].playing)
    return msg.channel.sendMessage("Уже играю").then(m => {
      m.delete(del_time);
    });
  let dispatcher;
  queue[msg.guild.id].playing = true;
  msg.delete(del_time);

  console.log(queue);
  (function play(song) {
    console.log(song);
    if (song === undefined)
      return msg.channel.sendMessage("Очередь пуста").then(m => {
        queue[msg.guild.id].playing = false;
        msg.member.voiceChannel.leave();
        m.delete(del_time);
      });
    msg.channel
      .sendMessage(
        `Играет: **${song.title}** по запросу: **${song.requester}**`
      )
      .then(m => m.delete(del_time));
    dispatcher = msg.guild.voiceConnection.playStream(
      yt(song.url, { audioonly: true }),
      { passes: tokens.passes }
    );
    let collector = msg.channel.createCollector(m => m);
    collector.on("message", m => {
      if (m.content.startsWith(tokens.prefix + "pause")) {
        msg.channel.sendMessage("Пауза").then(m => {
          dispatcher.pause();
          m.delete(del_time);
        });
        m.delete(del_time);
      } else if (m.content.startsWith(tokens.prefix + "resume")) {
        msg.channel.sendMessage("Возобновлено").then(m => {
          dispatcher.resume();
          m.delete(del_time);
        });
        m.delete(del_time);
      } else if (m.content.startsWith(tokens.prefix + "skip")) {
        msg.channel.sendMessage("Пропускаются").then(m => {
          dispatcher.end();
          m.delete(del_time);
        });
        m.delete(del_time);
        /*
      } else if (m.content.startsWith(tokens.prefix + "s")) {
        msg.channel.sendMessage("Пропускаются").then(() => {
          dispatcher.end();  
        });*/

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
        msg.channel
          .sendMessage(
            `time: ${Math.floor(dispatcher.time / 60000)}:${
              Math.floor((dispatcher.time % 60000) / 1000) < 10
                ? "0" + Math.floor((dispatcher.time % 60000) / 1000)
                : Math.floor((dispatcher.time % 60000) / 1000)
            }`
          )
          .then(m => m.delete(del_time));
        m.delete(del_time);
      } else if (m.content.startsWith(tokens.prefix + "leave")) {
        // const emoji = m.guild.emojis.find(emoji => emoji.name === 'emoji_name');
        const emoji = "👋";
        m.channel.sendMessage(`До скорых встреч`).then(m => {
          m.react(emoji);
          m.delete(del_time);
        });
        m.delete(del_time);
        queue[msg.guild.id].playing = false;
        msg.member.voiceChannel.leave();
        queue[msg.guild.id].songs = [];
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
    return msg.channel
      .sendMessage(
        `Вы должны добавить URL видео YouTube или идентификатор после ${tokens.prefix}add`
      )
      .then(m => m.delete(del_time));
  if (
    !url.includes("youtube.com/watch") &&
    !url.includes("https://youtu.be/")
  ) {
    search(msg);
  } else {
    yt.getInfo(url, (err, info) => {
      if (err)
        return msg.channel
          .sendMessage("Неверная ссылка на YouTube: " + err)
          .then(m => {
            m.delete(del_time);
            msg.delete(del_time);
          });
      if (!queue.hasOwnProperty(msg.guild.id))
        (queue[msg.guild.id] = {}),
          (queue[msg.guild.id].playing = false),
          (queue[msg.guild.id].songs = []);
      queue[msg.guild.id].songs.push({
        url: url,
        title: info.title,
        requester: msg.author.username
      });
      msg.channel
        .sendMessage(`Добавлено **${info.title}** в очередь`)
        .then(m => {
          m.delete(del_time);
          msg.delete(del_time);
        });
    });
  }
};

const queue_show = msg => {
  if (queue[msg.guild.id] === undefined)
    return msg.channel
      .sendMessage(
        `Сначала добавьте несколько песен в очередь с помощью ${tokens.prefix}add`
      )
      .then(m => m.delete(del_time));
  let tosend = [];
  queue[msg.guild.id].songs.forEach((song, i) => {
    tosend.push(`${i + 1}. ${song.title} - Requested by: ${song.requester}`);
  });
  msg.channel
    .sendMessage(
      `__**${msg.guild.name}' Музыкальная очередь: **__ В настоящее время **${
        tosend.length
      }** песня(и) в очереди ${
        tosend.length > 15 ? "*[Показываются только следующие 15]*" : ""
      }\n\`\`\`${tosend.slice(0, 15).join("\n")}\`\`\``
    )
    .then(m => m.delete(del_time));
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
    msg.channel.sendMessage(tosend.join("\n")).then(() => msg.delete(0));
  }
};

const reboot = msg => {
  if (msg.author.id == tokens.adminID) process.exit(); //Requires a node module like Forever to work.
};

const search = msg => {
  let args = msg.content.split(" ");
  args.shift();
  const query = args.join(" ");
  const url = encodeURI(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&type=video&key=${tokens.YTApiKey}`
  );
  console.log(url);
  console.log(typeof VID);
  request(url, (e, r, b) => {
    if (e) console.log(msg, e);
    if (r.statusCode == 200) {
      const videoID = JSON.parse(b)["items"][0]["id"]["videoId"];
      const url = `https://youtu.be/${videoID}`;
      yt.getInfo(url, (err, info) => {
        if (err)
          return msg.channel
            .sendMessage("Неверная ссылка на YouTube: " + err)
            .then(m => m.delete(del_time));
        if (!queue.hasOwnProperty(msg.guild.id))
          (queue[msg.guild.id] = {}),
            (queue[msg.guild.id].playing = false),
            (queue[msg.guild.id].songs = []);
        queue[msg.guild.id].songs.push({
          url: url,
          title: info.title,
          requester: msg.author.username
        });
        msg.channel
          .sendMessage(`Добавлено **${info.title}** в очередь`)
          .then(m => {
            m.delete(del_time);
            msg.delete(del_time);
          });
      });
    }
  });
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
