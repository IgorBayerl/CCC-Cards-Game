import {Router, Request, Response} from "express";
import db from "../lib/database";
import {getAllUniqueLanguages, getDecksWithCardCounts} from "../lib/deckUtils";
import {asyncHandler} from "../lib/utils";
import zParse from "../lib/zParse";
import {
  AnswerSchema,
  DeckFiltersSchema,
  DeckSchema,
  DeckWithCardsSchema,
  QuestionSchema,
  TAnswer,
  TDeck,
  TQuestion,
} from "./schemas/deckSchemas";

const router = Router();

router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const filters = await zParse(DeckFiltersSchema, req.body);
    const decks = await getDecksWithCardCounts(filters);

    res.status(200).json({
      message: "Fetched decks successfully",
      filters,
      data: decks,
    });
  }),
);

// Endpoint to add a new Question
router.post(
  "/questions/new",
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData: TQuestion = await zParse(QuestionSchema, req.body);
    const newQuestion = await db.question.create({
      data: validatedData,
    });
    res.status(201).json({
      message: "Question created successfully",
      data: newQuestion,
    });
  }),
);

// Endpoint to add a new Answer
router.post(
  "/answers/new",
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData: TAnswer = await zParse(AnswerSchema, req.body);
    const newAnswer = await db.answer.create({
      data: validatedData,
    });
    res.status(201).json({
      message: "Answer created successfully",
      data: newAnswer,
    });
  }),
);

// Endpoint to add a new Deck
router.post(
  "/decks/new",
  asyncHandler(async (req: Request, res: Response) => {
    const validatedData: TDeck = await zParse(DeckSchema, req.body);
    const newDeck = await db.deck.create({
      data: validatedData,
    });
    res.status(201).json({
      message: "Deck created successfully",
      data: newDeck,
    });
  }),
);

// Endpoint to add a new Deck with associated questions and answers
router.post(
  "/decks/new-with-cards",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate the input data
    const validatedData = await zParse(DeckWithCardsSchema, req.body);

    // Destructure validated data
    const {title, description, darknessLevel, icon, language, cards} = validatedData;

    // Create new deck
    const newDeck = await db.deck.create({
      data: {
        title,
        description,
        darknessLevel,
        icon,
        language,
      },
    });

    // Create associated questions and answers
    const questions = cards.questions.map(q => {
      return db.question.create({
        data: {
          text: q.text,
          spaces: q.spaces,
          deckId: newDeck.id,
        },
      });
    });

    const answers = cards.answers.map(a => {
      return db.answer.create({
        data: {
          text: a.text,
          deckId: newDeck.id,
        },
      });
    });

    // Wait for all to be created
    await Promise.all([...questions, ...answers]);

    const responseData = {
      ...newDeck,
      questions: cards.questions.length,
      answers: cards.answers.length,
    };

    // Return new deck along with associated questions and answers
    res.status(201).json({
      message: "Deck created successfully",
      data: responseData,
    });
  }),
);

// Endpoint to get all unique languages from the Deck table
router.get(
  "/languages",
  asyncHandler(async (req: Request, res: Response) => {
    const uniqueLanguages = await getAllUniqueLanguages();
    res.status(200).json({
      message: "Fetched languages successfully",
      data: uniqueLanguages,
    });
  }),
);

export default router;
