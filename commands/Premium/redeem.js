const {
    ApplicationCommandOptionType,
    ChannelType,
    EmbedBuilder,
    PermissionFlagsBits,
  } = require("discord.js");
  const moment = require('moment');
  const Premium = require("../../Models/Premium");
  const Redeem = require("../../Models/Redeem");
  
  module.exports = {
    name: ["redeem"],
    description: "redeem a premium by the code",
    category: "Premium",
    options: [
      {
        name: "code",
        description: "the code generated by owner",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ],
    permissions: {
      channel: [],
      bot: [],
      user: [],
    },
    settings: {
      isPremium: false,
      isOwner: false,
      inVoice: false,
      isNSFW: false,
    },
    run: async (interaction, client) => {
  
      await interaction.deferReply({ ephemeral: false });
  
      const input = interaction.options.getString("code");
  
      let member = await Premium.findOne({ Id: interaction.user.id })
  
      if (member && member.isPremium) {
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`You Already Have Premium Enjoy That`)
        return interaction.editReply({ embeds: [embed] });
      } else {
  
      const premium = await Redeem.findOne({ code: input.toUpperCase() });
      if (premium) {
        const expires = moment(premium.expiresAt).format('do/MMMM/YYYY (HH:mm:ss)')
  
       const member2 = new Premium({ Id: interaction.user.id})
        member2.isPremium = true
        member2.premium.redeemedBy.push(interaction.user)
        member2.premium.redeemedAt = Date.now()
        member2.premium.expiresAt = premium.expiresAt
        member2.premium.plan = premium.plan
  
        member = await member2.save({ new: true });
        client.premiums.set(interaction.user.id, member);
        await premium.deleteOne();
  
        const embed = new EmbedBuilder()
          .setAuthor({ name: `Redeemed Code`, iconURL: client.user.displayAvatarURL() })
          .setDescription(`**Plan**: \`${premium.plan}\`\n**Expires At**: \`${expires}\``)
          .setColor(client.color)
          .setTimestamp()
  
        return interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`That Redeem code is invalid`)
        return interaction.editReply({ embeds: [embed] })
      }
    }
  },
  };