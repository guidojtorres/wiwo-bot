const { play, queue } = require("./music");
const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Siguiente cancion");

const skipSong = async (queue, guild, interaction) => {
  const serverQueue = queue.get(guild.id);
  serverQueue.songs.shift();
  if (serverQueue.songs.length) {
    let song = serverQueue.songs[0];
    play(guild, song, queue);
    await interaction.reply("Skipped");
  } else {
    queue.delete(guild.id);
    serverQueue.connection.destroy();
    await interaction.reply("Skipped, no hay mas canciones en la cola.");
  }
};

module.exports = {
  data: data,
  async execute(interaction) {
    const guild = interaction.guild;
    if (!queue.size) return interaction.reply("No estas poniendo musica");
    await skipSong(queue, guild, interaction);
  },
};
