import { generateFakeBooksAndReviews } from "@/src/lib/fakeBooks.js";

// Import Firestore functions for CRUD operations, queries, transactions, and timestamps
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

import { db } from "@/src/lib/firebase/clientApp"; // Firebase client instance

// Updates the photo URL of a book document
export async function updateBookImageReference(
  bookId,
  publicImageUrl
) {
  const bookRef = doc(collection(db, "books"), bookId); // reference to book
  if (bookRef) {
    await updateDoc(bookRef, { photo: publicImageUrl }); // update the photo field
  }
}

// Helper function for transactional rating update
const updateWithRating = async (
  transaction,
  docRef,          // reference to book document
  newRatingDocument, // reference for new rating subdocument
  review            // new review object
) => {
  const book = await transaction.get(docRef); // get book snapshot
  const data = book.data(); // current book data

  // calculate new totals
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  // update book aggregate fields
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
    // add new field for userid making review to use as security check
    lastReviewUserId: review.userId,
  });

  // create new rating subdocument
  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

// Adds a review to a book, wrapped in a Firestore transaction
export async function addReviewToBook(db, bookId, review) {
  if (!bookId) {
    throw new Error("No book ID has been provided."); // validation
  }

  if (!review) {
    throw new Error("A valid review has not been provided"); // validation
  }

  try {
    const docRef = doc(collection(db, "books"), bookId); // book doc reference
    const newRatingDocument = doc(
      collection(db, `books/${bookId}/ratings`) // new rating subdoc reference
    );

    // Run transaction to update book rating and create new rating
    await runTransaction(db, transaction =>
      updateWithRating(transaction, docRef, newRatingDocument, review)
    );
  } catch (error) {
    console.error("There was an error adding the rating to the book", error);
    throw error;
  }
};

// Apply query filters for book fetching
function applyQueryFilters(q, { genre, author, publicationYear, price, sort }) {
  if (genre) {
    q = query(q, where("genre", "==", genre)); // filter by genre
  }
  if (author) {
    q = query(q, where("author", "==", author)); // filter by author
  }
  if (publicationYear) {
    q = query(q, where("publicationYear", "==", publicationYear)); // filter by publication year
  }
  if (price) {
    q = query(q, where("price", "==", price.length)); // filter by price
  }
  // sorting
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc")); // sort by average rating
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc")); // sort by number of reviews
  }
  return q;
}

// Fetches books with optional filters
export async function getBooks(db = db, filters = {}) {
  let q = query(collection(db, "books")); // base query
  q = applyQueryFilters(q, filters);           // apply filters
  const results = await getDocs(q);            // execute query
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      // convert Firestore timestamp to JS Date
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Listen for real-time updates to books collection
export function getBooksSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "books"));
  q = applyQueryFilters(q, filters);

  // Subscribe to real-time updates
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id:doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      };
    }); 

    cb(results); // call the callback with updated data
  })
}

// Fetch single book by ID
export async function getBookById(db, bookId) {
  if (!bookId) {
    console.log("Error: Invalid ID received: ", bookId);
    return;
  }
  const docRef = doc(db, "books", bookId);
  const docSnap = await getDoc(docRef); // get document snapshot
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Placeholder for snapshot of single book (not implemented)
export function getBookSnapshotById(bookId, cb) {
  return;
}

// Fetch reviews for a given book
export async function getReviewsByBookId(db, bookId) {
  if (!bookId) {
    console.log("Error: Invalid bookId received: ", bookId);
    return;
  }

  const q = query(
    collection(db, "books", bookId, "ratings"), // ratings subcollection
    orderBy("timestamp", "desc") // order by newest first
  );

  const results = await getDocs(q);
  return results.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Listen for real-time updates to book ratings
export function getReviewsSnapshotByBookId(bookId, cb) {
  if (!bookId) {
    console.log("Error: Invalid bookId received: ", bookId);
    return;
  }

  const q = query(
    collection(db, "books", bookId, "ratings"),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    cb(results);
  });
}

// Add fake books and associated reviews to Firestore
export async function addFakeBooksAndReviews() {
  const data = await generateFakeBooksAndReviews(); // generate fake data
  for (const { bookData, ratingsData } of data) {
    try {
      const docRef = await addDoc(
        collection(db, "books"), // add book
        bookData
      );

      // add each rating to the book's ratings subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "books", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
