#!/usr/bin/env bash
# Tournage des captures BRUTES des stores, depuis le vrai code de l'app.
#
# Ce script ne dessine rien. Il pilote le banc de rendu web
# (scripts/web-preview/capture.cjs, docs/visual-qa.md) : l'app réelle tourne
# dans Chromium via react-native-web, avec sa vraie base SQLite et le profil de
# démonstration « Amina » (CP1, 12 leçons terminées ; ses 7 badges sont
# calculés par les règles de l'app), et chaque plan de
# store/screenshots/plan.json est photographié aux résolutions exactes des
# appareils :
#
#   iphone   iPhone 6,9"            440 × 956  ×3 → 1320 × 2868 → raw/<id>.png
#   ipad     iPad 13" paysage      1376 × 1032 ×2 → 2752 × 2064 → raw/<id>@tablette.png
#   android  tablette Android 10"  1280 × 800  ×2 → 2560 × 1600 → raw/<id>@tablette-android.png
#            (plans « play » de plan.json seulement)
#
# La capture iPhone sert aux fiches iPhone et Play téléphone, la capture iPad
# à la fiche iPad, la capture Android à la fiche Play tablette
# (scripts/tools/compose-store-screenshots.mjs).
#
# ⚠️ Rendu web ≠ app installée. Avant de soumettre, comparer chaque capture à
# l'app installée par TestFlight / test interne Play ; si un écran diffère
# (police, ombre, zone sûre, illustration), le remplacer par une capture
# d'appareil (store/screenshots/README.md, « La règle d'abord »).
#
# PRÉREQUIS — le serveur de prévisualisation web doit déjà tourner :
#
#   npm i --no-save react-native-web@~0.21.0 @expo/metro-runtime@~56.0.21   # une fois
#   ECOLNA_WEB_PREVIEW=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --port 8081
#
# et Playwright doit être joignable (hors du dépôt, aucune dépendance ajoutée) :
#   PLAYWRIGHT_MODULE=<chemin du paquet playwright>   (défaut : require('playwright'))
#   CHROME_PATH=<exécutable Chromium>                  (défaut : celui de Playwright)
#
# USAGE
#   scripts/tools/capture-store-screenshots.sh [options]
#
#   --only <regex>      ne tourner que les plans dont l'id correspond
#                       (ex. --only '01-accueil|07-reussite')
#   --appareil <a>      iphone | ipad | android | tous (défaut : tous) ;
#                       plusieurs : --appareil iphone,android
#   --sortie <dossier>  où écrire les PNG (défaut : store/screenshots/raw) ;
#                       utile pour un essai sans toucher à la série livrée
#   --composer          enchaîner sur compose-store-screenshots.mjs
#                       (uniquement si la sortie est store/screenshots/raw)
#   --liste             afficher les plans et leurs réglages, sans rien tourner
#   -h, --help          cette aide
#
# Variables : PREVIEW_URL (défaut http://localhost:8081), CAPTURE_TIMEOUT
# (secondes par capture, défaut 300).
#
# Sortie : code 0 si toutes les captures demandées existent ET ont les
# dimensions exactes ; code 1 sinon (les journaux des échecs sont affichés).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

RAW_DEFAUT="$ROOT/store/screenshots/raw"
PLAN="$ROOT/store/screenshots/plan.json"
PREVIEW_URL="${PREVIEW_URL:-http://localhost:8081}"
CAPTURE_TIMEOUT="${CAPTURE_TIMEOUT:-300}"
LECON='/(child)/lesson'

ONLY=""
APPAREIL="tous"
SORTIE="$RAW_DEFAUT"
COMPOSER=0
LISTE=0

aide() { sed -n '2,/^set -euo pipefail/p' "${BASH_SOURCE[0]}" | sed '$d' | sed 's/^# \{0,1\}//'; }

while [ $# -gt 0 ]; do
  case "$1" in
    --only) ONLY="${2:?--only attend une expression}"; shift 2 ;;
    --appareil) APPAREIL="${2:?--appareil attend iphone, ipad ou tous}"; shift 2 ;;
    --sortie) SORTIE="${2:?--sortie attend un dossier}"; shift 2 ;;
    --composer) COMPOSER=1; shift ;;
    --liste) LISTE=1; shift ;;
    -h|--help) aide; exit 0 ;;
    *) echo "Option inconnue : $1 (voir --help)" >&2; exit 2 ;;
  esac
