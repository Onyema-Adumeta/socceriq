require("dotenv").config();
const fs = require("fs");
const path = require("path");
const photosDir = path.join(__dirname, "public", "photos");

const PLAYER_API_IDS = [
  { id: 1, name: "Lionel Messi", apiId: 154 },
  { id: 2, name: "Cristiano Ronaldo", apiId: 874 },
  { id: 3, name: "Kylian Mbappe", apiId: 278 },
  { id: 4, name: "Erling Haaland", apiId: 1100 },
  { id: 5, name: "Neymar Jr", apiId: 276 },
  { id: 6, name: "Luka Modric", apiId: 184 },
  { id: 7, name: "Virgil van Dijk", apiId: 306 },
  { id: 8, name: "Kevin De Bruyne", apiId: 627 },
  { id: 9, name: "Ronaldinho", apiId: 49 },
  { id: 10, name: "Zinedine Zidane", apiId: 921 },
  { id: 11, name: "Thierry Henry", apiId: 1160 },
  { id: 12, name: "Pele", apiId: 154 },
  { id: 13, name: "Diego Maradona", apiId: 154 },
  { id: 14, name: "Ronaldo Nazario", apiId: 48 },
  { id: 15, name: "Mohamed Salah", apiId: 306 },
  { id: 16, name: "Jude Bellingham", apiId: 19229 },
  { id: 17, name: "Vinicius Junior", apiId: 39843 },
  { id: 18, name: "Robert Lewandowski", apiId: 521 },
  { id: 19, name: "Sadio Mane", apiId: 1082 },
  { id: 20, name: "Zlatan Ibrahimovic", apiId: 1485 },
  { id: 21, name: "Didier Drogba", apiId: 1477 },
  { id: 22, name: "Andres Iniesta", apiId: 186 },
  { id: 23, name: "Xavi Hernandez", apiId: 185 },
  { id: 24, name: "Gianluigi Buffon", apiId: 523 },
  { id: 25, name: "Samuel Eto o", apiId: 1471 },
  { id: 26, name: "Harry Kane", apiId: 184 },
  { id: 27, name: "Toni Kroos", apiId: 183 },
  { id: 28, name: "Karim Benzema", apiId: 169 },
  { id: 29, name: "Pedri", apiId: 158956 },
  { id: 30, name: "Marcus Rashford", apiId: 7907 },
  { id: 31, name: "Bukayo Saka", apiId: 19252 },
  { id: 32, name: "Jamal Musiala", apiId: 284068 },
  { id: 33, name: "Florian Wirtz", apiId: 284285 },
  { id: 34, name: "Lamine Yamal", apiId: 903207 },
  { id: 35, name: "Phil Foden", apiId: 3725 },
  { id: 36, name: "Rodri", apiId: 2931 },
  { id: 37, name: "Son Heung-min", apiId: 2295 },
  { id: 38, name: "Raheem Sterling", apiId: 561 },
  { id: 39, name: "Achraf Hakimi", apiId: 57435 },
  { id: 41, name: "Neymar PSG", apiId: 276 },
  { id: 42, name: "Marco Verratti", apiId: 521 },
  { id: 43, name: "Paulo Dybala", apiId: 521 },
  { id: 44, name: "Lorenzo Insigne", apiId: 521 },
  { id: 45, name: "Xherdan Shaqiri", apiId: 627 },
  { id: 46, name: "Giorgio Chiellini", apiId: 521 },
  { id: 47, name: "Romelu Lukaku", apiId: 727 },
  { id: 48, name: "Riyad Mahrez", apiId: 745 },
  { id: 49, name: "Victor Osimhen", apiId: 57490 },
  { id: 50, name: "Wilfried Zaha", apiId: 666 },
  { id: 52, name: "Declan Rice", apiId: 3316 },
  { id: 53, name: "Martin Odegaard", apiId: 1485 },
  { id: 54, name: "Gabriel Martinelli", apiId: 199665 },
  { id: 55, name: "Ollie Watkins", apiId: 19366 },
  { id: 56, name: "Cole Palmer", apiId: 152982 },
  { id: 57, name: "Enzo Fernandez", apiId: 154562 },
  { id: 58, name: "Alexander-Arnold", apiId: 19197 },
  { id: 59, name: "Darwin Nunez", apiId: 57497 },
  { id: 60, name: "Anthony Gordon", apiId: 284068 },
  { id: 61, name: "Alexander Isak", apiId: 2864 },
  { id: 62, name: "Dominic Solanke", apiId: 19228 },
  { id: 63, name: "James Maddison", apiId: 19245 },
  { id: 64, name: "Richarlison", apiId: 1485 },
  { id: 65, name: "Joao Pedro", apiId: 57435 },
  { id: 66, name: "Nicolas Jackson", apiId: 152982 },
  { id: 67, name: "Leandro Trossard", apiId: 19366 },
  { id: 68, name: "Gabriel Jesus", apiId: 200104 },
  { id: 69, name: "Casemiro", apiId: 2931 },
  { id: 70, name: "Rodrigo Bentancur", apiId: 521 },
  { id: 71, name: "Federico Valverde", apiId: 169 },
  { id: 72, name: "Aurelien Tchouameni", apiId: 169 },
  { id: 73, name: "Eduardo Camavinga", apiId: 169 },
  { id: 74, name: "Dani Carvajal", apiId: 169 },
  { id: 75, name: "Antonio Rudiger", apiId: 169 },
  { id: 76, name: "Frenkie de Jong", apiId: 184 },
  { id: 77, name: "Gavi", apiId: 177003 },
  { id: 78, name: "Raphinha", apiId: 57435 },
  { id: 79, name: "Ferran Torres", apiId: 184 },
  { id: 80, name: "Jules Kounde", apiId: 184 },
  { id: 81, name: "Antoine Griezmann", apiId: 1489 },
  { id: 82, name: "Jan Oblak", apiId: 1489 },
  { id: 83, name: "Alvaro Morata", apiId: 521 },
  { id: 85, name: "Vitinha", apiId: 278 },
  { id: 86, name: "Ousmane Dembele", apiId: 278 },
  { id: 87, name: "Bradley Barcola", apiId: 278 },
  { id: 88, name: "Warren Zaire-Emery", apiId: 278 },
  { id: 89, name: "David Alaba", apiId: 169 },
  { id: 90, name: "Lautaro Martinez", apiId: 1100 },
  { id: 91, name: "Nicolo Barella", apiId: 521 },
  { id: 92, name: "Khvicha Kvaratskhelia", apiId: 521 },
  { id: 93, name: "Tijjani Reijnders", apiId: 47066 },
  { id: 94, name: "Ruben Dias", apiId: 627 },
  { id: 95, name: "Bernardo Silva", apiId: 627 },
  { id: 96, name: "Granit Xhaka", apiId: 278 },
  { id: 97, name: "Serhou Guirassy", apiId: 1100 },
  { id: 98, name: "Gregor Kobel", apiId: 1100 },
  { id: 99, name: "Jadon Sancho", apiId: 627 },
  { id: 100, name: "Joao Felix", apiId: 627 },
  { id: 101, name: "Naby Keita", apiId: 306 },
  { id: 103, name: "Andre Onana", apiId: 306 },
  { id: 104, name: "Thomas Partey", apiId: 306 },
  { id: 105, name: "Edouard Mendy", apiId: 306 },
  { id: 113, name: "Yaya Toure", apiId: 1477 },
  { id: 116, name: "Riyad Mahrez", apiId: 745 },
  { id: 117, name: "Pierre-Emerick Aubameyang", apiId: 1471 },
  { id: 120, name: "Hakim Ziyech", apiId: 745 },
  { id: 133, name: "Sergio Aguero", apiId: 627 },
  { id: 134, name: "Alexis Sanchez", apiId: 521 },
  { id: 135, name: "Arturo Vidal", apiId: 184 },
  { id: 136, name: "Ivan Rakitic", apiId: 184 },
  { id: 137, name: "Angel Di Maria", apiId: 154 },
  { id: 138, name: "Dani Alves", apiId: 184 },
  { id: 139, name: "Marcelo", apiId: 169 },
  { id: 140, name: "Thiago Silva", apiId: 278 },
  { id: 143, name: "Edinson Cavani", apiId: 278 },
  { id: 144, name: "Luis Suarez", apiId: 184 },
  { id: 145, name: "Diego Forlan", apiId: 169 },
  { id: 146, name: "Radamel Falcao", apiId: 169 },
  { id: 147, name: "James Rodriguez", apiId: 169 },
  { id: 149, name: "Kaka", apiId: 154 },
  { id: 150, name: "Hulk", apiId: 154 }
];

async function download(url, filepath) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return false;
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch(e) { return false; }
}

async function run() {
  let downloaded = 0;
  let skipped = 0;
  for (const p of PLAYER_API_IDS) {
    const filepath = path.join(photosDir, "player_" + p.id + ".png");
    const url = "https://media.api-sports.io/football/players/" + p.apiId + ".png";
    const ok = await download(url, filepath);
    if (ok) { downloaded++; process.stdout.write("\rDownloaded: " + downloaded); }
    else skipped++;
    await new Promise(r => setTimeout(r, 150));
  }
  console.log("\nDone! Downloaded: " + downloaded + " Skipped: " + skipped);
  process.exit(0);
}
run();