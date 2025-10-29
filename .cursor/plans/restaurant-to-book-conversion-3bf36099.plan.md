<!-- 3bf36099-cd89-4e99-9cdd-69f18e3429a7 5d9c7928-da56-458d-87af-37cdbf2cfb9e -->
# Convert Restaurant Review Site to Book Review Site

## Core Data Model Changes

### Update Firestore Schema (`src/lib/firebase/firestore.js`)

- Rename `restaurants` collection to `books`
- Update document fields: `name` → `title`, add `author`, `category` → `genre`, `city` → `publicationYear`, `price` → keep as-is
- Rename all functions: `getRestaurants` → `getBooks`, `addReviewToRestaurant` → `addReviewToBook`, etc.
- Update query filters to work with new fields (genre, author, publicationYear, price)
- Update subcollection path from `restaurants/{id}/ratings` to `books/{id}/ratings`

### Update Server Actions (`src/app/actions.js`)

- Rename `addReviewToRestaurant` → `addReviewToBook`
- Update parameter from `restaurantId` → `bookId`

### Update Fake Data Generator (`src/lib/fakeRestaurants.js`)

- Rename file to `fakeBooks.js`
- Rename function to `generateFakeBooksAndReviews`
- Replace restaurant data with book data:
- Book titles, authors, genres (Fiction, Non-Fiction, Mystery, Romance, Science Fiction, Fantasy, Biography, History, Self-Help, Thriller)
- Publication years (range of years)
- Update reviews to be book-focused
- Update image URLs to use book cover placeholders

### Update Random Data (`src/lib/randomData.js`)

- Replace `restaurantNames` with `bookTitles`
- Replace `restaurantCategories` with `bookGenres`
- Replace `restaurantCities` with `publicationYears`
- Add `bookAuthors` array
- Update `restaurantReviews` to `bookReviews` with book-appropriate review text

## Component Updates

### Rename and Update Main Components

- `src/components/Restaurant.jsx` → `Book.jsx`: Update all restaurant references to book
- `src/components/RestaurantDetails.jsx` → `BookDetails.jsx`: Display title, author, genre, publication year
- `src/components/RestaurantListings.jsx` → `BookListings.jsx`: Update component names and props

### Update Filters Component (`src/components/Filters.jsx`)

- Change "Category" to "Genre" with book genres
- Change "City" to "Author" 
- Add "Publication Year" filter (range or specific years)
- Keep "Price" filter
- Update filter summary text from "Restaurants" to "Books"

### Update Review Components

- `ReviewDialog.jsx`: Change "Add your review" context and hidden field from `restaurantId` to `bookId`
- Update Reviews folder components to reference books instead of restaurants

## Page Routes

### Update Main Page (`src/app/page.js`)

- Import `getBooks` instead of `getRestaurants`
- Rename component prop from `initialRestaurants` to `initialBooks`
- Update `BookListings` import

### Update Dynamic Route (`src/app/restaurant/[id]/`)

- Rename folder from `restaurant/[id]` to `book/[id]`
- Update `page.jsx` to use `getBookById` and pass book data
- Update component imports and props

## UI and Branding

### Update Layout (`src/app/layout.js`)

- Change metadata title from "FriendlyEats" to "BookReviews" (or similar)
- Update description to mention books

### Update Header (`src/components/Header.jsx`)

- Change logo text from "Friendly Eats" to "Book Reviews"
- Update "Add sample restaurants" to "Add sample books"
- Call `addFakeBooksAndReviews` instead

### Update Styling (`src/app/styles.css`)

- Update any restaurant-specific class names if needed
- Ensure styling works for book metadata display

## Configuration Files

### Update README (`readme.md`)

- Change title and descriptions from restaurant to book review site
- Update instructions to reference books

### Update Public Assets

- Consider updating SVG icons if any are restaurant-specific (food.svg → book.svg if needed)
- Note: friendly-eats.svg logo will need updating in the future

## Implementation Notes

- Keep image upload functionality for book covers
- Maintain Firebase structure (just rename collections)
- Preserve rating system (1-5 stars) as-is
- Keep authentication flow unchanged
- Future enhancement: Google Books API integration for real book data

### To-dos

- [ ] Update Firestore functions in firestore.js - rename collections, functions, and update field mappings
- [ ] Create fakeBooks.js and update randomData.js with book-specific data (titles, authors, genres, years, reviews)
- [ ] Rename Restaurant components to Book components (Restaurant.jsx → Book.jsx, RestaurantDetails.jsx → BookDetails.jsx, RestaurantListings.jsx → BookListings.jsx)
- [ ] Update Filters.jsx to use book-related filters (Genre, Author, Publication Year, Price)
- [ ] Rename restaurant route to book route and update all page imports and function calls
- [ ] Update actions.js to use book terminology and call renamed Firestore functions
- [ ] Update Header.jsx and layout.js with book review branding and metadata
- [ ] Update ReviewDialog.jsx and review components to reference books instead of restaurants
- [ ] Update readme.md to reflect book review site instead of restaurant review site