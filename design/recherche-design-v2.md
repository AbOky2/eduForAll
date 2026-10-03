# ECOLNA v2 — Dossier de recherche design

> Recherche menée le 3 octobre 2026 par six enquêtes parallèles (Dribbble /
> Behance, apps primées pour enfants, artisanat des icônes, illustration
> africaine et représentation, logo et icône d'app, UX de création de profil
> pour les 5–7 ans). 157 sources dédupliquées, listées en fin de document ;
> celles qu'on n'a pas pu ouvrir sont marquées *non vérifié*. Dribbble et
> Behance ont bloqué la lecture automatique (pare-feu WAF) : leurs
> enseignements viennent des études de cas publiées par les studios eux-mêmes
> et des pages d'Apple, pas de captures de « shots ».
>
> Ce dossier nourrit `design/brief-identite-v2.md`, qui tranche. Ici on
> explique **pourquoi**.

## 1. Ce que les six enquêtes disent toutes

1. **Un langage de formes fermé.** Duolingo, Pok Pok, Sago Mini, Khan
   Academy Kids : tout est construit à partir de trois primitives — rectangle
   arrondi, cercle/ellipse, triangle arrondi — sans aucune pointe. C'est cette
   contrainte, plus que le talent individuel, qui fait qu'un ensemble semble
   dessiné par une seule main.
2. **Une seule lumière, trois tons par matière.** Base, ombre (plus chaude et
   plus saturée, jamais plus grise), lumière ; source en haut à gauche ;
   ombre portée en *pilule*, jamais en ovale. Pas de dégradé sur les
   personnages ni les icônes, pas de filtre, pas de flou.
3. **Deux familles d'icônes.** Des *glyphes* d'interface (24 u, trait 2,
   pour le parent et le chrome) et des *pictogrammes enfant* (48 u, pleins,
   trait 4, colorés) pour tout ce qu'un enfant touche ou lit comme du sens.
   Le trait fin dans un carré pastel est la signature du template SaaS — et
   exactement ce que le propriétaire a repéré.
4. **Une icône = un sens.** L'étincelle à quatre branches est devenue en
   2024-2026 le glyphe générique de « fonction IA » ; ECOLNA l'utilise pour six
   sens. Les enfants de 5–7 ans reconnaissent des **objets de leur journée**
   (ardoise, craie, cartable, cailloux, calebasse, soleil), pas des
   conventions d'adulte (engrenage, nuage, flamme, calculatrice).
5. **La peau foncée se modèle par la lumière, pas par l'obscurité.** Rampes
   chaudes par teinte, petits reflets nets (front, pommette, bout du nez),
   « bounce » chaud sur la mâchoire côté ombre. Jamais un seul « brun emoji »,
   jamais d'ombre grise ou bleue, jamais de contour noir.
6. **La diversité par la construction, pas par le recoloriage.** Un même
   visage teinté six fois est le signe le plus clair d'un travail de template
   (critique documentée par les guides USAID/RTI et REACH). Chaque enfant doit
   être reconnaissable **en silhouette noire à 40 px** — par ses cheveux ou sa
   coiffe.
7. **Le Tchad tout entier, sans défaut religieux ni régional.** Environ 58 %
   de musulmans, 35 % de chrétiens, une fracture nord/sud que le projet a déjà
   prise au sérieux en renonçant au nom « Alifa ». Aucun avatar par défaut ne
   porte de marqueur religieux (ni kufi, ni voile, ni croix) ; un foulard noué
   *qui laisse voir la racine des cheveux, les oreilles et le cou* est un
   accessoire de mode, pas un voile. Les indices régionaux sont décorrélés de
   la couleur de peau (un vêtement du nord sur une peau très foncée, une peau
   plus claire avec un indice du sud).
8. **L'avatar est le héros émotionnel du profil.** Grand (120 dp et plus sur
   tablette), choisi activement (rien de présélectionné), porté tout de suite
   sur une « scène » persistante. Une décision par écran pour un enfant de
   cinq ans ; boutons jamais grisés sans explication ; jamais de rouge.
9. **Le logo doit survivre à 29 px.** Trois formes au plus sur le fond, des
   traits ≥ 9 % du canevas, une forme claire sur un fond saturé, rien de
   cuit (ni ombre, ni reflet) : iOS 26/27 ajoute son propre verre, Android son
   ombre. Le livre ouvert actuel perd sa reliure (3,9 % du canevas, 1,1 px à
   29 px) et ressemble à toutes les icônes d'éducation.
10. **Une âme vient d'un geste humain, pas d'une texture.** Un seul élément
    fait main (le trait de craie, modulé de ±10–15 %), le reste géométrique.

## 2. Signes d'un travail « IA / template » à proscrire

- Étincelles et blobs décoratifs ; argile 3D brillante à côté d'icônes plates.
- Lumière et perspective incohérentes ; reflets qui pointent dans des sens
  différents ; tresses non attachées au crâne, qui fusionnent.
- Plus de quatre couleurs par icône ; dégradés partout ; dégradés violets.
- Traits fins à décimales partout ; dix épaisseurs différentes dans une même
  famille (c'est le cas des 113 pictogrammes actuels : 1,1 à 3,4 u).
- Un même visage recolorié ; « peau emoji » ; lèvres rouges, yeux cerclés de
  blanc, sourires géants par défaut (marqueurs de caricature documentés).
- « Kit Afrique » : kente partout, peintures faciales, case + coucher de
  soleil + girafe ; ou à l'inverse le « Corporate Memphis » (bras
  interminables, visages sans traits).
- Copier les « shots » d'inspiration au lieu de les **transposer** : on garde
  la pilule flottante, le décor ton sur ton, les mini-icônes colorées dans les
  puces ; on remplace le lavande par l'ivoire et le sable, le robot 3D par des
  enfants en aplats trois tons, et les motifs botaniques par l'acacia, le
  palmier doum, le mil.

## 3. Décisions et alternatives écartées

