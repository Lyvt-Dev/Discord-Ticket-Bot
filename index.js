require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Collection,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const SUPPORT_ROLE_ID = process.env.SUPPORT_ROLE_ID;
const TICKET_CHANNEL_ID = process.env.TICKET_CHANNEL_ID;
const TRANSCRIPT_CHANNEL_ID = process.env.TRANSCRIPT_CHANNEL_ID;
const BLACKLIST_ROLE_ID = process.env.BLACKLIST_ROLE_ID;
const blacklistPath = path.join(__dirname, 'blacklist.json');

let blacklist = [];
if (fs.existsSync(blacklistPath)) {
  blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'));
} else {
  fs.writeFileSync(blacklistPath, JSON.stringify([]));
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

  const commands = [
    new SlashCommandBuilder()
      .setName('sendticketpanel')
      .setDescription('Send the ticket panel'),
    new SlashCommandBuilder()
      .setName('blacklist')
      .setDescription('Manage user blacklist')
      .addSubcommand(sub =>
        sub.setName('add')
          .setDescription('Add a user to the blacklist')
          .addUserOption(opt => opt.setName('user').setDescription('User to blacklist').setRequired(true))
      )
      .addSubcommand(sub =>
        sub.setName('remove')
          .setDescription('Remove a user from the blacklist')
          .addUserOption(opt => opt.setName('user').setDescription('User to remove').setRequired(true))
      )
      .addSubcommand(sub =>
        sub.setName('list')
          .setDescription('List all blacklisted users')),
  ];

  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Slash commands registered');
  } catch (err) {
    console.error('Error registering slash commands:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'sendticketpanel') {
      const embed = new EmbedBuilder()
        .setTitle('📦 PayBox Support')
        .setDescription(
          `Please select the category that best suits your concern:

⛔ Don't open multiple tickets unnecessarily.
🕒 The team will respond as quickly as possible.
📌 If there is no response within 3 days, please ping the owner.`
        )
        .setColor(0x2f3136);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_category')
        .setPlaceholder('Select a category')
        .addOptions(
          new StringSelectMenuOptionBuilder().setLabel('🛠 General Support').setValue('general').setDescription('Get help with general inquiries.'),
          new StringSelectMenuOptionBuilder().setLabel('💰 Billing').setValue('billing').setDescription('Questions about payments or purchases.'),
          new StringSelectMenuOptionBuilder().setLabel('🐞 Bug Report').setValue('bugs').setDescription('Report bugs or technical issues.'),
          new StringSelectMenuOptionBuilder().setLabel('🎯 Cheater Report').setValue('cheater').setDescription('Report users violating rules.'),
          new StringSelectMenuOptionBuilder().setLabel('🚀 Booster').setValue('booster').setDescription('Get help with boosting-related perks.'),
          new StringSelectMenuOptionBuilder().setLabel('🤝 Partnership').setValue('partnership').setDescription('Request or manage partnerships.')
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === 'blacklist') {
      const sub = interaction.options.getSubcommand();
      const user = interaction.options.getUser('user');

      if (sub === 'add') {
        if (!blacklist.includes(user.id)) {
          blacklist.push(user.id);
          fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));
          const member = await interaction.guild.members.fetch(user.id);
          await member.roles.add(BLACKLIST_ROLE_ID);
          await interaction.reply({ content: `✅ ${user.tag} has been blacklisted.`, ephemeral: true });
        } else {
          await interaction.reply({ content: `⚠️ ${user.tag} is already blacklisted.`, ephemeral: true });
        }
      }

      if (sub === 'remove') {
        const index = blacklist.indexOf(user.id);
        if (index !== -1) {
          blacklist.splice(index, 1);
          fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));
          const member = await interaction.guild.members.fetch(user.id);
          await member.roles.remove(BLACKLIST_ROLE_ID);
          await interaction.reply({ content: `✅ ${user.tag} has been removed from blacklist.`, ephemeral: true });
        } else {
          await interaction.reply({ content: `⚠️ ${user.tag} is not blacklisted.`, ephemeral: true });
        }
      }

      if (sub === 'list') {
        const userTags = await Promise.all(
          blacklist.map(async id => {
            try {
              const user = await client.users.fetch(id);
              return user.tag;
            } catch {
              return `Unknown User (${id})`;
            }
          })
        );

        await interaction.reply({
          content: `🧾 **Blacklisted Users:**\n${userTags.join('\n') || 'No users blacklisted.'}`,
          ephemeral: true
        });
      }
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_category') {
    const user = interaction.user;
    if (blacklist.includes(user.id)) {
      return interaction.reply({ content: '🚫 You are blacklisted and cannot create a ticket.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true }); // FIX

    const topic = interaction.values[0];
    const threadName = `ticket-${user.username}`.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
    const ticketChannel = await interaction.guild.channels.fetch(TICKET_CHANNEL_ID);

    const thread = await ticketChannel.threads.create({
      name: threadName,
      type: ChannelType.PrivateThread,
      invitable: false
    });

    await thread.members.add(user.id);

    const controlSelect = new StringSelectMenuBuilder()
      .setCustomId('ticket_controls')
      .setPlaceholder('🎛 Ticket Actions')
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('🔒 Close').setValue('close_ticket').setDescription('Close this ticket.'),
        new StringSelectMenuOptionBuilder().setLabel('✏️ Rename').setValue('rename_ticket').setDescription('Rename the ticket.')
      );

    await thread.send({
      content: `<@&${SUPPORT_ROLE_ID}>`,
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('🎫 New Ticket')
          .setDescription(`Hey <@${user.id}>, thank you for reaching out!\nPlease describe your issue below.\n\n🔔 A new ticket has been created! <@&${SUPPORT_ROLE_ID}>`)
          .setThumbnail(user.displayAvatarURL())
          .addFields(
            { name: '🧑 User', value: `<@${user.id}>`, inline: true },
            { name: '📂 Topic', value: `\`${topic}\``, inline: true }
          )
          .setFooter({ text: 'Created by _.calmly', iconURL: client.user.displayAvatarURL() })
          .setTimestamp()
      ],
      components: [new ActionRowBuilder().addComponents(controlSelect)]
    });

    await interaction.editReply({ content: `✅ Ticket Created: <#${thread.id}>` }); // FIX
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_controls') {
    const user = interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.roles.cache.has(SUPPORT_ROLE_ID)) {
      return interaction.reply({ content: '❌ You are not allowed to use this action.', ephemeral: true });
    }

    const ticketChannel = interaction.channel;
    const action = interaction.values[0];

    if (action === 'close_ticket') {
      const messages = await ticketChannel.messages.fetch({ limit: 100 });
      const transcript = messages.reverse().map(m => `[${m.createdAt.toISOString()}] ${m.author.tag}: ${m.content}`).join('\n');

      const transcriptChannel = await interaction.guild.channels.fetch(TRANSCRIPT_CHANNEL_ID);
      await transcriptChannel.send({
        content: `📄 Transcript from ${ticketChannel.name}`,
        files: [{ attachment: Buffer.from(transcript, 'utf-8'), name: `${ticketChannel.name}-transcript.txt` }]
      });

      await ticketChannel.delete();
    }

    // not done so dont change anything here if you dont know what you do <3
    if (action === 'claim_ticket') {
      await ticketChannel.permissionOverwrites.edit(SUPPORT_ROLE_ID, { SendMessages: false });
      await ticketChannel.permissionOverwrites.edit(user.id, { SendMessages: true });
      await interaction.reply({ content: `📌 Ticket claimed by <@${user.id}>`, ephemeral: false });
    }

    if (action === 'rename_ticket') {
      const modal = new ModalBuilder()
        .setCustomId('rename_ticket_modal')
        .setTitle('Rename Ticket')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('new_name')
              .setLabel('New Ticket Name')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'rename_ticket_modal') {
      const newName = interaction.fields.getTextInputValue('new_name');
      await interaction.channel.setName(newName);
      await interaction.reply({ content: `✏️ Ticket renamed to \`${newName}\``, ephemeral: true });
    }
  }
});

client.login(process.env.TOKEN);
