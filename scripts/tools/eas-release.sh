#!/usr/bin/env bash
# Build EAS de production d'ECOLNA, puis envoi EN TEST — jamais en revue.
#
#   Android → Play Console, piste « Test interne », statut brouillon
#   iOS     → App Store Connect / TestFlight
#
# La soumission en revue (production Play, « Ajouter pour vérification » chez
# Apple) reste un geste humain, fait dans les consoles APRÈS vérification sur
# appareil (docs/deploiement-v1.md, « La séquence de mise en ligne »).
#
# USAGE
#   scripts/tools/eas-release.sh [options]
#
#   (sans option)            build Android + iOS, puis envoi en test des deux
#   --android | --ios        une seule plateforme
#   --no-submit              build seulement, aucun envoi
#   --submit-only <id[,id]>  envoyer des builds DÉJÀ faits (identifiants EAS),
#                            sans rebuild — après un envoi refusé, par exemple ;
#                            ajouter --android ou --ios s'il n'y en a qu'un
#   --interactive            premier passage : laisse EAS poser ses questions
#                            (connexion Apple, création de la fiche App Store
#                            Connect, clé de compte de service Google)
#   --message <texte>        message attaché au build (défaut : version + commit)
#   --dry-run                vérifications locales seulement, puis affiche les
#                            commandes qui seraient lancées ; aucun appel réseau
#   -h, --help               cette aide
#
# Variables facultatives : EAS_CLI_VERSION (défaut latest), EAS_CLI (ex. « eas »
# pour un eas-cli installé globalement au lieu de npx).
#
# CE QUI DOIT EXISTER AVANT (rien de tout cela n'est dans le dépôt, et rien ne
# doit y entrer) :
#   EXPO_TOKEN               jeton d'accès Expo (expo.dev → Settings → Access
#                            tokens ; de préférence celui d'un utilisateur
#                            robot du compte « okimy », rôle minimal). Exporté
#                            dans le shell ou injecté par la CI, jamais écrit
#                            dans un fichier du dépôt.
#   App Store Connect        la fiche de l'app (bundle td.ecolna.app) créée, son
#                            « Apple ID » numérique reporté dans eas.json
#                            (submit.production.ios.ascAppId), et une clé API
#                            App Store Connect enregistrée dans EAS
#                            (`eas credentials -p ios` → App Store Connect: Manage
#                            your API Key → Set up … for EAS Submit).
#   Play Console             l'app créée (td.ecolna.app), et le JSON d'un compte
#                            de service Google enregistré dans EAS
#                            (`eas credentials -p android` → Google Service
#                            Account → Upload…). Le JSON reste HORS du dépôt.
#                            Premier envoi : la doc Expo à jour (oct. 2026) dit
#                            qu'eas submit crée la toute première version sur la
#                            piste interne ; l'ancien téléversement manuel
#                            obligatoire du premier AAB n'est plus exigé. Si la
#                            console refuse quand même, téléverser une fois l'AAB
#                            à la main (docs/deploiement-v1.md § 1.3).
#   Réseau                   si la commande tourne dans un conteneur filtré :
#                            registry.npmjs.org, api.expo.dev, expo.dev,
#                            storage.googleapis.com, reactnative.directory
#                            (obligatoires) ; logs.expo.dev,
#                            api.appstoreconnect.apple.com (recommandés).
#                            Détail : docs/deploiement-v1.md, § 2.3.
#
# Garde-fous, dans l'ordre : identité de release lue dans eas.json, Node, arbre
# git propre, aucun secret suivi par git, configuration Expo de release
# (identifiants, permissions bloquées, tablette, versions), profil de soumission,
# EXPO_TOKEN, domaines joignables, eas-cli, `eas whoami`, `eas project:info` =
# @okimy/alifa, `npm run validate:release`. Le premier qui échoue arrête tout.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

