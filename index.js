require('dotenv').config();
const { Bot, GrammyError, HttpError } = require('grammy');
const bot = new Bot(process.env.BOT_API_KEY);
const keep_alive = require('./keep_alive.js');

bot.command('start', async (ctx) => {
    await ctx.reply('Привет, это тестовый запуск бота')
})

bot.on('message', async (ctx) => {
    await ctx.reply('Сообщение получено!')
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling an update ${ctx.update_id}:`);


    if (e instanceof GrammyError) {
        console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
        console.error('Could not contact Telegram', e);
    } else {
        console.error('Unknown error', e);
    }
});
bot.start();