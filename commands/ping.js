const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const button = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setCustomId("primary")
    .setLabel("Primary")
    .setStyle(ButtonStyle.Primary)
);

const embed = new EmbedBuilder()
  .setColor("#0099ff")
  .setTitle("Some title")
  .setURL("https://discord.js.org")
  .setDescription("Some description here");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply({
      content: "Pong!",
      ephemeral: true,
      embeds: [embed],
      components: [button],
    });
  },
};
