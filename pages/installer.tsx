 /*
 *  TTYREPLACE
 *  - File: installer.tsx
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
import { baseDir, type Page, type undoConfig } from "../share";
import Button from "./components/button";
import { useKeyboard, useRenderer } from "@opentui/react";
import fs from "fs";
import path from "path";
import Toggle from "./components/toggle";
import { execSync } from "child_process";
import DonePage from "./done";
import FontName from "fontname";
import type { SelectOption } from "@opentui/core";

export default function Installer({ setWindow }: Page) {
    const [page, setPage] = React.useState(0);
    const [tabsFocussed, setTabsFocussed] = React.useState(false);
    const [pageSelectedIndex, setPageSelectedIndex] = React.useState(0);
    const [program, setProgram] = React.useState("/usr/bin/btop");
    const [TTY, setTTY] = React.useState("tty1");
    const [serviceName, setServiceName] = React.useState(`${path.basename(program)}-${TTY}`);
    const [serviceNameUserMod, setServiceNameUserMod] = React.useState(false);
    const [disableLightDM, setDisableLightDM] = React.useState(true);
    const [runUser, setRunUser] = React.useState("ttyreplaceuser");
    let kmsconInstalled = fs.existsSync("/usr/bin/kmscon");
    const [useAdvancedGraphics, setUseAdvancedGraphics] = React.useState(kmsconInstalled);
    const [terminalFont, setTerminalFont] = React.useState("monospace");
    const [fontSize, setFontSize] = React.useState("14");

    const lightdmInstalled = fs.existsSync("/usr/lib/systemd/system/lightdm.service");

    const allFonts = [] as SelectOption[];
    function tree(dir: string) {
        for (const fontPath of fs.readdirSync(dir)) {
            try {
                if (fs.lstatSync(path.join(dir, fontPath)).isDirectory()) {
                    tree(path.join(dir, fontPath));
                } else if (fontPath.endsWith(".ttf") || fontPath.endsWith(".otf")) {
                    // @ts-expect-error this works
                    const parsed = FontName.parse(fs.readFileSync(path.join(dir, fontPath)))[0]!;
                    // @ts-expect-error by this point i think the @types/fontfamily package is just incorrrect
                    const fontDescription = `${parsed.fontFamily} ${parsed.fontSubfamily}`;
                    const recommended = fontDescription.toLowerCase().includes("mono") || 
                        fontDescription.toLowerCase().includes("console") ||
                        fontDescription.toLowerCase().includes("terminal") ||
                        fontDescription.toLowerCase().includes("code") ||
                        fontDescription.toLowerCase().includes("nf");
                    allFonts.push({
                        name: fontDescription,
                        value: fontDescription,
                        description: `${
                            // @ts-expect-error this types package is absolute garbage
                            parsed.fontFamily
                        }${
                            recommended ? ' - recommended' : ''
                        }${
                            terminalFont === fontDescription ? ' - selected' : ''
                        }`
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }
    }

    tree("/usr/share/fonts");

    const [filteredFonts, setFilteredFonts] = React.useState(allFonts);

    const renderer = useRenderer();

    const pageLengths = [
        3 + (lightdmInstalled ? 1 : 0),
        2 + (useAdvancedGraphics ? 3 : 0),
        2
    ];

    useKeyboard((key) => {
        if (key.name === "escape") {
            setTabsFocussed((prev) => {
                if (prev) {
                    process.exit(0);
                }
                return true;
            });
        } else if (key.name === "return") {
            setTabsFocussed(false);
        } else if (key.name === "tab" && !key.shift) {
            setPageSelectedIndex((prev) => (prev + 1) % (pageLengths[page] || 1));
        } else if (key.name === "tab" && key.shift) {
            setPageSelectedIndex((prev) => (prev - 1 + (pageLengths[page] || 1)) % (pageLengths[page] || 1));
        }
    })

    const options = [
        {
            name: 'Application settings',
            value: 'appsettings',
            description: 'Settings for the application and services'
        },
        {
            name: 'TTY settings',
            value: 'ttysettings',
            description: 'Settings for the TTY interface'
        },
        {
            name: 'Confirm changes',
            value: 'confirmchanges',
            description: 'Confirm changes made in the settings'
        },
    ];

    function updateServiceName({ newProgram = program, newTTY = TTY }: { newProgram?: string, newTTY?: string }) {
        if (!serviceNameUserMod) {
            setServiceName(`${path.basename(newProgram.split(" ")[0]!)}-${newTTY}`);
        }
    }

    const changesList: string[] = [
        `generate undo config`,
        `create ${serviceName} service`,
        `enable ${serviceName} service`,
        `disable getty@${TTY} service`,
    ];

    if (disableLightDM) changesList.push("disable lightdm service");
    if (!kmsconInstalled && useAdvancedGraphics) changesList.push(`install kmscon via apt`);
    if (useAdvancedGraphics) changesList.push(`disable kmsconvt@${TTY} service`);

    const pages = [
        [
            <text><b>Application settings</b></text>,
            <box>
                <text>program to run in tty</text>
                <input
                    focused={!tabsFocussed && pageSelectedIndex === 0 && page === 0}
                    value={program} onInput={(e) => {
                        setProgram(e);
                        updateServiceName({ newProgram: e });
                    }} />
            </box>,
            <box flexDirection="column" gap={1}>
                <text>service name</text>
                <input
                    focused={!tabsFocussed && pageSelectedIndex === 1 && page === 0}
                    value={serviceName} onChange={(e) => {
                        setServiceName(e);
                        setServiceNameUserMod(true);
                    }} />
                <text>
                    <span fg="red">{
                        fs.existsSync(`/usr/lib/systemd/system/${serviceName}.service`) ?
                            'Service exists' : ''
                    }</span>
                </text>
            </box>,
            <box flexDirection="column" gap={1}>
                <text>
                    user to run as
                </text>
                <input
                    focused={!tabsFocussed && pageSelectedIndex === 2 && page === 0}
                    value={runUser} onChange={setRunUser} />
                <text>if the user doesn't already exist, it will be created</text>
            </box>,
            lightdmInstalled ? <box flexDirection="row" gap={2} alignItems="center">
                <Toggle
                    focussed={!tabsFocussed && pageSelectedIndex === 3 && page === 0}
                    checked={disableLightDM} onChange={setDisableLightDM} />
                <text>disable lightDM (Debian only)?</text>
            </box> : null
        ],
        [
            <text><b>TTY settings</b></text>,
            <box>
                <text>TTY to use</text>
                <select
                    focused={!tabsFocussed && pageSelectedIndex === 0 && page === 1}
                    onChange={(_, opt) => {
                        updateServiceName({ newTTY: opt!.value });
                        setTTY(opt!.value);
                    }}
                    showScrollIndicator
                    height={10}
                    options={[
                        { name: TTY, value: TTY, description: "currently selected" },
                        ...fs.readdirSync("/dev")
                            .filter(v => 
                                v.startsWith("tty") && 
                                v.length > 3 &&
                                !isNaN(Number(v.slice(3))) 
                            )
                            .sort((a, b) => {
                                return Number(a.slice(3)) - Number(b.slice(3));
                            })
                            .map(v => ({
                                name: v, value: v, description:
                                    v === TTY ?
                                        v === "tty1" ? "selected - recommended" : "selected" :
                                        v === "tty1" ? "recommended" : ""
                            })),
                    ]}
                />
            </box>,
            <box
                flexDirection="column"
                gap={1}
            >
                <box flexDirection="row" gap={2}>
                    <Toggle
                        checked={useAdvancedGraphics}
                        onChange={setUseAdvancedGraphics}
                        focussed={!tabsFocussed && pageSelectedIndex === 1 && page === 1}
                    />
                    <text>use advanced graphics?</text>
                </box>
                {!kmsconInstalled ? <text fg="red">
                    kmscon is not installed, this option will install it (Debian only)
                </text> : null}
            </box>,
            useAdvancedGraphics ? [
                <text><b>advanced graphics settings</b></text>,
                <input placeholder="search..." placeholderColor={"gray"} 
                focused={!tabsFocussed && pageSelectedIndex === 2 && page === 1}
                onInput={e => setFilteredFonts(allFonts.filter(v => 
                    v.name.toLowerCase().includes(e.toLowerCase())
                ))}
                />,
                <box flexDirection="column" gap={1}>
                    <box>
                        <text>terminal font</text>
                        <select
                            focused={!tabsFocussed && pageSelectedIndex === 3 && page === 1}
                            onChange={(_, opt) => {
                                setTerminalFont(opt!.value);
                            }}
                            showScrollIndicator
                            height={10}
                            options={[
                                { name: terminalFont, value: terminalFont, description: "currently selected" },
                                ...filteredFonts
                            ]}
                        />
                    </box>
                </box>,
                <box flexDirection="column">
                    <text>font size</text>
                    <input focused={!tabsFocussed && pageSelectedIndex === 4 && page === 1} value={fontSize} onInput={e => {
                        if (!isNaN(Number(e))) {
                            setFontSize(e);
                        }
                    }} />
                </box>
            ] : null
        ],
        [
            <text><b>Confirm changes</b></text>,
            <scrollbox width="100%" height="80%" focused={!tabsFocussed && pageSelectedIndex === 0 && page === 2}>
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
            </scrollbox>,
            <Button
                onClick={() => {
                    renderer.console.show();
                    renderer.console.clear();

                    fs.mkdirSync(baseDir);
                    console.log(`created directory: ${baseDir}`);

                    let userCreated = false;

                    console.log(`checking exitance of user: ${runUser}`);
                    try {
                        execSync(`/usr/bin/id -u ${runUser}`, { stdio: "pipe" });
                        console.log(`user ${runUser} exists`);
                    } catch {
                        console.log(`user ${runUser} does not exist, creating...`);
                        execSync(
                            `/usr/sbin/useradd -m -d ${path.join(baseDir, "runUserHome")} ${runUser}`, { stdio: "pipe" }
                        );
                        userCreated = true;
                        console.log(`created user: ${runUser}`);
                        const id = parseInt(execSync(`/usr/bin/id -u ${runUser}`, { stdio: "pipe" }).toString().trim());
                        fs.chownSync(path.join(baseDir, "runUserHome"), id, id);
                        console.log(`set ownership of ${path.join(baseDir, "runUserHome")} to ${runUser} (uid: ${id})`);
                    }

                    const installKmscon = !kmsconInstalled && useAdvancedGraphics;

                    console.log("B: generate undo config");

                    fs.writeFileSync(path.join(baseDir, "undo.config"), JSON.stringify({
                        serviceName,
                        disableLightDM,
                        TTY,
                        user: runUser,
                        userCreated,
                        installKmscon
                    } as undoConfig));
                    console.log(`created file: ${path.join(baseDir, "undo.config")}`);

                    console.log(`D: generate undo config`);

                    console.log(`B: create ${serviceName} service`);

                    fs.writeFileSync(path.join("/etc/systemd/system", `${serviceName}.service`), `[Unit]
Description=${program.split(" ")[0]} ${TTY} replacement
After=systemd-user-sessions.service
After=plymouth-quit-wait.service
After=getty-pre.target
Before=Getty.target

[Service]
User=root
Group=root
Restart=always
ExecStart=/bin/sh ${path.join(baseDir, "tty.sh")}
StartLimitInterval=180
StartLimitBurst=30
RestartSec=5s

[Install]
WantedBy=getty.target`);
                    console.log(`created file: ${path.join("/etc/systemd/system", `${serviceName}.service`)}`);

                    fs.writeFileSync(path.join(baseDir, "run.sh"), `#!/bin/bash
while true; do
    sudo -u ${runUser} ${program}
done`);
                    console.log(`created file: ${path.join(baseDir, "run.sh")}`);
                    fs.chmodSync(path.join(baseDir, "run.sh"), 0o755);
                    console.log(`set executable permission for file: ${path.join(baseDir, "run.sh")}`, 0o755);
                    fs.writeFileSync(path.join(baseDir, "tty.sh"), useAdvancedGraphics ? `#!/bin/bash
/usr/bin/kmscon --vt=${TTY} --no-switchvt --font-name "${terminalFont}" --font-size ${fontSize} --login ${path.join(baseDir, "run.sh")}`
: `#!/bin/bash
/usr/bin/setsid /usr/bin/sh -l -c 'exec ${path.join(baseDir, "run.sh")} <> /dev/tty1 >&0 2>&1'`);
                    console.log(`created file: ${path.join(baseDir, "tty.sh")}`);

                    console.log(`D: create ${serviceName} service`);

                    console.log(`B: disable getty@${TTY} service`);

                    execSync(`/usr/bin/systemctl disable getty@${TTY}`, { stdio: "pipe" });

                    console.log(`D: disable getty@${TTY} service`);

                    if (installKmscon) {
                        console.log(`B: install kmscon via apt`);
                        execSync(`/usr/bin/apt-get update`, { stdio: "pipe" });
                        execSync(`/usr/bin/apt-get install -y kmscon`, { stdio: "pipe" });
                        console.log(`D: install kmscon via apt`);
                        kmsconInstalled = true;
                    }

                    if (kmsconInstalled) {
                        console.log(`B: disable kmsconvt@${TTY} service`);
                        execSync(`/usr/bin/systemctl disable kmsconvt@${TTY}`, { stdio: "pipe" });
                        console.log(`D: disable kmsconvt@${TTY} service`);
                    }

                    console.log(`B: enable ${serviceName} service`);

                    execSync(`/usr/bin/systemctl enable ${serviceName}`, { stdio: "pipe" });

                    if (disableLightDM) {
                        console.log(`B: disable lightdm service`);
                        execSync(`/usr/bin/systemctl disable lightdm`, { stdio: "pipe" });
                        console.log(`D: disable lightdm service`);
                    }

                    setWindow(<DonePage />);
                }}
                focussed={!tabsFocussed && pageSelectedIndex === 1 && page === 2}
                text="Confirm Changes"
            />
        ],
    ];

    return ([
        <box
            backgroundColor="#1e1e1e"
            style={{ padding: 0, width: '90%', height: '90%' }}>
            <tab-select
                options={options}
                focused={tabsFocussed}
                backgroundColor={"#0e0e0e"}
                selectedBackgroundColor={"#3e3e3e"}
                showDescription={tabsFocussed}
                showUnderline={tabsFocussed}
                onChange={(idx, opt) => {
                    setPageSelectedIndex(0);
                    setPage(idx);
                    console.log('Selected tab:', opt);
                }}
            />
            <box
                flexDirection="column"
                marginTop={1}
                padding={1}
                height="95%"
                backgroundColor="#2e2e2e"
                justifyContent="center"
                // alignItems="center"
                gap={2}>
                {pages[page]}
            </box>
        </box>,
        <text>{
            tabsFocussed ?
                'press Enter to enter tab, esc to exit' :
                'press esc to select tab, tab/shift+tab to switch elements, space to press'}</text>
    ]);

}
