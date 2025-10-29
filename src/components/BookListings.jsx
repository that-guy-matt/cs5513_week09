"use client";

// This components handles the book listings page
// It receives data from src/app/page.jsx, such as the initial books and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getBooksSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const BookItem = ({ book }) => (
  <li key={book.id}>
    <Link href={`/book/${book.id}`}>
      <ActiveBook book={book} />
    </Link>
  </li>
);

const ActiveBook = ({ book }) => (
  <div>
    <ImageCover photo={book.photo} title={book.title} />
    <BookDetails book={book} />
  </div>
);

const ImageCover = ({ photo, title }) => (
  <div className="image-cover">
    <img src={photo} alt={title} />
  </div>
);

const BookDetails = ({ book }) => (
  <div className="restaurant__details">
    <h2>{book.title}</h2>
    <BookRating book={book} />
    <BookMetadata book={book} />
  </div>
);

const BookRating = ({ book }) => (
  <div className="restaurant__rating">
    <ul>{renderStars(book.avgRating)}</ul>
    <span>({book.numRatings})</span>
  </div>
);

const BookMetadata = ({ book }) => (
  <div className="restaurant__meta">
    <p>
      {book.genre} | {book.author} | {book.publicationYear}
    </p>
    <p>{"$".repeat(book.price)}</p>
  </div>
);

export default function BookListings({
  initialBooks,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    author: searchParams.author || "",
    genre: searchParams.genre || "",
    publicationYear: searchParams.publicationYear || "",
    price: searchParams.price || "",
    sort: searchParams.sort || "",
  };

  const [books, setBooks] = useState(initialBooks);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getBooksSnapshot((data) => {
      setBooks(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="restaurants">
        {books.map((book) => (
          <BookItem key={book.id} book={book} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}

