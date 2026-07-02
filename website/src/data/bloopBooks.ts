// The Bloop Book Club library. "Bloop" is the sound Boop makes when it falls
// asleep on a book — hence the club's name.

export type BookPage = { img: string; en: string; pt: string };
export type QuizQ = { q: { en: string; pt: string }; options: { en: string[]; pt: string[] }; answer: number };
export type BloopBook = {
  slug: string;
  emoji: string;
  cover: string;
  title: { en: string; pt: string };
  blurb: { en: string; pt: string };
  pages: BookPage[];
  quiz: QuizQ[];
};

export const bloopBooks: BloopBook[] = [
  {
    slug: "gloss-that-ran-away",
    emoji: "🏃",
    cover: "/bookclub/chase-1.webp",
    title: { en: "Bloop and the Gloss That Ran Away", pt: "O Bloop e o Gloss Que Fugiu" },
    blurb: { en: "The gloss escaped. Again. Bloop has a plan (Bloop does not have a plan).", pt: "O gloss fugiu. Outra vez. O Bloop tem um plano (o Bloop não tem plano nenhum)." },
    pages: [
      { img: "/bookclub/chase-1.webp", en: "One morning, the pH Gloss woke up before Bloop and rolled right out the door. \"Not today!\" squeaked Bloop, and the chase began.", pt: "Uma manhã, o pH Gloss acordou antes do Bloop e rolou porta fora. \"Hoje não!\", chiou o Bloop, e a perseguição começou." },
      { img: "/bookclub/chase-2.webp", en: "The gloss surfed a jelly wave at the beach. Bloop tried to surf too. Bloop is not good at surfing. Bloop is good at falling.", pt: "O gloss surfou uma onda de gelatina na praia. O Bloop também tentou surfar. O Bloop não sabe surfar. O Bloop sabe cair." },
      { img: "/bookclub/chase-3.webp", en: "In the library of tiny books, the gloss hid on the tallest shelf. \"Shhh,\" said the books. \"SQUEAK,\" said Bloop, much too loudly.", pt: "Na biblioteca dos livros pequeninos, o gloss escondeu-se na prateleira mais alta. \"Shhh\", disseram os livros. \"SQUEAK\", disse o Bloop, alto demais." },
      { img: "/bookclub/chase-4.webp", en: "At the candy-cloud park, Bloop stopped to catch its breath. A heart balloon floated by. \"Focus, Boop,\" Bloop told itself. Bloop did not focus.", pt: "No parque das nuvens doces, o Bloop parou para respirar. Um balão-coração passou a voar. \"Concentra-te, Boop\", disse o Bloop a si próprio. O Bloop não se concentrou." },
      { img: "/bookclub/chase-5.webp", en: "The gloss boarded the cloud train. Bloop ran along the platform, little legs blurring, cloud cap flapping like a tiny flag.", pt: "O gloss apanhou o comboio das nuvens. O Bloop correu pela plataforma, perninhas a toda a velocidade, tampa-nuvem a abanar como uma bandeirinha." },
      { img: "/bookclub/chase-6.webp", en: "In the end, the gloss stopped and waited. \"You never give up,\" it said. Bloop smiled its biggest smile: \"Never. You're my favorite shine.\" And they walked home together. (Until tomorrow.)", pt: "No fim, o gloss parou e esperou. \"Tu nunca desistes\", disse. O Bloop sorriu o seu maior sorriso: \"Nunca. És o meu brilho favorito.\" E foram para casa juntos. (Até amanhã.)" },
    ],
    quiz: [
      { q: { en: "Where did the gloss surf?", pt: "Onde é que o gloss surfou?" }, options: { en: ["On a jelly wave", "On a cloud", "On Bloop's cap"], pt: ["Numa onda de gelatina", "Numa nuvem", "Na tampa do Bloop"] }, answer: 0 },
      { q: { en: "What did the books say in the library?", pt: "O que disseram os livros na biblioteca?" }, options: { en: ["Squeak!", "Shhh", "Run, Bloop!"], pt: ["Squeak!", "Shhh", "Corre, Bloop!"] }, answer: 1 },
      { q: { en: "Why does Bloop chase the gloss?", pt: "Porque é que o Bloop persegue o gloss?" }, options: { en: ["It's angry", "It's Bloop's favorite shine", "For exercise"], pt: ["Está zangado", "É o brilho favorito do Bloop", "Para fazer exercício"] }, answer: 1 },
    ],
  },
  {
    slug: "pink-cloud-adventure",
    emoji: "☁️",
    cover: "/bookclub/plush-sleepover.webp",
    title: { en: "Bloop's Pink Cloud Adventure", pt: "A Aventura do Bloop na Nuvem Rosa" },
    blurb: { en: "Cloudie is missing! (Cloudie is asleep somewhere. But WHERE?)", pt: "A Cloudie desapareceu! (A Cloudie está a dormir algures. Mas ONDE?)" },
    pages: [
      { img: "/mascots/group.webp", en: "One evening, Cloudie wasn't home for cloud-cocoa. \"Emergency!\" squeaked Bloop. Jelly wobbled with worry.", pt: "Uma noite, a Cloudie não apareceu para o cacau-de-nuvem. \"Emergência!\", chiou o Bloop. A Jelly abanou de preocupação." },
      { img: "/bookclub/plush-tea-party.webp", en: "They checked the tea table. Only teacups. \"Cloudie loves naps,\" said Jelly. \"We must think like a nap.\"", pt: "Procuraram na mesa do chá. Só chávenas. \"A Cloudie adora sestas\", disse a Jelly. \"Temos de pensar como uma sesta.\"" },
      { img: "/bookclub/chase-4.webp", en: "They searched the candy-cloud park. Bloop checked inside a balloon. Do not ask how. It took a while to get out.", pt: "Procuraram no parque das nuvens doces. O Bloop procurou dentro de um balão. Não perguntem como. Demorou a sair." },
      { img: "/bookclub/plush-movie-night.webp", en: "Behind the little TV, they found popcorn. A clue! Cloudie's snack! \"Warmer,\" whispered Bloop. \"We're getting warmer!\"", pt: "Atrás da televisãozinha encontraram pipocas. Uma pista! O lanche da Cloudie! \"Quente\", sussurrou o Bloop. \"Estamos quase!\"" },
      { img: "/bookclub/plush-sleepover.webp", en: "And there, in the softest sleeping bag, was Cloudie — fast asleep since lunchtime. \"BLOOP,\" went Bloop, falling asleep beside her instantly.", pt: "E ali, no saco-cama mais fofo, estava a Cloudie — a dormir desde a hora de almoço. \"BLOOP\", fez o Bloop, adormecendo logo ao lado dela." },
      { img: "/bookclub/plush-sleepover.webp", en: "Jelly tucked them both in and kept watch, sparkling gently in the dark. Some adventures end exactly where they should: in a pile of friends.", pt: "A Jelly aconchegou os dois e ficou de vigia, a brilhar baixinho no escuro. Há aventuras que acabam mesmo onde deviam: num monte de amigos." },
    ],
    quiz: [
      { q: { en: "What was Cloudie missing for?", pt: "A Cloudie faltou a quê?" }, options: { en: ["Cloud-cocoa", "A race", "School"], pt: ["Ao cacau-de-nuvem", "A uma corrida", "À escola"] }, answer: 0 },
      { q: { en: "What clue did they find?", pt: "Que pista encontraram?" }, options: { en: ["A sock", "Popcorn", "A map"], pt: ["Uma meia", "Pipocas", "Um mapa"] }, answer: 1 },
      { q: { en: "What sound does Bloop make falling asleep?", pt: "Que som faz o Bloop a adormecer?" }, options: { en: ["Bloop", "Beep", "Meow"], pt: ["Bloop", "Beep", "Miau"] }, answer: 0 },
    ],
  },
  {
    slug: "secret-jellyboop-club",
    emoji: "🤫",
    cover: "/bookclub/plush-tea-party.webp",
    title: { en: "Bloop and the Secret JellyBoop Club", pt: "O Bloop e o Clube Secreto JellyBoop" },
    blurb: { en: "A secret club needs three things: a password, snacks, and absolutely no secrets.", pt: "Um clube secreto precisa de três coisas: uma palavra-passe, lanches, e absolutamente zero segredos." },
    pages: [
      { img: "/bookclub/plush-tea-party.webp", en: "Jelly had an idea, which is always slightly dangerous. \"Let's start a SECRET club!\" The password would be — obviously — 'jellyboop'.", pt: "A Jelly teve uma ideia, o que é sempre ligeiramente perigoso. \"Vamos fazer um clube SECRETO!\" A palavra-passe seria — claro — 'jellyboop'." },
      { img: "/mascots/group.webp", en: "Rule one: be kind. Rule two: snacks are mandatory. Rule three: boop before entering. Bloop practiced rule three for an hour.", pt: "Regra um: ser gentil. Regra dois: lanches obrigatórios. Regra três: dar um boop antes de entrar. O Bloop treinou a regra três durante uma hora.", },
      { img: "/bookclub/plush-movie-night.webp", en: "The first club meeting was movie night. Cloudie fell asleep during the opening titles. This surprised no one.", pt: "A primeira reunião do clube foi noite de cinema. A Cloudie adormeceu nos títulos iniciais. Isto não surpreendeu ninguém." },
      { img: "/bookclub/chase-6.webp", en: "But a secret club has a problem: it's TOO good not to share. Bloop told the gloss. The gloss told the mirror. The mirror told everyone.", pt: "Mas um clube secreto tem um problema: é BOM demais para não se partilhar. O Bloop contou ao gloss. O gloss contou ao espelho. O espelho contou a todos." },
      { img: "/bookclub/plush-parade.webp", en: "So they held a parade instead. \"New rule,\" announced Jelly. \"The secret club is now a SHARING club. Password stays, though. It's too fun to say.\"", pt: "Então fizeram um desfile. \"Nova regra\", anunciou a Jelly. \"O clube secreto agora é um clube de PARTILHA. Mas a palavra-passe fica. É divertida demais.\"" },
      { img: "/bookclub/plush-tea-party.webp", en: "And that's how the JellyBoop Club got its one true secret: there was never a secret at all. Just friends, snacks, and one very proud password.", pt: "E foi assim que o Clube JellyBoop ganhou o seu único segredo verdadeiro: nunca houve segredo nenhum. Só amigos, lanches, e uma palavra-passe muito orgulhosa." },
    ],
    quiz: [
      { q: { en: "What was the club password?", pt: "Qual era a palavra-passe do clube?" }, options: { en: ["sparkle", "jellyboop", "gloss"], pt: ["sparkle", "jellyboop", "gloss"] }, answer: 1 },
      { q: { en: "What was rule one?", pt: "Qual era a regra um?" }, options: { en: ["Be kind", "Bring gloss", "No sleeping"], pt: ["Ser gentil", "Trazer gloss", "Não dormir"] }, answer: 0 },
      { q: { en: "What did the secret club become?", pt: "No que se tornou o clube secreto?" }, options: { en: ["A sharing club", "A racing club", "A nap club"], pt: ["Um clube de partilha", "Um clube de corridas", "Um clube de sestas"] }, answer: 0 },
    ],
  },
  {
    slug: "share-the-sparkle",
    emoji: "✨",
    cover: "/bookclub/plush-parade.webp",
    title: { en: "Bloop Learns to Share the Sparkle", pt: "O Bloop Aprende a Partilhar o Brilho" },
    blurb: { en: "Bloop found ALL the sparkle. Bloop kept ALL the sparkle. This went badly.", pt: "O Bloop encontrou TODO o brilho. O Bloop guardou TODO o brilho. Correu mal." },
    pages: [
      { img: "/bookclub/chase-4.webp", en: "One day Bloop found a whole jar of sparkle dust. \"Mine,\" whispered Bloop, hugging it. \"All mine.\"", pt: "Um dia o Bloop encontrou um frasco inteiro de pó de brilho. \"Meu\", sussurrou o Bloop, a abraçá-lo. \"Todo meu.\"" },
      { img: "/mascots/group.webp", en: "Jelly asked for a pinch. \"Hmm,\" said Bloop, and hid the jar under its cloud cap. The cap sparkled suspiciously.", pt: "A Jelly pediu uma pitadinha. \"Hmm\", disse o Bloop, e escondeu o frasco debaixo da tampa-nuvem. A tampa brilhava de forma suspeita." },
      { img: "/bookclub/plush-movie-night.webp", en: "But here's the thing about sparkle: alone, it just sits there. Bloop stared at the jar. The jar stared back. Neither of them had any fun.", pt: "Mas o brilho tem um segredo: sozinho, fica ali parado. O Bloop olhou para o frasco. O frasco olhou de volta. Nenhum dos dois se divertiu." },
      { img: "/bookclub/plush-tea-party.webp", en: "So Bloop poured sparkle into Cloudie's cocoa (she woke up! briefly!) and onto Jelly, who spun like a tiny disco.", pt: "Então o Bloop deitou brilho no cacau da Cloudie (ela acordou! por momentos!) e em cima da Jelly, que girou como uma mini discoteca." },
      { img: "/bookclub/plush-parade.webp", en: "The sparkle spread everywhere and — this is true — there was MORE of it now. Shared sparkle grows. That's just science. Bloop science.", pt: "O brilho espalhou-se por todo o lado e — é verdade — agora havia MAIS. Brilho partilhado cresce. É ciência. Ciência do Bloop." },
      { img: "/bookclub/chase-6.webp", en: "That night the gloss asked, \"Wasn't it hard to share?\" Bloop thought carefully. \"Yes,\" it said. \"For about four seconds. Then it was the best day ever.\"", pt: "Nessa noite o gloss perguntou: \"Custou partilhar?\" O Bloop pensou bem. \"Sim\", disse. \"Durante uns quatro segundos. Depois foi o melhor dia de sempre.\"" },
    ],
    quiz: [
      { q: { en: "Where did Bloop hide the jar?", pt: "Onde escondeu o Bloop o frasco?" }, options: { en: ["Under its cloud cap", "In the fridge", "At the beach"], pt: ["Debaixo da tampa-nuvem", "No frigorífico", "Na praia"] }, answer: 0 },
      { q: { en: "What happens to shared sparkle?", pt: "O que acontece ao brilho partilhado?" }, options: { en: ["It disappears", "It grows", "It melts"], pt: ["Desaparece", "Cresce", "Derrete"] }, answer: 1 },
      { q: { en: "How long was sharing hard for?", pt: "Quanto tempo custou partilhar?" }, options: { en: ["Four seconds", "Four days", "Forever"], pt: ["Quatro segundos", "Quatro dias", "Para sempre"] }, answer: 0 },
    ],
  },
  {
    slug: "honest-reader-challenge",
    emoji: "🕵️",
    cover: "/bookclub/chase-3.webp",
    title: { en: "Bloop and the Honest Reader Challenge", pt: "O Bloop e o Desafio do Leitor Honesto" },
    blurb: { en: "A book about actually reading books. Yes, Bloop is watching. Kindly.", pt: "Um livro sobre ler livros a sério. Sim, o Bloop está a ver. Com carinho." },
    pages: [
      { img: "/bookclub/chase-3.webp", en: "Bloop discovered something amazing in the tiny library: if you actually read a book, a whole world happens inside your head. For free!", pt: "O Bloop descobriu uma coisa incrível na biblioteca pequenina: se leres mesmo um livro, acontece um mundo inteiro dentro da tua cabeça. De graça!" },
      { img: "/bookclub/plush-movie-night.webp", en: "Jelly once pretended to read by staring at the cover really hard. \"Anything?\" asked Bloop. \"Nothing,\" admitted Jelly. \"The cover is not the book.\"", pt: "A Jelly uma vez fingiu ler olhando muito para a capa. \"Alguma coisa?\", perguntou o Bloop. \"Nada\", admitiu a Jelly. \"A capa não é o livro.\"" },
      { img: "/bookclub/plush-sleepover.webp", en: "Cloudie reads one page per nap. It takes her a month per book. \"Slow reading still counts,\" says Bloop. \"ALL reading counts.\"", pt: "A Cloudie lê uma página por sesta. Demora um mês por livro. \"Ler devagar também conta\", diz o Bloop. \"Ler conta SEMPRE.\"" },
      { img: "/bookclub/plush-tea-party.webp", en: "The rules of the Honest Reader are simple: read the pages. Think your thoughts. And if someone asks what happened in the story — you'll actually know!", pt: "As regras do Leitor Honesto são simples: lê as páginas. Pensa os teus pensamentos. E se alguém perguntar o que aconteceu na história — tu vais mesmo saber!" },
      { img: "/bookclub/plush-parade.webp", en: "\"But what if I skip to the quiz?\" asked Jelly. Bloop gasped so hard its cap lifted. \"Then the surprise wouldn't be yours. It would be a stranger's surprise.\"", pt: "\"E se eu saltar para o quiz?\", perguntou a Jelly. O Bloop assustou-se tanto que a tampa levantou. \"Então a surpresa não seria tua. Seria a surpresa de um estranho.\"" },
      { img: "/bookclub/chase-6.webp", en: "So here's Bloop's honest promise: read for real, and every reward will feel real too. (Also Bloop may ask your parents. Bloop knows parents. 😄)", pt: "Fica então a promessa honesta do Bloop: lê a sério, e cada prémio vai saber a verdadeiro. (E o Bloop é capaz de perguntar aos teus pais. O Bloop conhece os pais. 😄)" },
    ],
    quiz: [
      { q: { en: "What is not the book?", pt: "O que é que não é o livro?" }, options: { en: ["The pages", "The cover", "The words"], pt: ["As páginas", "A capa", "As palavras"] }, answer: 1 },
      { q: { en: "How does Cloudie read?", pt: "Como lê a Cloudie?" }, options: { en: ["One page per nap", "Very fast", "Upside down"], pt: ["Uma página por sesta", "Muito depressa", "De pernas para o ar"] }, answer: 0 },
      { q: { en: "What might Bloop do about honesty?", pt: "O que pode o Bloop fazer sobre a honestidade?" }, options: { en: ["Ask your parents 😄", "Call the police", "Nothing"], pt: ["Perguntar aos teus pais 😄", "Chamar a polícia", "Nada"] }, answer: 0 },
    ],
  },
];

export const getBook = (slug: string) => bloopBooks.find((b) => b.slug === slug);
