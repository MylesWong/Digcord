const giveItem = require(`./giveItem.js`);

module.exports = {
	name: 'inventory',
	description: 'inventory',
	async execute(client, message, MessageEmbed, player) {
		const showI = client.getItems.all(message.author.id);
		console.log(showI);

		//Create the Embed message for inventory.
		const embedInv = new MessageEmbed()
		.setDescription('')
		.setTitle(message.author.username + "'s Inventory")
		.setThumbnail(message.author.displayAvatarURL());
		message.channel.send(embedInv).then(async gameEdit => {

		//Page for inventory.
		var page = 1;

		//Only react to specific emotes and user.
		const filter = (reaction, user) => {
			return ['⬅️', '➡️', '🛑'].includes(reaction.emoji.name) && user.id === message.author.id;
		};
		gameEdit.react('⬅️').then(() => gameEdit.react('➡️')).then(() => gameEdit.react('🛑'));
		await invUpdate();

		//Every 5 pages shows 5 items. Does not work properly yet, as the getItems needs to check for server based info as well, not just player based. Or else items are connected between servers.
		function invUpdate() {
			embedInv.description = `📃 **Page ${page}** 📃 \n`;

			//Filter between the list of items according to page number.
			for(var i=(page*5)-5; i < page*5; i++) {
				if(showI[i]) {
					embedInv.description += `**${showI[i].name}** [${showI[i].amount}] \n *Sells for ${showI[i].gold}* \n`;
				}
			}
			gameEdit.edit(embedInv);
	
			//Create commands. Arrows move pages and stop sign deletes the inventory.
			gameEdit.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
			.then(async collected => {
				const reaction = collected.first();
				reaction.users.remove(message.author.id);
				
				switch(reaction.emoji.name) {
					case '⬅️':
						page--;
						if(page < 1)
							page = 1;
						invUpdate();
						break;
					case '➡️':
						page++;
						invUpdate();
						break;
					case '🛑':
						gameEdit.delete();
						break;
				}
			})
		}
	})


	}
}