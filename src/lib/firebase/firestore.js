import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

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
import { ErrorBoundaryHandler } from "next/dist/client/components/error-boundary"; // unused import

// Updates the photo URL of a restaurant document
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId); // reference to restaurant
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl }); // update the photo field
  }
}

// Helper function for transactional rating update
const updateWithRating = async (
  transaction,
  docRef,          // reference to restaurant document
  newRatingDocument, // reference for new rating subdocument
  review            // new review object
) => {
  const restaurant = await transaction.get(docRef); // get restaurant snapshot
  const data = restaurant.data(); // current restaurant data

  // calculate new totals
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  // update restaurant aggregate fields
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  // create new rating subdocument
  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

// Adds a review to a restaurant, wrapped in a Firestore transaction
export async function addReviewToRestaurant(db, restaurantId, review) {
  if (!restaurantId) {
    throw new Error("No restaurant ID has been provided."); // validation
  }

  if (!review) {
    throw new Error("A valid review has not been provided"); // validation
  }

  try {
    const docRef = doc(collection(db, "restaurants"), restaurantId); // restaurant doc reference
    const newRatingDocument = doc(
      collection(db, `restaurants/${restaurantId}/ratings`) // new rating subdoc reference
    );

    // Run transaction to update restaurant rating and create new rating
    await runTransaction(db, transaction =>
      updateWithRating(transaction, docRef, newRatingDocument, review)
    );
  } catch (error) {
    console.error("There was an error adding the rating to the restaurant", error);
    throw error;
  }
};

// Apply query filters for restaurant fetching
function applyQueryFilters(q, { category, city, price, sort }) {
  if (category) {
    q = query(q, where("category", "==", category)); // filter by category
  }
  if (city) {
    q = query(q, where("city", "==", city)); // filter by city
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

// Fetches restaurants with optional filters
export async function getRestaurants(db = db, filters = {}) {
  let q = query(collection(db, "restaurants")); // base query
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

// Listen for real-time updates to restaurants collection
export function getRestaurantsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "restaurants"));
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

// Fetch single restaurant by ID
export async function getRestaurantById(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }
  const docRef = doc(db, "restaurants", restaurantId);
  const docSnap = await getDoc(docRef); // get document snapshot
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Placeholder for snapshot of single restaurant (not implemented)
export function getRestaurantSnapshotById(restaurantId, cb) {
  return;
}

// Fetch reviews for a given restaurant
export async function getReviewsByRestaurantId(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"), // ratings subcollection
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

// Listen for real-time updates to restaurant ratings
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
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

// Add fake restaurants and associated reviews to Firestore
export async function addFakeRestaurantsAndReviews() {
  const data = await generateFakeRestaurantsAndReviews(); // generate fake data
  for (const { restaurantData, ratingsData } of data) {
    try {
      const docRef = await addDoc(
        collection(db, "restaurants"), // add restaurant
        restaurantData
      );

      // add each rating to the restaurant's ratings subcollection
      for (const ratingData of ratingsData) {
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
