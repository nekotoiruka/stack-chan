/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Avatar, { Emotion } from 'avatar'
import Emoticon from 'emoticon'
import MarqueeLabel from 'marquee-label'
import { Application, Container, Skin } from 'piu/MC'
/* global trace, SharedArrayBuffer */
import TTS from 'tts-aquestalk'
import WiFi from "wifi";
import SNTP from "sntp";
import Time from "time";

let robot
let ap

const hosts = ["ntp.nict.jp", "ntp.jst.mfeed.ad.jp"];
let ready = false

const fluid = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

function onLaunch() {
  // WiFi接続
  connect();

  // ap起動
  ap = new Application(null, {
    displayListLength: 4096,
    ...fluid,
    skin: new Skin({ fill: 'white' }),
    contents: [createAvatar('black', 'white')],
  })
  return ap
}


function onRobotCreated(theRobot) {
  robot = theRobot
}


function onButtonChange(button, pressed) {
  if (!pressed) {
    return
  }
  let emoticon
  let leftEye, rightEye
  switch (button) {
    case 'A':
      leftEye = ap.content('avatar').content('leftEye').content('eyelid')
      leftEye.variant = 2
      rightEye = ap.content('avatar').content('rightEye').content('eyelid')
      rightEye.variant = 2
      break
    case 'B':
      if(!ready) {
        speak("ma'da/junnbichu-dayo-.", "まだ準備中だよー。", 100);
        
      }else{
        // 現在日時をしゃべる
        speakCurrentDateTime();
      }

      break
    case 'C':
      let speed = Math.floor( Math.random() * 250 ) + 50;
      speak("yukku'ri/_shiteitte'ne.", "ゆっくりしていってね！", speed);
      break
  }
}


function connect() {
  WiFi.mode = 1;
  // WiFi接続
  let monitor = new WiFi({ssid: "yourssid", password: "yourpassword"}, msg => {
    switch (msg) {
      case WiFi.connected:
        break; // still waiting for IP address
      case WiFi.gotIP:

        // SNTP接続＆時刻補正
        new SNTP({host: hosts.shift()}, function(message, value) {
          switch (message) {
            case SNTP.time:
              trace("Received time ", value, ".\n");
              Time.set(value);
              Time.timezone = +9 * 60 * 60;	// Set time zone to UTC+09:00
              
              // WiFi切断
              monitor.close();
              ready = true;
              break;
        
            case SNTP.retry:
              trace("Retrying.\n");
              break;
        
            case SNTP.error:
              trace("Failed: ", value, "\n");
              if (hosts.length)
                return hosts.shift();
              break;
          }
        });

        break;
      case WiFi.disconnected:
        break;  // connection lost
    }
  });
}

function speakCurrentDateTime() {
  let date = new Date();
  let year = String(date.getFullYear());
  let month = String(date.getMonth() + 1).padStart(2, "0");
  let day = String(date.getDate()).padStart(2, "0");
  let dayofweekIndex = date.getDay();
  const dayName = ['日','月','火','水','木','金','土'];
  const dayNameAques = ["nichiyo'-", "getsuyo'-", "kayo'-", "suiyo'-", "mokuyo'-", "kinnyo'-", "doyo'-"];
  let dayofweek = dayName[dayofweekIndex];
  let dayofweekAques = dayNameAques[dayofweekIndex];

  let hours = String(date.getHours()).padStart(2, "0");
  let minutes = String(date.getMinutes()).padStart(2, "0");

  let aquesText = `kyo'-wa/<NUMK VAL=${year} COUNTER=nenn>/<NUMK VAL=${month} COUNTER=gatsu>/<NUMK VAL=${day} COUNTER=nichi>${dayofweekAques}bi <NUMK VAL=${hours} COUNTER=ji>/<NUMK VAL=${minutes} COUNTER=funn>dayo--.`;
  let renderText = year + "/" + month + "/" + day + "[" + dayofweek + "] " + hours + ":" + minutes;

  speak(aquesText, renderText, 100);
}

function createAvatar(primaryColor, secondaryColor) {
  return new Avatar({
    width: 320,
    height: 240,
    name: 'avatar',
    primaryColor,
    secondaryColor,
    props: {
      autoUpdateGaze: false,
      autoUpdateBlink: true,
    },
  })
}

let idx = 0

function createNote() {
  return new Emoticon({
    top: 30,
    right: 30,
    name: 'note',
    emotion: Emotion.SLEEPY,
  })
}



function renderSpeech(str) {
  if (ap.content('balloon') == null) {
    const balloon = new MarqueeLabel({
      state: 0,
      bottom: 10,
      right: 10,
      width: 300,
      height: 40,
      name: 'balloon',
      string: str,
    })
    ap.add(balloon)
    const avatar = ap.content('avatar')
    avatar && avatar.delegate('startSpeech')
  }
}

function removeSpeech() {
  const balloon = ap.content('balloon')
  if (balloon != null) {
    ap.remove(balloon)
    const avatar = ap.content('avatar')
    avatar && avatar.delegate('stopSpeech')
  }
}

async function speak(aquesText, renderText, speed) {
  if (robot == null) {
    trace('robot not initialized\n')
    return
  }
  renderSpeech(" " + renderText + " ")
  await TTS.speak(aquesText + " ", speed, 32).catch(() => {
    trace('thrown\n')
  })
  removeSpeech()
}



export default {
  onLaunch,
  onRobotCreated,
  onButtonChange,
  autoLoop: true,
}
