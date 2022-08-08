const { play, queue } = require("./music");
const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("stop")
  .setDescription("Detener la cola");

const stopQueue = async (queue, guild, interaction) => {
  const serverQueue = queue.get(guild.id);
  queue.delete(guild.id);
  serverQueue.connection.destroy();
  await interaction.reply("Detenida la cola");
};

module.exports = {
  data: data,
  async execute(interaction) {
    const guild = interaction.guild;
    if (!queue.size) return interaction.reply("No estas poniendo musica");
    await stopQueue(queue, guild, interaction);
  },
};
