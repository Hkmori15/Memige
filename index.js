require('dotenv').config();
const keep_alive = require('.keep_alive.js');
const { error } = require('console');
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

// Create a bot and get a token from FatherBot
const bot = new TelegramBot(process.env.BOT_API_KEY, { polling: true });

// You need to find out your ID and write it here
const adminChatId = '1019809138';


// Indentifier telegram channel
const channelId = '@unnecessary_thought';


// Handle the /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Отправьте любую информацию (мемы, новости, голосовые) все это будет передано администратору и возможно отправлено на канал');
});

// Handler for income messages
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Ignoring command /start
    if (msg.text && /\/start/i.test(msg.text)) {
        return;
    }

    // Ignoring messages from admin
    if (userId === parseInt(adminChatId)) {
        return;
    }


    // Send the user confirmation of receipt of information
    bot.sendMessage(chatId, 'Информация принята. Ссылка на канал: https://t.me/unnecessary_thought', {
    });
    // Forward information to the admin
    bot.forwardMessage(adminChatId, chatId, msg.message_id);
});

// Command /send for forward information (only admin)
bot.onText(/\/send/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if the user is admin
    if (chatId === parseInt(adminChatId)) {
        // Receive identifier message which need forward
        const messageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (messageId) {
            // Forward message to telegram channel
            bot.forwardMessage(channelId, chatId, messageId)
                .then(() => {
                    bot.sendMessage(chatId, 'Информация успешно отправлена на канал');
                })

                .catch((error) => {
                    console.error('Ошибка при отправке сообщения на канал:', error);
                    bot.sendMessage(chatId, 'Произошла ошибка при отправке на канал (проверь логи)');
                });
        } else {
            bot.sendMessage(chatId, 'Пожалуйста, ответь на сообщение которое нужно переслать в канал');
        }
    } else {
        bot.sendMessage(chatId, 'Вы не администратор и не можете использовать эту команду');
    }
});

// Function for send message to channel but automatic
const sendMessageToChannel = (messageId) => {
    bot.forwardMessage(channelId, adminChatId, messageId)
        .then(() => {
            console.log('Информация успешно отправлена на канал');
        })

        .catch((error) => {
            console.error('Ошибка при отправке сообщения на канал:', error);
        });
};
// Object for schedule message
const scheduledMessages = {};

// Hanlder for schedule message (only admin)
bot.onText(/\/schedule/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Check if the user is admin
    if (userId === parseInt(adminChatId)) {
        const messageId = msg.reply_to_message ? msg.reply_to_message.message_id : null;

        if (messageId) {
            bot.sendMessage(chatId, 'Введите время в формате "10:00" для отправки сообщения на канал');
            bot.once('message', (timeMsg) => {
                const scheduledTime = timeMsg.text;
                const cronExpression = `0 ${scheduledTime.split(':')[1]} ${scheduledTime.split(':')[0]} * * *`;


                const job = cron.schedule(cronExpression, () => {
                    sendMessageToChannel(messageId);
                    const messageSchedules = scheduledMessages[messageId];
                    if (messageSchedules) {
                        const index = messageSchedules.indexOf(job);
                        if (index !== -1) {
                            messageSchedules.splice(index, 1);
                        }
                    }
                });

                if (!scheduledMessages[messageId]) {
                    scheduledMessages[messageId] = [];
                }

                scheduledMessages[messageId].push(job);

                bot.sendMessage(chatId, `Сообщение запланировано на отправку в ${scheduledTime}`);
            });
        } else {
            bot.sendMessage(chatId, 'Пожалуйста, ответьте на сообщение, которое нужно отправить на канал');
        }
    } else {
        bot.sendMessage(chatId, 'Вы не администратор и не можете использовать эту команду');
    }
});