done

APPAREILS=()
for a in ${APPAREIL//,/ }; do
  case "$a" in
    iphone|ipad|android) APPAREILS+=("$a") ;;
    tous) APPAREILS+=(iphone ipad android) ;;
    *) echo "--appareil : iphone, ipad, android ou tous (reçu : $a)" >&2; exit 2 ;;
  esac
done
[ ${#APPAREILS[@]} -gt 0 ] || { echo "--appareil : aucun appareil" >&2; exit 2; }

# ── Les plans ──────────────────────────────────────────────────────────────
# id | route | variables d'environnement de capture.cjs, séparées par « ; »
#
# Les légendes et l'ordre vivent dans plan.json ; ici, seulement COMMENT mettre
# l'app dans l'état du plan. Le script refuse de tourner si plan.json contient
# un plan qu'il ne sait pas mettre en scène (voir verifier_plans).
#   SEED=1       profil « Amina » semé avant chaque capture
#   STEP=l:n     la leçon l ouverte à l'étape n (n à partir de 0)
#   WAIT=ms      attente avant la photo (animations d'entrée terminées)
#   CLICK=gate   franchir la porte parentale (lit l'opération, entre la réponse)
#   SCROLL=…     faire défiler avant la photo (n px, haut:texte@m, bas:texte@m)
# Une variable préfixée « iphone: », « ipad: » ou « android: » ne vaut que
# pour cet appareil.
#
# 07 : la 10ᵉ leçon du profil, qui ferme « Moi et mon école » et fait dix
# leçons de langage — elle a réellement débloqué « Monde terminé » et « Belle
# parole ». capture.cjs refuse un écran de réussite que le profil semé n'a
# pas vécu (leçon, étoiles et badges sont vérifiés).
# 10 : l'espace parent passe par sa porte, comme dans l'app.
# iPhone, défilement : 01 et 10 jusqu'au bout (01 finit sur la rangée
# Écriture · Calcul entière au-dessus de la barre d'onglets ; 10 montre « Par
# discipline », « Cette semaine » et « Analyse de progression ») ; 09 finit
# sur une rangée de badges entière, au-dessus du fondu de défilement.
PLANS=(
  "01-accueil|/|SEED=1;iphone:SCROLL=fin"
  "02-image|$LECON/cp1-langage-fetes-1|SEED=1;STEP=cp1-langage-fetes-1:0;WAIT=2600"
  "03-ecriture|$LECON/cp1-ecriture-lettres-3|SEED=1;STEP=cp1-ecriture-lettres-3:2;WAIT=2300"
  "04-parcours|/level-map|SEED=1;WAIT=2200"
  "05-lecture|$LECON/cp1-lecture-l-2|SEED=1;STEP=cp1-lecture-l-2:3;WAIT=2600"
  "06-calcul|$LECON/cp1-calcul-nombres-11-15|SEED=1;STEP=cp1-calcul-nombres-11-15:1;WAIT=2600"
  "07-reussite|$LECON/result?stars=3&lessonId=cp1-langage-famille-2&badges=first-world,speaker|SEED=1;WAIT=3200"
  "08-matieres|/learn|SEED=1"
  "09-badges|/profile|SEED=1;iphone:SCROLL=bas:Belle lecture@52"
  "10-parent|/gate|SEED=1;CLICK=gate;iphone:SCROLL=fin"
)

# appareil → périphérique de capture.cjs, densité, suffixe, dimensions attendues
device_de() { case "$1" in iphone) echo iphone69 ;; ipad) echo ipad13-l ;; android) echo tab10-l ;; esac; }
dpr_de() { case "$1" in iphone) echo 3 ;; ipad) echo 2 ;; android) echo 2 ;; esac; }
suffixe_de() { case "$1" in iphone) echo "" ;; ipad) echo "@tablette" ;; android) echo "@tablette-android" ;; esac; }
dims_de() { case "$1" in iphone) echo 1320x2868 ;; ipad) echo 2752x2064 ;; android) echo 2560x1600 ;; esac; }

