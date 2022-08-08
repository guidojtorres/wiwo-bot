const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const puppeteer = require("puppeteer");

async function getCounters(champion) {
  const parsedChampion = champion.toLowerCase();
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto(`https://u.gg/lol/champions/${parsedChampion}/counter`);

  let nombres = [];
  let winRates = [];
  let partidas = [];

  for (let i = 1; i < 11; i++) {
    try {
      var counterChampion = await page.waitForSelector(
        `#content > div > div.champion-profile-content-container.content-side-padding > div > div > div.champion-profile-page > div > div:nth-child(1) > div.counters-list.best-win-rate > a:nth-child(${i}) > div.col-2 > div.champion-name`
      );
      var counterWinRate = await page.waitForSelector(
        `#content > div > div.champion-profile-content-container.content-side-padding > div > div > div.champion-profile-page > div > div:nth-child(1) > div.counters-list.best-win-rate > a:nth-child(${i}) > div.col-3 > div.win-rate`
      );

      var counterGames = await page.waitForSelector(
        `#content > div > div.champion-profile-content-container.content-side-padding > div > div > div.champion-profile-page > div > div:nth-child(1) > div.counters-list.best-win-rate > a:nth-child(${i}) > div.col-3 > div.total-games`
      );
    } catch (error) {
      return ["", "", ""];
    }
    var counterChampionText = await page.evaluate(
      (counterChampion) => counterChampion.textContent,
      counterChampion
    );
    var counterWinRateText = await page.evaluate(
      (counterWinRate) => counterWinRate.textContent,
      counterWinRate
    );

    var counterGamesText = await page.evaluate(
      (counterGames) => counterGames.textContent,
      counterGames
    );

    nombres.push(counterChampionText);
    winRates.push(counterWinRateText.replace(" WR", ""));
    partidas.push(counterGamesText.replace(" games", ""));
  }
  browser.close();
  const nombresString = nombres.join("\n");
  const winRatesString = winRates.join("\n");
  const partidasString = partidas.join("\n");
  return [nombresString, winRatesString, partidasString];
}

const data = new SlashCommandBuilder()
  .setName("counter")
  .setDescription("Muestra counters e info del champion ingresado")
  .addStringOption((option) =>
    option
      .setName("champion")
      .setDescription("El champion al que counterear")
      .setRequired(true)
  );

module.exports = {
  data,
  async execute(interaction) {
    await interaction.deferReply();
    const champion = interaction.options.getString("champion");
    const [nombres, winRates, partidas] = await getCounters(champion);
    if (!nombres || !winRates || !partidas) {
      await interaction.editReply(
        "No se encontraron counters para " + champion
      );
      return;
    } else {
      const mensaje = new EmbedBuilder()
        .setTitle("Counters de " + champion)
        .setColor("#f22105")
        .addFields(
          { name: "Champion", value: nombres, inline: true },
          { name: "Win rate", value: winRates, inline: true },
          { name: "Partidas", value: partidas, inline: true }
        );
      await interaction.editReply({ embeds: [mensaje] });
    }
  },
};
