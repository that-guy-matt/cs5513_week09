// Import Gemini AI utilities and model definitions
import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
// Import the Genkit framework for integrating AI models
import { genkit } from "genkit";
// Import Firestore helper to fetch book reviews
import { getReviewsByBookId } from "@/src/lib/firebase/firestore.js";
// Import helper to get a Firebase app instance for an authenticated user
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
// Import Firestore SDK to interact with the database
import { getFirestore } from "firebase/firestore";

// Async function that generates a Gemini-based summary of book reviews
export async function GeminiSummary({ bookId }) {
  // Get a Firebase app instance authenticated for the current user
  const { firebaseServerApp } = await getAuthenticatedAppForUser();

  // Fetch all reviews for the given book ID from Firestore
  const reviews = await getReviewsByBookId(
    getFirestore(firebaseServerApp),
    bookId
  );

  // Define a separator to distinguish between multiple reviews in the prompt
  const reviewSeparator = "@";

  // Construct a text prompt for the Gemini model
  const prompt = `
    Based on the following book reviews,
    where each review is separated by a '${reviewSeparator}' character,
    create a one-sentence summary of what people think of the book.
    
    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
    `;

  try {
    // Ensure that the Gemini API key is set as an environment variable
    if (!process.env.GEMINI_API_KEY) {
      // Provide guidance for setting the GEMINI_API_KEY secret in Firebase
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance with Google AI plugin and Gemini model
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // Set Gemini 2.0 Flash as the default model
    });

    // Generate a summary using the AI model and the constructed prompt
    const { text } = await ai.generate(prompt);

    // Return a JSX element displaying the AI-generated summary
    return (
      <div className="restaurant__review_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    // Log any errors that occur during the process
    console.error(e);
    // Display a fallback message if summarization fails
    return <p>Error summarizing reviews.</p>
  }
}

// Skeleton component shown while waiting for the Gemini summary to load
export function GeminiSummarySkeleton() {
  return (
    <div className="restaurant__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p>
    </div>
  );
}
