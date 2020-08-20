const giveItem = require(`./giveItem.js`);

module.exports = {
	name: 'mine',
	description: 'mines an area',
	async execute(client, message, MessageEmbed) {
		//Create Give Item Command
		client.commands.set(giveItem.name, giveItem);
		//Grab player info.
		var player = client.getPInfo.get(message.author.id, message.guild.id);
		var x = player.x;
		var y = player.y;
		for(var i = 0; i <= 1; i++) {
			switch(player.dir) {
				//Mine in the direction the user is looking at.
				case 1:
					y++;
					break;
				case 2:
					x++;
					break;
				case 3:
					y--;
					break;
				case 4:
					x--;
					break;
			}

			var stone = client.getBlock.get(message.guild.id, x, y)
			//If the block is stone, mine it and give the user stone. (Stones are set as invalid blocks.)
			if(!client.getBlock.get(message.guild.id, x, y)) {
				var block = {worldkey: message.guild.id, id: "745708096541950075", x: x, y: y, ground: "true"}
				var amount = Math.round(Math.floor(Math.random()*5)+10);
				client.setBlock.run(block);
				await client.commands.get('giveItem').execute(client, message, MessageEmbed, "Rocks", amount, 1);
				return `\`\`\`You mined Stone.\n+${amount} Rocks\`\`\``;
			}
			//If the block has a linked ID, mine it.
			switch(stone.id) {
				case "745879634746277940":
					var block = {worldkey: stone.worldkey, id: "745708096541950075", x: x, y: y, ground: "true"}
					var amount =Math.round(Math.floor(Math.random()*2)+2);
					client.setBlock.run(block);
					await client.commands.get('giveItem').execute(client, message, MessageEmbed, "Iron Ore", amount, 5);
					return `\`\`\`You mined an Iron Ore.\n+${amount} Iron Ore\`\`\``;
				case "746130824356954142":
					var block = {worldkey: stone.worldkey, id: "745708096541950075", x: x, y: y, ground: "true"}
					var amount =Math.round(Math.floor(Math.random()*2)+1);
					client.setBlock.run(block);
					await client.commands.get('giveItem').execute(client, message, MessageEmbed, "Gold Ore", amount, 10);
					return `\`\`\`You mined a Gold Ore.\n+${amount} Gold Ore\`\`\``;
			}
			
		}
		return `\`\`\`  \`\`\``;
	}
}
