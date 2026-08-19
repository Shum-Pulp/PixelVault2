# Game source notices

## Original Pixel Vault mini-games

The Pong, Snake, Falling Blocks, Breakout, Minesweeper, Asteroids,
Tic-Tac-Toe, and Road & River implementations in `games/classic-collection/`
were written from scratch for this educational project. Their general game
mechanics were inspired by the learning overview in Jscrambler's
[10 Addictive Classic Games Recreated in JavaScript](https://jscrambler.com/blog/classic-games-javascript/).
No source code or image assets from the article's linked sample directories
were copied into these eight implementations.

The current featured-card sprite sheet at
`game_img/classic-games-retro-sheet-v2.png` and its earlier source version at
`game_img/classic-games-neon-sheet.png` were generated specifically for Pixel
Vault with OpenAI's image generation tool. They contain no imported stock
imagery or commercial game assets.

## Vault unlock sound

`sounds/vault-unlock-powerup.mp3` is `PowerUp1` by Eric Matyas of
[Soundimage.org](https://soundimage.org/sfx-pwrupdn/). Soundimage requires
visible attribution; the project footer includes the author and source link.

## Pac-Man and Space Invaders

Source: [EJINEROZ/classic-games-js](https://github.com/EJINEROZ/classic-games-js), commit `89c16c6fd693c29c1a877f17e09a5300b8e20f36`.

The upstream repository labels its license file `MIT License (c) 2025 Ejiro
Thankgod`, and that notice is reproduced verbatim in each imported game
directory. The upstream file does not include the standard MIT permission
grant. Pixel Vault adds responsive presentation rules but retains the supplied
game logic. Confirm permission with the upstream author before using these two
imports outside this classroom project.

## Mortal Kombat / mk.js

Source: [mgechev/mk.js](https://github.com/mgechev/mk.js), commit `174149629e9b66f79995eaa204faf15695af43c1`.

The upstream README states that the software is distributed under the MIT License. The upstream README is preserved in `games/mortal-kombat/UPSTREAM_README.md`. Pixel Vault retains the local fighter and arena engine, removes unused network and webcam controller paths, and adds responsive local multiplayer controls. The supplied fighter and arena image assets remain from upstream.

## Barrel Climb

The Donkey Kong card launches an original, clean-room Pixel Vault canvas game. The referenced Jscrambler article does not list a Donkey Kong implementation, and no code or assets were copied from the separately reviewed unlicensed clone repository.