| Sujet | Retenu | Écarté (et pourquoi) |
|---|---|---|
| Logo | **L'ardoise à la boucle** : l'ardoise d'écolier de CP (programme officiel, p. 26 : « traçage des boucles vers le haut ») inclinée sur fond or, une boucle de craie qui est aussi le « e » cursif d'ecolna | Livre ouvert (générique) ; « e » à visage (rappelle Internet Explorer/Edge) ; case au soleil (romantise la pauvreté rurale, régionale, proche des armoiries) ; acacia-livre (lu comme champignon ou pupitre sous 60 px) ; éléphanteau-livre gardé comme **finaliste** face au jury et comme piste de mascotte future |
| Fond d'icône | **Or chaud** (le plus singulier parmi WhatsApp, Facebook, YouTube, Telegram, Duolingo sur une maquette d'écran d'accueil) | Bleu pétrole (noyé parmi Facebook, Messenger, Telegram, Epic, Busuu) |
| Icônes | Deux familles optiquement distinctes, 24 u / 48 u, trois modes (mono, duo, couleur), reflet signature | Une seule échelle de 12 à 96 dp |
| Avatars | **12 enfants** (6 filles, 6 garçons), 6 rampes de peau chacune portée par une fille et un garçon, 2 expressions (calme, joie), 2 niveaux de détail | 8 (pas assez pour que chaque enfant d'une classe trouve le sien) ; compagnons animaux (reportés : un compagnon raté coûte plus qu'il ne rapporte) |
| Profil | **Une scène persistante + des étapes** (personnage → prénom → classe → bienvenue) | Un seul formulaire défilant (déborde en paysage, le clavier masque le bouton) |
| Classe | Deux cartes, **grand chiffre 1 / 2**, la même pousse qui grandit, « 1re année / 2e année » pour l'adulte | Étincelle / livre ; liste déroulante ; texte seul |
| Barre d'onglets | **Pilule flottante claire**, pictogrammes 48 u, galet sable actif, libellé gras | Barre sombre (écartée en v1 par cohérence, décision maintenue) |

## 4. Ce qu'il faudra valider au Tchad

