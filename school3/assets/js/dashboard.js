/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/dashboard.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {

ref,
get,
onValue

} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    initializeDashboard();

});

let overviewChart=null;

/* ==========================================
MAIN
========================================== */

export async function initializeDashboard(){

    try{

        await loadStatistics();

        await initializeChart();

        initializeRealtimeListeners();

        startClock();

    }

    catch(error){

        console.error(

            "Dashboard Error:",

            error

        );

    }

}

/* ==========================================
LOAD DASHBOARD STATISTICS
========================================== */

async function loadStatistics(){

    const users=

    await getCount("users");

    const students=

    await getCount("students");

    const teachers=

    await getCount("teachers");

    const classes=

    await getCount("classes");

    setValue(

        "totalUsers",

        users

    );

    setValue(

        "totalStudents",

        students

    );

    setValue(

        "totalTeachers",

        teachers

    );

    setValue(

        "totalClasses",

        classes

    );

}

/* ==========================================
GET COUNT
========================================== */

async function getCount(path){

    try{

        const snapshot=

        await get(ref(db,path));

        return snapshot.exists()

        ? Object.keys(

            snapshot.val()

        ).length

        : 0;

    }

    catch(error){

        console.error(error);

        return 0;

    }

}

/* ==========================================
SET VALUE
========================================== */

function setValue(id,value){

    const element=

    document.getElementById(id);

    if(element){

        element.textContent=value;

    }

}

/* ==========================================
REALTIME
========================================== */

function initializeRealtimeListeners(){

    realtime("users","totalUsers");

    realtime("students","totalStudents");

    realtime("teachers","totalTeachers");

    realtime("classes","totalClasses");

}

function realtime(path,id){

    onValue(ref(db,path),snapshot=>{

        const total=

        snapshot.exists()

        ? Object.keys(

            snapshot.val()

        ).length

        : 0;

        setValue(id,total);

        updateChart();

    });

}

/* ==========================================
CHART
========================================== */

async function initializeChart(){

    const canvas=

    document.getElementById(

    "overviewChart"

    );

    if(!canvas) return;

    const users=

    await getCount("users");

    const students=

    await getCount("students");

    const teachers=

    await getCount("teachers");

    const classes=

    await getCount("classes");

    overviewChart=new Chart(canvas,{

        type:"bar",

        data:{

            labels:[

                "Users",

                "Students",

                "Teachers",

                "Classes"

            ],

            datasets:[{

                label:

                "Statistics",

                data:[

                    users,

                    students,

                    teachers,

                    classes

                ],

                borderWidth:1,

                borderRadius:10

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{

                    display:false

                }

            }

        }

    });

}

async function updateChart(){

    if(!overviewChart) return;

    overviewChart.data.datasets[0].data=[

        await getCount("users"),

        await getCount("students"),

        await getCount("teachers"),

        await getCount("classes")

    ];

    overviewChart.update();

}

/* ==========================================
CLOCK
========================================== */

function startClock(){

    updateClock();

    setInterval(

        updateClock,

        1000

    );

}

function updateClock(){

    const text=

    document.querySelector(

    ".topbar p"

    );

    if(!text) return;

    text.textContent=

    new Date().toLocaleString();

}

/* ==========================================
END OF FILE
========================================== */