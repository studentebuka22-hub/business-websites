/* ==========================================================
MathCloud Tutorial Academy
File: firebase/backup-service.js
Production Ready
========================================================== */

import { db } from "./firebase-config.js";

import {

ref,
get,
set

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
EXPORT DATABASE
========================================== */

export async function exportDatabase(){

    const snapshot = await get(ref(db));

    return snapshot.exists()

        ? snapshot.val()

        : {};

}

/* ==========================================
DOWNLOAD BACKUP
========================================== */

export async function downloadBackup(){

    const data = await exportDatabase();

    const json = JSON.stringify(

        data,

        null,

        2

    );

    const blob = new Blob(

        [json],

        {

            type:"application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =

    "mathcloud-backup.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

/* ==========================================
IMPORT DATABASE
========================================== */

export async function importDatabase(data){

    await set(

        ref(db),

        data

    );

}

/* ==========================================
READ BACKUP FILE
========================================== */

export function readBackupFile(file){

    return new Promise((resolve,reject)=>{

        const reader = new FileReader();

        reader.onload = event=>{

            try{

                const data = JSON.parse(

                    event.target.result

                );

                resolve(data);

            }

            catch(error){

                reject(error);

            }

        };

        reader.onerror = ()=>{

            reject(

                new Error(

                    "Unable to read backup."

                )

            );

        };

        reader.readAsText(file);

    });

}

/* ==========================================
RESTORE FROM FILE
========================================== */

export async function restoreBackup(file){

    const data = await readBackupFile(file);

    await importDatabase(data);

    return true;

}

/* ==========================================
END OF FILE
========================================== */

