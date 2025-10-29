import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; 
// Import functions for working with Firebase Storage: create references, upload files, and get download URLs

import { storage } from "@/src/lib/firebase/clientApp"; 
// Import the configured Firebase storage instance

import { updateBookImageReference } from "@/src/lib/firebase/firestore"; 
// Import helper to update the book document in Firestore with the new image URL

// Main function to update a book's image
export async function updateBookImage(bookId, image) {
    try {
        // Validate that a book ID is provided
        if (!bookId) {
            throw new Error("No book ID has been provided");
        }

        // Validate that a valid image object is provided
        if (!image || !image.name) {
            throw new Error("A valid image has not been provided");
        }

        // Upload the image to Firebase Storage and get its public URL
        const publicImageUrl = await uploadImage(bookId, image);

        // Update the book document in Firestore with the new image URL
        await updateBookImageReference(bookId, publicImageUrl);

        // Return the public URL of the uploaded image
        return publicImageUrl;
    } catch (error) {
        // Log any errors that occur during the process
        console.error("Error processing request:", error);
    }
}

// Helper function to upload an image to Firebase Storage
async function uploadImage(bookId, image) {
    const filePath = `images/${bookId}/${image.name}`; 
    // Define the path in Firebase Storage where the image will be stored

    const newImageRef = ref(storage, filePath); 
    // Create a reference to the file location in storage

    await uploadBytesResumable(newImageRef, image); 
    // Upload the image as a resumable upload

    return await getDownloadURL(newImageRef); 
    // Get the public download URL for the uploaded image
}

// Note: These two functions replace the previous implementation
