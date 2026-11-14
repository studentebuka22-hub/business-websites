/* ==========================================================
MathCloud Tutorial Academy
File: firebase/student-service.js
Production Ready
========================================================== */

import {
    database
} from "./firebase-config.js";

import {
    ref,
    push,
    set,
    get,
    update,
    remove,
    query,
    orderByChild,
    equalTo,
    onValue
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const COLLECTION = "students";

/* ==========================================
CREATE STUDENT
========================================== */

export async function createStudent(student){

    const studentsRef = ref(database, COLLECTION);

    const newStudent = push(studentsRef);

    const timestamp = Date.now();

    const data = {

        id: newStudent.key,

        status: "active",

        deleted: false,

        createdAt: timestamp,

        updatedAt: timestamp,

        ...student

    };

    await set(newStudent, data);

    return data;

}

/* ==========================================
GET STUDENT
========================================== */

export async function getStudent(studentId){

    const snapshot = await get(

        ref(database, `${COLLECTION}/${studentId}`)

    );

    if(!snapshot.exists()) return null;

    return snapshot.val();

}

/* ==========================================
GET ALL STUDENTS
========================================== */

export async function getAllStudents(){

    const snapshot = await get(

        ref(database, COLLECTION)

    );

    if(!snapshot.exists()) return [];

    return Object.values(snapshot.val());

}

/* ==========================================
UPDATE STUDENT
========================================== */

export async function updateStudent(studentId,data){

    data.updatedAt = Date.now();

    await update(

        ref(database,`${COLLECTION}/${studentId}`),

        data

    );

}

/* ==========================================
SOFT DELETE
========================================== */

export async function deleteStudent(studentId){

    await update(

        ref(database,`${COLLECTION}/${studentId}`),

        {

            deleted:true,

            status:"deleted",

            updatedAt:Date.now()

        }

    );

}

/* ==========================================
RESTORE
========================================== */

export async function restoreStudent(studentId){

    await update(

        ref(database,`${COLLECTION}/${studentId}`),

        {

            deleted:false,

            status:"active",

            updatedAt:Date.now()

        }

    );

}

/* ==========================================
PERMANENT DELETE
========================================== */

export async function permanentlyDeleteStudent(studentId){

    await remove(

        ref(database,`${COLLECTION}/${studentId}`)

    );

}

/* ==========================================
SEARCH
========================================== */

export async function findStudentByAdmissionNumber(admissionNumber){

    const studentQuery = query(

        ref(database,COLLECTION),

        orderByChild("admissionNumber"),

        equalTo(admissionNumber)

    );

    const snapshot = await get(studentQuery);

    if(!snapshot.exists()) return [];

    return Object.values(snapshot.val());

}

/* ==========================================
REALTIME LISTENER
========================================== */

export function watchStudents(callback){

    onValue(

        ref(database,COLLECTION),

        snapshot=>{

            callback(

                snapshot.exists()

                ? Object.values(snapshot.val())

                : []

            );

        }

    );

}

/* ==========================================
END OF FILE
========================================== */

