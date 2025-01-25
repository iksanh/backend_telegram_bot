require("dotenv").config();
const moment = require("moment");
const TelegramBot = require("node-telegram-bot-api");
const {
  supabase,
  createUser,
  cekStatusUser,
  getPetugasByTelegramId,
  postLaporanProgress,
  cekExistingUserReport,
  today,
  editLaporanProgress,
} = require("./services/supabase");
const { isNumeric } = require("./utils");

// Replace with your bot token
const TOKEN = process.env.TELEGRAM_TOKEN;

// Create a new bot instance
const bot = new TelegramBot(TOKEN, { polling: true });

function sendMessage(telegramId){
    bot.sendMessage(telegramId, "Pesan dari express js")
}

// Handle '/start' command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Bismillah! Selamat data di Telegram bot! Pelaporan Progress Pekerjaan 🚀"
  );
});

// Handle text messages
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
 
    const [number, ...other] = text.split(" ");
  

  


  const isUserRegistartion = await cekStatusUser(chatId);
  const isActiveUser = isUserRegistartion.is_active;

  if (!isUserRegistartion) {
    bot.sendMessage(chatId, "Anda belum terdaftar sebagai petugas");
  }

  if (!isActiveUser) {
    bot.sendMessage(
      chatId,
      "belum bisa memeasukan laporan, Anda sudah terdaftar tapi belum aktif, silahkan hubungi admin"
    );
  }

  if (text.startsWith("regis")) {
    const parts = text.split(" ");
    const [command, nama] = parts;
    console.log(`command anda ${command} nama ${nama}`);

    const result = await createUser(chatId, nama);

    if (result.success) {
      bot.sendMessage(chatId, `Hi ${nama} registrasi anda berhasil`);
    } else {
      bot.sendMessage(chatId, `Registrasi Gagal`);
    }
  }

  //Cek input laporan by numeric
  if (isNumeric(number) && isActiveUser) {
    const jumlah_laporan = parseInt(number);

    const [{ id: petugas_id }] = await getPetugasByTelegramId(chatId);

    const { success, data } = await cekExistingUserReport(petugas_id);
    const dataExist = data.length > 0;
    console.log(data);

    if (dataExist > 0) {
      const [{ id: id_laporan, jumlah_berkas }] = data
      const result = await editLaporanProgress(
        id_laporan,
        petugas_id,
        jumlah_laporan
      );
      result.success
        ? bot.sendMessage(
            chatId,
            `laporan pengumpulan berkas pada ${today} sudah di perbaharui  dengan jumlah ${jumlah_laporan} sebelumnya ${jumlah_berkas}`
          )
        : bot.sendMessage(chatId, "Gagal memperbaharui laporan");
    } else {
      const result = await postLaporanProgress(petugas_id, jumlah_laporan);

      if (result.success) {
        bot.sendMessage(
          chatId,
          `Pelaporan dengan jumlah berkas ${jumlah_laporan} berhasil disimpan`
        );
      } else {
        bot.sendMessage(chatId, "Gagal input Laporan");
      }
      console.log(isActiveUser);
    }
  }

 

});

// handle status registration

bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const user = await cekStatusUser(chatId);
  const created_at = moment(user.created_at).format("YYYY-MM-DD HH:mm:ss");
  const messageIsActive = user.is_active
    ? "dan telah aktif"
    : "tetapi belum aktif";
  if (user) {
    bot.sendMessage(
      chatId,
      `hi ${user.user} kamu telah terdaftar pada tanggal ${created_at} ${messageIsActive}`
    );
  } else {
    bot.sendMessage(
      chatId,
      `Kamu belum mendaftar silahkan ketik regis nama untuk mendaftar`
    );
  }


});

// Handle '/registration' command
// bot.onText(/\/registration/, (msg) => {
//   const chatId = msg.chat.id;

//   // Send a message with a "Share Contact" button
//   const options = {
//     reply_markup: {
//       keyboard: [
//         [
//           {
//             text: "Share my phone number 📱",
//             request_contact: true, // Request the contact
//           },
//         ],
//       ],
//       one_time_keyboard: true, // Keyboard disappears after one use
//     },
//   };

//   bot.sendMessage(
//     chatId,
//     "Please share your phone number for registration:",
//     options
//   );
// });

// // Handle receiving contact information
// bot.on("contact", (msg) => {
//   const chatId = msg.chat.id;
//   const phoneNumber = msg.contact.phone_number;

//   bot.sendMessage(
//     chatId,
//     `Thank you for sharing your phone number: ${phoneNumber}`
//   );
//   console.log(
//     `Received phone number: ${phoneNumber} from user ID: ${msg.from.id}`
//   );
// });



module.exports =  {sendMessage, bot}

console.log("Bot is running...");
