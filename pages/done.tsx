 /*
 *  TTYREPLACE
 *  - File: done.tsx
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

import { useKeyboard, useRenderer } from "@opentui/react"
import { use, useEffect, useState } from "react"
import Button from "./components/button";
import { execSync } from "child_process";

export default function DonePage() {
    const [focussedElem, setFocussedElem] = useState(0);
    useRenderer().console.hide();

    useKeyboard((key) => {
        if (key.name === "tab" && !key.shift) {
            setFocussedElem((prev) => (prev + 1) % (2));
        } else if (key.name === "tab" && key.shift) {
            setFocussedElem((prev) => (prev - 1 + 2) % 2);
        }
    });

    return <box
        backgroundColor="#1e1e1e"
        style={{ padding: 0, width: '90%', height: '90%' }}>
        <box
            flexDirection="column"
            marginTop={1}
            padding={1}
            height="90%"
            backgroundColor="#2e2e2e"
            justifyContent="center"
            alignItems="center"
            gap={2}>
                <ascii-font text="Done" font="slick"/>
                <text>you will need to reboot to see the changes, reboot now?</text>
                <Button focussed={focussedElem === 0} text={"reboot now"} onClick={() => {
                    execSync("reboot");
                }} />
                <Button focussed={focussedElem === 1} text={"reboot later"} onClick={() => {
                    process.exit(0);
                }} />
        </box>
    </box>
}