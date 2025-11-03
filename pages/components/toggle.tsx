 /*
 *  TTYREPLACE
 *  - File: toggle.tsx
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
import Button from "./button";

export default function Toggle(
    {
        checked,
        onChange,
        focussed = false,
        disabled
    }: {
        checked: boolean;
        onChange: (newValue: boolean) => void;
        focussed?: boolean;
        disabled?: boolean;
    }) {
    const [Checked, setChecked] = React.useState(checked);
    return (
        <Button
            onClick={() => {
                onChange(!Checked);
                setChecked(!Checked);
            }}
            disabled={disabled}
            borderColor={Checked ? "green" : "red"}
            text={Checked ? "-" : "o"}
            focussed={focussed}
            color={Checked ? "white" : "black"}
            backgroundColor={Checked ? "black" : "gray"}
            hoverBackgroundColor={Checked ? "#303030" : "#b0b0b0"}
        >
        </Button>
    );
}