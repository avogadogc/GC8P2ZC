const STATES = {
  unknown: {
    title: 'Zatím nic',
    html: '?',
    symbol: '?',
  },
  water: {
    title: 'Voda',
    html: '≈',
    symbol: 'W',
  },
  ship: {
    title: 'Loď',
    html: '🛳',
    symbol: 'S',
  }
};

const STATUS_WIP = 'Já si pluju se svou lodí...';
const STATUS_TOO_MANY = 'Takovejch lodí, není to moc?';

const COOKIE_NAME = 'GC8P2ZC-progress'
const COOKIE_DOMAIN = window.location.href.includes('localhost') ? 'localhost' : 'avogadogc.github.io';
const COOKIE_PATH = window.location.href.includes('localhost') ? '/' : 'GC8P2ZC';

const STATUS_CORRECT_ENCRYPTED = '{"iv":"iBX/ROwjTgoLk4XBHE2QfA==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"+K6y7O7mtCM=","ct":"Av8t8jUy5fLc0MGZfhDtTvRdjPj+JS+j4DrjjSZUyotOE6tWaaMP1GnNuBBtOTF3Y4o2IZ7fSy00IJPTonWtgs/aKS3SK0yWOhJgHRAZIZMtnjlLIV10vOa9SmncSJlQExuyNfIgOm7dDT2Jp/OzA875uzOjQOmuEA/3+SHTg5L7gWClHSHOIEUWkGD5SsqOg7w3gE4btN/RRwKumww4jOW88XsT0j9ZJ0CukmJ3IX2K5d2PKKQzKa17YpXqW6eH4SLM/gjsAvE="}';
const CORRECT_HASH = '8c5d7a2b6b297d6acfaca947130dd6ce81f952e5bd6605ed0cbeeeed1785298d';

function init() {
  var progress = get_saved_progress()

  for (var tr of document.getElementById("layout").getElementsByTagName("tr")) {
    for (var td of tr.getElementsByTagName("td")) {
      var box_state = state_from_symbol(progress.substring(0, 1));
      set_box_state(td, box_state);
      progress = progress.substring(1);

      td.onclick = function(event) {
        var element = event.target;
        toggle_box(element);
        validate();
      }
    }
  }

  validate(); // Restored progress
}

function get_saved_progress() {
  var progress = Cookies.get(COOKIE_NAME, { domain: COOKIE_DOMAIN, path: COOKIE_PATH });
  var isSet = typeof progress === 'string' || progress instanceof String;
  if (!isSet || progress.length != 50) {
    progress = STATES.unknown.symbol.repeat(50);
  } else {
    console.log('Reading saved progress ' + progress)
  }
  return progress;
}

function state_from_symbol(symbol) {
  for (state in STATES) {
    if (STATES[state].symbol == symbol) return STATES[state];
  }

  console.log("No state for symbol " + symbol);
}

function toggle_box(element) {
  var old = element.innerHTML
  switch (old) {
    case STATES.unknown.html:
        set_box_state(element, STATES.ship)
    break;
    case STATES.ship.html:
        set_box_state(element, STATES.water)
    break;
    case STATES.water.html:
        set_box_state(element, STATES.unknown)
    break;
    default:
        console.log("Unknown content found: " + old);
        set_box_state(element, STATES.unknown)
    break;
  }
}

function set_box_state(box, state) {
  box.innerHTML = state.html;
  box.title = state.title;
}

function validate() {
  var shipCnt = 0;
  var progress = '';
  for (var tr of document.getElementById("layout").getElementsByTagName("tr")) {
    for (var td of tr.getElementsByTagName("td")) {
      switch (td.innerHTML) {
        case STATES.ship.html:
          shipCnt++;
          progress += STATES.ship.symbol;
        break;
        case STATES.water.html:
          progress += STATES.water.symbol;
        break;
        case STATES.unknown.html:
          progress += STATES.unknown.symbol;
        break;
      }
    }
  }

  Cookies.set(COOKIE_NAME, progress, { expires: 7, domain: COOKIE_DOMAIN, path: COOKIE_PATH, sameSite: 'strict' });

  var ship_progress = get_ship_progress(progress)
  if (sha256(ship_progress) == CORRECT_HASH) {
    set_status(decrypt(STATUS_CORRECT_ENCRYPTED, ship_progress));
    return;
  }

  if (shipCnt > 18) {
    set_status(STATUS_TOO_MANY);
    return;
  }

  set_status(STATUS_WIP);
}

function get_ship_progress(progress) {
  // W as STATES.water.symbol
  return progress.replace(/W/g, STATES.unknown.symbol);
}

function set_status(msg) {
  var oldStatus = document.getElementById('status');
  if (oldStatus.innerHTML == msg) return;

  oldStatus.innerHTML = msg;
}

function sha256(string) {
  return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(string))
}

function encrypt(pwd, msg) {
  cypher = sjcl.encrypt(pwd, msg)
  if (sjcl.decrypt(pwd, cypher) != msg) console.log('Unable to decompress')

  alert(sha256(pwd)+": "+cypher);
}

function decrypt(cyphertext, key) {
  return sjcl.decrypt(key, cyphertext)
}
