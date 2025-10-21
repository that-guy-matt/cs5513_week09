"use client"; // Marks this component as a Client Component in Next.js

// This component shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react"; // Import React hooks and Suspense for lazy loading
import dynamic from "next/dynamic"; // Used to dynamically import components
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js"; // Firestore function to listen for restaurant data updates
import { useUser } from "@/src/lib/getUser"; // Custom hook to get the current authenticated user
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx"; // Component to display restaurant details
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js"; // Firebase storage function for updating restaurant images

// Dynamically import the ReviewDialog component (loaded only when needed)
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  // State to store restaurant details (initially loaded from props)
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);

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

  // Function to handle image upload for the restaurant
  async function handleRestaurantImage(target) {
    const image = target.files ? target.files[0] : null; // Get the uploaded file
    if (!image) {
      return; // Exit if no image was selected
    }

    // Upload the image to Firebase and get its URL
    const imageURL = await updateRestaurantImage(id, image);

    // Update the restaurant details with the new photo URL
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }

  // Function to close the review dialog and reset review form
  const handleClose = () => {
    setIsOpen(false);
    setReview({ rating: 0, text: "" });
  };

  // Subscribe to Firestore document updates for this restaurant
  useEffect(() => {
    // Listen for real-time updates from Firestore
    return getRestaurantSnapshotById(id, (data) => {
      setRestaurantDetails(data);
    });
  }, [id]); // Re-run when the restaurant ID changes

  return (
    <>
      {/* Render restaurant details */}
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </RestaurantDetails>

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
