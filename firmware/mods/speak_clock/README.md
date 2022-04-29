# mods/speak_clock

音声合成サーバーを使うのが面倒だったので  
ESP32向けの超軽量音声合成ライブラリ、AquesTalk ESP32をstackchanから使ってみたサンプルです。

stack-chan with [AquesTalk ESP32](https://www.a-quest.com/products/aquestalk_esp32.html), a tiny text-to-speech engine for ESP32. 
<br />
```JavaScript
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
```


---
# Acknowledgements

実装は[こちらのissue](https://github.com/Moddable-OpenSource/moddable/issues/487)を参考にさせていただきました。<br />
meganetaaan様、ありがとうございます！

I appreciate the [following issue](https://github.com/Moddable-OpenSource/moddable/issues/487) as a reference.

モダンjavascriptもC++も慣れてないので、見よう見まねで書いてます。  
おかしななところあったらご指摘いただけると嬉しいです！


---
# Requirement

事前にmoddableに対してAquesTalkを取り込む必要があります。  
[こちら](https://github.com/nekotoiruka/moddable/tree/feature/nekotoiruka/add-tts-aquestalk/contributed/hello-aquestalk)を事前にご確認ください。

別途、stack-chan/firmware/stackchan フォルダに対して以下をコピーする必要があります。
* aquestalk-esp32/src/aquestalk.h（ライブラリ定義ヘッダ ※59行目をコメントアウトしたもの）

変更箇所の全容は[こちら](https://github.com/nekotoiruka/stack-chan/commit/f72dc87dc82c2a46dbf820f9b4f8eb413978d640)

---
# Usage

Modとして動かします。

例）mac / m5stack core2

まずはスタックちゃん本体のファームウェアを書き込みます。
```bash
cd /path/to/stack-chan/firmware/stackchan
UPLOAD_PORT=/dev/cu.wchusbserialXXXXXXXX mcconfig -d -m -p esp32/m5stack_core2
```
書き込めたらctrl+cで終了し、MODフォルダに移動して適用します。
```bash
cd /path/to/stack-chan/firmware/mods/speak_clock
UPLOAD_PORT=/dev/cu.wchusbserialXXXXXXXX mcrun -d -m -p esp32/m5stack_core2
```

---
# Unresolved Issues...

* aquestalk.hの59行目をコメントアウトしています（型定義？のエラーが発生するため）
* [ライセンスキー](https://store.a-quest.com/items/10524168)をjavascript側から初期化時に渡したかったけどうまく実装できてません
* robot.jsに取り込めてません