PROJET_ATTENDU="@okimy/alifa"
# eas-cli via npx, à la dernière version (EAS_CLI_VERSION pour en figer une).
# EAS_CLI="eas" utilise à la place un eas-cli déjà installé sur le poste.
EAS_CLI_VERSION="${EAS_CLI_VERSION:-latest}"
if [ -n "${EAS_CLI:-}" ]; then
  read -r -a EAS <<<"$EAS_CLI"
else
  EAS=(npx --yes "eas-cli@${EAS_CLI_VERSION}")
fi

PLATEFORME="all"
SUBMIT=1
INTERACTIF=0
SUBMIT_ONLY=""
DRY=0
MESSAGE=""

aide() { sed -n '2,/^set -euo pipefail/p' "${BASH_SOURCE[0]}" | sed '$d' | sed 's/^# \{0,1\}//'; }

while [ $# -gt 0 ]; do
  case "$1" in
    --android) PLATEFORME="android"; shift ;;
    --ios) PLATEFORME="ios"; shift ;;
    --no-submit) SUBMIT=0; shift ;;
    --submit-only) SUBMIT_ONLY="${2:?--submit-only attend un ou plusieurs identifiants de build}"; shift 2 ;;
    --interactive) INTERACTIF=1; shift ;;
    --message) MESSAGE="${2:?--message attend un texte}"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    -h|--help) aide; exit 0 ;;
    *) echo "Option inconnue : $1 (voir --help)" >&2; exit 2 ;;
  esac
done
if [ -n "$SUBMIT_ONLY" ] && [ "$SUBMIT" = 0 ]; then
  echo "--submit-only et --no-submit s'excluent." >&2
  exit 2
fi

# ── Affichage ──────────────────────────────────────────────────────────────
ETAPE=0
etape() { ETAPE=$((ETAPE + 1)); printf '\n\033[1m%s. %s\033[0m\n' "$ETAPE" "$1"; }
ok() { printf '   ✅ %s\n' "$1"; }
info() { printf '   ℹ️  %s\n' "$1"; }
alerte() { printf '   ⚠️  %s\n' "$1"; }
stop() { printf '\n❌ %s\n' "$1" >&2; shift; for l in "$@"; do printf '   %s\n' "$l" >&2; done; exit 1; }

# Les commandes EAS sont affichées, jamais le jeton.
lancer() {
  printf '   $ %s\n' "$*"
  if [ "$DRY" = 1 ]; then return 0; fi
  "$@"
}

# Chaîne et non tableau : un tableau vide sous `set -u` casse le bash 3.2 de macOS.
NI="--non-interactive"
if [ "$INTERACTIF" = 1 ]; then NI=""; fi

TRAVAIL="$(mktemp -d "${TMPDIR:-/tmp}/ecolna-release.XXXXXX")"
fin() {
  local code=$?
  if [ "$code" -ne 0 ] && [ "$code" -ne 2 ]; then echo "   Journal et réponses JSON : $TRAVAIL" >&2; fi
}
trap fin EXIT
trap 'echo; echo "Interrompu. Un build déjà lancé CONTINUE sur EAS : le retrouver sur expo.dev (Builds)." >&2; exit 130' INT

export EXPO_NO_TELEMETRY=1
# eas-cli envoie des statistiques d'usage par défaut ; le projet n'en veut pas.
export DISABLE_EAS_ANALYTICS=1

# ── 1. Identité de release ─────────────────────────────────────────────────
etape "Identité de release (eas.json, profil production)"
IDENTITE="$(node -e '
  const eas = JSON.parse(require("fs").readFileSync("eas.json", "utf8"));
  const env = (eas.build && eas.build.production && eas.build.production.env) || {};
  console.log([env.ECOLNA_RELEASE || "", env.ECOLNA_ANDROID_PACKAGE || "", env.ECOLNA_IOS_BUNDLE_ID || ""].join(" "));
