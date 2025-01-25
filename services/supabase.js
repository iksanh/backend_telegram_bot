// import supabase client
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKEY = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseURL, supabaseKEY);

const today = new Date().toISOString().split("T")[0];

async function checkConnection() {
  try {
    let { data: user, error } = await supabase.from("user").select("*");

    if (error) {
      console.log("Supabase connection error", error.message);
    } else {
      console.log("Supbase conection success with table ", user);
    }
  } catch (error) {
    console.log("supabase connection error:", error.message);
  }
}

// checkConnection();

async function createUser(telegramId, user) {
  const { data, error } = await supabase
    .from("user")
    .insert([{ telegram_id: telegramId, user: user }])
    .select();

  if (error) {
    console.error("Gagal Registrasi ", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

async function cekStatusUser(telegramId) {
  const { data: user, error } = await supabase
    .from("user")
    .select("telegram_id, user, is_active, created_at ")
    .eq("telegram_id", telegramId)
    .single();

  if (error) {
    console.error("error pemeriksaan status user", error.message);
    return null;
  }

  console.log(`user data`, user);

  return user;
}

const getPetugasByTelegramId = async (telegramId) => {
  let { data: petugas, error } = await supabase
    .from("user")
    .select("id")
    .eq("telegram_id", telegramId);

  if (error) {
    throw new Error("Petugas tidak dapat di akses");
  }

  return petugas;
};

const postLaporanProgress = async (petugasId, jumlahBerkas) => {
  const { data, error } = await supabase
    .from("t_laporan_capaian")
    .insert([{ petugas_id: petugasId, jumlah_berkas: jumlahBerkas }])
    .select();

  if (error) {
    throw new Error("Gagal Pelaporan", error.message);
  }

  return { success: true, data };
};

const editLaporanProgress = async (idLaporan, petugasId, jumlahBerkas) => {
  console.log(idLaporan,petugasId, jumlahBerkas)
  const { data, error } = await supabase
  .from("t_laporan_capaian")
  .update({ jumlah_berkas: jumlahBerkas })
  .eq("id", idLaporan);
    

  if (error) {
    console.error(error)
    throw new Error("Gagal Pelaporan", error);
  }

  return { success: true, data };
};

const cekExistingUserReport = async (petugasId) => {
  const { data, error } = await supabase
    .from("t_laporan_capaian")
    .select("id, jumlah_berkas")
    .eq("petugas_id", petugasId)
    .eq("tanggal_laporan", today);

  if (error) {
    throw new Error("Gagal Pelaporan", error.message);
  }

  return { success: true, data };
};
module.exports = {
  supabase,
  createUser,
  cekStatusUser,
  getPetugasByTelegramId,
  postLaporanProgress,
  cekExistingUserReport,
  editLaporanProgress,
  today,
};
