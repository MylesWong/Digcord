module.exports = {
	name: 'giveItem',
	description: 'gives an item',
	async execute(client, message, MessageEmbed, itemName, itemAmount, itemSell) {
		//Gives an item.
		var item = client.getItem.get(message.author.id, itemName, message.guild.id)
		if(!item) {
			i = {id: message.author.id, name: itemName, amount: itemAmount, gold: itemSell, world: message.guild.id}
			client.giveItem.run(i);
		}
		else {
			item.amount += itemAmount;
			client.giveItem.run(item);
		}
	}
}