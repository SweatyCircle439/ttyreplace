 /*
 *  TTYREPLACE
 *  - File: uninstaller.tsx
 *  Copyright (C) 2025 SweatyCircle439
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *  
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import type { Page } from "../share";
import { useKeyboard, useRenderer } from "@opentui/react";
import fs from "fs";
import path from "path";
import { baseDir, type undoConfig } from "../share";
import Button from "./components/button";
import DonePage from "./done";
import { execSync } from "child_process";

export default function Uninstaller({ setWindow }: Page) {
    const [focussedElem, setFocussedElem] = React.useState(0);

    const kmsconInstalled = fs.existsSync("/usr/bin/kmscon");
    const renderer = useRenderer();

    useKeyboard((key) => {
        if (key.name === "tab" && !key.shift) {
            setFocussedElem((prev) => (prev + 1) % (2));
        } else if (key.name === "tab" && key.shift) {
            setFocussedElem((prev) => (prev - 1 + 2) % 2);
        }
    });
    const config = JSON.parse(fs.readFileSync(path.join(baseDir, "undo.config")).toString()) as undoConfig;
    const changesList = [
        `disable and stop ${config.serviceName} service`,
        `delete ${config.serviceName} service`,
        `delete all SC439 TTY REPLACER files`,
        kmsconInstalled && !config.installKmscon ?
        `enable kmsconvt@${config.TTY} service` :
        `enable getty@${config.TTY} service`
    ]

    if (config.userCreated) {
        changesList.push(`delete user ${config.user}`);
    }
    if (config.disableLightDM) {
        changesList.push("enable lightdm service");
    }
    if (config.installKmscon) {
        changesList.push("purge kmscon");
    }
    return <box
        backgroundColor="#1e1e1e"
        style={{ padding: 0, width: '90%', height: '90%' }}>
        <box
            flexDirection="column"
            marginTop={1}
            padding={1}
            height="100%"
            backgroundColor={"#2e2e2e"}
            justifyContent="center"
            alignItems="center"
            gap={2}>
            <text><b>Confirm changes</b></text>
            <scrollbox width="100%" height="80%" focused={focussedElem === 0}>
                <text>
                    <strong>pending changes</strong>
                    <br />
                    {changesList.map((v, i, a) => i === a.length - 1 ?
                        [
                            <strong key={`line-${i}`}><span fg="gray">╰─ </span></strong>,
                            <span key={i}>{v}</span>
                        ] :
                        [
                            <strong key={`line-${i}`}><span fg="gray">├─ </span></strong>,
                            <span key={i}>{v}</span>,
                            <br />
                        ])}
                </text>
            </scrollbox>
            <Button
                onClick={() => {
                    renderer.console.show();
                    renderer.console.clear();

                    console.log(`B: disable and stop ${config.serviceName} service`);
                    execSync(`/usr/bin/systemctl disable --now ${config.serviceName}`, {stdio: "pipe"});
                    
                    console.log(`B: delete ${config.serviceName} service`);
                    
                    fs.rmSync(path.join("/etc/systemd/system", `${config.serviceName}.service`));
                    console.log(`D: delete ${config.serviceName} service`);
                    
                    console.log(`B: delete all SC439 TTY replacer files`);
                    
                    fs.rmdirSync(baseDir, {recursive: true});
                    console.log(`D: delete all SC439 TTY replacer files`);

                    console.log(`B: enable ${kmsconInstalled && !config.installKmscon ? 
                        "kmsconvt" : "getty"
                    }@${config.TTY} service`);

                    execSync(
                        `/usr/bin/systemctl enable ${kmsconInstalled && !config.installKmscon ?
                            "kmsconvt" : "getty"
                        }@${config.TTY}`,
                        {stdio: "pipe"}
                    );
                    console.log(`D: enable ${kmsconInstalled && !config.installKmscon ? 
                        "kmsconvt" : "getty"
                    }@${config.TTY} service`);

                    if (config.disableLightDM) {
                        console.log(`B: enable lightdm service`);
                        console.log(`B: configure lightdm service`);
                        
                        execSync(`/usr/sbin/dpkg-reconfigure lightdm`, {stdio: "pipe"});
                        console.log(`D: configure lightdm service`);
                        console.log(`D: enable lightdm service`);
                    }

                    if (config.userCreated) {
                        console.log(`B: delete user ${config.user}`);
                        execSync(`/usr/sbin/userdel ${config.user}`, {stdio: "pipe"});
                        console.log(`D: delete user ${config.user}`);
                    }

                    if (config.installKmscon) {
                        console.log(`B: purge kmscon`);
                        execSync(`/usr/bin/apt-get purge -y kmscon`, {stdio: "pipe"});
                        console.log(`D: purge kmscon`);
                    }

                    setWindow(<DonePage />);
                }}
                focussed={focussedElem === 1}
                text="Confirm Changes"
            />
        </box>
    </box>
}