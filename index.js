const express = require('express')
const cors = require('cors')
const { sendMessage, bot } = require('./bot')
const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

const data = {
    "id": 2,
    "telegram_id": 525623592,
    "created_at": "2025-01-11T00:00:55.907938+00:00",
    "user": "iksan",
    "phone_number": "255",
    "is_active": true
}

app.get('/',  (req, res) => {

    sendMessage(data["telegram_id"])
    res.send('Hello World')
})

app.post('/activate-user', async (req, res)=> {
    const {telegram_id, created_at, user, is_active} = req.body;

    if(!telegram_id){
        return res.status(400).send({error: "chat id tidak ada, tidak dapat mengirimkan pesan"})

    }

    const message = `HI ${user}, user anda ${is_active ? 'diaktifkan':'dinonaktifkan'}`

    try {
        await bot.sendMessage(telegram_id, message)
        res.status(200).send({success:true, message: "Success mengirim pesan"})
    } catch (error) {
        console.error("Error mengirim pesan", error)
        res.status(500).send({success: false, message:"Failed to send message"})
    }
})

app.listen(port, ()=>{
    console.log(`Example app listening on port ${port}`)
})