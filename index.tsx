 /*
 *  TTYREPLACE
 *  - File: index.tsx
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

import { render } from "@opentui/react";
import React from "react";
import MainWindow from "./pages/mainWindow";

function App() {
    const [page, setPage] = React.useState(<></>);
    React.useEffect(() => {
        setPage(<MainWindow setWindow={setPage} />);
    }, []);
    return <box
        justifyContent='center'
        alignItems='center'
        height='100%'
        width='100%'
        backgroundColor='#282c34'
    >
        {page}
    </box>
}

render(<App />);