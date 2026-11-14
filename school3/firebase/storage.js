/* ==========================================================
   MathCloud Tutorial Academy Management System
   Firebase Storage Engine
   File: firebase/storage.js
   ========================================================== */

import { storage } from "./firebase-config.js";

import {

    ref,

    uploadBytes,

    uploadBytesResumable,

    getDownloadURL,

    deleteObject,

    listAll,

    getMetadata,

    updateMetadata

} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

/* ==========================================================
   SIMPLE UPLOAD
   ========================================================== */

export async function uploadFile(path, file) {

    try {

        const storageRef = ref(storage, path);

        await uploadBytes(storageRef, file);

        return await getDownloadURL(storageRef);

    } catch (error) {

        console.error(error);

        return null;

    }

}

/* ==========================================================
   UPLOAD WITH PROGRESS
   ========================================================== */

export function uploadWithProgress(path, file, progressCallback) {

    return new Promise((resolve, reject) => {

        const storageRef = ref(storage, path);

        const task = uploadBytesResumable(storageRef, file);

        task.on(

            "state_changed",

            (snapshot) => {

                const progress = Math.round(

                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100

                );

                if (progressCallback) {

                    progressCallback(progress);

                }

            },

            reject,

            async () => {

                const url = await getDownloadURL(task.snapshot.ref);

                resolve(url);

            }

        );

    });

}

/* ==========================================================
   GET DOWNLOAD URL
   ========================================================== */

export async function fileURL(path) {

    try {

        return await getDownloadURL(ref(storage, path));

    } catch {

        return null;

    }

}

/* ==========================================================
   DELETE FILE
   ========================================================== */

export async function deleteFile(path) {

    try {

        await deleteObject(ref(storage, path));

        return true;

    } catch {

        return false;

    }

}

/* ==========================================================
   LIST FILES
   ========================================================== */

export async function listFiles(path) {

    try {

        const result = await listAll(ref(storage, path));

        return result.items;

    } catch {

        return [];

    }

}

/* ==========================================================
   FILE METADATA
   ========================================================== */

export async function getFileMetadata(path) {

    try {

        return await getMetadata(ref(storage, path));

    } catch {

        return null;

    }

}

/* ==========================================================
   UPDATE METADATA
   ========================================================== */

export async function setFileMetadata(path, metadata) {

    try {

        return await updateMetadata(

            ref(storage, path),

            metadata

        );

    } catch {

        return null;

    }

}

/* ==========================================================
   IMAGE UPLOAD
   ========================================================== */

export async function uploadImage(folder, file) {

    const filename =

        Date.now() +

        "_" +

        file.name.replace(/\s+/g, "_");

    return await uploadFile(

        `${folder}/${filename}`,

        file

    );

}

/* ==========================================================
   DOCUMENT UPLOAD
   ========================================================== */

export async function uploadDocument(folder, file) {

    const filename =

        Date.now() +

        "_" +

        file.name.replace(/\s+/g, "_");

    return await uploadFile(

        `${folder}/${filename}`,

        file

    );

}

/* ==========================================================
   END OF FILE
   ========================================================== */

