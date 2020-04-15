const NOTE_WATER = '≈';
const NOTE_SHIP = '🛳';
const NOTE_UNKNOWN = '⋅';

const TITLE_WATER = 'Voda';
const TITLE_SHIP = 'Loď';
const TITLE_UNKNOWN = 'Zatím nic';

const STATUS_WIP = 'Já si pluju se svou lodí...';
const STATUS_TOO_MANY = 'Takovejch lodí, není to moc?';
const STATUS_CORRECT_ENCRYPTED = '{"iv":"iBX/ROwjTgoLk4XBHE2QfA==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"+K6y7O7mtCM=","ct":"Av8t8jUy5fLc0MGZfhDtTvRdjPj+JS+j4DrjjSZUyotOE6tWaaMP1GnNuBBtOTF3Y4o2IZ7fSy00IJPTonWtgs/aKS3SK0yWOhJgHRAZIZMtnjlLIV10vOa9SmncSJlQExuyNfIgOm7dDT2Jp/OzA875uzOjQOmuEA/3+SHTg5L7gWClHSHOIEUWkGD5SsqOg7w3gE4btN/RRwKumww4jOW88XsT0j9ZJ0CukmJ3IX2K5d2PKKQzKa17YpXqW6eH4SLM/gjsAvE="}';

const CORRECT_HASH = '8c5d7a2b6b297d6acfaca947130dd6ce81f952e5bd6605ed0cbeeeed1785298d';

function init() {
  for (var tr of document.getElementById("layout").getElementsByTagName("tr")) {
    for (var td of tr.getElementsByTagName("td")) {
      td.innerHTML = NOTE_UNKNOWN;
      td.title = TITLE_UNKNOWN;
      set_status(STATUS_WIP);
      td.onclick = function(event) {
        var element = event.target;
        toggle_box(element);
        validate();
      }
    }
  }
}

function toggle_box(element) {
  var old = element.innerHTML
  switch (old) {
    case NOTE_UNKNOWN:
        element.innerHTML = NOTE_SHIP;
        element.title = TITLE_SHIP;
    break;
    case NOTE_SHIP:
        element.innerHTML = NOTE_WATER;
        element.title = TITLE_WATER;
    break;
    case NOTE_WATER:
        element.innerHTML = NOTE_UNKNOWN;
        element.title = TITLE_UNKNOWN;
    break;
    default:
        alert("Unknown content found: " + old);
        element.innerHTML = NOTE_UNKNOWN;
        element.title = TITLE_UNKNOWN;
    break;
  }
}

function validate() {
  var shipCnt = 0;
  var key = '';
  for (var tr of document.getElementById("layout").getElementsByTagName("tr")) {
    for (var td of tr.getElementsByTagName("td")) {
      if (td.innerHTML == NOTE_SHIP) {
        shipCnt++;
        key += 'S';
      } else {
        key += '?';
      }
    }
  }

  if (sha256(key) == CORRECT_HASH) {
    set_status(decrypt(STATUS_CORRECT_ENCRYPTED, key));
    return;
  }

  if (shipCnt > 18) {
    set_status(STATUS_TOO_MANY);
    return;
  }

  set_status(STATUS_WIP);
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