')"
read -r REL_FLAG ANDROID_ID IOS_ID <<<"$IDENTITE"
if [ "$REL_FLAG" != "1" ] || [ -z "${ANDROID_ID:-}" ] || [ -z "${IOS_ID:-}" ]; then
  stop "eas.json : build.production.env doit définir ECOLNA_RELEASE=1, ECOLNA_ANDROID_PACKAGE et ECOLNA_IOS_BUNDLE_ID."
fi
case "$ANDROID_ID $IOS_ID" in
  *.dev*|*.preview*) stop "Identifiant de développement dans le profil production : $ANDROID_ID / $IOS_ID." ;;
esac
# `eas submit` évalue app.config.ts SANS l'env du profil de build (eas-cli le
# dit en commentaire dans commands/submit.js). Sans ces trois variables, il
# résoudrait td.ecolna.app.dev et chercherait les clés Play et Apple… de l'app
# de développement. On les exporte donc pour TOUTES les commandes qui suivent.
export ECOLNA_RELEASE=1 ECOLNA_ANDROID_PACKAGE="$ANDROID_ID" ECOLNA_IOS_BUNDLE_ID="$IOS_ID"
ok "Android $ANDROID_ID · iOS $IOS_ID"

# ── 2. Poste de travail ────────────────────────────────────────────────────
etape "Poste de travail"
NODE_V="$(node -p 'process.versions.node')"
node -e '
  const [a, b, c] = process.versions.node.split(".").map(Number);
  // eas-cli exige ^20.18.3 || >=22
  const okv = a >= 22 || (a === 20 && (b > 18 || (b === 18 && c >= 3)));
  process.exit(okv ? 0 : 1);
' || stop "Node $NODE_V : eas-cli exige Node 20.18.3+ ou 22+."
ok "Node $NODE_V"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || stop "Pas un dépôt git : EAS archive le dépôt pour construire."
COMMIT="$(git rev-parse --short HEAD)"
BRANCHE="$(git rev-parse --abbrev-ref HEAD)"
SALE="$(git status --porcelain --untracked-files=normal)"
if [ -n "$SALE" ]; then
  if [ "$DRY" = 1 ] || [ -n "$SUBMIT_ONLY" ]; then
    alerte "Arbre git modifié ($(echo "$SALE" | wc -l | tr -d ' ') fichier(s)) — toléré en --dry-run / --submit-only."
  else
    stop "Arbre git modifié : un build doit correspondre exactement à un commit." \
      "Commiter (ou écarter) d'abord :" "$(echo "$SALE" | head -15)"
  fi
else
  ok "Arbre propre — $BRANCHE @ $COMMIT"
fi

# Aucun secret de signature ou de console ne doit être suivi par git.
SECRETS="$(git ls-files | grep -Ei '\.(p8|p12|jks|keystore|mobileprovision|pem)$|service[-_]?account[^/]*\.json$|play[-_]?(console|store)[^/]*\.json$|AuthKey_[^/]*$|credentials\.json$' || true)"
[ -z "$SECRETS" ] || stop "Fichier(s) sensible(s) suivi(s) par git — les retirer de l'historique et révoquer les clés :" "$SECRETS"
# (Un vrai jeton Expo fait une quarantaine de caractères ; en dessous de 16, la
# recherche ne prouverait rien et trouverait n'importe quel mot.)
JETON="${EXPO_TOKEN:-}"
if [ "${#JETON}" -ge 16 ] && git grep -qF -- "$JETON" 2>/dev/null; then
  stop "La valeur d'EXPO_TOKEN figure dans un fichier suivi par git. Révoquer ce jeton sur expo.dev et en créer un autre."
fi
ok "Aucun secret suivi par git"

# ── 3. Configuration Expo de release (hors ligne) ──────────────────────────
etape "Configuration Expo de release (npx expo config --type public)"
EXPO_OFFLINE=1 npx expo config --type public --json >"$TRAVAIL/config.json" 2>"$TRAVAIL/config.err" ||
  stop "app.config.ts ne se résout pas en release :" "$(tail -n 5 "$TRAVAIL/config.err")"
