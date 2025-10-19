// TTYREPLACE
// Copyright (C) 2025 SweatyCircle439

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import {getuid, exit} from "process";

export function draw(lines:string[]) {
    console.clear();
    const AC = lines.concat([]);
    const maxL = AC.sort((a, b) => b.length - a.length)[0]?.length;
    if (!maxL) {
        return draw(["error: empty draw statement"]);
    }
    console.log(`╭${'─'.repeat(maxL + 2)}╮`);
    for (const line of lines) {
        console.log(`│ ${line.padEnd(maxL)} │`);
    }
    console.log(`╰${'─'.repeat(maxL + 2)}╯`);
}

export const staticLines = [
    "SweatyCircle439 TTY replace",
    "replace tty1 with any command",
];

export const baseDir = "/.SC439TTYR";

export interface undoConfig {
    serviceName: string,
    shouldDisableLightDM: boolean
}

if (!getuid) {
    staticLines.push("error: not running on linux");
    draw(staticLines);
    exit();
}

if (getuid() !== 0) {
    staticLines.push("warning: you are not running as root, lack of priviliges may cause issues");
}