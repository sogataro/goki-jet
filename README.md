# Goki Jet — あなたは清掃員

[日本語](README_ja.md)

![Gameplay demo](docs/demo.gif)

Play: https://sogataro.github.io/goki-jet/

A first-person supermarket cleaning survival game for desktop Chrome/Edge. Keep customer satisfaction above zero by defeating cockroaches and cleaning floor stains.

## Play
Enter starts/resumes with a three-second countdown. WASD/arrows move, hold 0.5 seconds to run, Space jumps, mouse looks, left click uses a tool and right hold aims. Q toggles mop/last weapon; E cycles weapons. Esc pauses.

Kills earn 20P and +5 satisfaction; cleaning earns 10P and +5. A customer noticing a pest costs 10 satisfaction; hitting customers costs 15 per person. Spray lasts 30 seconds. Use the red vending machine to refill for100P or buy sequential upgrades and bombs. Shotgun shots are limited to the central square.

Two stains appear every30 seconds; six or more dirty spots cost10 satisfaction every15 seconds. Every120 seconds, add three pests and two customers and increase pest speed ×1.2. Store expansion ×1.3 occurs at levels2,3,10,20,30…. Free gacha appears every60 seconds: 200P28%, three5× pests20%,500P15%,ten pests10%,1000P4%,2000P2%,5000P1%,three rockets20%. Bonus pests do not respawn. Maintaining90% satisfaction for30 seconds earns100P.

## Run / deploy
No build or package install required. Run `node server.cjs` and visit http://localhost:8019/. Test with `node --test`. Publish the static root to GitHub Pages (main / root). No server-side game runtime required. The intended public and source URLs are encoded in the share QR codes.

## Stored data
Language, sensitivity, aim assist, volume settings, changelog status and best level/time stay in browser localStorage. Ongoing runs are not saved. Settings can erase local data.

## Feedback / フィードバック
Use the FB button in the header. Your message, optional contact, app name/version and language are sent to the shared feedback service only when you press Send. Customer and gameplay data are not sent. / ヘッダーのFBから送信できます。送信時のみ本文・任意の連絡先・アプリ名/版/言語を共通受付へ送ります。

## License
MIT; bundled Three.js attribution in [vendor/THREE-LICENSE.txt](vendor/THREE-LICENSE.txt). Sounds and title illustration were created for this game.

