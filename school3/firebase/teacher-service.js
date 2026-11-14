/* ==========================================================
MathCloud Tutorial Academy
File: firebase/teacher-service.js
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

const COLLECTION = "teachers";

/* ==========================================
CREATE TEACHER
========================================== */

export async function createTeacher(teacher){

    const teachersRef = ref(database, COLLECTION);

    const newTeacher = push(teachersRef);

    const timestamp = Date.now();

    const data = {

        id: newTeacher.key,

        status: "active",

        deleted: false,

        createdAt: timestamp,

        updatedAt: timestamp,

        ...teacher

    };

    await set(newTeacher, data);

    return data;

}

/* ==========================================
GET TEACHER
========================================== */

export async function getTeacher(teacherId){

    const snapshot = await get(

        ref(database, `${COLLECTION}/${teacherId}`)

    );

    return snapshot.exists() ? snapshot.val() : null;

}

/* ==========================================
GET ALL TEACHERS
========================================== */

export async function getAllTeachers(){

    const snapshot = await get(

        ref(database, COLLECTION)

    );

    return snapshot.exists()

        ? Object.values(snapshot.val())

        : [];

}

/* ==========================================
UPDATE TEACHER
========================================== */

export async function updateTeacher(teacherId, data){

    data.updatedAt = Date.now();

    await update(

        ref(database, `${COLLECTION}/${teacherId}`),

        data

    );

}

/* ==========================================
SOFT DELETE
========================================== */

export async function deleteTeacher(teacherId){

    await update(

        ref(database, `${COLLECTION}/${teacherId}`),

        {

            deleted: true,

            status: "deleted",

            updatedAt: Date.now()

        }

    );

}

/* ==========================================
RESTORE
========================================== */

export async function restoreTeacher(teacherId){

    await update(

        ref(database, `${COLLECTION}/${teacherId}`),

        {

            deleted: false,

            status: "active",

            updatedAt: Date.now()

        }

    );

}

/* ==========================================
PERMANENT DELETE
========================================== */

export async function permanentlyDeleteTeacher(teacherId){

    await remove(

        ref(database, `${COLLECTION}/${teacherId}`)

    );

}

/* ==========================================
SEARCH
========================================== */

export async function findTeacherByStaffId(staffId){

    const teacherQuery = query(

        ref(database, COLLECTION),

        orderByChild("staffId"),

        equalTo(staffId)

    );

    const snapshot = await get(teacherQuery);

    return snapshot.exists()

        ? Object.values(snapshot.val())

        : [];

}

/* ==========================================
REALTIME LISTENER
========================================== */

export function watchTeachers(callback){

    onValue(

        ref(database, COLLECTION),

        snapshot => {

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

