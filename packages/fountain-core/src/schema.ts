import { z } from 'zod';
import type { FountainNode } from './types.js';

export const SceneSettingEnum = z.enum(['INT', 'EXT', 'INT/EXT', 'I/E', 'OTHER']);
export const SceneSettingSchema = SceneSettingEnum;

export const SceneHeadingSchema = z.object({
  type: z.literal('scene_heading'),
  text: z.string().min(1, 'Scene heading text must not be empty'),
  sceneNumber: z.string().optional(),
  setting: SceneSettingEnum.optional(),
  interiorExteriorTag: SceneSettingEnum.optional(),
});

export const ActionSchema = z.object({
  type: z.literal('action'),
  text: z.string(),
  centered: z.boolean().default(false),
  isCentered: z.boolean().optional(),
});

export const CharacterSchema = z.object({
  type: z.literal('character'),
  name: z.string().min(1, 'Character name must not be empty'),
  dual: z.boolean().default(false),
  isDual: z.boolean().optional(),
  extension: z.string().optional(),
});

export const DialogueSchema = z.object({
  type: z.literal('dialogue'),
  text: z.string(),
});

export const ParentheticalSchema = z.object({
  type: z.literal('parenthetical'),
  text: z.string(),
});

export const TransitionSchema = z.object({
  type: z.literal('transition'),
  text: z.string().min(1, 'Transition text must not be empty'),
});

export const SectionSchema = z.object({
  type: z.literal('section'),
  text: z.string(),
  depth: z.number().int().min(1, 'Section depth must be an integer greater than or equal to 1'),
});

export const SynopsisSchema = z.object({
  type: z.literal('synopsis'),
  text: z.string(),
});

export const NoteSchema = z.object({
  type: z.literal('note'),
  text: z.string(),
});

export const BoneyardSchema = z.object({
  type: z.literal('boneyard'),
  text: z.string(),
});

export const TitlePageMetadataValueSchema = z.union([
  z.string(),
  z.array(z.string()),
]);

export const TitlePageSchema = z.object({
  type: z.literal('title_page'),
  metadata: z.record(z.string(), TitlePageMetadataValueSchema).default({}),
  title: TitlePageMetadataValueSchema.optional(),
  credit: TitlePageMetadataValueSchema.optional(),
  author: TitlePageMetadataValueSchema.optional(),
  authors: TitlePageMetadataValueSchema.optional(),
  source: TitlePageMetadataValueSchema.optional(),
  draftDate: TitlePageMetadataValueSchema.optional(),
  contact: TitlePageMetadataValueSchema.optional(),
});

export const FountainNodeSchema = z.discriminatedUnion('type', [
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
  TitlePageSchema,
]);

export function parseFountainNode(input: unknown): FountainNode {
  return FountainNodeSchema.parse(input);
}

export function safeParseFountainNode(
  input: unknown
): z.SafeParseReturnType<unknown, FountainNode> {
  return FountainNodeSchema.safeParse(input);
}
