module.exports = {
	name: 'sendEmbed',
	description: 'Sends an Embed Message',
	execute(MessageEmbed, m, c, t, d, f) {
		//Sends an Embed message.
		class EMessage {
			constructor(message, color, title, description, footer) {
				this.message = message;
				this.color = color;
				this.title = title;
				this.description = description;
				this.footer = footer;
			}
			static send(save) {
				sendMessage(save.message, save.color, save.title, save.description, save.footer);
			}
		}

		var design = new EMessage(m, c, t, d, f)
		EMessage.send(design);
		return;

		function sendMessage(message, color, title, description, footer) {
			const embedMsg = new MessageEmbed()
			if(title)
				embedMsg.setTitle(title)
			embedMsg.setDescription(description);
			embedMsg.setColor(color);
			if(footer)
				embedMsg.setFooter(footer);
			message.channel.send(embedMsg);

			
		}
	}
}