CONTENT_GEN="$(sed -n "s/^const CONTENT_VERSION = '\([^']*\)'.*/\1/p" scripts/generate-content.ts)"
# shellcheck disable=SC2016 # gabarits JavaScript, à ne pas développer par le shell
CONFIG_RESUME="$(node -e '
  const fs = require("fs");
  const c = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const manifeste = JSON.parse(fs.readFileSync("src/content/manifests/curriculum-v1.json", "utf8"));
  const [androidId, iosId, contentGen] = process.argv.slice(2);
  const err = [];
  const a = c.android || {}, i = c.ios || {}, x = c.extra || {};
  if (a.package !== androidId) err.push(`android.package = ${a.package}, attendu ${androidId}`);
  if (i.bundleIdentifier !== iosId) err.push(`ios.bundleIdentifier = ${i.bundleIdentifier}, attendu ${iosId}`);
  for (const p of ["android.permission.INTERNET", "com.google.android.gms.permission.AD_ID"])
    if (!(a.blockedPermissions || []).includes(p)) err.push(`permission non bloquée : ${p}`);
  if (a.allowBackup !== false) err.push("android.allowBackup doit valoir false");
  if (i.supportsTablet !== true) err.push("ios.supportsTablet doit valoir true (app pensée pour la tablette)");
  if (c.orientation !== "default") err.push(`orientation = ${c.orientation}, attendu default (les deux sens)`);
  if ((i.infoPlist || {}).ITSAppUsesNonExemptEncryption !== false) err.push("ITSAppUsesNonExemptEncryption doit valoir false");
  if (!(x.eas && x.eas.projectId)) err.push("extra.eas.projectId absent");
  if (x.contentVersion !== manifeste.contentVersion || x.contentVersion !== contentGen)
    err.push(`contentVersion incohérente : app.config ${x.contentVersion}, manifeste ${manifeste.contentVersion}, générateur ${contentGen}`);
  if (err.length) { console.error(err.join("\n")); process.exit(1); }
  console.log([c.version, x.contentVersion, x.eas.projectId, c.owner, c.slug].join(" "));
' "$TRAVAIL/config.json" "$ANDROID_ID" "$IOS_ID" "$CONTENT_GEN" 2>"$TRAVAIL/config-check.err")" ||
  stop "Configuration de release incorrecte :" "$(cat "$TRAVAIL/config-check.err")"
read -r VERSION CONTENU PROJECT_ID OWNER SLUG <<<"$CONFIG_RESUME"
ok "ECOLNA $VERSION · contenu $CONTENU · projet EAS $PROJECT_ID ($OWNER/$SLUG)"
ok "INTERNET et AD_ID bloquées · sauvegarde Android coupée · iPad pris en charge · deux orientations"

# ── 4. Profils eas.json ────────────────────────────────────────────────────
etape "Profils de build et de soumission (eas.json)"
EASJSON="$(node -e '
  const e = JSON.parse(require("fs").readFileSync("eas.json", "utf8"));
  const b = (e.build || {}).production || {};
  const s = (e.submit || {}).production || {};
  const sa = s.android || {}, si = s.ios || {};
  console.log([
    (b.android || {}).buildType || "-", sa.track || "-", sa.releaseStatus || "-",
    si.ascAppId || "-", sa.applicationId || "-", si.bundleIdentifier || "-",
  ].join(" "));
')"
read -r BUILD_TYPE TRACK STATUT ASC_APP_ID SUB_ANDROID_ID SUB_IOS_ID <<<"$EASJSON"
[ "$BUILD_TYPE" = "app-bundle" ] || stop "build.production.android.buildType = $BUILD_TYPE : Play exige un AAB (app-bundle)."
[ "$TRACK" = "internal" ] && [ "$STATUT" = "draft" ] ||
  stop "submit.production.android doit viser track internal / releaseStatus draft (trouvé : $TRACK / $STATUT)." \
    "Ce script n'envoie qu'en test ; la promotion se fait à la main dans la Play Console."
