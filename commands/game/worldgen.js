
module.exports = {
	name: 'worldgen',
	description: 'generates map',
	async execute(client, message, MessageEmbed) {
		client.delWorld.run(message.guild.id);
		client.delEnemy.run(message.guild.id);
		var tag = message.guild.id;

		await message.channel.send('\`\`\`Generating World...\`\`\`')

		//Generates right path
		var space = false;
		for(var x = 0; x<= Math.floor(Math.random()*10)+40; x++) {
			block = {worldkey: tag, id: "745708096541950075", x: x, y: 0, ground: "true"}
			client.setBlock.run(block);
			if(!space) {
				switch(Math.floor(Math.random()*3)+1) {
					case 1:
						tunnelGen(x, 0, "up");
						break;
				}
			}
			else {
				space = false;
			}
		}
		for(var x = 0; x >= -Math.floor(Math.random()*10)+40; x--) {
			block = {worldkey: tag, id: "745708096541950075", x: x, y: 0, ground: "true"}
			client.setBlock.run(block);
			if(!space) {
				switch(Math.floor(Math.random()*3)+1) {
					case 1:
						tunnelGen(x, 0, "down");
						break;
				}
			}
			else {
				space = false;
			}
		}
		//Spawn
		for(var x = -2; x <= 2; x++) {
			for(var y = -2; y <= 2; y++) {
				block = {worldkey: tag, id: "745708096541950075", x: x, y: y, ground: "true"}
				client.setBlock.run(block);
			}
		}
		message.channel.send('\`\`\`Terrain Generated! \`\`\`')

		function tunnelGen(x, y, turn) {
			var direction = turn;
			for(var i = 0; i <= 500; i++) {
				switch(Math.floor(Math.random()*10)+1) {
					case 1:		
						turn = "left";
						break;
					case 2:
						turn = "right";
						break;
					case 3: 
						turn = "up";
						break;
					case 4:
						turn = "down";
						break;
				}

				switch(turn) {
					case "left":
						x--;
						break;
					case "right":
						x++;
						break;
					case "up":
						y++;
						break;
					case "down":
						y--;
						break;
				}
				block = {worldkey: message.guild.id, id: "745708096541950075", x: x, y: y, ground: "true"}
				switch(Math.floor(Math.random()*10)+1) {
					case 1:
						block = {worldkey: message.guild.id, id: "745879634746277940", x: x, y: y, ground: "false"}
						break;
					case 2:
						block = {worldkey: message.guild.id, id: "746130824356954142", x: x, y: y, ground: "false"}
						break;
				}

				client.setBlock.run(block);
			}
		}
	}
}

