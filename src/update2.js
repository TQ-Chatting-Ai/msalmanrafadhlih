import path from "path";
import fetch from "node-fetch";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Menentukan __dirname untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("Script update.js dimulai...");

let stars = 0,
  page = 1;

let special;

const fetchStars = async () => {
  try {
    console.log(`Mengambil data bintang dari halaman ${page}...`);
    const response = await fetch(
      `https://api.github.com/users/msalmanrafadhlih/starred?per_page=100&page=${page}`
    );
    console.log(`Status response GitHub: ${response.status}`);

    if (!response.ok) {
      throw new Error(`GitHub API responded dengan status: ${response.status}`);
    }

    const starsData = await response.json();
    console.log(`Ditemukan ${starsData.length} bintang`);
    return starsData;
  } catch (error) {
    console.error(`Error fetching stars data: ${error.message}`);
    return [];
  }
};

const countStars = async () => {
  let starsData = await fetchStars();
  stars += starsData.length;
  page++;
  console.log(`Total bintang saat ini: ${stars}`);

  if (starsData.length === 100) {
    await countStars();
  } else {
    console.log("Selesai menghitung bintang. Memperbarui README...");
    await writeReadMe();
  }
};

const fetchUserData = async () => {
  try {
    console.log("Mengambil data pengguna dari GitHub...");
    const response = await fetch("https://api.github.com/users/msalmanrafadhlih");
    console.log(`Status response GitHub: ${response.status}`);

    if (!response.ok) {
      throw new Error(`GitHub API responded dengan status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching user data: ${error.message}`);
    return null;
  }
};

const writeReadMe = async () => {
  console.log("Menulis README.md...");

  const readMePath = path.join(__dirname, "..", "README.md");
  const date = new Date();
  const [dd, mm] = [date.getDate(), date.getMonth() + 1];

  if (mm === 12) special = ["⛄", "❄", "🎄"];
  else if (mm === 10 && dd === 31) special = ["👻", "🎃", "🍬"];
  else if (mm === 1 && dd === 1) special = ["🎉", "🥳", "🎆"];
  else if (mm === 9 && dd === 29) special = ["🎉", "🎈", "🎊"];
  else special = ["✨", "🚀", "✨"];

  const userData = await fetchUserData();
  if (!userData) {
    console.error("Gagal mengambil data pengguna. README tidak diperbarui.");
    return;
  }

  const text = `# Profil GitHub - msalmanrafadhlih

Selamat datang di profil saya! ${special.join(" ")}

- **Total Bintang GitHub:** ${stars}
- **Terakhir diperbarui:** ${dd}-${mm}-${date.getFullYear()}

Terima kasih telah mengunjungi!`;

  fs.writeFileSync(readMePath, text);
  console.log("README.md berhasil diperbarui!");
};

const getDateSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// Jalankan script utama
(async () => {
  console.log("Memulai perhitungan bintang...");
  await countStars();
  console.log("Script selesai!");
})();

// Tambahkan export {}; untuk mencegah error di ES Module
export {};