ok "Android : AAB → piste interne, brouillon"
VEUT_IOS=0; VEUT_ANDROID=0
case "$PLATEFORME" in all) VEUT_IOS=1; VEUT_ANDROID=1 ;; ios) VEUT_IOS=1 ;; android) VEUT_ANDROID=1 ;; esac
if [ "$SUBMIT" = 1 ] && [ "$VEUT_IOS" = 1 ]; then
  if [ "$ASC_APP_ID" = "-" ]; then
    if [ "$INTERACTIF" = 1 ]; then
      alerte "submit.production.ios.ascAppId absent : eas submit le demandera (et peut créer la fiche App Store Connect)."
    else
      stop "submit.production.ios.ascAppId absent d'eas.json : eas submit iOS échoue en mode non interactif" \
        "(« Set ascAppId in the submit profile (eas.json) or re-run this command in interactive mode »)." \
        "→ créer la fiche dans App Store Connect (bundle $IOS_ID), reporter son « Apple ID » numérique" \
        "  dans eas.json, commiter ; ou relancer une première fois avec --interactive."
    fi
  else
    ok "iOS : TestFlight, fiche App Store Connect $ASC_APP_ID"
  fi
fi
[ "$SUB_ANDROID_ID" != "-" ] || info "submit.production.android.applicationId absent : compensé par l'export d'ECOLNA_ANDROID_PACKAGE (à ajouter dans eas.json)."
[ "$SUB_IOS_ID" != "-" ] || info "submit.production.ios.bundleIdentifier absent : compensé par l'export d'ECOLNA_IOS_BUNDLE_ID (à ajouter dans eas.json)."

if [ "$DRY" = 1 ]; then
  etape "Commandes qui seraient lancées (--dry-run : aucun appel réseau)"
  echo "   npm run validate:release"
  if [ -n "$SUBMIT_ONLY" ]; then
    echo "   ${EAS[*]} build:view <id> --json            (pour chaque identifiant)"
  elif [ "$INTERACTIF" = 1 ]; then
    echo "   ${EAS[*]} build --platform $PLATEFORME --profile production --message \"…\""
    echo "   ${EAS[*]} build:list --platform <p> --build-profile production --status finished --git-commit-hash <HEAD> --limit 1 --json"
  else
    echo "   ${EAS[*]} build --platform $PLATEFORME --profile production --non-interactive --json --message \"…\""
  fi
  if [ "$SUBMIT" = 1 ]; then
    if [ "$VEUT_ANDROID" = 1 ]; then
      echo "   ${EAS[*]} submit --platform android --profile production --id <build Android>${NI:+ $NI} --wait"
    fi
    if [ "$VEUT_IOS" = 1 ]; then
      echo "   ${EAS[*]} submit --platform ios --profile production --id <build iOS>${NI:+ $NI} --wait --what-to-test \"…\""
    fi
  fi
  echo
  echo "Vérifications locales : OK. Rien n'a été envoyé."
  rm -rf "$TRAVAIL"
  exit 0
fi

# ── 5. Accès Expo ──────────────────────────────────────────────────────────
etape "Accès au compte Expo"
if [ -z "${EXPO_TOKEN:-}" ]; then
  if [ "$INTERACTIF" = 1 ]; then
    alerte "EXPO_TOKEN absent : la session ouverte par « eas login » sera utilisée."
  else
    stop "EXPO_TOKEN absent." \
      "Créer un jeton sur expo.dev → Settings → Access tokens (de préférence pour un utilisateur robot" \
      "du compte « okimy »), puis : export EXPO_TOKEN=…   — dans le shell ou les secrets de la CI," \
      "jamais dans un fichier du dépôt."
  fi
else
  ok "EXPO_TOKEN présent (valeur non affichée)"
