 /*
 *  TTYREPLACE
 *  - File: button.tsx
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

import { useKeyboard } from "@opentui/react";
import React from "react";

export default function Button({
    onClick,
    disabled = false,
    text,
    borderColor = disabled? "#000" : "#ffffffff",
    backgroundColor = "#0e0e0e",
    pressedBackgroundColor = "#ffff00",
    pressedColor = "#000",
    hoverBackgroundColor = "#2e2e2e",
    color = "#ffffffff",
    focussed = false,
}: {
    onClick: () => void;
    text?: string;
    borderColor?: string;
    backgroundColor?: string;
    pressedBackgroundColor?: string;
    pressedColor?: string;
    hoverBackgroundColor?: string;
    color?: string;
    focussed?: boolean;
    disabled?: boolean;
}) {
    const [bg, setBg] = React.useState(focussed ? hoverBackgroundColor : backgroundColor);
    React.useEffect(() => {
        setBg(focussed ? hoverBackgroundColor : backgroundColor);
    }, [focussed]);
    function press() {
        if (disabled) return;
        setBg(pressedBackgroundColor);
        onClick();
        setTimeout(() => {
            setBg(focussed ? hoverBackgroundColor : backgroundColor);
        }, 200);
    }
    useKeyboard((key) => {
        if (focussed && (key.name === "space")) {
            press();
        }
    })
    return ([
        <box
            border
            borderColor={borderColor}
            customBorderChars={{
                topT: "█",
                bottomT: "█",
                leftT: "█",
                rightT: "█",
                topLeft: "█",
                topRight: "█",
                bottomLeft: "█",
                bottomRight: "█",
                horizontal: "█",
                vertical: "█",
                cross: "█",
            }}
            onMouseDown={press}
            onMouseOver={() => setBg(hoverBackgroundColor)}
            onMouseOut={() => setBg(backgroundColor)}
            backgroundColor={bg}
            width={(text?.length || 16) + 4}
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
        >
            <text>
                <span fg={color}>{text}</span>
            </text>
        </box>
    ])
}