/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/system-logs.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {

ref,
onValue

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    initializeSystemLogs();

});

function initializeSystemLogs(){

    loadLogs();

    initializeSearch();

    initializeRefresh();

}

/* ==========================================
LOAD LOGS
========================================== */

function loadLogs(){

    const tbody=document.querySelector(

    "#logsTable tbody"

    );

    if(!tbody) return;

    onValue(ref(db,"systemLogs"),snapshot=>{

        tbody.innerHTML="";

        if(!snapshot.exists()){

            tbody.innerHTML=`

            <tr>

            <td colspan="5">

            No system logs available.

            </td>

            </tr>

            `;

            return;

        }

        snapshot.forEach(item=>{

            const log=item.val();

            const badge=

            log.status==="Success"

            ? "successBadge"

            : log.status==="Failed"

            ? "failedBadge"

            : "warningBadge";

            tbody.innerHTML+=`

            <tr>

            <td>${log.dateTime||"-"}</td>

            <td>${log.user||"-"}</td>

            <td>${log.activity||"-"}</td>

            <td>${log.module||"-"}</td>

            <td>

            <span class="${badge}">

            ${log.status||"-"}

            </span>

            </td>

            </tr>

            `;

        });

    });

}

/* ==========================================
SEARCH
========================================== */

function initializeSearch(){

    const search=

    document.getElementById(

    "searchLogs"

    );

    if(!search) return;

    search.addEventListener("input",()=>{

        const keyword=

        search.value.toLowerCase();

        document

        .querySelectorAll(

        "#logsTable tbody tr"

        )

        .forEach(row=>{

            row.style.display=

            row.innerText

            .toLowerCase()

            .includes(keyword)

            ? ""

            : "none";

        });

    });

}

/* ==========================================
REFRESH
========================================== */

function initializeRefresh(){

    const button=

    document.getElementById(

    "refreshLogs"

    );

    if(!button) return;

    button.addEventListener("click",()=>{

        loadLogs();

    });

}

/* ==========================================
END OF FILE
========================================== */

