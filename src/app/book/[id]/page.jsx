import Book from "@/src/components/Book.jsx";
import { Suspense } from "react";
import { getBookById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";

export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const book = await getBookById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__book">
      <Book
        id={params.id}
        initialBook={book}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary bookId={params.id} />
        </Suspense>
      </Book>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={book.numRatings} />}
      >
        <ReviewsList bookId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}

