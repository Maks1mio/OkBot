const tokens = require("./../tokens.json");

const del_time = 15000;

const clear = msg => {
  console.log("First part")
  if (!msg.member.roles.find("name", "Future North")) return msg.delete(0);
  console.log("Second part")

  const args = msg.content
    .slice(tokens.prefix.length)
    .trim()
    .split(/ +/g);

  if (args[1] !== undefined)
    if (!isNaN(parseInt(args[1])))
      msg.channel.fetchMessages({ limit: parseInt(args[1]) + 1 }).then(msgs => {
        msgs.forEach(m => {
          if (m.id != msg.id) m.delete(0);
        });
        msg.delete(0);
      });
    else
      return msg.reply("Вы указали не число").then(m => {
        m.delete(del_time);
        msg.delete(0);
      });
  else
    return msg.reply("Вы должны указать кол-во удаляемых сообщений").then(m => {
      m.delete(del_time);
      msg.delete(0);
    });
};

exports.clear = clear;
