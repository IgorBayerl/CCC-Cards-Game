import {TDeckFilters} from "../routes/schemas/deckSchemas";
import db from "./database";
import extractErrorMessage from "./extractErrorMessage";

/**
 * Retrieves a deck by its ID, along with its associated questions and answers.
 *
 * @param deckId - The ID of the deck to retrieve.
 *
 * @returns - A Promise that resolves to an object containing the deck and its associated questions and answers.
 *
 * @throws {Error} - Throws an error if the deck is not found.
 *
 * @example
 *
 * const deck = await getDeckById('someDeckId')
 */
export const getDeckById = async (deckId: string) => {
  try {
    // Retrieve the deck, questions, and answers using Prisma
    const deck = await db.deck.findUnique({
      where: {
        id: deckId,
      },
      include: {
        questions: true, // Include associated questions
        answers: true, // Include associated answers
      },
    });

    // Check if deck exists
    if (!deck) {
      throw new Error(`Deck with ID ${deckId} not found.`);
    }

    return deck;
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(
      `An error occurred while fetching the deck: ${errorMessage}`,
    );
  }
};

/**
 * Retrieves a random question card from a given list of deck IDs, while excluding cards listed in a blacklist.
 *
 * @param deckIds - An array of deck IDs from which to retrieve question cards.
 * @param blacklistCardIds - An array of question card IDs to be excluded from the selection.
 *
 * @returns A Promise that resolves to an object containing a random question card and the number of remaining cards.
 *
 * @throws {Error} - Throws an error if no matching cards are found.
 *
 * @example
 *
 * const questionCards = await getRandomQuestionCardFromDecks(['deck1', 'deck2'], ['card1', 'card2'])
 */
export const getRandomQuestionCardFromDecks = async (
  deckIds: string[],
  blacklistCardIds: string[],
): Promise<{questionCard: any; remainingCount: number}> => {
  try {
    // Retrieve the list of questions that are in the specified decks but not in the blacklist
    const questions = await db.question.findMany({
      where: {
        AND: [
          {
            deckId: {
              in: deckIds,
            },
          },
          {
            NOT: {
              id: {
                in: blacklistCardIds,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        text: true,
        spaces: true,
        deckId: true,
        // add more fields if needed
      },
    });

    // Count the total number of questions in the specified decks but not in the blacklist
    const totalQuestions = await db.question.count({
      where: {
        AND: [
          {
            deckId: {
              in: deckIds,
            },
          },
          {
            NOT: {
              id: {
                in: blacklistCardIds,
              },
            },
          },
        ],
      },
    });

    if (questions.length === 0) {
      throw new Error("No matching cards found.");
    }

    const randomIndex = Math.floor(Math.random() * questions.length);
    const randomCard = questions[randomIndex];

    return {
      questionCard: randomCard,
      remainingCount: totalQuestions - 1, // Subtract one because we're taking one card
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(
      `An error occurred while fetching the deck: ${errorMessage}`,
    );
  }
};

/**
 * Retrieves multiple random answer cards from specified decks, while avoiding blacklisted cards.
 *
 * @param  deckIds - An array of IDs for the decks to choose cards from.
 * @param  blacklistCardIds - An array of IDs for cards that should be avoided.
 * @param  count - The number of answer cards to return.
 *
 * @returns A Promise that resolves to an object containing an array of random answer cards
 *          and the number of cards remaining in the query that are not blacklisted.
 * @throws {Error} - Throws an error if no matching cards are found.
 *
 * @example
 *
 * const answerCards = await getRandomAnswerCardsFromDecks(['deckId1', 'deckId2'], ['blacklistedCardId1'], 3)
 */
export const getRandomAnswerCardsFromDecks = async (
  deckIds: string[],
  blacklistCardIds: string[],
  count: number,
): Promise<{answerCards: any[]; remainingCount: number}> => {
  try {
    // Retrieve the list of answers that are in the specified decks but not in the blacklist
    const answers = await db.answer.findMany({
      where: {
        AND: [
          {
            deckId: {
              in: deckIds,
            },
          },
          {
            NOT: {
              id: {
                in: blacklistCardIds,
              },
            },
          },
        ],
      },
    });

    // Count the total number of answers in the specified decks but not in the blacklist
    const totalAnswers = await db.answer.count({
      where: {
        AND: [
          {
            deckId: {
              in: deckIds,
            },
          },
          {
            NOT: {
              id: {
                in: blacklistCardIds,
              },
            },
          },
        ],
      },
    });

    // If the number of answers retrieved is less than the requested count, throw an error
    if (answers.length < count) {
      throw new Error("Insufficient matching cards found.");
    }

    // Randomly select 'count' number of answers
    const randomAnswers = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * answers.length);
      randomAnswers.push(answers.splice(randomIndex, 1)[0]);
    }

    return {
      answerCards: randomAnswers,
      remainingCount: totalAnswers - randomAnswers.length,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(
      `An error occurred while fetching the answer cards: ${errorMessage}`,
    );
  }
};

/**
 * Retrieves an array of decks along with the counts of questions and answers associated with each deck.
 * The decks are filtered based on provided darknessLevel and language options.
 *
 * @param options - An object containing filter options for darknessLevel and language.
 * @returns - A Promise that resolves to an array of deck objects, each enriched with the count of questions and answers.
 *
 * @example
 *
 * const options = { darknessLevel: [1, 2], language: ['English', 'Spanish'] };
 * const decksWithCounts = await getDecksWithCardCounts(options);
 */
export const getDecksWithCardCounts = async (options: TDeckFilters) => {
  const {darknessLevel, language} = options;

  // Find decks matching filters for darknessLevel and language
  const decks = await db.deck.findMany({
    where: {
      AND: [
        {
          darknessLevel: {
            in: darknessLevel, // assuming darknessLevel is an array
          },
        },
        {
          language: {
            in: language, // assuming language is an array
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      description: true,
      darknessLevel: true,
      icon: true,
    },
  });

  // Fetch the count of questions and answers for each deck
  const decksWithCounts = await Promise.all(
    decks.map(async deck => {
      const questionCount = await db.question.count({
        where: {
          deckId: deck.id,
        },
      });

      const answerCount = await db.answer.count({
        where: {
          deckId: deck.id,
        },
      });

      return {
        ...deck,
        questionCount,
        answerCount,
      };
    }),
  );

  return decksWithCounts;
};

export const getAllUniqueLanguages = async (): Promise<string[]> => {
  const uniqueLanguages = await db.deck.groupBy({
    by: ["language"],
  });

  // Extract language values, filter out nulls, and return them as an array
  return uniqueLanguages
    .map(item => item.language)
    .filter((lang): lang is string => lang !== null);
};
