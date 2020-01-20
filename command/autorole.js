const addRole = (member, role_name="Member") => {
  console.log(`New user ${member}`);
  const role = member.guild.roles.find(role => role.name === role_name);
  console.log(`Role ${role}`);
  member.addRole(role, "Присоеденился к серверу");
};

exports.addRole = addRole