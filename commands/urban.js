const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");
const data = new SlashCommandBuilder()
  .setName("urban")
  .setDescription("Responds with urban dictionary terms")
  .addStringOption((option) =>
    option.setName("term").setDescription("Term to look for").setRequired(true)
  );

async function getTerm(query) {
  const res = await fetch(`https://api.urbandictionary.com/v0/define?${query}`);
  const { list } = await res.json();
  return list;
}

module.exports = {
  data,
  async execute(interaction) {
    await interaction.deferReply();
    const term = interaction.options.getString("term");
    const query = new URLSearchParams({ term });
    const foundTerm = await getTerm(query);
    if (!foundTerm.length) {
      return interaction.editReply(
        `No se encontraron resultados para **${term}**.`
      );
    }
    await interaction.editReply(`**${term}**: ${foundTerm[0].definition}`);
  },
};
