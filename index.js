const Discord = require("discord.js");
const client = new Discord.Client();
const {Client, MessageEmbed} = require('discord.js');
const SQLite = require("better-sqlite3");
const player = new SQLite('./player.sqlite');
const world = new SQLite('./world.sqlite');
const sendEmbed = require(`./commands/game/sendEmbed.js`);
const {prefix, token} = require('./config.json')
const fs = require('fs');
client.commands = new Discord.Collection();

//Command File Reader. Reads any js files in /commands/ folder.
const commandFile = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFile) {
	const command = require(`./commands/${file}`);
	
	client.commands.set(command.name, command);
}

//Login bot. Token taken from config.
client.login(token);
//When bot is turned on, setup the tables.
client.on("ready", () => {
	console.log("Bot Online");
	
	setupTables();
})

client.on("message", async (message) => {
	//If the message is not from the bot, not in a server, or doesn't have a prefix, then don't respond.
	if (message.author.bot || !message.guild || message.content.indexOf(prefix) !== 0) return;
	
	//Create sendEmbed command.
	client.commands.set(sendEmbed.name, sendEmbed);

	//If the user does not have info linked to that server, create starting data.
	if(!client.getPInfo.get(message.author.id, message.guild.id)) {
		await client.commands.get('sendEmbed').execute(MessageEmbed, message, 0xb7ece0, `Welcome ${message.author.username}`, `It seems like it's your first time using the bot on this server. To start playing, do +play. \n\n**Commands**\n ⬅️⬇️⬆️➡️ Movement \n 🛑 Stop Game \n ⛏️ Mine a Block`, 'Digcord was developed by Farly.');
		var player = {id: message.author.id, x: 0, y: 0, dir: 1, level: 1, exp: 1, gold: 0, world: message.guild.id}
		client.setStats.run(player);
	}

	//Check user input for command.
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
	if(client.commands.get(command)) {
		client.commands.get(command).execute(client, message, MessageEmbed, player, world);
	}
	else {
		//If there is no file named for that command, tell the user it's an invalid command.
		message.channel.send('```Invalid Command.```');
	}
})

function setupTables() {
	//Player Info
	var testPInfo = player.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'players';").get();
	if (!testPInfo['count(*)']) {
		player.prepare("CREATE TABLE players (id INTEGER PRIMARY KEY, x INTEGER, y INTEGER, dir INTEGER, level INTEGER, exp INTEGER, gold INTEGER, world TEXT);").run();
    }
	client.getPInfo = player.prepare("SELECT * FROM players WHERE id = ? AND world = ?");
	client.getPlayer = player.prepare("SELECT * FROM players where id != ? AND x = ? AND y = ? AND world = ?");
	client.setStats = player.prepare("INSERT OR REPLACE INTO players (id, x, y, dir, level, exp, gold, world) VALUES (@id, @x, @y, @dir, @level, @exp, @gold, @world);");

	//Item Info
	var testItems = player.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'items';").get();
	if (!testItems['count(*)']) {
		player.prepare("CREATE TABLE items (id INTEGER, name TEXT, amount INTEGER, gold INTEGER, world TEXT, PRIMARY KEY (id, name, world));").run();
    }
	client.getItem = player.prepare("SELECT * FROM items WHERE id = ? AND name = ? AND world = ?");
	client.giveItem = player.prepare("INSERT OR REPLACE INTO items (id, name, amount, gold, world) VALUES (@id, @name, @amount, @gold, @world);");
	client.removeItem = player.prepare("DELETE FROM items WHERE id = ? AND name = ?");
	client.getItems = player.prepare("SELECT * FROM items WHERE id = ? ORDER BY id ASC LIMIT 1000;");

	//World Info
	var testWorld = world.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'world';").get();
	if (!testWorld['count(*)']) {
		world.prepare("CREATE TABLE world (worldkey TEXT, id TEXT, x INTEGER, y INTEGER, ground TEXT, PRIMARY KEY (worldkey, x, y));").run();
	}
	client.getBlock= world.prepare("SELECT * FROM world WHERE worldkey = ? AND x = ? AND y = ?");
	client.delWorld = world.prepare("DELETE FROM world WHERE worldkey = ?");
	client.setBlock = world.prepare("INSERT OR REPLACE INTO world (worldkey, id, x, y, ground) VALUES (@worldkey, @id, @x, @y, @ground);")
	/*
	var testEnemy = world.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'enemy';").get();
	if (!testEnemy['count(*)']) {
		world.prepare("CREATE TABLE enemy (name TEXT, id TEXT, x INTEGER, y INTEGER, hp INTEGER, atk INTEGER, def INTEGER, xp INTEGER, gold INTEGER, world TEXT);").run();
	}
	client.getEnemy= world.prepare("SELECT * FROM enemy WHERE x = ? AND y = ? AND world = ?");
	client.setEnemy = world.prepare("INSERT OR REPLACE INTO enemy (name, id, x, y, hp, atk, def, xp, gold, world) VALUES (@name, @id, @x, @y, @hp, @atk, @def, @xp, @gold, @world);");
	client.killEnemy = world.prepare("DELETE FROM enemy WHERE x = ? AND y = ? AND world = ?");
	client.delEnemy = world.prepare("DELETE FROM enemy WHERE world = ?");
	client.spawnEnemy = world.prepare("REPLACE INTO enemy (name, id, x, y, hp, atk, def, xp, gold, world) VALUES (@name, @id, @x, @y, @hp, @atk, @def, @xp, @gold, @world);")
	*/
	//Enemies was originally made but dropped.
}