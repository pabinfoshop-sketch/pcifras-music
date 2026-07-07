export type MockSong = {
  id: string;
  title: string;
  artist: string;
  key: string;
  category: string;
  cifra: string;
};

export const mockSongs: MockSong[] = [
  {
    id: "1",
    title: "Evidências",
    artist: "Chitãozinho & Xororó",
    key: "G",
    category: "Sertanejo",
    cifra: `[Intro] G  D  Em  C

[G]Quando eu digo que [D]deixei de te amar
É por[Em]que eu te amo
Quando eu [C]digo que não quero mais você
É por[G]que eu te quero

[Em]Eu tenho medo de te [C]dar meu coração
E confes[G]sar que eu estou em tuas [D]mãos
Mas não po[Em]sso imaginar o que [C]será de mim
Se eu te [D]perder um [G]dia`,
  },
  {
    id: "2",
    title: "Como Zaqueu",
    artist: "Fernandinho",
    key: "D",
    category: "Gospel",
    cifra: `[Intro] D  A  Bm  G

[D]Como Zaqueu eu quero [A]subir
O mais [Bm]alto que eu puder
Só pra Te [G]ver, olhar pra Ti
E chamar a Tua a[D]tenção`,
  },
  {
    id: "3",
    title: "Garota de Ipanema",
    artist: "Tom Jobim",
    key: "F",
    category: "Bossa Nova",
    cifra: `[Intro] Fmaj7  G7

[Fmaj7]Olha que coisa mais linda
Mais cheia de [G7]graça
É ela menina que vem e que [Gm7]passa
Num doce ba[F#7]lanço a caminho do [Fmaj7]mar`,
  },
  {
    id: "4",
    title: "Nada Pra Mim",
    artist: "Léo Brandão",
    key: "E",
    category: "Gospel",
    cifra: `[E]Se eu tenho tudo e não tenho a [B]Ti
Não tenho [C#m]nada, nada pra [A]mim
[E]Se eu tenho a Ti e não tenho [B]mais
Já tenho [C#m]tudo, tudo demais[A]`,
  },
  {
    id: "5",
    title: "Chove",
    artist: "Anavitória",
    key: "C",
    category: "Pop",
    cifra: `[C]Chove lá fora, chove [G]dentro do peito
[Am]Chove memória, chove [F]nosso jeito
[C]De se querer sem [G]saber por quê
[Am]De se perder pra se [F]encontrar em você`,
  },
  {
    id: "6",
    title: "Sorte Que Cê Tem Sorte",
    artist: "Marília Mendonça",
    key: "A",
    category: "Sertanejo",
    cifra: `[A]Sorte que cê tem sorte
[E]De eu ter esse coração mole
[F#m]De perdoar tudo que cê [D]faz
[A]Sorte que cê tem sorte`,
  },
];

export type MockRepertoire = {
  id: string;
  name: string;
  description: string;
  songIds: string[];
  createdAt: string;
};

export const mockRepertoires: MockRepertoire[] = [
  {
    id: "r1",
    name: "Culto Domingo",
    description: "Repertório para o culto de domingo à noite",
    songIds: ["2", "4"],
    createdAt: "2026-06-15",
  },
  {
    id: "r2",
    name: "Show Acústico",
    description: "Set list para apresentação acústica",
    songIds: ["1", "3", "5"],
    createdAt: "2026-06-20",
  },
  {
    id: "r3",
    name: "Favoritas",
    description: "Minhas músicas preferidas",
    songIds: ["1", "6"],
    createdAt: "2026-07-01",
  },
];
