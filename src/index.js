require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, MessageFlags } = require('discord.js');
const HyperismsDB = require('./database');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

const db = new HyperismsDB();

const commands = [
  new SlashCommandBuilder()
    .setName('hyperism')
    .setDescription('Manage and retrieve Hyper\'s quotes')
    .addStringOption(option =>
      option.setName('new')
        .setDescription('Add a new hyperism with this quote')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(false)
        .addChoices(
          { name: 'Show count', value: 'count' },
          { name: 'List recent', value: 'list' }
        ))
    .addIntegerOption(option =>
      option.setName('delete')
        .setDescription('Delete hyperism by ID')
        .setRequired(false)),
];

client.once('clientReady', async () => {
  await db.init();
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Total hyperisms in database: ${db.getHyperismCount()}`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands.map(cmd => cmd.toJSON()) },
    );
    console.log('Slash commands registered successfully!');
  } catch (error) {
    console.error('Error registering slash commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName !== 'hyperism') return;

  try {
    const newQuote = interaction.options.getString('new');
    const action = interaction.options.getString('action');
    const deleteId = interaction.options.getInteger('delete');

    // Add new hyperism
    if (newQuote) {
      db.addHyperism(newQuote, interaction.user.tag);
      return await interaction.reply(`Hyperism added successfully! "${newQuote}"`);
    }

    // Delete hyperism
    if (deleteId) {
      const deleted = db.deleteHyperism(deleteId);
      if (deleted > 0) {
        return await interaction.reply({ content: `Hyperism #${deleteId} has been deleted.`, flags: MessageFlags.Ephemeral });
      } else {
        return await interaction.reply({ content: `Hyperism #${deleteId} not found.`, flags: MessageFlags.Ephemeral });
      }
    }

    // Show count
    if (action === 'count') {
      const count = db.getHyperismCount();
      return await interaction.reply(`There are currently ${count} hyperisms in the database!`);
    }

    // List hyperisms
    if (action === 'list') {
      const hyperisms = db.getAllHyperisms();

      if (hyperisms.length === 0) {
        return interaction.reply('No hyperisms yet! Add one with `/hyperism new:<quote>`');
      }

      const list = hyperisms.slice(0, 10).map(h => `#${h.id}: "${h.quote}"`).join('\n');
      const footer = hyperisms.length > 10 ? `\n...and ${hyperisms.length - 10} more!` : '';

      return await interaction.reply(`Recent hyperisms:\n${list}${footer}`);
    }

    // Default: Get random hyperism
    const hyperism = db.getRandomHyperism();

    if (!hyperism) {
      return interaction.reply('No hyperisms yet! Add one with `/hyperism new:<quote>`');
    }

    await interaction.reply(`"${hyperism.quote}" - Hyper #${hyperism.id}`);
  } catch (error) {
    console.error('Error handling command:', error);
    const replyMethod = interaction.replied || interaction.deferred ? 'followUp' : 'reply';
    await interaction[replyMethod]({ content: 'An error occurred while processing your command.', flags: MessageFlags.Ephemeral });
  }
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  db.close();
  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
