# Cyberlepsie

Narrative browser game made by students at Gobelins (Paris) for the class project of narrative storytelling.

* Platform: PC
* Mode: Single player
* Genre: Narrative, point-and-click, terminal simulation

Text available in English and French, the English translation still being a draft.
More information is available at http://longnguyenhuu.com/game-projects/cyberlepsie.
If you are interested in the project, you can also contact us (http://longnguyenhuu.com/contact).

How to play Cyberlepsie

# Running the game

## Playing on GitHub Pages (recommended for non-developers)

You can directly play the game on GitHub Pages at http://hsandt.github.io/hacker
We push the last stable version of the game to GitHub Pages, so you may not have access to the latest features.

Note that the game will need more time to load than when playing locally.

## Playing locally

To play the game locally you need to download or clone this repository, and to run a local server on your computer.
If you download the repository, make sure you chose the version you want by switching branches on GitHub.
If you clone the repository, you may checkout another branch later.

The two main folders in the project are `src` and `dist`. The `src` folder always contain the last version of the game,
but has not been compiled, i.e. Coffeescript has not been compiled to Javascript and SASS has not been compiled to CSS.
Therefore, it is easier to play from the `dist` folder (which is actually the part of the code that is pushed to GitHub Pages),
but the `dist` folder may miss a few of the last features added, depending on the lsat time we distributed a copy of the project
to `dist`.

### Compile from source

If you work from src, you need to compile those files first. First, install the following tools:

* npm which is included in nodeJS (https://nodejs.org/en) 
* `bower: npm install -g bower`

Then, from the root of the project run in the terminal:

* `npm install`
* `bower install`

Since npm and bower packages are used for front-end development only, they are not required to play from `dist`
but still useful to run a local server. We will likely use only one package manager in the future.

To compile the game's source code, you can use the copy of Coffeescript installed with `npm install` earlier
(in `node_modules/coffee-script/bin` or `node_modules/.bin`), or use your own Coffeescript command (`coffee` or `coffee.cmd` on Windows).

From the root, run
`coffee -o src/js/ -c src/coffee/`

To compile the SASS stylesheets, install SASS (http://sass-lang.com/install).

From the `src/stylesheets` directory, run
`sass main.sass:css/main.css`

If you want to distribute the game from `src` to `dist` from here, run the gulpfile with
`node node_modules/gulp/bin/gulp.js --gulpfile gulpfile.js build`
or
`gulp build`
if you have installed gulp-cli globally.

### Use distributed version

To use the distributed version just go to the `dist` folder, which has the same kind of content as the GitHub Pages
and may be missing a few features but is stable, except if you have compiled and distributed the project from `src`
to `dist` earlier.

### Run the local server

Finally run the local server from either `src` or `dist` depending on your method.
Possible methods are explained at https://github.com/mrdoob/three.js/wiki/How-to-run-things-locally,
and are written again below.

In the dist folder:

`# Python 2.x
python -m SimpleHTTPServer`

`# Python 3.x
python -m http.server`

Or install Node then install HTTP server:

`npm install http-server -g
http-server .`

# Playing instructions

Play with the mouse for most actions and use the keyboard to type in the terminal.
We are currently improving the interface to make it more intuitive for players not familiar with computer development,
so we will put more direct instructions and cues inside the game from now on.

# Credits

* Médéric Hénin
* Long Nguyen Huu
* Timothée Marnat

# Acknowledgement

Close icon made by [Pavel Kozlov](http://www.flaticon.com/authors/pavel-kozlov) from [www.flaticon.com](http://www.flaticon.com) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)
