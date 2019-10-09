'use strict';

const moment = require("moment")
const express = require('express');
const line = require('@line/bot-sdk');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

// HTTPSサーバー起動                                                                               
var fs = require('fs');

const config = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.ACCESS_TOKEN
};

const app = express();
app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)')); //ブラウザ確認用(無くても問題ない)
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);

    //ここのif分はdeveloper consoleの"接続確認"用なので削除して問題ないです。
    if (req.body.events[0].replyToken === '00000000000000000000000000000000' && req.body.events[1].replyToken === 'ffffffffffffffffffffffffffffffff') {
        res.send('Hello LINE BOT!(POST)');
        console.log('疎通確認用');
        return;
    }

    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }
    let msg = "対応していません"
    if (event.message.text === "休憩時間を計測したい") {
        msg = "「12:00+45」のように聞いてみてください"
    }

    const pat = /^\d{2}:\d{2}\+\d{2}$/g
    const res = event.message.text.match(pat)
    if (res) {
        const times = res[0].split("+")
        const now = moment(times[0], "HH:mm")
        const interval_time = times[1]
        now.add(interval_time,"m")
        msg = "休憩終了時刻は "+now.format("HH:mm")+"です"
    }

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: msg
    });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);
