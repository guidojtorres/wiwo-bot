const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytpl = require("ytpl");

let queue = new Map();
const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Pone la musica!")
  .addStringOption((option) =>
    option
      .setName("cancion")
      .setDescription("Cancion o playlist")
      .setRequired(true)
  );

async function getYtSong(input, interaction) {
  let song = [];
  try {
    if (await ytpl.getPlaylistID(input)) {
      const playlist = await ytpl(input);
      const items = playlist.items;
      items.map((unaCancion) => {
        song.push({
          title: unaCancion.title,
          url: unaCancion.url,
        });
      });
      return song;
    }
  } catch (e) {
    if (ytdl.validateURL(input)) {
      const songInfo = await ytdl.getInfo(input);
      song.push({
        title: songInfo.videoDetails.video_url,
        url: songInfo.videoDetails.video_url,
      });
    } else {
      const { videos } = await yts(input);
      if (!videos.length)
        return await interaction.reply("No se encontraron canciones :(");
      song.push({
        title: videos[0].title,
        url: videos[0].url,
      });
    }
  }

  return song;
}

async function play(guild, song, queue) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.destroy();
    queue.delete(guild.id);
    return;
  }

  const stream = ytdl(song.url, { filter: "audioonly" });
  const player = createAudioPlayer();
  const resource = createAudioResource(stream);

  player.play(resource);
  serverQueue.connection.subscribe(player);

  player.on("error", (error) => console.error(error));
  player.on(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    if (serverQueue.songs.length) {
      play(guild, serverQueue.songs[0], queue);
    } else {
      queue.delete(guild.id);
      serverQueue.connection.destroy();
      return serverQueue.textChannel.send(`Termino la cola`);
    }
  });
  return serverQueue.textChannel.send(`Tocando: **${song.title}**`);
}

async function startBot(interaction, queue) {
  const input = interaction.options.getString("cancion");
  const voiceChannel = interaction.member.voice.channel;

  if (!voiceChannel) {
    await interaction.reply("Tenes que estar en un canal para poner musica");
    return;
  }

  const permissions = voiceChannel.permissionsFor(interaction.client.user);

  if (
    !permissions.has(PermissionsBitField.Flags.Connect) ||
    !permissions.has(PermissionsBitField.Flags.Speak)
  ) {
    await interaction.reply(
      "Necesito permisos para entrar y hablar en tu canal! :("
    );
    return;
  }
  const songs = await getYtSong(input, interaction);
  if (!queue.size) {
    const queueConstruct = {
      textChannel: interaction.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true,
    };

    queue.set(interaction.guild.id, queueConstruct);
    songs.map((unaCancion) => {
      queueConstruct.songs.push(unaCancion);
    });
    try {
      var connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      queueConstruct.connection = connection;

      play(interaction.guild, queueConstruct.songs[0], queue);
      await interaction.reply("Poniendo musica");
    } catch (e) {
      console.log(e);
      queue.delete(interaction.guild.id);
      await interaction.reply(e);
      return;
    }
  } else {
    const songsArray = queue.get(interaction.guild.id).songs;
    songs.map((unaCancion) => {
      songsArray.push(unaCancion);
    });
    if (songs.length === 1) {
      await interaction.reply(`${songs[0].title} fue agregada a la cola! :D`);
    } else {
      await interaction.reply(
        `${songs.length} canciones fueron agregadas a la cola! :D`
      );
    }
    return;
  }
}

module.exports = {
  data: data,
  async execute(interaction) {
    await startBot(interaction, queue);
  },
  play,
  queue,
};
