/* ==========================================================
MathCloud Tutorial Academy
File: assets/js/backup-restore.js
Production Ready
========================================================== */

import { db } from "../../firebase/firebase-config.js";

import {

ref,
get,
set

} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

/* ==========================================
INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    initializeBackupRestore();

});

function initializeBackupRestore(){

    initializeBackup();

    initializeRestore();

}

/* ==========================================
CREATE BACKUP
========================================== */

function initializeBackup(){

    const button=

    document.getElementById("createBackup");

    if(!button) return;

    button.addEventListener("click",async()=>{

        try{

            const snapshot=

            await get(ref(db));

            if(!snapshot.exists()){

                alert("Database is empty.");

                return;

            }

            const data=

            JSON.stringify(

                snapshot.val(),

                null,

                2

            );

            const blob=

            new Blob(

                [data],

                {type:"application/json"}

            );

            const url=

            URL.createObjectURL(blob);

            const link=

            document.createElement("a");

            link.href=url;

            link.download=

            "mathcloud-backup.json";

            link.click();

            URL.revokeObjectURL(url);

        }

        catch(error){

            console.error(error);

            alert("Backup failed.");

        }

    });

}

/* ==========================================
RESTORE BACKUP
========================================== */

function initializeRestore(){

    const button=

    document.getElementById("restoreBackup");

    const input=

    document.getElementById("backupFile");

    if(!button || !input) return;

    button.addEventListener("click",()=>{

        const file=input.files[0];

        if(!file){

            alert("Select a backup file.");

            return;

        }

        const reader=new FileReader();

        reader.onload=async(event)=>{

            try{

                const data=

                JSON.parse(

                    event.target.result

                );

                await set(

                    ref(db),

                    data

                );

                alert(

                "Database restored successfully."

                );

            }

            catch(error){

                console.error(error);

                alert(

                "Invalid backup file."

                );

            }

        };

        reader.readAsText(file);

    });

}

/* ==========================================
END OF FILE
========================================== */

