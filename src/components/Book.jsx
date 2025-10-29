"use client"; // Marks this component as a Client Component in Next.js

// This component shows one individual book
// It receives data from src/app/book/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react"; // Import React hooks and Suspense for lazy loading
import dynamic from "next/dynamic"; // Used to dynamically import components
import { getBookSnapshotById } from "@/src/lib/firebase/firestore.js"; // Firestore function to listen for book data updates
import { useUser } from "@/src/lib/getUser"; // Custom hook to get the current authenticated user
import BookDetails from "@/src/components/BookDetails.jsx"; // Component to display book details
import { updateBookImage } from "@/src/lib/firebase/storage.js"; // Firebase storage function for updating book images

// Dynamically import the ReviewDialog component (loaded only when needed)
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

export default function Book({
  id,
  initialBook,
  initialUserId,
  children,
}) {
  // State to store book details (initially loaded from props)
  const [bookDetails, setBookDetails] = useState(initialBook);

  // State to control whether the review dialog is open or closed
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID
  // is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;

  // State to manage the review input (rating and text)
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  // Function to update review state when user edits rating or text
  const onChange = (value, name) => {
    setReview({ ...review, [name]: value });
  };

  // Function to handle image upload for the book
  async function handleBookImage(target) {
    const image = target.files ? target.files[0] : null; // Get the uploaded file
    if (!image) {
      return; // Exit if no image was selected
    }

    // Upload the image to Firebase and get its URL
    const imageURL = await updateBookImage(id, image);

    // Update the book details with the new photo URL
    setBookDetails({ ...bookDetails, photo: imageURL });
  }

  // Function to close the review dialog and reset review form
  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  // Subscribe to Firestore document updates for this book
  useEffect(() => {
    // Listen for real-time updates from Firestore
    return getBookSnapshotById(id, (data) => {
      setBookDetails(data);
    });
  }, [id]); // Re-run when the book ID changes

  return (
    <>
      {/* Render book details */}
      <BookDetails
        book={bookDetails}
        userId={userId}
        handleBookImage={handleBookImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </BookDetails>

      {/* Show review dialog only if user is signed in */}
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}