fi

# Un proxy filtrant répond 403 au CONNECT : curl renvoie alors le code 000.
joignable() { [ "$(curl -s -o /dev/null --max-time 20 -w '%{http_code}' "https://$1/" 2>/dev/null || true)" != "000" ]; }
BLOQUES=()
for hote in registry.npmjs.org api.expo.dev expo.dev storage.googleapis.com reactnative.directory; do
  if joignable "$hote"; then ok "$hote joignable"; else BLOQUES+=("$hote"); printf '   ❌ %s injoignable\n' "$hote"; fi
done
if joignable logs.expo.dev; then ok "logs.expo.dev joignable"; else
  alerte "logs.expo.dev injoignable — facultatif : seul le journal en direct du build manquera."; fi
if joignable api.appstoreconnect.apple.com; then ok "api.appstoreconnect.apple.com joignable"; else
  alerte "api.appstoreconnect.apple.com injoignable — nécessaire si EAS doit créer ou vérifier les clés iOS."; fi
if [ ${#BLOQUES[@]} -gt 0 ]; then
  stop "Domaine(s) bloqué(s) par le réseau : ${BLOQUES[*]}" \
    "Depuis un conteneur, les ajouter à la liste des domaines autorisés (docs/deploiement-v1.md," \
    "§ 2.3), ou lancer ce script depuis un poste ou une CI qui a Internet."
fi

etape "eas-cli"
EAS_V="$("${EAS[@]}" --version 2>"$TRAVAIL/eas-version.err")" ||
  stop "eas-cli injoignable via npx :" "$(tail -n 3 "$TRAVAIL/eas-version.err")"
ok "$EAS_V"
# Sortie complète dans un fichier : `| head -n 1` sous pipefail ferait échouer
# la commande sur un SIGPIPE dès que whoami écrit plus d'une ligne.
"${EAS[@]}" whoami >"$TRAVAIL/whoami.txt" 2>&1 ||
  stop "eas whoami a échoué (jeton invalide, révoqué ou expiré ?) :" "$(tail -n 3 "$TRAVAIL/whoami.txt")"
if grep -qi "not logged in" "$TRAVAIL/whoami.txt"; then
  stop "eas whoami : aucune session (« Not logged in »). Vérifier EXPO_TOKEN, ou « eas login » en mode --interactive."
fi
ok "connecté : $(head -n 1 "$TRAVAIL/whoami.txt")"
"${EAS[@]}" project:info >"$TRAVAIL/project-info.txt" 2>&1 ||
  stop "eas project:info a échoué :" "$(tail -n 5 "$TRAVAIL/project-info.txt")"
grep -q -- "$PROJET_ATTENDU" "$TRAVAIL/project-info.txt" ||
  stop "Projet EAS inattendu — attendu $PROJET_ATTENDU :" "$(cat "$TRAVAIL/project-info.txt")"
grep -q -- "$PROJECT_ID" "$TRAVAIL/project-info.txt" ||
  stop "eas project:info ne montre pas l'identifiant $PROJECT_ID d'app.config.ts :" "$(cat "$TRAVAIL/project-info.txt")"
ok "projet $PROJET_ATTENDU ($PROJECT_ID)"

# ── 6. Gates de release ────────────────────────────────────────────────────
if [ -z "$SUBMIT_ONLY" ]; then
  etape "Gates de release (npm run validate:release)"
  if npm run validate:release 2>&1 | tee "$TRAVAIL/validate-release.log"; then
    ok "gates automatisables vertes (exceptions acceptées comprises)"
  else
    stop "npm run validate:release a échoué : aucun build ne part." \
      "Journal : $TRAVAIL/validate-release.log"
  fi
fi

# ── 7. Build ───────────────────────────────────────────────────────────────
BUILDS_JSON="$TRAVAIL/builds.json"
if [ -n "$SUBMIT_ONLY" ]; then
  etape "Builds à envoyer (déjà construits)"
  echo "[" >"$BUILDS_JSON"
  premier=1
  for id in ${SUBMIT_ONLY//,/ }; do
    "${EAS[@]}" build:view "$id" --json >"$TRAVAIL/build-$id.json" 2>"$TRAVAIL/build-$id.err" ||
      stop "Build $id introuvable :" "$(tail -n 3 "$TRAVAIL/build-$id.err")"
    [ "$premier" = 1 ] || echo "," >>"$BUILDS_JSON"
    cat "$TRAVAIL/build-$id.json" >>"$BUILDS_JSON"
    premier=0
  done
  echo "]" >>"$BUILDS_JSON"
else
  etape "Build de production ($PLATEFORME) sur EAS — compter 15 à 40 minutes"
  MESSAGE="${MESSAGE:-ECOLNA $VERSION · contenu $CONTENU · $COMMIT}"
  if [ "$INTERACTIF" = 1 ]; then
    # Sans --json : EAS doit pouvoir poser ses questions (clés de signature).
    lancer "${EAS[@]}" build --platform "$PLATEFORME" --profile production --message "$MESSAGE" ||
      stop "Le build a échoué. Journal complet : page du build sur expo.dev."
    # On retrouve les builds par commit, profil et statut : jamais « le dernier »
    # tout court, qui peut être un build preview lancé entre-temps.
    echo "[" >"$BUILDS_JSON"
    premier=1
    for p in android ios; do
      [ "$PLATEFORME" = all ] || [ "$PLATEFORME" = "$p" ] || continue
      "${EAS[@]}" build:list --platform "$p" --build-profile production --status finished \
        --git-commit-hash "$(git rev-parse HEAD)" --limit 1 --json --non-interactive \
        >"$TRAVAIL/list-$p.json" 2>"$TRAVAIL/list-$p.err" ||
        stop "Impossible de retrouver le build $p :" "$(tail -n 3 "$TRAVAIL/list-$p.err")"
      node -e 'const l = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); if (!l[0]) process.exit(1); console.log(JSON.stringify(l[0]));' \
        "$TRAVAIL/list-$p.json" >"$TRAVAIL/one-$p.json" || stop "Aucun build $p terminé pour ce commit."
      [ "$premier" = 1 ] || echo "," >>"$BUILDS_JSON"
      cat "$TRAVAIL/one-$p.json" >>"$BUILDS_JSON"
      premier=0
    done
    echo "]" >>"$BUILDS_JSON"
  else
    printf '   $ %s\n' "${EAS[*]} build --platform $PLATEFORME --profile production --non-interactive --json --message \"$MESSAGE\""
    if ! "${EAS[@]}" build --platform "$PLATEFORME" --profile production --non-interactive --json \
        --message "$MESSAGE" >"$BUILDS_JSON" 2> >(tee "$TRAVAIL/build.log" >&2); then
      stop "Le build a échoué ou a été annulé." \
        "Journal : $TRAVAIL/build.log — et la page du build sur expo.dev (Builds)." \
        "Premier build d'une plateforme ? Les clés de signature iOS exigent une clé API App Store Connect" \
        "dans EAS, ou un premier passage avec --interactive (connexion Apple)."
    fi
  fi
fi

# Contrôle de chaque build : terminé, profil production, distribution store,
# bon identifiant. Sortie : « plateforme id version (build) url » par ligne.
# shellcheck disable=SC2016 # gabarits JavaScript, à ne pas développer par le shell
LIGNES="$(node -e '
  const fs = require("fs");
  const [file, androidId, iosId, owner, slug, voulu] = process.argv.slice(1);
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const builds = Array.isArray(raw) ? raw : [raw];
  const err = [];
  for (const b of builds) {
    const plat = String(b.platform || "").toLowerCase();
    const attendu = plat === "android" ? androidId : iosId;
    if (voulu !== "all" && plat !== voulu) err.push(`${plat} ${b.id} : plateforme non demandée (option --${voulu})`);
    if (b.status !== "FINISHED") err.push(`${plat} ${b.id} : statut ${b.status}`);
    if (b.buildProfile && b.buildProfile !== "production") err.push(`${plat} ${b.id} : profil ${b.buildProfile}, attendu production`);
    if (b.distribution && b.distribution !== "STORE") err.push(`${plat} ${b.id} : distribution ${b.distribution}, attendu STORE`);
    if (b.appIdentifier && b.appIdentifier !== attendu) err.push(`${plat} ${b.id} : identifiant ${b.appIdentifier}, attendu ${attendu}`);
    console.log([plat, b.id, b.appVersion || "?", b.appBuildVersion || "?",
      `https://expo.dev/accounts/${owner}/projects/${slug}/builds/${b.id}`].join(" "));
  }
  if (err.length) { console.error(err.join("\n")); process.exit(1); }
' "$BUILDS_JSON" "$ANDROID_ID" "$IOS_ID" "$OWNER" "$SLUG" "$PLATEFORME" 2>"$TRAVAIL/builds-check.err")" ||
  stop "Build(s) inutilisable(s) pour un envoi en test :" "$(cat "$TRAVAIL/builds-check.err")"
while read -r plat id v bv url; do
  ok "$plat · $v ($bv) · $id"
  info "$url"
done <<<"$LIGNES"

if [ "$SUBMIT" = 0 ]; then
  echo
  echo "Builds prêts, rien envoyé (--no-submit). Réponses JSON : $BUILDS_JSON"
  echo "Pour les envoyer en test plus tard :"
  echo "   scripts/tools/eas-release.sh --submit-only $(echo "$LIGNES" | awk '{print $2}' | paste -sd, -)"
  exit 0
fi

# ── 8. Envoi en test ───────────────────────────────────────────────────────
etape "Envoi en test (jamais en revue)"
while read -r plat id v bv url; do
  case "$plat" in
    android)
      lancer "${EAS[@]}" submit --platform android --profile production --id "$id" \
        $NI --wait ||
        stop "Envoi Android refusé." \
          "Causes fréquentes : compte de service sans accès à l'app dans la Play Console (Utilisateurs et" \
          "autorisations), API Google Play Android Developer non activée dans le projet Google Cloud, app" \
          "absente de la Play Console, ou versionCode déjà utilisé. Relancer : --submit-only $id"
      ok "Android $v ($bv) → Play Console, test interne, brouillon"
      ;;
    ios)
      lancer "${EAS[@]}" submit --platform ios --profile production --id "$id" \
        $NI --wait \
        --what-to-test "ECOLNA $v ($bv) — contenu $CONTENU. Parcourir accueil, une leçon de chaque matière, réussite, espace parent, en paysage et en portrait, en mode avion." ||
        stop "Envoi iOS refusé." \
          "Causes fréquentes : ascAppId erroné, clé API App Store Connect absente d'EAS, conformité" \
          "export ou accords non signés dans App Store Connect. Relancer : --submit-only $id"
      ok "iOS $v ($bv) → App Store Connect ; visible dans TestFlight après traitement Apple (10 à 30 min)"
      ;;
  esac
done <<<"$LIGNES"

cat <<EOF

Fait. Rien n'est parti en revue. Réponses JSON des builds : $BUILDS_JSON
La suite, dans l'ordre (docs/deploiement-v1.md, « La séquence de mise en ligne ») :
  1. Installer depuis TestFlight (iPhone, iPad) et depuis le lien de test interne Play (tablette,
     téléphone) — jamais d'APK sur les tablettes des enfants.
  2. Vérifier sur appareil, en mode avion : docs/release-process.md (gates manuelles).
  3. Comparer chaque capture de store/screenshots/out/ à l'app installée ; remplacer celles qui diffèrent.
  4. Seulement alors : soumettre en revue depuis App Store Connect et promouvoir la version Play.
EOF
