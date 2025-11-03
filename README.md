# ttyreplace

>SweatyCircle439 ttyreplacer
>
>Copyright (C) 2025  SweatyCircle439
>
>This program is free software: you can redistribute it and/or modify
>it under the terms of the GNU General Public License as published by
>the Free Software Foundation, either version 3 of the License, or
>(at your option) any later version.
>
>This program is distributed in the hope that it will be useful,
>but WITHOUT ANY WARRANTY; without even the implied warranty of
>MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
>GNU General Public License for more details.
>
>You should have received a copy of the GNU General Public License
>along with this program.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).

## To install dependencies:

```bash
bun install
```

## To build:

```bash
bun run build
```

## To use:

download the ttyreplace binary from the latest release(remember the release number, maybe store it somewhere) and run

```bash
./ttyreplace
```

or:

build the project and run

```bash
./dist/ttyreplace
```

then, answer the questions and confirm, and you will reboot into the selected program runnning in tty1

## To uninstall

> since version 2.0.0 one binary handles both installing and uninstalling

you should already have the ttyreplace binary for your version stored somewhere, run it
and select uninstall

## changelog

### V2.0.0
- the old ui is now replaced by @opentui/react ([npm](https://npmjs.com/package/@opentui/react)|[github](https://github.com/sst/opentui/tree/main/packages/react))
- the user that runs the program can now be picked
- added a **advanced graphical mode that enables full character set and truecolor** (using kmscon)
- in
- the uninstaller is now included in the binary
- added markers for features that only *currently* work on debian
- added the option to select which tty to replace
- added license headers **this does not imply that the code for the previous version can be freely used, it also falls under GPLv3**