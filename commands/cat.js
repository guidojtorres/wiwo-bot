const { SlashCommandBuilder } = require("discord.js");
const { request } = require("undici");

const data = new SlashCommandBuilder()
  .setName("cat")
  .setDescription("Responds with a random cat");

async function getJSONResponse(body) {
  let fullBody = "";
  for await (const data of body) {
    fullBody = data.toString();
  }
  console.log(JSON.parse(fullBody));
  return JSON.parse(fullBody);
}

async function getCat() {
  const catResult = await request("https://aws.random.cat/meow");
  const { file } = await getJSONResponse(catResult.body);
  return file;
}

module.exports = {
  data,
  async execute(interaction) {
    await interaction.deferReply();
    const randomCat = await getCat();
    interaction.editReply({ files: [randomCat] });
  },
};
