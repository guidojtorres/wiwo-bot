const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get info about a user or a server!")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("user")
      .setDescription("Info about the user")
      .addUserOption((option) =>
        option.setName("target").setDescription("The user")
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("server").setDescription("Info about the server")
  );

module.exports = {
  data,
  async execute(interaction) {
    if (interaction.options.getSubcommand() === "user") {
      const user = interaction.options.getUser("target");
      await interaction.reply(interaction.user.tag);
    } else if (interaction.options.getSubcommand() === "server") {
      await interaction.reply(interaction.member.guild.name);
    }
  },
};
