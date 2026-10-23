# Fountain AST schemas and domain types architecture

## Problem

Fountain screenplays require structured representation for parsing, serialization, pagination, and editor synchronization across Nextcloud. Screenplay elements have distinct structural requirements: scene headings have scene numbers and interior or exterior tags, characters have dual-dialogue flags and extensions, sections have heading depths, actions have centering flags, and title pages have metadata dictionaries. Without a unified schema, parsers and consumers duplicate ad-hoc validation and risk illegal states. We define runtime Zod schemas and derive TypeScript domain types as a discriminated union on the `type` field.

## Usage (caller's view)

```typescript
import {
  parseFountainNode,
  safeParseFountainNode,
  SceneHeadingSchema,
  type FountainNode,
  type SceneHeading,
} from '@nextcloud-fountain/fountain-core';

// Validate and parse an incoming AST node
const node: FountainNode = parseFountainNode({
  type: 'scene_heading',
  text: 'INT. COFFEE SHOP - DAY',
  sceneNumber: '1',
  setting: 'INT',
});

// Type narrowing via discriminated union
switch (node.type) {
  case 'scene_heading':
    console.log(`Scene ${node.sceneNumber ?? ''}: ${node.text}`);
    break;
  case 'character':
    console.log(`Character ${node.name} (dual: ${node.dual})`);
    break;
  case 'dialogue':
    console.log(`Line: ${node.text}`);
    break;
}

// Safe parsing with structured error reporting
const result = safeParseFountainNode({ type: 'action', text: 'He steps outside.' });
if (result.success) {
  const action = result.data;
  console.log(action.text, action.centered);
} else {
  console.error(result.error.issues);
}
```

## Shape

Data structures first. All nodes share a discriminated union discriminator `type`:

1. `SceneHeadingSchema`:
   - `type`: `z.literal('scene_heading')`
   - `text`: `z.string().min(1)`
   - `sceneNumber`: `z.string().optional()`
   - `setting`: `z.enum(['INT', 'EXT', 'INT/EXT', 'I/E', 'OTHER']).optional()`
   - `interiorExteriorTag`: `z.enum(['INT', 'EXT', 'INT/EXT', 'I/E', 'OTHER']).optional()`

2. `ActionSchema`:
   - `type`: `z.literal('action')`
   - `text`: `z.string()`
   - `centered`: `z.boolean().default(false)`
   - `isCentered`: `z.boolean().optional()`

3. `CharacterSchema`:
   - `type`: `z.literal('character')`
   - `name`: `z.string().min(1)`
   - `dual`: `z.boolean().default(false)`
   - `isDual`: `z.boolean().optional()`
   - `extension`: `z.string().optional()`

4. `DialogueSchema`:
   - `type`: `z.literal('dialogue')`
   - `text`: `z.string()`

5. `ParentheticalSchema`:
   - `type`: `z.literal('parenthetical')`
   - `text`: `z.string()`

6. `TransitionSchema`:
   - `type`: `z.literal('transition')`
   - `text`: `z.string().min(1)`

7. `SectionSchema`:
   - `type`: `z.literal('section')`
   - `text`: `z.string()`
   - `depth`: `z.number().int().min(1)`

8. `SynopsisSchema`:
   - `type`: `z.literal('synopsis')`
   - `text`: `z.string()`

9. `NoteSchema`:
   - `type`: `z.literal('note')`
   - `text`: `z.string()`

10. `BoneyardSchema`:
    - `type`: `z.literal('boneyard')`
    - `text`: `z.string()`

11. `TitlePageSchema`:
    - `type`: `z.literal('title_page')`
    - `metadata`: `z.record(z.string(), z.union([z.string(), z.array(z.string())])).default({})`
    - `title`: `z.union([z.string(), z.array(z.string())]).optional()`
    - `credit`: `z.union([z.string(), z.array(z.string())]).optional()`
    - `author`: `z.union([z.string(), z.array(z.string())]).optional()`
    - `authors`: `z.array(z.string()).optional()`
    - `source`: `z.union([z.string(), z.array(z.string())]).optional()`
    - `draftDate`: `z.union([z.string(), z.array(z.string())]).optional()`
    - `contact`: `z.union([z.string(), z.array(z.string())]).optional()`

12. `FountainNodeSchema`:
    - `z.discriminatedUnion('type', [ ...all 11 schemas... ])`

13. Helpers:
    - `parseFountainNode(input: unknown): FountainNode`
    - `safeParseFountainNode(input: unknown): z.SafeParseReturnType<unknown, FountainNode>`

Validation lives strictly at the boundary (per `principle-boundary-discipline`). TypeScript types are derived directly from authoritative Zod schemas via `z.infer` (per `principle-type-system-discipline`). The domain is modeled as a sum type (per `principle-model-the-domain`).

## Synthesis decision

Candidate 1 (Flat discriminated union with explicit property schemas and aliases) is selected over Candidate 2 (Nested composite screenplay tree). A linear token stream AST matches Fountain's line-oriented specification, simplifies parser token streaming (issue 2), and directly maps to ProseMirror flat block nodes (issue 3).

## Tradeoffs accepted

- We accept dual property aliases (`setting` and `interiorExteriorTag`, `centered` and `isCentered`, `dual` and `isDual`) in exchange for backward and ergonomic interop across issue descriptions and callers.
- We accept optional title page fields alongside a catch-all metadata dictionary in exchange for both typed property access and custom metadata keys.

## Alternatives considered

- Nested dialogue blocks (`DialogueBlock` containing `Character`, optional `Parenthetical`, and `Dialogue`): Rejected because Fountain token streams are sequential lines, and forcing tree nesting complicates roundtrip serialization and incremental editing.

## Open questions and risks

- None identified. Schemas cover all 11 requirements from issue 1.

## Next implementation step

Scaffold the monorepo root and `packages/fountain-core` workspace package, then implement `schema.ts`, `types.ts`, and Vitest test suites.
