"use client"; 
// Marks this as a client-side component in Next.js — allows use of hooks like useEffect and direct DOM manipulation.

// This component handles the review dialog and uses a Next.js feature known as Server Actions
// to handle the form submission (server actions are async functions that run on the server).

import { useEffect, useLayoutEffect, useRef } from "react";
import RatingPicker from "@/src/components/RatingPicker.jsx";
import { handleReviewFormSubmission } from "@/src/app/actions.js";

const ReviewDialog = ({
  isOpen,       // boolean that determines whether the dialog should be open
  handleClose,  // function to close the dialog
  review,       // current review object (contains text, rating, etc.)
  onChange,     // callback function to handle input changes
  userId,       // ID of the currently signed-in user
  id,           // ID of the restaurant being reviewed
}) => {
  const dialog = useRef(); // creates a reference to the <dialog> DOM element

  // useLayoutEffect runs after DOM mutations but before the browser paints
  // Ensures dialog open/close behavior happens smoothly and synchronously with render updates
  useLayoutEffect(() => {
    if (isOpen) {
      // showModal() opens the dialog with a backdrop
      dialog.current.showModal();
    } else {
      // close() hides the dialog
      dialog.current.close();
    }
  }, [isOpen, dialog]);

  // Handles clicks outside the modal — closes dialog if backdrop clicked
  const handleClick = (e) => {
    if (e.target === dialog.current) {
      handleClose();
    }
  };

  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleReviewFormSubmission} // Server Action handles the submission on the backend
        onSubmit={() => {
          handleClose(); // Close the dialog after submission
        }}
      >
        <header>
          <h3>Add your review</h3>
        </header>
        <article>
          <RatingPicker /> {/* Custom component for selecting star rating */}

          <p>
            <input
              type="text"
              name="text"
              id="review"
              placeholder="Write your thoughts here"
              required
              value={review.text} // Binds input value to review.text
              onChange={(e) => onChange(e.target.value, "text")} // Calls onChange callback to update state
            />
          </p>

          {/* Hidden fields to include necessary metadata for the server action */}
          <input type="hidden" name="restaurantId" value={id} />
          <input type="hidden" name="userId" value={userId} />
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={handleClose} // Close without submitting
              className="button--cancel"
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog;
