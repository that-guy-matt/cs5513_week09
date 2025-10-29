"use server";

import { addReviewToBook } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
import { getFirestore } from "firebase/firestore";

// This is a Server Action
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
// Replace the function below
export async function handleReviewFormSubmission(data) {
    const { app, currentUser } = await getAuthenticatedAppForUser();
    const db = getFirestore(app);

    await addReviewToBook(db, data.get("bookId"), {
        text: data.get("text"),
        rating: data.get("rating"),

        // This came from a hidden form field.
         userId: data.get("userId"),
        //userId: currentUser.uid,
    });
}
