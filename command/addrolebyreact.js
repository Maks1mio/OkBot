const tokens = require("./../tokens.json");

let posts = [];

const addrolebyreact = msg => {
  console.log("First part");
  if (!msg.member.roles.find("name", "Future North")) return msg.delete(0);
  console.log("Second part");
  
  const args = msg.content
    .slice(tokens.prefix.length)
    .trim()
    .split(/ +/g);

  const regex = /(\w+)/;
  if (args[2].match(regex) !== null) {
    args[2] = args[2].match(regex)[0];
  }
  console.log(args);

  if (!posts.hasOwnProperty(msg.guild.id)) {
    posts[msg.guild.id] = {};
    posts[msg.guild.id].posts = [];
  }
  posts[msg.guild.id].posts.push({
    post: args[1],
    emoji: args[2],
    role: msg.guild.roles.find(role => role.name === args[3])
  });
  // console.log(posts[msg.guild.id].posts + "1st")
  msg.channel
    .fetchMessage(args[1])
    .then(m => m.react(m.guild.emojis.find(em => em.name === args[2])));
  msg.delete(0);
  // console.log(posts[msg.guild.id].posts)
};

const addrole = (msgReact, user) => {
  console.log(user.username + " added reaction.");
  // console.log(msgReact.emoji);
  const msg = msgReact.message;
  posts[msg.guild.id].posts.forEach(post => {
    console.log("ForEach " + post.post);
    if (post.post == msg.id) {
      console.log("Found post");
      if (msgReact.emoji.name == post.emoji) {
        const member = msg.guild.member(user);
        member.addRole(post.role);
        console.log("Added role");
      } else {
        console.log("No found emoji`s");
      }
    } else {
      console.log("No found posts");
    }
  });
};

const takeRole = (msgReact, user) => {
  console.log(user.username + " took reaction.");
  const msg = msgReact.message;
  posts[msg.guild.id].posts.forEach(post => {
    if (post.post == msg.id) {
      console.log("Found post");
      if (msgReact.emoji.name == post.emoji) {
        const member = msg.guild.member(user);
        member.removeRole(post.role);
        console.log("Took role");
      } else {
        console.log("No found emoji`s");
      }
      // const member = msg.guild.member(user);
      // member.removeRole(post.role);
      // console.log("Took role");
    } else {
      console.log("No found posts");
    }
  });
};

exports.addrolebyreact = addrolebyreact;
exports.addrole = addrole;
exports.takeRole = takeRole;