Rien de ceci ne remplace un regard tchadien. À soumettre avec
`docs/pedagogical-validation.md` : la distribution des 12 enfants (chacun se
reconnaît-il ? un avatar paraît-il trop régional ou religieux ?), le foulard
noué, les tresses relevées, l'ardoise comme logo (authentique ou démodé pour
des parents urbains ?), et la reconnaissance des pictogrammes sans texte
(cible : 4 enfants sur 5 nomment l'objet).

## 5. Sources

### Dribbble / Behance — studios et illustrateurs

- ['How to Spot AI-Made Graphic Design and Posters' (mikareyes.com)](https://mikareyes.com/ai/how-to-spot-ai-made-graphic-design-and-posters.md) — Tells: no white space, too much text set tiny, mismatched typefaces, clashing art styles ('three different worlds glued into one frame'), details that fall apart under zoom, a generic identity
- ['Why Your AI Keeps Building the Same Purple Gradient Website' (prg.sh)](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website) — Tells: indigo or purple gradients on white, Inter or Roboto, a hero section plus three icon boxes, rounded corners everywhere, shadows at 0.1 opacity
- [AIGA Eye on Design: what the Corporate Memphis think pieces say about illustration](https://eyeondesign.aiga.org/what-the-think-pieces-about-corporate-memphis-tell-us-about-the-state-of-illustration/) — Recognize the style: flat, gangly arms, long legs, small torsos
- [Airbnb 2025 redesign: in-house dimensional icons (It's Nice That) and 'the texture era' (One Thing newsletter)](https://www.itsnicethat.com/articles/airbnb-app-redesign-140525) — Softly rounded pictographs 'like custom emoji', with small hidden details that reward a closer look
- [Alexa Gornago: 'Talking Duo, Vector Mascots for Kids Learning App' (Behance)](https://www.behance.net/gallery/235742943/Talking-Duo-Vector-Mascots-for-Kids-Learning-App) — Deliverables: turnarounds, an emotion sheet, app screens and a custom icon
- [Android Developers: adaptive icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive) — Foreground and background layers are 108x108dp; only the inner 66x66dp is visible; 18dp per side is reserved
- [Apple Design Awards 2025: CapWords (winner, Delight and Fun) and Vocabulary (finalist, Visuals and Graphics)](https://developer.apple.com/design/awards/2025/) — CapWords turns photographed objects into interactive stickers with a fun animation, which suggests the die-cut sticker as a reward object
- [Apple Human Interface Guidelines: Icons, App icons, Tab bars (Liquid Glass updates, 2025-2026)](https://developer.apple.com/design/human-interface-guidelines/icons) — Interface icons use 'streamlined shapes'; app icons may use shading, texture and highlights. These are two different families
- [Baby schema (Kindchenschema) review in PMC, citing Glocker et al. 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC3105163) — Protruding forehead, large head, round face, big eyes, small nose and mouth
- [Bears Gratitude (Apple Design Award 2024, Delight and Fun), Apple Developer article](https://developer.apple.com/news/?id=i74v3f4r) — 'The art drives everything': the UI is designed around the characters, not the other way round
- [Brown and Anthony, 'Toward Comparing the Touchscreen Interaction Patterns of Kids and Adults' (CHI EIST 2012)](https://lisa-anthony.com/wp-content/uploads/2012/03/brown-and-anthony-chi2012eist.pdf) — Children aged 7-11 missed targets 46% of the time, against 32% for adults
- [Duolingo World Characters: 'Building character', the visemes article, and Apple 'Behind the Design: Duolingo'](https://blog.duolingo.com/building-character/) — Derive every character from the mascot's parts (big eyes, a distinct body shape, detached feet) so the cast reads as one family
- [Duolingo blog: 'Shape language: Duolingo's art style' (Megan Barker, 2020; art by Greg Hartman, Kurt Hartfelder, Rachel Suggs, Derek Gieraltowski)](https://blog.duolingo.com/shape-language-duolingos-art-style/) — Use 'the fewest details needed to get the point across'
- [Duolingo blog: How to draw Duo the owl](https://blog.duolingo.com/how-to-draw-duo-the-owl) — Head is a circle, ears are one wavy shape, wings are softened 'shark fins', feet are two pills set at angles for bounce
- [Duolingo blog: the new home screen, the path](https://blog.duolingo.com/new-duolingo-home-screen-design) — 'Pebble-shaped circles in a swirling path'
- [Duolingo design team on Dribbble (AJ Noh: 'Higher levels, more crowns!' and 'XP Ramp Up Challenge'; Jenny Cha: 'Plus Reward Chests')](https://dribbble.com/Duolingo) — Show progress as countable empty slots that fill up, not as percentages
- [Hair Love production (characters by Vashti Harrison; directors Everett Downing Jr. and Bruce W. Smith)](https://creativelivesinprogress.com/articles/the-makings-of-oscar-nominated-short-film-hair-love) — Keep the illustrator's charm while making it animatable, 'keeping it on model'
- [Headspace for Kids (Chris Markland, animation by Moth) and Karen Yoo Jin for Headspace](https://dribbble.com/shots/3905094-Headspace-for-Kids-Calm) — Simple, abstract characters introduced before each session to set the mood
- [Hello Monday: Google Kids Space character system](https://hellomonday.com/work/google-kids-space-illustrations) — A character system 'optimized for customization': 1,000+ features including skin colour, hair styles, clothes and accessories
- [Keiki Learning Games: avatar onboarding (screensdesign)](https://screensdesign.com/apps/keiki-learning-games-for-kids/) — One character per screen, swipe to browse, each with a name, a one-line personality and a 'Choose <Name>' button
- [Khan Academy Design on Dribbble: 'Achieving Mastery' (Elizabeth Lin)](https://dribbble.com/shots/4454109--Achieving-Mastery) — Give each milestone its own celebration art
- [Lingokids 2025 brand identity](https://lingokids.com/blog/posts/lingokids-new-brand-identity-kids-entertainment) — The mascot (Elliot the panda) sits at the heart of the logo: 'bigger, bolder, and more expressive'
- [Material Design: system icon construction](https://m2.material.io/design/iconography/system-icons.html) — 24dp grid, 20dp live area, 2dp padding
- [Microsoft Fluent Emoji (Flat vs Color styles), SVGs inspected](https://github.com/microsoft/fluentui-emoji) — Flat style: 32x32 viewBox, 2-unit padding, about 7 flat paths per face, eyes are a white shape plus a dark pupil
- [Nielsen Norman Group: children's physical development, and kids' cognition](https://www.nngroup.com/articles/children-ux-physical-development/) — Targets of at least 2x2 cm for ages 3-5, which is 4 times the 1x1 cm adult minimum
- [OpenMoji style guide (HfG Schwäbisch Gmünd), with sample SVGs inspected](https://openmoji.org/styleguide) — 72x72 viewBox, 2-unit stroke (about 2.8% of the canvas), round caps and joins
- [Paul Adams, 'The Dribbblisation of Design' (Intercom, 2013)](https://www.intercom.com/blog/the-dribbblisation-of-design/) — Shots leave out 'the problem being solved' and the business and technical constraints
- [Pixar 'Soul', rendering darker skin tones (SIGGRAPH 2021 talk, Laughing Place report)](https://www.laughingplace.com/w/articles/2021/08/12/siggraph-2021-pixar-talks-about-the-technical-side-of-lighting-skin-tones-in-soul/) — Darker skin reflects light, so increase the specular highlights
- [Pok Pok (Apple Design Award 2021, Delight and Fun): Sketch interview and Pok Pok blog](https://sketch.com/blog/pok-pok) — A fixed palette of 11 colours plus white, kept as Color Variables
- [Sago Mini Jinja's Garden (Apple Design Award 2026, Interaction)](https://gori.me/en/apps/ipad-app-news/167337/) — Tell everything through pictures
- [Sago Mini production process (lead illustrator Aaron Leighton), Joan Ganz Cooney Center transcript](https://joanganzcooneycenter.org/2018/01/11/podcast-transcript-the-app-fairy-talks-to-sago-mini/) — Sketch by hand first; production artists redraw clean vectors from the sketch
- [Toca Boca design process (Motionographer)](https://motionographer.com/2016/04/27/the-design-process-behind-toca-bocas-infectious-apps/) — Principles: the kids' perspective, quirkiness, attention to detail, gender-neutral play
- [Tubik Studio: Roebuck educational app illustrations](https://tubikstudio.com/blog/mobile-design-illustrations-educational-app/) — Images that are 'bright, neat, clear, but not over-detailed'
- [Viget: 'Behind the Design: Khan Academy Avatars' (Joseph Le, Minh Tran)](https://www.viget.com/articles/behind-the-design-khan-academy-avatars) — Start with two shades of one colour per avatar, then add 1-2 more for shadows, highlights and details
- [What ranks on Dribbble and Behance for 'kids learning app' (Nixtio, Paperpillar, Neomodeon, Musemind 'Schoolie', NestStrix 'Toki')](https://dribbble.com/search/kids-learning-app) — Borrow layout ideas from concepts, but take construction rules from shipped teams
- [Dick Bruna (Miffy), Books for Keeps obituary](https://booksforkeeps.co.uk/article/obituary-dick-bruna/) *(non vérifié : extrait de recherche seulement)* — Characters face the reader directly
- [Duolingo illustration guidelines (design.duolingo.com: Illustration and Characters)](https://design.duolingo.com/illustration) *(non vérifié : extrait de recherche seulement)* — Only three primitives: rounded rectangle, circle, rounded triangle. Every shape has rounded edges; 'pointy shapes are off-brand'
- [Teach Your Monster to Read (Usborne Foundation; illustrators Chris Garbutt and Rich Wake)](https://www.arenaillustration.com/news/2012/07/illustration-process-teach-your-monster-to-read-by-chris-garbutt/) *(non vérifié : extrait de recherche seulement)* — Make avatar creation the opening game, not a form

### Apps primées pour enfants

- [Apple Design Awards 2021: Pok Pok Playroom (Apple Newsroom)](https://www.apple.com/newsroom/2021/06/apple-announces-winners-of-the-2021-apple-design-awards/) — 'Subtle haptics and spot-on sound effects': pair every tap with a sound and a light vibration.
- [Apple Design Awards 2023 (Apple Newsroom); finalists list from AppleInsider](https://www.apple.com/newsroom/2023/06/apple-announces-winners-of-the-2023-apple-design-awards/) — Duolingo's character and shape system is recognised by an award, not just popular.
- [Apple Design Awards 2026: Sago Mini Jinja's Garden](https://developer.apple.com/design/awards/) — 'Interactions that require no reading' and 'effortless swipe-to-move controls'.
- [Cindy deRosier: 'Drawing myself as a Duolingo character'](https://www.cindyderosier.com/2022/09/drawing-myself-as-duolingo-character.html) — Style checklist: 'rounded geometric shapes, unrealistic proportions, large eyes, teardrop noses, bright colors, minimal details, and disembodied feet'.
- [Duck Duck Moose (Moose Math; the team behind Khan Academy Kids): 7x7 profile](https://www.7x7.com/tech-gadgets/duck-duck-moose-creates-educational-apps-young-children) — 'Kids react to a simple user interface. It's critical that they can directly manipulate the app' (Caroline Hu Flexer).
- [Duolingo ABC: Common Sense Media review](https://www.commonsensemedia.org/app-reviews/duolingo-abc-learn-to-read) — Parents 'must enter their kid's name or nickname', turn on the microphone and may add an email, then hand the device to the child.
- [Duolingo blog: 'Achievement badges' (Jackson Shuttleworth), with 'Streak milestone design' (Kurt Hartfelder)](https://blog.duolingo.com/achievement-badges) — Badges show characters in action ('Duo holding a crown', 'Bea shooting a bow and arrow').
- [Duolingo blog: 'Designing new characters' (Taylor Burgess, internship)](https://blog.duolingo.com/designing-new-characters-internship) — Characters are 'constructed of simple geometric building blocks', combined into 'fun character silhouettes'.
- [Duolingo blog: 'World character visemes' (Jasmine Vahidsafa, Kevin Lenzo)](https://blog.duolingo.com/world-character-visemes/) — '20+ mouths' per character, one per viseme (mouth shape for a sound), each drawn in the character's personality.
- [Endless Alphabet (Originator): App Store listing, with the App Fairy transcript (joanganzcooneycenter.org/?p=18237)](https://apps.apple.com/us/app/endless-alphabet/id591626572) — Letters are 'wacky monsters that speak their sounds as you drag them into place', and a narrator then says the letter's name.
- [Johnson Banks' Duolingo rebrand (Creative Review)](https://www.creativereview.co.uk/duolingo-rebrand-johnson-banks/) — 'The answer was to use their mascot as our inspiration': the letters borrow 'serif-flecked' details from Duo's feathers.
- [Khan Academy Kids: App Store listing, with The 74 feature (the74million.org/zero2eight/learning-and-growing-with-khan-academy-kids)](https://apps.apple.com/us/app/khan-academy-kids/id1378467217) — One guide character per subject: Ollo for 'phonics and letter sounds', Reya for 'storytime and writing', Peck for 'numbers and counting', Sandy for 'puzzles, memory, and problem-solving', and Kodi as host.
- [Lingokids: creative director Guillermo García Carsí (creator of Pocoyo)](https://lingokids.com/press/lingokids-creative-director-pocoyo-creator-guillermo-garcia-carsi) — Characters are 'the hook for the tales' and 'the friends that children need' on their learning journey.
- [NN/g: 'Children's UX: Usability Issues in Designing for Young People'](https://www.nngroup.com/articles/childrens-websites-usability-issues/) — Children reject 'babyish' design: 'This website is for babies... You can tell because of the cartoons and trains.'
- [Pok Pok: Sketch customer story (with Pok Pok blog posts)](https://www.sketch.com/blog/pok-pok/) — The whole app uses only 11 colours (12 with white), managed as shared colour variables.
- [Sago Sago: 'First Contact: Playtesting with Preschoolers' (Jason Krogh)](https://joanganzcooneycenter.org/2013/10/01/first-contact-playtesting-with-preschoolers/) — Note six signals: speedbumps (hesitation), crossed wires (unexpected outcome), roadblocks, questions (asking for help), engagement, and emotion (glassy stare versus focus).
- [Teach Your Monster to Read (Usborne Foundation): Common Sense Media review](https://www.commonsensemedia.org/app-reviews/teach-your-monster-to-read) — 'Start by designing a monster': the child's own creation is the hero.
- [Toca Boca: App Fairy podcast transcript (Caroline Ingeborn, Petter Karlsson)](https://joanganzcooneycenter.org/?p=18640) — 'Few toys have any language on them when you buy them, and so why would a digital toy be different.'
- [Toca Boca: Character Creator (Shorty Awards entry)](https://shortyawards.com/4th-socialgood/character-creator-tool) — No 'default' skin or hair colour: the creator opens on 'a silhouette, not a prefabricated character'.
- [Ubongo (Akili and Me, Ubongo Kids): Elevate Prize profile, with ubongo.org/shows/akili-and-me](https://elevateprize.org/blogs/making-education-fun-and-accessible-to-children-across-africa/) — Characters are 'empowered, smart, adventurous children from across Africa' with a specific home (Akili lives at the foot of Kilimanjaro).
- [onebillion onecourse](https://onebillion.org/apps) — The digital teacher 'appears on screen herself, or as a pointing hand' to demonstrate each activity.
- [Duolingo Illustration Guidelines (design.duolingo.com, Illustration and Characters pages)](https://design.duolingo.com/illustration/characters) *(non vérifié : extrait de recherche seulement)* — Only three building shapes: the rounded rectangle (the most used), the circle and the rounded triangle. Every shape has rounded edges; 'pointy shapes are off-brand'.
- [Kitkit School (Enuma): Global Learning XPRIZE coverage (EdSurge)](https://edsurge.com/news/2019-05-15-the-5-year-15-million-global-learning-xprize-competition-is-over-here-s-who-won) *(non vérifié : extrait de recherche seulement)* — Treat game-design craft and universal design for learning as equal partners when children have no adult help.
- [Toca Boca: skin tones and advisory board (Save the Children Child-Centered Design Guide case study)](https://childrensdesignguide.org/?p=53873) *(non vérifié : extrait de recherche seulement)* — Show skin tones as a mix, not 'going from, say, white to black' (senior play designer Mikhail Novoseltsev).

### Artisanat des icônes

- [Android — Screen pixel densities](https://developer.android.com/training/multiscreen/screendensities) — mdpi = 1x (about 160 dpi), hdpi = 1.5x (about 240 dpi), xhdpi = 2x, xxhdpi = 3x
- [Apple HIG — SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) — 9 weights matched to the system font; 3 scales relative to cap height
- [Apple HIG — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars) — Prefer filled symbols or icons in tab bars
- [Atlassian — Reinventing our iconography system at scale](https://atlassian.design/whats-new/building-atlassians-new-icon-system/) — Stroke chosen to match the stroke of UI text (1.5 px on a 16 px canvas)
- [Central Icon System (The Iconists)](https://iconists.co/central) — 24 grid with 2 px padding, giving a 20×20 live area
- [Font Awesome — Duotone](https://docs.fontawesome.com/web/style/duotone) — Secondary layer at opacity 0.4 by default
- [GitHub Primer — Octicons design guidelines](https://primer.style/foundations/icons/design-guidelines) — Draw a 16 px and a 24 px version of each icon
- [Hugeicons — styles](https://hugeicons.com/styles) — Bulk: two-layer fill, secondary layer at 40% by default
- [Iconoir](https://iconoir.com) — 24 grid with a 1.5 stroke (checked in home.svg). That is fine on retina screens, but on mdpi it gives soft, two-pixel grey lines. Avoid it for low-DPI kids' tablets
- [Lucide — Icon design principles](https://lucide.dev/contribute/icons/design-principles) — 24×24 canvas, at least 1 px padding, 2 px centered strokes, round caps on open paths, round joins
- [Material Components Android — Navigation bar docs](https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md) — Active indicator 56×32 dp with 50% rounding (a pill)
- [Material Design (M1 spec) — System and product icon construction](https://m1.material.io/style/icons.html) — 24 dp grid with a 20×20 live area (2 dp per side); a dense 20 dp variant with a 16 dp live area
- [Material Symbols — variable axes (Google Fonts guide)](https://developers.google.com/fonts/docs/material_symbols) — FILL 0→1: one icon renders both unfilled and filled, intended for interaction states and animation
- [McDougall and Isherwood (2009), What's in a name? (Behavior Research Methods)](https://staffprofiles.bournemouth.ac.uk/display/journal-article/11112) — Semantic distance (how close the picture is to its function) was the best predictor of identification early on, accounting for up to 55% of the variance
- [Microsoft Fluent 2 — Iconography](https://fluent2.microsoft.design/iconography) — Regular theme for wayfinding; Filled theme for selected states or moments that need more weight
- [NN/g — Icon usability](https://www.nngroup.com/articles/icon-usability/) — Only a few icons are nearly universal (home, print, search)
- [OpenMoji — Style guide](https://openmoji.org/styleguide/) — 2 px stroke with round corners and ends; at least 2 px gap between overlapping contours
- [Phosphor Icons (raw SVGs and README)](https://github.com/phosphor-icons/core) — Designed at 16×16 and authored on a 256-unit master grid (16× scale), so coordinates stay integers
- [Streamline Icon System and Flex (studio blog)](https://blog.streamlinehq.com/flex/) — Core and Flex on a 14 px grid, Sharp on 24 px, Plump on 48 px: one construction rule per family
- [Streamline Plump](https://www.streamlinehq.com/icons/plump-free) — 48 px grid with a 3 px line stroke (6.25% of size)
- [Tabler Icons (raw SVG)](https://github.com/tabler/tabler-icons) — 24 grid, stroke-width 2, round caps and joins (checked in home.svg)
- [Wiebe et al. (Graphics Interface 2016), Icons for Kids](https://hci.cs.umanitoba.ca/Publications/details/icons-for-kids-can-young-children-understand-graphical-representations-of-a) — Design candidate icons with children and evaluate them with children
- [Zach Roszczewski — Designing icons (Dribbble Stories)](https://dribbble.com/stories/2015/09/03/designing-icons-zach-roszczewski) — Every line at 2 px
- [Apple legacy HIG — custom tab bar icon metrics](https://developer-rno.apple.com/design/human-interface-guidelines/components/navigation-and-search/tab-bars) *(non vérifié : extrait de recherche seulement)* — Regular tab bar: circle 25 pt, square 23 pt, wide 31 pt wide, tall 28 pt tall. Compact: 18 / 17 / 23 / 20 (snippet only)
- [Icons8 — Make pixel-perfect icons](https://icons8.com/blog/articles/make-pixel-perfect-icons/) *(non vérifié : extrait de recherche seulement)* — Use stroke widths in whole pixels (even numbers are safest)
- [Material 3 — Navigation bar guidelines](https://m3.material.io/components/navigation-bar/guidelines) *(non vérifié : extrait de recherche seulement)* — Filled icon for the selected destination, outlined for unselected ones (snippet)

### Illustration africaine et représentation

- [3D Artist (Substack), 'How to light dark-skinned characters'](https://3dartist.substack.com/p/3d-artist-tip-how-to-light-dark-skinned) — In flat vector, use a single saturated warm bounce crescent along the shadow-side jaw, plus a few small highlight shapes.
- [AWN, 'Weaving Through Fabric: Disney and Kugali's Iwájú'](https://www.awn.com/animationworld/weaving-through-fabric-disney-and-kugalis-iw-j) — Give each avatar one garment motif with a Chadian meaning (the Lake Chad wave from the coat of arms, an acacia leaf, an Ennedi arch) instead of random 'ethnic' geometry.
- [Africa is a Country, 'New cartoon reps urban West Africa' (Bino and Fino, Adamu Waziri)](https://www.africasacountry.com/2010/11/new-cartoon-reps-urban-west-africa) — Mix city and countryside, modern school objects and heritage details.
- [African Storybook](https://www.africanstorybook.org/) — Build reference boards for poses, everyday clothes and settings, preferring books credited to African illustrators.
- [Ahlan Simsim, Sesame Workshop (Wikipedia)](https://en.wikipedia.org/wiki/Ahlan_Simsim) — Draw assistive devices as the child's real-life kit, shown matter-of-factly.
- [Alwihda Info, 'Sister's Design, la startup qui veut concevoir localement les voiles' (lafaye), plus Wikipedia 'Melhfa'](https://www.alwihdainfo.com/tchad-sister-s-design-la-startup-qui-veut-concevoir-localement-les-voiles-a80393/) — The veil is very common among adult women. For 5–7-year-olds, offer it only as an optional variant.
- [Artist guide 'So you might be saying: Lion why a guide on drawing black people?' (mel-lion, via Tumblr reblog)](https://www.tumblr.com/hubedihubbe/170566302685/mel-lion-so-you-might-be-saying-lion-why-a) — Draw the nose as a broad, soft base shape (22–26% of face width) with no bridge line, never a triangle or a dot.
- [CLIP STUDIO TIPS, article 16821 on colouring darker skin](https://tips.clip-studio.com/en-us/articles/16821) — Set a saturation floor of about 50% HSB on deep base, shadow and lip fills to avoid ashy greys.
- [Coat of arms of Chad (Wikipedia)](https://en.wikipedia.org/wiki/Coat_of_arms_of_Chad) — Pair a goat kid with a lion cub to signal national unity without religion or a single region.
- [DPDK's inclusive illustration design system (Adobe XD Ideas)](https://xd.adobe.com/ideas/perspectives/soda-series/dpdks-inclusive-illustration-design-system) — Freeze Ecolna's six skin bases only after eyedropping consented photos of Chadian children in neutral light.
- [Envato Tuts+, 'A quick lesson on using different skin tones in portrait illustration' (vector)](https://design.tutsplus.com/articles/a-quick-lesson-on-using-different-skin-tones-in-portrait-illustration--vector-9075) — Shift highlight hue toward orange/gold by about +7° and keep it peach, never white or lemon.
- [Glocker et al. 2009, 'Baby Schema in Infant Faces Induces Cuteness Perception…' (Ethology 115:257–263)](https://www.cceb.upenn.edu/csa/assets/user-content/documents/BabySchemainInfantFacesInducesCutenessPerceptionandMotivationforCaretakinginAdults.pdf) — Put the eye line 57–60% of head height down from the top of the skull (forehead/face ratio 1.31, rising to 1.52 at +2 SD).
- [Jim Crow Museum (Ferris State University), 'The Picaninny Caricature'](https://jimcrowmuseum.ferris.edu/antiblack/picaninny/picaninny.htm) — Hard limits for the spec: no white rings around irises, no red/pink lips, no huge default grin, no spiky or messy hair, no rags, no nudity, no predator chasing a child.
- [Kirikou and the Sorceress (Wikipedia)](https://en.wikipedia.org/wiki/Kirikou_and_the_Sorceress) — Build scenes from layered flat planes (parallax-ready in RN-SVG) with botanically accurate Sahel plants.
- [Kukua, Super Sema (Inverse feature)](https://nc.inverse.com/entertainment/super-sema) — Show the child's agency through competence (learner and maker), not rescue.
- [Pixar RenderMan, 'Cinematography with Soul' (lighting dark skin)](https://renderman.pixar.com/stories/cinematography-with-soul) — Keep deep bases truly deep. Never lighten a whole face to 'help legibility' (the ¾-stop error).
- [Tchadinfos, 'Le chébé, un rituel de beauté ancestral des femmes tchadiennes' (2025), plus the 2024 report on N'Djamena salons](https://tchadinfos.com/2025/03/24/le-chebe-un-rituel-de-beaute-ancestral-des-femmes-tchadiennes/) — Give one avatar a simplified Gourone-inspired style (two side braids looped into 'horns' plus a fine centre braid) as an unmistakably Chadian signature.
- [Teaching for Change, 'Guide for Selecting Anti-Bias Children's Books' (Derman-Sparks, after the CIBC 1980 checklist)](https://www.teachingforchange.org/guide-for-selecting-anti-bias-childrens-books) — Vary face construction between avatars (brow shape, nose-base width, cheek fullness, ear size), not just colour.
- [Tingatinga painting (Wikipedia), the tradition behind Tinga Tinga Tales](https://en.wikipedia.org/wiki/Tingatinga_(painting)) — Give each companion one decorative pattern zone (chest or ears) in saturated palette colours.
- [USAID/RTI, 'A Guide for Strengthening Gender Equality and Inclusiveness in Teaching and Learning Materials' (Bulat & Lapp, 2015)](https://www.globalbookalliance.org/s/8460-3_DERP_Gender_Guide_V3_102715_r9_FNL-6g53.pdf) — Give every avatar the same head size, framing and pose.
- [Ubongo, Akili and Me (show page and Season 5 redesign coverage on Devdiscourse)](https://www.ubongo.org/shows/akili-and-me/) — Give each avatar an expression set (calm, joy, pride, curiosity) built from brow, lid and mouth swaps on the same head.
- [Wikipedia 'Religion in Chad', 'Chad' and 'Sara people'](https://en.wikipedia.org/wiki/Religion_in_Chad) — Balance northern and southern cues and keep many neutral or urban ones.
- [Wildlife of Chad: Scimitar oryx, Zakouma National Park and Kuri cattle (Wikipedia)](https://en.wikipedia.org/wiki/Scimitar_oryx) — Cap each animal at three identifying features.
- [World Bank / REACH Initiative, 'What Makes a Great Storybook? Recommendations for Storybook Quality' (2018)](https://documents1.worldbank.org/curated/en/981561612849831039/pdf/What-Makes-a-Great-Storybook-Recommendations-for-Storybook-Quality.pdf) — Treat religious dress as an optional, embedded trait, never a default and never a character's whole identity.
- [Pixar, 'Space Rangers with Cornrows' (Lightyear)](https://graphics.pixar.com/library/Cornrows/) *(non vérifié : extrait de recherche seulement)* — Draw the partings (scalp lines) and edge hairs. They make cornrows read more than braid texture does.

### Logo et icône d’app

- [9to5Google: Android 16 auto-themed icons, apps can't opt out (Sept 16, 2025)](https://9to5google.com/2025/09/16/android-16-auto-themed-icons-apps-cant-opt-out/) — Icons without Material You support get auto-tinted
- [Agrandir typeface (Pangram Pangram)](https://pangrampangram.com/products/agrandir) — Accept unaligned, quirky shapes. It 'celebrates humanity, not machines'
- [Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen) — Icon with background: 240x240 dp, content inside a 160 dp circle
- [Apple Developer: Creating your app icon using Icon Composer](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer) — 1024x1024 canvas for iPhone/iPad/Mac (1088 for Watch), from Apple's template
- [Apple Human Interface Guidelines: App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons) — Express the core idea 'with a minimal number of shapes'
- [Apple WWDC25 session 220: Say hello to the new look of app icons](https://developer.apple.com/videos/play/wwdc2025/220/) — Layering: a background plus one or more stacked foreground layers
- [Apple WWDC26 session 8012: Icon Composer for iOS 27](https://developer.apple.com/videos/play/wwdc2026/8012/) — Keep at least part of the foreground white or near-white so the icon keeps contrast in tinted mode
- [Basic Apple Guy: Icon Composer hands-on](https://basicappleguy.com/basicappleblog/icon-composer) — Build and finish the layers in a vector tool. Icon Composer is the final polishing step
- [Busuu app icon (pixel-measured)](https://apps.apple.com/app/id379968583) — One blob-like letterform about 50% of the canvas wide, with a main mass about 15% thick
- [Counter-examples: ABCmouse, Moose Math, Kahoot! Kids, Teach Your Monster, Montessori Preschool, Pok Pok seasonal icon (pixel-checked)](https://apps.apple.com/app/id6460300848) — Full-body characters plus props plus words turn into a grey blob at 29 px
- [ECOLNA official programme encoding, writing progression p. 26](file:///Users/moustapha/Downloads/eduForAll/src/content/curriculum/official-program.ts) — The slate and the upward loop are the first objects and gestures of CP writing in Chad. They are culturally exact and owned by no competitor
- [Epic! app icon (pixel-measured)](https://apps.apple.com/app/id719219382) — Letter stems 29-41/512 (6-8%), only about 2 px at 29 px, which is why it blurs
- [Expo docs: App icons (ios.icon .icon support, adaptive icons)](https://docs.expo.dev/guides/app-icons/) — ios.icon can point to an Icon Composer .icon directory (SDK 54+). Dark mode is then handled inside the .icon
- [Google Play icon design specifications](https://developer.android.com/google-play/resources/icon-design-specifications) — 512x512, 32-bit PNG, sRGB, 1024 KB max, full square
- [Kahoot! app icon (pixel-measured)](https://apps.apple.com/app/id1131203560) — Only 2 colors: purple 74% of the area, white 25%
- [Khan Academy Kids app icon (pixel-measured)](https://apps.apple.com/app/id1378467217) — Eye whites 60x80 of 512 (12x16%), pupils 40x44 (8%), eye centers 158 px apart (31%)
- [Khan Academy logo redesign (blog) and Khan Academy app icon](https://blog.khanacademy.org/?p=73) — Hexagon chosen as a building block of math, nature and art. Leaf kept as the growth metaphor
- [Michael Flarup on app icons (Adobe interview)](https://blog.adobe.com/en/publish/2015/07/23/flarup-app-icon) — App icons are not logos: they work inside a square canvas at fixed sizes from 29x29 to 1024
- [Monotype/Fontsmith: Duolingo 'Feather Bold' custom typeface](https://cms-prod.monotype.com/studio/portfolio/duolingo) — Put one brand form (the owl's wing) into the letterforms instead of setting a neutral font next to the symbol
- [PBS KIDS logo refresh with Lippincott (2022)](https://www.pbs.org/about/about-pbs/blogs/news/pbs-kids-unveils-new-logo) — Bright colors, large bold lettering, clear visuals
- [Toca Boca (logo and name)](https://en.wikipedia.org/wiki/Toca_Boca) — 'Toca la boca' (touch the mouth): the logo is a face with an open mouth, and touching it skipped the intro
- [WWDC Notes: Create icons with Icon Composer (WWDC25 361)](https://wwdcnotes.com/documentation/wwdc25-361-create-icons-with-icon-composer/) — Up to 4 groups (depth levels). Prefix the background layer with 0_
- [Zakouma National Park (Chad) elephants](https://en.wikipedia.org/wiki/Zakouma_National_Park) — Population collapsed to about 400-450 by 2010 and recovered to 636 in 2021, with calves born since 2013. A 'growing up' story that fits learning
- [Johnson Banks Duolingo rebrand (Design Week coverage)](https://www.designweek.co.uk/duolingo-rebrand-avoids-silicon-valley-tropes-and-reflects-companys-quirky-personality/) *(non vérifié : extrait de recherche seulement)* — Redraw the logotype from the symbol's form

### UX de création de profil (5–7 ans)

- [Anthony et al. – Designing Smarter Touch-Based Interfaces for Educational Contexts (Personal & Ubiquitous Computing, 2013)](https://lisa-anthony.com/wp-content/uploads/2013/04/anthony-et-al-jpuc2013.pdf) — Targets tested at 0.125, 0.25, 0.375 and 0.5 inch. Children aged 7–10 missed about 30% of 0.25-inch targets, and about half of 0.125-inch targets were missed on the first try. 'The younger the child, the larger the targets are actually necessary to be'
- [Apple Human Interface Guidelines – Onboarding, Accessibility, Text fields](https://developer.apple.com/design/human-interface-guidelines/onboarding) — Onboarding should be 'fast, fun, and optional'. Teach through interactivity. 'Postpone nonessential setup flows'
- [Apple – App Store Review Guidelines 1.3 Kids Category and 5.1.4 Kids, plus the Kids apps / parental gates page](https://developer.apple.com/app-store/review/guidelines/) — No links out of the app and no purchases unless behind a parental gate; no third-party analytics or ads
- [Debra Levin Gelman – Kids 4–6: The Muddy Middle (A List Apart); interview in UX Magazine](https://alistapart.com/article/kids-4-6-the-muddy-middle/) — '4- and 5-year-olds will leave websites and close apps that they can't immediately figure out'
- [Designing for Children’s Rights Guide (D4CR, with UNICEF)](https://joanganzcooneycenter.org/2022/09/26/the-designing-for-childrens-rights-guide/) — 'Use communication children can understand'
- [Duolingo ABC – onboarding teardown (ScreensDesign)](https://screensdesign.com/apps/learn-to-read-duolingo-abc/) — The parent types the name and enters age as a number, then the child picks from a grid of 15 animal avatars: the steps are split between adult and child
- [Google Play Families Policy](https://support.google.com/googleplay/android-developer/answer/9893335) — Disclose all personal information collected from children, including anything collected through SDKs
- [Google for Developers – Building for kids: Designing engaging apps](https://developers.google.com/building-for-kids/designing-engaging-apps) — 'Avoid text-only buttons to support non-readers'
- [Lisa Anthony – Physical Dimensions of Children’s Touchscreen Interactions: Lessons from five years of the MTAGIC project (IJHCS 2019, preprint)](https://init.cise.ufl.edu/wp-content/uploads/sites/378/2019/03/anthony-et-al-IJHCS2019-MTAGIC-final-preprint.pdf) — On tablets, children miss more often at the top and left of the screen
- [Nielsen Norman Group – Designing for Kids: Cognitive Considerations, and the report UX Design for Children (Ages 3–12), 4th ed.](https://www.nngroup.com/articles/kids-cognition/) — Ages 3–5 need very explicit, visual instructions with audio at the same time
- [React Native 0.85 TextInput and Accessibility docs; Expo keyboard-handling guide; Reanimated useAnimatedKeyboard](https://reactnative.dev/docs/0.85/textinput) — disableFullscreenUI (Android) stops the full-screen text editor in landscape, so the child keeps seeing the avatar while typing
- [Sesame Workshop – Best Practices: Designing Touch Tablet Experiences for Preschoolers (2012)](https://joanganzcooneycenter.org/wp-content/uploads/2020/02/SesameWorkshop-2012.pdf) — 'We assume that younger children will be assisted by an adult during any registration/login process… design logins so that children can recognize their own profile (such as their name and a unique icon)'
- [Soni, Aloba, Morga, Wisniewski, Anthony – TIDRC framework (IDC 2019)](https://init.cise.ufl.edu/wp-content/uploads/sites/775/2019/06/soni-et-al-idc2019-talk.pdf) — I19: give explicit scaffolding such as interaction prompts (only 54% of apps did)
- [Toca Boca – design lessons (Kill Screen)](https://www.killscreen.com/what-designers-can-learn-about-play-children/) — 'A good toy doesn’t need instructions'
- [UK ICO – Age Appropriate Design Code (15 standards)](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/code-standards/) — Transparency: 'concise, prominent and in clear language suited to the age of the child'
- [Woodward et al. – Characterizing How Interface Complexity Affects Children’s Touchscreen Interactions (CHI 2016)](https://init.cise.ufl.edu/wp-content/uploads/sites/378/2017/05/Woodward-et-al-CHI2016_0.pdf) — 'children may benefit from larger and longer feedback when pressing an onscreen key'
- [Khan Academy Kids – Help Center 'How do I add a new user?'](https://khankids.zendesk.com/hc/en-us/articles/360006538192-How-do-I-add-a-new-user) *(non vérifié : extrait de recherche seulement)* — A 'New' button on the opening screen, but adding a child goes through a 'Grown-Ups Only' section
- [Lingokids and Epic! – kid profile help articles](https://help.lingokids.com/hc/en-us/articles/9568131412881-How-to-manage-kid-profile) *(non vérifié : extrait de recherche seulement)* — Lingokids: up to 4 kid profiles, each with avatar, name, birthdate and level
- [Treiman & Broderick (1998) – What’s in a name: children’s knowledge about the letters in their own names](https://sites.wustl.edu/treiman/files/2020/02/Treiman-Broderick-1998-Whats-in-a-name.pdf) *(non vérifié : extrait de recherche seulement)* — Children know the initial letter of their own first name better than other letters (by letter name) and write it better (children aged 4;10–5;8)
- [onebillion onecourse (Global Learning XPRIZE co-winner)](https://onebillion.org/) *(non vérifié : extrait de recherche seulement)* — 'no personal login and no collection of children’s personal data': data kept to the minimum by design