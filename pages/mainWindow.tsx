 /*
 *  TTYREPLACE
 *  - File: mainWindow.tsx
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

import fs from "fs";
import { baseDir, type Page } from "../share";
import Button from "./components/button";
import Installer from "./installer";
import Uninstaller from "./uninstaller";

export default function MainWindow({setWindow} : Page) {
    const runningAsRoot = process.getuid!() === 0;
    return (
        <box
            backgroundColor="#1e1e1e"
            style={{ padding: 0, width: '90%', height: '90%' }}>
            <box
                flexDirection="column"
                marginTop={1}
                padding={1}
                height="100%"
                backgroundColor={runningAsRoot? "#2e2e2e" : "#ff0000"}
                justifyContent="center"
                alignItems="center"
                gap={2}>
                    <ascii-font text="SweatyCircle439" font="slick"/>
                    <ascii-font text="TTY REPLACER" font="slick"/>
                    {runningAsRoot ?
                        [
                            ...(fs.existsSync(baseDir)? [
                                <text>found existing installation at {baseDir}</text>,
                                <Button
                                    onClick={() => setWindow(<Uninstaller setWindow={setWindow} />)}
                                    focussed
                                    text="uninstall" />
                            ] : [
                                <text>no existing installation found</text>,
                                <Button
                                    onClick={() => setWindow(<Installer setWindow={setWindow} />)}
                                    focussed
                                    text="install" />
                            ]),
                            <text>press space to press button</text>
                        ] : (
                            <text>not running as root, please restart with sudo or as root</text>
                        )
                    }
            </box>
        </box>
    );
}