# Les variables d'un plan pour un appareil : « ; » sépare, « appareil: » filtre.
vars_de() { # vars appareil → une affectation VAR=valeur par ligne
  local IFS=';' v
  for v in $1; do
    case "$v" in
      iphone:*|ipad:*|android:*) [ "${v%%:*}" = "$2" ] && printf '%s\n' "${v#*:}" ;;
      '') ;;
      *) printf '%s\n' "$v" ;;
    esac
  done
  return 0
}

ids_script() { for p in "${PLANS[@]}"; do echo "${p%%|*}"; done; }

verifier_plans() {
  local attendus manquants
  attendus="$(node -e '
    const p = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    for (const plan of p.plans) console.log(plan.id);
  ' "$PLAN")"
  # Les plans des fiches Play : seuls tournés sur la tablette Android.
  PLANS_PLAY="$(node -e '
    const p = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    for (const plan of p.plans) if (plan.play !== false) console.log(plan.id);
  ' "$PLAN")"
  manquants="$(comm -23 <(echo "$attendus" | sort) <(ids_script | sort))"
  if [ -n "$manquants" ]; then
    echo "❌ plan.json contient des plans que ce script ne sait pas mettre en scène :" >&2
    while read -r l; do echo "     $l"; done <<<"$manquants" >&2
    echo "   Ajouter leur route et leurs réglages au tableau PLANS de ce script." >&2
    exit 1
  fi
  local orphelins
  orphelins="$(comm -13 <(echo "$attendus" | sort) <(ids_script | sort))"
  if [ -n "$orphelins" ]; then
    echo "ℹ️  Plans du script absents de plan.json (ignorés) : $(echo "$orphelins" | tr '\n' ' ')"
  fi
  # On ne tourne que ce que plan.json demande.
  PLANS_ACTIFS=()
  for p in "${PLANS[@]}"; do
    local id="${p%%|*}"
    if echo "$attendus" | grep -qx "$id"; then
      if [ -z "$ONLY" ] || [[ "$id" =~ $ONLY ]]; then PLANS_ACTIFS+=("$p"); fi
    fi
  done
  if [ ${#PLANS_ACTIFS[@]} -eq 0 ]; then
    echo "❌ Aucun plan ne correspond à --only '$ONLY'." >&2
    exit 1
  fi
}

dimensions_png() { # fichier → LxH (lu dans l'en-tête IHDR, sans dépendance)
  node -e '
    const b = require("fs").readFileSync(process.argv[1]);
    if (b.toString("ascii", 1, 4) !== "PNG") { console.log("pas-un-png"); process.exit(0); }
    console.log(b.readUInt32BE(16) + "x" + b.readUInt32BE(20));
  ' "$1"
}

verifier_plans

pour_appareil() { # id appareil → vrai si ce plan se tourne sur cet appareil
  [ "$2" != android ] || echo "$PLANS_PLAY" | grep -qx "$1"
}

if [ "$LISTE" = 1 ]; then
  echo "Plans à tourner (${#PLANS_ACTIFS[@]}) × appareils (${APPAREILS[*]}) → $SORTIE"
  for appareil in "${APPAREILS[@]}"; do
    echo "  $appareil ($(device_de "$appareil") ×$(dpr_de "$appareil") → $(dims_de "$appareil"), raw/<id>$(suffixe_de "$appareil").png)"
    for p in "${PLANS_ACTIFS[@]}"; do
      IFS='|' read -r id route vars <<<"$p"
      pour_appareil "$id" "$appareil" || continue
      printf '    %-12s %-82s %s\n' "$id" "$route" "$(vars_de "$vars" "$appareil" | paste -sd ' ' -)"
    done
  done
  exit 0
fi

# ── Prérequis ──────────────────────────────────────────────────────────────
if ! curl -s -o /dev/null --max-time 10 "$PREVIEW_URL"; then
  cat >&2 <<EOF
❌ Le serveur de prévisualisation ne répond pas sur $PREVIEW_URL.
   Le lancer dans un autre terminal (docs/visual-qa.md) :

     ECOLNA_WEB_PREVIEW=1 EXPO_NO_TELEMETRY=1 BROWSER=none npx expo start --web --port 8081

   puis attendre que la page réponde et relancer ce script.
EOF
  exit 1
fi
for paquet in react-native-web @expo/metro-runtime; do
  if [ ! -d "node_modules/$paquet" ]; then
    echo "❌ node_modules/$paquet absent. Une fois, sans toucher package.json :" >&2
    echo "     npm i --no-save react-native-web@~0.21.0 @expo/metro-runtime@~56.0.21" >&2
    exit 1
  fi
done
# Playwright hors du dépôt : on garde les chemins fournis, sinon ceux du
# conteneur de développement s'ils existent, sinon require('playwright').
if [ -z "${PLAYWRIGHT_MODULE:-}" ] && [ -d /opt/node-tools/node_modules/playwright ]; then
  export PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright
fi
if [ -z "${CHROME_PATH:-}" ] && [ -x /opt/pw-browsers/chromium-1194/chrome-linux/chrome ]; then
  export CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
fi

mkdir -p "$SORTIE"
TRAVAIL="$(mktemp -d "${TMPDIR:-/tmp}/ecolna-captures.XXXXXX")"
trap 'rm -rf "$TRAVAIL"' EXIT

# Un seul navigateur à la fois : capture.cjs réutilise un profil Chromium
# persistant (.cache/web-preview-profile), que deux tournages simultanés
# corrompraient.
mkdir -p "$ROOT/.cache"
if command -v flock >/dev/null 2>&1; then
  exec 9>"$ROOT/.cache/web-preview.lock"
  flock 9
fi

AVEC_TIMEOUT=()
if command -v timeout >/dev/null 2>&1; then AVEC_TIMEOUT=(timeout "$CAPTURE_TIMEOUT"); fi

echo "Tournage : ${#PLANS_ACTIFS[@]} plan(s) × ${APPAREILS[*]} — banc $PREVIEW_URL → $SORTIE"
ECHECS=()
OK=0
for appareil in "${APPAREILS[@]}"; do
  device="$(device_de "$appareil")"
  dpr="$(dpr_de "$appareil")"
  suffixe="$(suffixe_de "$appareil")"
  attendu="$(dims_de "$appareil")"
  for p in "${PLANS_ACTIFS[@]}"; do
    IFS='|' read -r id route vars <<<"$p"
    pour_appareil "$id" "$appareil" || continue
    journal="$TRAVAIL/$id-$device.log"
    produit="$TRAVAIL/$id-$device.png"
    cible="$SORTIE/$id$suffixe.png"
    ENV_PLAN=()
    while IFS= read -r v; do [ -n "$v" ] && ENV_PLAN+=("$v"); done < <(vars_de "$vars" "$appareil")
    printf '  %-12s %-9s … ' "$id" "$appareil"
    if env ${ENV_PLAN[@]+"${ENV_PLAN[@]}"} DPR="$dpr" OUT="$TRAVAIL" PREVIEW_URL="$PREVIEW_URL" \
        ${AVEC_TIMEOUT[@]+"${AVEC_TIMEOUT[@]}"} node scripts/web-preview/capture.cjs "$route" "$id" "$device" \
        >"$journal" 2>&1 && [ -s "$produit" ]; then
      dims="$(dimensions_png "$produit")"
      if [ "$dims" = "$attendu" ]; then
        cp "$produit" "$cible"
        echo "ok ($dims) → ${cible#"$ROOT"/}"
        OK=$((OK + 1))
      else
        echo "❌ dimensions $dims, attendu $attendu"
        ECHECS+=("$id $appareil : dimensions $dims au lieu de $attendu")
      fi
    else
      echo "❌ échec"
      ECHECS+=("$id $appareil : $(tail -n 3 "$journal" | tr '\n' ' ' | cut -c1-300)")
    fi
  done
done

echo
echo "$OK capture(s) écrite(s)."
if [ ${#ECHECS[@]} -gt 0 ]; then
  echo "❌ ${#ECHECS[@]} échec(s) — les fichiers déjà en place pour ces plans n'ont PAS été remplacés :" >&2
  printf '   - %s\n' "${ECHECS[@]}" >&2
  exit 1
fi

if [ "$COMPOSER" = 1 ]; then
  if [ "$(cd "$SORTIE" && pwd)" != "$RAW_DEFAUT" ]; then
    echo "ℹ️  --composer ignoré : la composition lit store/screenshots/raw, pas $SORTIE."
  else
    echo "Composition des formats de store…"
    node scripts/tools/compose-store-screenshots.mjs
  fi
fi

cat <<'EOF'

Étape suivante, obligatoire avant toute soumission : comparer ces captures à
l'app installée (TestFlight / test interne Play) — store/screenshots/README.md.
EOF
