const mine = require(`./game/mine.js`);
const inv = require(`./game/inventory.js`);
const worldgen = require(`./game/worldgen.js`);

const activeGame = new Set();

module.exports = {
	name: 'play',
	description: 'shows the map',
	async execute(client, message, MessageEmbed, player) {
		//Create class to run game linked to user's message info.
		class Game {
			constructor(message) {
				this.message = message;
			}
			static play(save) {
				run(save.message);
			}
		}

		//Create commands for world generation, mining, and inventory.
		client.commands.set(worldgen.name, worldgen);
		client.commands.set(mine.name, mine);
		client.commands.set(inv.name, inv);

		//If the player is not running a game, start the game.
		if(!activeGame.has(message.author.id)) {
			const g = new Game(message);
			Game.play(g);
		}
		//If they are running a game, don't start the game.
		else {
			message.channel.send('\`\`\`You already have an active game.\`\`\`')
		}

		//Game Function
		async function run(message) {
			//
			var active = true;

			activeGame.add(message.author.id);

			//If there is not a valid block at the center of the world, generate the world.
			if(!client.getBlock.get(message.guild.id, 0, 0)) {
				client.commands.get('worldgen').execute(client, message, MessageEmbed);
			}

			//Setup Emoji Assets
			const pTop = client.emojis.cache.get("745873592960548865");
			const pRight = client.emojis.cache.get("745873461376712805");
			const pBottom = client.emojis.cache.get("745873507287564330");
			const pLeft = client.emojis.cache.get("745873548920225803");
			const stoneBlock = client.emojis.cache.get("745708096898334720");

			const aTop = client.emojis.cache.get("745888432064299008");
			const aRight = client.emojis.cache.get("745888381506158642");
			const aBottom = client.emojis.cache.get("745888334555119716");
			const aLeft = client.emojis.cache.get("745888273301373021");

			const iconOne = client.emojis.cache.find(ident => ident.name === "tleft"); 
			const iconTwo = client.emojis.cache.find(ident => ident.name === "tright");
			const iconThree = client.emojis.cache.find(ident => ident.name === "bleft");
			const iconFour = client.emojis.cache.find(ident => ident.name === "bright"); 

			//Filter to only respond to specific emojis and player.
			const filter = (reaction, user) => {
				return ['⬅️', '➡️', '⬇️', '⬆️', '🛑', '⛏️', '🧳'].includes(reaction.emoji.name) && user.id === message.author.id;
			};

			//Create starting logo for game.
			var embedMsg = `${iconOne}${iconTwo}\n${iconThree}${iconFour}`
			
			//Send game message, basically the window.
			message.channel.send(embedMsg).then(async gameEdit => {
			//Send console, shows players info about what they mine, their coordinates, nearby players.
			message.channel.send(`\`\`\`Loading Game...\`\`\``).then(async consoleEdit => {
				//Grab player stats.
				var stats = client.getPInfo.get(message.author.id, message.guild.id);
				//React the controls for players to click on.
				await gameEdit.react('⬅️').then(() => gameEdit.react('⬇️')).then(() => gameEdit.react('⬆️')).then(() => gameEdit.react('➡️')).then(() => gameEdit.react('🛑')).then(() => gameEdit.react('⛏️')).then(() => gameEdit.react('🧳'));
				//Create an empty description.
				var description = ' ';
				//Show coordinates at start of game.
				var consoleDesc = `\`\`\`X: ${stats.x} | Y: ${stats.y}\`\`\``
				await mapUpdate();
				await update();

				//Update the game according to user input.
				async function update() {
					if(active) {
						description = ' ';
						consoleEdit.edit(consoleDesc);
						consoleDesc = `\`\`\`X: ${stats.x} | Y: ${stats.y}\`\`\``
						stats = client.getPInfo.get(message.author.id, message.guild.id);
						gameEdit.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
						.then(async collected => {
							const reaction = collected.first();
							reaction.users.remove(message.author.id);
							switch(reaction.emoji.name) {
								case '⬅️':
									move(stats, stats.x-1, stats.y, 4);
									break;
								case '➡️':
									move(stats, stats.x+1, stats.y, 2);
									break;
								case '⬇️':
									move(stats, stats.x, stats.y-1, 3);
									break;
								case '⬆️':
									move(stats, stats.x, stats.y+1, 1)
									break;
								case '🛑':
									activeGame.delete(message.author.id);
									active = false;
									break;
								case '⛏️':
									consoleDesc += await client.commands.get('mine').execute(client, message, MessageEmbed);
									break;
								case '🧳':
									client.commands.get('inventory').execute(client, message, MessageEmbed, player);
									break;

							}

						await mapUpdate();
						await update();
						turns--;
					}).catch(err => {
						//If the player does not respond in time, shut down the game.
						activeGame.delete(message.author.id);
						gameEdit.edit(`${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n`);
						consoleEdit.edit('``` Game Closed ```')
					})
					}
				}

				//Move according to user input.
				async function move(stats, x, y, dir) {
					if(client.getBlock.get(message.guild.id, x, y)) {
						if(client.getBlock.get(message.guild.id, x, y).ground == "true") {
							stats.x = x;
							stats.y = y;
						}
					}
					stats.dir = dir;
					client.setStats.run(stats);
				}

				//Update the map after user input.
				async function mapUpdate() {
					var block;
					if(active) {
						for(var y = stats.y+2; y >= stats.y-2; y--) {
							for(var x = stats.x-2; x <= stats.x+2; x++) {
								//The player is at the center of the screen.
								if(y == stats.y & x == stats.x) {
									switch(stats.dir) {
										case 1:
											block = pTop; 
											break
										case 2:
											block = pRight;
											break;
										case 3:
											block = pBottom; 
											break;
										case 4:
											block = pLeft; 
											break;
									}
								}
								//If there is an ally that isn't the player, set the block to that person.
								else if(client.getPlayer.get(message.author.id, x, y, message.guild.id)) {
									var ally = client.getPlayer.get(message.author.id, x, y, message.guild.id);
									if(ally.y == stats.y & ally.x == stats.x) {
										consoleDesc += `\`\`\`[stats] ${client.users.cache.find(user => user.id == ally.id).username} [Level: ${ally.level}]\`\`\`\n`;
									}
									if(y == ally.y & x == ally.x) {
										switch(ally.dir) {
											case 1:
												block = aTop;
												break
											case 2:
												block = aRight;
												break;
											case 3:
												block = aLeft;
												break;
											case 4:
												block = aBottom;
												break;
										}
									}
								}
								//If there is no block, it is a stone.
								else if(!client.getBlock.get(message.guild.id, x, y))
										block = stoneBlock;
								//If the block is not a player or stone, check the block id.
								else 
									block = client.emojis.cache.get(client.getBlock.get(message.guild.id, x, y).id);

								description += `${block}`
							}
							description += `\n`;
						}
						consoleEdit.edit(consoleDesc);
						gameEdit.edit(description);
					}
					else {
						//Close the game.
						block = client.emojis.cache.find(ident => ident.name === "b_");
						gameEdit.edit(`${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n${block}${block}${block}${block}${block}\n`);
						consoleEdit.edit('``` Game Closed ```')
					}
				}
				})
			})
		}
	}
}
