import type { z } from 'zod';
import type {
  SceneSettingEnum,
  SceneHeadingSchema,
  ActionSchema,
  CharacterSchema,
  DialogueSchema,
  ParentheticalSchema,
  TransitionSchema,
  SectionSchema,
  SynopsisSchema,
  NoteSchema,
  BoneyardSchema,
  TitlePageMetadataValueSchema,
  TitlePageSchema,
  FountainNodeSchema,
} from './schema.js';

export type SceneSetting = z.infer<typeof SceneSettingEnum>;
export type SceneHeading = z.infer<typeof SceneHeadingSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Dialogue = z.infer<typeof DialogueSchema>;
export type Parenthetical = z.infer<typeof ParentheticalSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Synopsis = z.infer<typeof SynopsisSchema>;
export type Note = z.infer<typeof NoteSchema>;
export type Boneyard = z.infer<typeof BoneyardSchema>;
export type TitlePageMetadataValue = z.infer<typeof TitlePageMetadataValueSchema>;
export type TitlePage = z.infer<typeof TitlePageSchema>;
export type FountainNode = z.infer<typeof FountainNodeSchema>;
export type FountainNodeType = FountainNode['type'];
