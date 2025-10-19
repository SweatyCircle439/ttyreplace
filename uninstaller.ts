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

import * as fs from "fs";
import { baseDir, draw, staticLines, type undoConfig } from "./share";
import path from "path";
import {confirm} from "@inquirer/prompts";
import {exit} from "process";
import { execSync } from "child_process";

// staticLines.push("it is recommended to reboot as soon as the desktop is visible for cleanup reasons");

draw([
    ...staticLines,
    "> step 1: loading files",
    "step 2: confirm changes",
    "step 3: make changes",
    "step 4: reboot",
]);

const config = JSON.parse(fs.readFileSync(path.join(baseDir, "undo.config")).toString()) as undoConfig;
const changesList = [
    `disable and stop ${config.serviceName} service`,
    `delete ${config.serviceName} service`,
    `delete all SC439 TTY REPLACER files`,
    `enable getty@tty1 service`
]

if (config.shouldDisableLightDM) {
    changesList.push("enable lightdm service");
}

draw([
    ...staticLines,
    "step 1: loading files",
    "> step 2: confirm changes",
    "step 3: make changes",
    "step 4: reboot",
    "",
    "changes: ",
    ...changesList.map((v, i, a) => i === a.length - 1 ? `╰─ ${v}` : `├─ ${v}`),
]);

const shouldContinue = await confirm({message: "continue?", default: true});

if (!shouldContinue) {
    draw([
        ...staticLines,
        "step 1: loading files",
        "> step 2: confirm changes",
        "step 3: make changes",
        "step 4: reboot",
        "",
        "error: cancelled"
    ]);
    exit();
}

let lines = [
    ...staticLines,
    "step 1: loading files",
    "step 2: confirm changes",
    "> step 3: make changes",
    "step 4: reboot",
    ""
]

lines.push(`B: disable and stop ${config.serviceName} service`);
draw(lines);
execSync(`/usr/bin/systemctl disable --now ${config.serviceName}`, {stdio: "pipe"});
lines.push(`D: disable and stop ${config.serviceName} service`);

lines.push(`B: delete ${config.serviceName} service`);
draw(lines);
fs.rmSync(path.join("/etc/systemd/system", `${config.serviceName}.service`));
lines.push(`D: delete ${config.serviceName} service`);

lines.push(`B: delete all SC439 TTY replacer files`);
draw(lines);
fs.rmdirSync(baseDir, {recursive: true});
lines.push(`D: delete all SC439 TTY replacer files`);

lines.push(`B: enable getty@tty1 service`);
draw(lines);
execSync(`/usr/bin/systemctl enable getty@tty1`, {stdio: "pipe"});
lines.push(`D: enable getty@tty1 service`);

if (config.shouldDisableLightDM) {
    lines.push(`B: enable lightdm service`);
    //draw(lines);
    //execSync(`/usr/bin/systemctl enable lightdm`, {stdio: "pipe"});
    lines.push(`B: configure lightdm service`);
    draw(lines);
    execSync(`/usr/sbin/dpkg-reconfigure lightdm`, {stdio: "pipe"});
    lines.push(`D: configure lightdm service`);
    lines.push(`D: enable lightdm service`);
}
draw(lines);

draw([
    ...staticLines,
    "step 1: loading files",
    "step 2: confirm changes",
    "step 3: make changes",
    "> step 4: reboot",
    "done :D"
]);

const shouldReboot = await confirm({message: "reboot now?", default: true});

if (shouldReboot) {
    execSync(`/usr/sbin/reboot`, {stdio: "pipe"});
}
