require("dotenv").config();
const fs = require("fs");
const path = require("path");
const photosDir = path.join(__dirname, "public", "photos");

const WIKIPEDIA_PHOTOS = [
  { id: 9, name: "Ronaldinho", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Ronaldinho_2018.jpg/200px-Ronaldinho_2018.jpg" },
  { id: 10, name: "Zinedine Zidane", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Zinedine_Zidane_by_Tasnim_03.jpg/200px-Zinedine_Zidane_by_Tasnim_03.jpg" },
  { id: 11, name: "Thierry Henry", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Thierry_Henry_2012_%28cropped%29.jpg/200px-Thierry_Henry_2012_%28cropped%29.jpg" },
  { id: 12, name: "Pele", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Pele_Brazil_1970_01.jpg/200px-Pele_Brazil_1970_01.jpg" },
  { id: 13, name: "Diego Maradona", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Maradona-Mundial_86_con_la_copa.JPG/200px-Maradona-Mundial_86_con_la_copa.JPG" },
  { id: 14, name: "Ronaldo Nazario", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Ronaldo_R9_Retired.jpg/200px-Ronaldo_R9_Retired.jpg" },
  { id: 20, name: "Zlatan Ibrahimovic", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Zlatan_Ibrahimovi%C4%87_2019_%28cropped%29.jpg/200px-Zlatan_Ibrahimovi%C4%87_2019_%28cropped%29.jpg" },
  { id: 21, name: "Didier Drogba", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Didier_Drogba_2012_%28cropped%29.jpg/200px-Didier_Drogba_2012_%28cropped%29.jpg" },
  { id: 22, name: "Andres Iniesta", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Andres_iniesta_2018_%28cropped%29.jpg/200px-Andres_iniesta_2018_%28cropped%29.jpg" },
  { id: 23, name: "Xavi Hernandez", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Xavi_2018.jpg/200px-Xavi_2018.jpg" },
  { id: 24, name: "Gianluigi Buffon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Gianluigi_Buffon_2018_%28cropped%29.jpg/200px-Gianluigi_Buffon_2018_%28cropped%29.jpg" },
  { id: 27, name: "Toni Kroos", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Toni_Kroos_2022_%28cropped%29.jpg/200px-Toni_Kroos_2022_%28cropped%29.jpg" },
  { id: 28, name: "Karim Benzema", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Karim_Benzema_2022_%28cropped%29.jpg/200px-Karim_Benzema_2022_%28cropped%29.jpg" },
  { id: 113, name: "Yaya Toure", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Yaya_Tour%C3%A9_2014_%28cropped%29.jpg/200px-Yaya_Tour%C3%A9_2014_%28cropped%29.jpg" },
  { id: 120, name: "Hakim Ziyech", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Hakim_Ziyech_2022_%28cropped%29.jpg/200px-Hakim_Ziyech_2022_%28cropped%29.jpg" },
  { id: 133, name: "Sergio Aguero", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sergio_Ag%C3%BCero_2019_%28cropped%29.jpg/200px-Sergio_Ag%C3%BCero_2019_%28cropped%29.jpg" },
  { id: 136, name: "Ivan Rakitic", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Ivan_Rakiti%C4%87_2018_%28cropped%29.jpg/200px-Ivan_Rakiti%C4%87_2018_%28cropped%29.jpg" },
  { id: 137, name: "Angel Di Maria", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Di_Maria_2022_%28cropped%29.jpg/200px-Di_Maria_2022_%28cropped%29.jpg" },
  { id: 138, name: "Dani Alves", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Dani_Alves_2019_%28cropped%29.jpg/200px-Dani_Alves_2019_%28cropped%29.jpg" },
  { id: 144, name: "Luis Suarez", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Luis_Suarez_2018_%28cropped%29.jpg/200px-Luis_Suarez_2018_%28cropped%29.jpg" },
  { id: 149, name: "Kaka", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Kak%C3%A1_2014_%28cropped%29.jpg/200px-Kak%C3%A1_2014_%28cropped%29.jpg" },
  { id: 25, name: "Samuel Eto o", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Samuel_Eto%27o_2014_%28cropped%29.jpg/200px-Samuel_Eto%27o_2014_%28cropped%29.jpg" },
  { id: 117, name: "Pierre-Emerick Aubameyang", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Pierre-Emerick_Aubameyang_2019_%28cropped%29.jpg/200px-Pierre-Emerick_Aubameyang_2019_%28cropped%29.jpg" },
  { id: 143, name: "Edinson Cavani", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Edinson_Cavani_2018_%28cropped%29.jpg/200px-Edinson_Cavani_2018_%28cropped%29.jpg" },
  { id: 145, name: "Diego Forlan", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Diego_Forl%C3%A1n_2010_%28cropped%29.jpg/200px-Diego_Forl%C3%A1n_2010_%28cropped%29.jpg" },
  { id: 146, name: "Radamel Falcao", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Falcao_2019_%28cropped%29.jpg/200px-Falcao_2019_%28cropped%29.jpg" },
  { id: 147, name: "James Rodriguez", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/James_Rodr%C3%ADguez_2018_%28cropped%29.jpg/200px-James_Rodr%C3%ADguez_2018_%28cropped%29.jpg" }
];

async function download(url, filepath) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) { console.log("Failed:", url, res.status); return false; }
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch(e) { console.log("Error:", e.message); return false; }
}

async function run() {
  let ok = 0;
  for (const p of WIKIPEDIA_PHOTOS) {
    const filepath = path.join(photosDir, "player_" + p.id + ".png");
    const success = await download(p.url, filepath);
    console.log(p.name + ": " + (success ? "OK" : "FAILED"));
    await new Promise(r => setTimeout(r, 300));
  }
  console.log("Done!");
  process.exit(0);
}
run();