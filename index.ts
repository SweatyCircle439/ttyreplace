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

import {input, confirm} from "@inquirer/prompts";
import {exit} from "process";
import * as fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {draw, staticLines, baseDir, type undoConfig} from "./share";

draw([
    ...staticLines,
    "> step 1: enter command",
    "step 2: disable display manager",
    "step 3: confirm changes",
    "step 4: make changes",
    "step 5: reboot",
]);

const cmd = await input({message: "enter command", default: "btop"});
const serviceName = await input({message: "enter name for service", default: `${cmd.split(" ")[0]}-tty1`});

draw([
    ...staticLines,
    "step 1: enter command",
    "> step 2: disable display manager",
    "step 3: confirm changes",
    "step 4: make changes",
    "step 5: reboot",
]);

const shouldDisableLightDM = await confirm({message: "disable lightDM? (if enabled)", default: true});

const changesList:string[] = [
    `generate undo config`,
    `create ${serviceName} service`,
    `disable getty@tty1 service`,
    `enable ${serviceName} service`
];

if (shouldDisableLightDM) changesList.push("disable lightdm service");

draw([
    ...staticLines,
    "step 1: enter command",
    "step 2: disable display manager",
    "> step 3: confirm changes",
    "step 4: make changes",
    "step 5: reboot",
    "",
    "changes: ",
    ...changesList.map((v, i, a) => i === a.length - 1 ? `╰─ ${v}` : `├─ ${v}`),
    "all changes can be undone"
]);

const shouldContinue = await confirm({message: "continue?", default: true});

if (!shouldContinue) {
    draw([
        ...staticLines,
        "step 1: enter command",
        "step 2: disable display manager",
        "> step 3: confirm changes",
        "step 4: make changes",
        "step 5: reboot",
        "",
        "error: cancelled"
    ]);
    exit();
}

let lines = [
    ...staticLines,
    "step 1: enter command",
    "step 2: disable display manager",
    "step 3: confirm changes",
    "> step 4: make changes",
    "step 5: reboot",
    "",
]

lines.push("B: generate undo config");
draw(lines);

fs.mkdirSync(baseDir);

fs.writeFileSync(path.join(baseDir, "undo.config"), JSON.stringify({
    serviceName,
    shouldDisableLightDM
} as undoConfig));

lines.push(`D: generate undo config`);

lines.push(`B: create ${serviceName} service`);
draw(lines);

fs.writeFileSync(path.join("/etc/systemd/system", `${serviceName}.service`), `
[Unit]
Description=${cmd.split(" ")} tty1 replacement
After=getty.target

[Service]
User=root
Group=root
Restart=always
ExecStart=/bin/sh ${path.join(baseDir, "script.sh")}
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=multi-user.target
`);

fs.writeFileSync(path.join(baseDir, "script.sh"), `
#!/bin/bash
/usr/bin/setsid /usr/bin/sh -l -c 'exec ${cmd} <> /dev/tty1 >&0 2>&1'
`);

lines.push(`D: create ${serviceName} service`);

lines.push(`B: disable getty@tty1 service`);
draw(lines);

execSync(`/usr/bin/systemctl disable getty@tty1`, {stdio: "pipe"});

lines.push(`D: disable getty@tty1 service`);

lines.push(`B: enable ${serviceName} service`);
draw(lines);

execSync(`/usr/bin/systemctl enable ${serviceName}`, {stdio: "pipe"});

if (shouldDisableLightDM) {
    lines.push("B: disable lightdm service");
    draw(lines);
    execSync(`/usr/bin/systemctl disable lightdm`, {stdio: "pipe"});
    lines.push("D: disable lightdm service");
}

draw([
    ...staticLines,
    "step 1: enter command",
    "step 2: disable display manager",
    "step 3: confirm changes",
    "step 4: make changes",
    "> step 5: reboot",
    "done :D"
]);

const shouldReboot = await confirm({message: "reboot now?", default: true});

if (shouldReboot) {
    execSync(`/usr/sbin/reboot`, {stdio: "pipe"});
}