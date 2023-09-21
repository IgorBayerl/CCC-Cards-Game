import {AnswerCard} from "../../shared/types";
import {AnswerCardSchema, QuestionCardSchema, TAnswerCard, TQuestionCard} from "../rooms/schema";
import {TDeckFilters} from "../routes/schemas/deckSchemas";
import db from "./database";
import extractErrorMessage from "./extractErrorMessage";
import {ArraySchema} from "@colyseus/schema";

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
    throw new Error(`An error occurred while fetching the deck: ${errorMessage}`);
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
): Promise<{questionCard: TQuestionCard; remainingCount: number}> => {
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
        // deckId: true,
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

    // Create an instance of QuestionCardSchema and populate it with the random card's data
    const questionCardSchema = new QuestionCardSchema();
    questionCardSchema.id = randomCard.id;
    questionCardSchema.text = randomCard.text;
    questionCardSchema.spaces = randomCard.spaces;

    return {
      questionCard: questionCardSchema, // <-- returning an instance of QuestionCardSchema
      remainingCount: totalQuestions - 1,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(`An error occurred while fetching the deck: ${errorMessage}`);
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
): Promise<{answerCards: AnswerCard[]; remainingCount: number}> => {
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

    // Create an instance of AnswerCardSchema for each random answer card
    const answerCards = randomAnswers.map(answer => {
      const answerCardSchema = new AnswerCardSchema();
      answerCardSchema.id = answer.id;
      answerCardSchema.text = answer.text;
      return answerCardSchema;
    });

    return {
      answerCards: answerCards,
      remainingCount: totalAnswers - randomAnswers.length,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    throw new Error(`An error occurred while fetching the answer cards: ${errorMessage}`);
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
  const {darknessLevel, language, title} = options;

  // Modify the 'where' clause to include an optional title filter
  const whereClause: any = {
    AND: [
      {
        darknessLevel: {
          in: darknessLevel,
        },
      },
      {
        language: {
          in: language,
        },
      },
    ],
  };

  if (title) {
    whereClause.AND.push({
      title: {
        contains: title, // or startsWith, endsWith, etc.
      },
    });
  }

  // Find decks matching filters
  const decks = await db.deck.findMany({
    where: whereClause, // Using the modified where clause
    select: {
      id: true,
      title: true,
      description: true,
      darknessLevel: true,
      icon: true,
      language: true,
    },
  });

  // Initialize summary counters
  let totalDecks = 0;
  let totalQuestions = 0;
  let totalAnswers = 0;

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

      // Update summary counters
      totalDecks += 1;
      totalQuestions += questionCount;
      totalAnswers += answerCount;

      return {
        ...deck,
        questionCount,
        answerCount,
      };
    }),
  );

  // Return both the list of decks and the summary
  return {
    summary: {
      decks: totalDecks,
      questions: totalQuestions,
      answers: totalAnswers,
    },
    decks: decksWithCounts,
  };
};

export const getAllUniqueLanguages = async (): Promise<string[]> => {
  const uniqueLanguages = await db.deck.groupBy({
    by: ["language"],
  });

  // Extract language values, filter out nulls, and return them as an array
  return uniqueLanguages.map(item => item.language).filter((lang): lang is string => lang !== null);
};
