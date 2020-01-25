const tokens = require("./../tokens.json");
const del_time = 30000;

const report = msg => {
  const channel_reports = msg.guild.channels.find("name", "logs");

  let user;
  const user_match = /(<@\d+>)/;

  try {
    user = msg.content.match(user_match)[0];
  } catch {
    return msg
      .reply(
        "неверный формат имени пользователя. Вот как правильно отправить жалобу на пользователя `/report @OkBot#9664 Причина: <причина>`"
      )
      .then(m => {
        m.delete(15000);
        msg.delete(0);
      });
  }

  let reason;
  const reason_match = /(Причина: [\D\w]+)/;

  try {
    reason = msg.content.match(reason_match)[0];
  } catch {
    return msg
      .reply(
        "неверный формат указания причины. Вот как правильно отправить жалобу на пользователя `/report @OkBot#9664 Причина: <причина>`"
      )
      .then(m => {
        m.delete(15000);
        msg.delete(0);
      });
  }

  const res_msg = `Докладчик: <@${msg.author.id}> Подсудимый: ${user} ${reason}`;
  msg.channel
    .send(
      "Спасибо за Вашу жалобу, она будет рассмотрена в течении ближайшего времени"
    )
    .then(m => {
      m.delete(del_time);
      msg.delete(del_time);
    });
  channel_reports.send(res_msg);
};

exports.report = report;
