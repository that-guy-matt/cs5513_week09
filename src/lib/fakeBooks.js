import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

// Function to get a random book cover image URL
function getRandomBookCoverImage() {
  // Using placeholder book cover images from various sources
  // These are placeholder services that provide book cover-like images
  const bookCoverImages = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop", // Book stack
    "https://images.unsplash.com/photo-1531901595193-338e9bc998d1?w=400&h=600&fit=crop", // Open book
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop", // Book reading
    "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=400&h=600&fit=crop", // Book cover
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop", // Book pages
    "https://images.unsplash.com/photo-1517842815692-5d38a67079c2?w=400&h=600&fit=crop", // Bookshelf
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop", // Vintage book
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop", // Colorful books
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop", // Books on table
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop", // Library books
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop", // Book with glasses
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop", // Book collection
    "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=400&h=600&fit=crop", // Stacked books
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop", // Reading room
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=600&fit=crop", // Library shelves
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop", // Book store
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=600&fit=crop", // Book pages closeup
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=600&fit=crop", // Open book detail
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&h=600&fit=crop", // Books on shelf
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=600&fit=crop", // Minimalist books
  ];
  
  return bookCoverImages[randomNumberBetween(0, bookCoverImages.length - 1)];
}

export async function generateFakeBooksAndReviews() {
  const booksToAdd = 5;
  const data = [];

  for (let i = 0; i < booksToAdd; i++) {
    const bookTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this book
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(bookTimestamp.toDate())
      );

      const ratingData = {
        rating:
          randomData.bookReviews[
            randomNumberBetween(0, randomData.bookReviews.length - 1)
          ].rating,
        text: randomData.bookReviews[
          randomNumberBetween(0, randomData.bookReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    const bookData = {
      genre:
        randomData.bookGenres[
          randomNumberBetween(0, randomData.bookGenres.length - 1)
        ],
      title: randomData.bookTitles[
        randomNumberBetween(0, randomData.bookTitles.length - 1)
      ],
      author: randomData.bookAuthors[
        randomNumberBetween(0, randomData.bookAuthors.length - 1)
      ],
      avgRating,
      publicationYear: randomData.publicationYears[
        randomNumberBetween(0, randomData.publicationYears.length - 1)
      ],
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      price: randomNumberBetween(1, 4),
      photo: getRandomBookCoverImage(),
      timestamp: bookTimestamp,
    };

    data.push({
      bookData,
      ratingsData,
    });
  }
  return data;
}

