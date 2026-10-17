# Goki Jet — あなたは清掃員

[日本語](README_ja.md)

![Gameplay demo](docs/demo.gif)

Play: https://sogataro.github.io/goki-jet/

A first-person supermarket cleaning survival game for desktop Chrome/Edge. Keep customer satisfaction above zero by defeating cockroaches and cleaning floor stains.

## Play
Enter starts/resumes with a three-second countdown. WASD/arrows move, hold 0.5 seconds to run, Space jumps, mouse looks, left click uses a tool and right hold aims. Q toggles mop/last weapon; E cycles weapons. Esc pauses.

Kills earn 20P and +5 satisfaction; cleaning earns 10P and +5. A customer noticing a pest costs 10 satisfaction; hitting customers costs 15 per person. Spray lasts 30 seconds. Use the red vending machine to refill for100P or buy sequential upgrades and bombs. Shotgun shots are limited to the central square.

Two stains appear every30 seconds; six or more dirty spots cost10 satisfaction every15 seconds. Every120 seconds, earn500P, add three pests and increase pest speed ×1.2. Add one customer at levels2,4,6… Store size stays fixed at former level3 (width/depth ×1.69) from the start. Free gacha appears every60 seconds: 200P28%, three5× pests20%,500P15%,ten pests10%,1000P4%,2000P2%,5000P1%,three rockets20%. Bonus pests do not respawn. Maintaining90% satisfaction for30 seconds earns100P.

## Run / deploy
No build or package install required. Run `node server.cjs` and visit http://localhost:8019/. Test with `node --test`. Publish the static root to GitHub Pages (main / root). No server-side game runtime required. The intended public and source URLs are encoded in the share QR codes.

## Stored data
Language, sensitivity, aim assist, volume settings, changelog status and best level/time stay in browser localStorage. Ongoing runs are not saved. Settings can erase local data.

## Feedback / フィードバック
Use the FB button in the header. Your message, optional contact, app name/version and language are sent to the shared feedback service only when you press Send. Customer and gameplay data are not sent. / ヘッダーのFBから送信できます。送信時のみ本文・任意の連絡先・アプリ名/版/言語を共通受付へ送ります。

## License
MIT; bundled Three.js attribution in [vendor/THREE-LICENSE.txt](vendor/THREE-LICENSE.txt). Sounds and title illustration were created for this game.


Starting points:0P. The shop shows prices, effects, inventory and missing points.
- Version0.3.0 aim assist: None/Weak/Medium/Strong (default Weak). Every level has stronger correction and tracking. Tracking works while either mouse button is held, or after auto-spray acquires a pest. It retains the visible live target within its tracking cone, and stops on release when auto-spray is off. None keeps manual camera control.
- Auto-spray (default OFF): with spray selected, fires at visible live pests within about3 degrees of the crosshair (plus body size), within range. World fixtures and customers block it. Uses normal supply and customer penalty rules. Other tools remain manual. The preference is stored locally.


## 0.3.0 controls and pickups / 操作とアイテム
- Settings: up to two unique keys or mouse buttons per action; duplicate bindings rejected. Vending/gacha share Use until individually assigned. Defaults unchanged; two-finger scrolling controls the view. / 設定で各操作2キーまで変更・重複不可。未設定の自販機・ガチャは使用キー共用。2本指で視点移動。
- Bombs: 500P for one, unlimited stock. No trap in vending. Each level grants 500P. / 爆弾500P・1個、上限なし。ホイホイ販売終了。レベルごと500P。
- Every240s one random floor pickup (25% each): double kill/clean points15s, cookie attracts all live pests along shortest surface routes20s, every hit lethal15s, or global instant kill with rewards. Repeated timed effects refresh duration; pausing freezes timers. / 4分ごとに各25％：ポイント2倍15秒、おかし集合20秒、即退治15秒、全体即退治。同じ効果は時間更新、停止中は時計停止。
- Customers spawn randomly on valid aisle routes, avoiding fixtures and nearby actors. / 客は通行可能な通路にランダム出現。
