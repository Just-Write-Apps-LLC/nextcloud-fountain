import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  ActionSchema,
  BoneyardSchema,
  CharacterSchema,
  DialogueSchema,
  FountainNodeSchema,
  NoteSchema,
  ParentheticalSchema,
  parseFountainNode,
  safeParseFountainNode,
  SceneHeadingSchema,
  SectionSchema,
  SynopsisSchema,
  TitlePageSchema,
  TransitionSchema,
} from '../src/schema.js';
import type { FountainNode } from '../src/types.js';

describe('Fountain AST schemas and domain types', () => {
  describe('SceneHeadingSchema', () => {
    it('validates a minimal scene heading', () => {
      const node = SceneHeadingSchema.parse({
        type: 'scene_heading',
        text: 'INT. COFFEE SHOP - DAY',
      });
      expect(node.type).toBe('scene_heading');
      expect(node.text).toBe('INT. COFFEE SHOP - DAY');
      expect(node.sceneNumber).toBeUndefined();
      expect(node.setting).toBeUndefined();
    });

    it('validates a scene heading with scene number and setting', () => {
      const node = SceneHeadingSchema.parse({
        type: 'scene_heading',
        text: 'EXT. STREET - NIGHT',
        sceneNumber: '42',
        setting: 'EXT',
        interiorExteriorTag: 'EXT',
      });
      expect(node.sceneNumber).toBe('42');
      expect(node.setting).toBe('EXT');
      expect(node.interiorExteriorTag).toBe('EXT');
    });

    it('validates scene headings with all valid setting enum values', () => {
      const validSettings = ['INT', 'EXT', 'INT/EXT', 'I/E', 'OTHER'] as const;
      for (const setting of validSettings) {
        const node = SceneHeadingSchema.parse({
          type: 'scene_heading',
          text: 'SPACE STATION',
          setting,
          interiorExteriorTag: setting,
        });
        expect(node.setting).toBe(setting);
        expect(node.interiorExteriorTag).toBe(setting);
      }
    });

    it('rejects an empty text scene heading', () => {
      expect(() =>
        SceneHeadingSchema.parse({
          type: 'scene_heading',
          text: '',
        })
      ).toThrow(ZodError);
    });

    it('rejects a scene heading missing text', () => {
      expect(() =>
        SceneHeadingSchema.parse({
          type: 'scene_heading',
        })
      ).toThrow(ZodError);
    });

    it('rejects an invalid setting enum value', () => {
      expect(() =>
        SceneHeadingSchema.parse({
          type: 'scene_heading',
          text: 'INT. HOUSE - DAY',
          setting: 'OUTSIDE',
        })
      ).toThrow(ZodError);
    });

    it('rejects an invalid interiorExteriorTag enum value', () => {
      expect(() =>
        SceneHeadingSchema.parse({
          type: 'scene_heading',
          text: 'INT. HOUSE - DAY',
          interiorExteriorTag: 'UNKNOWN',
        })
      ).toThrow(ZodError);
    });
  });

  describe('ActionSchema', () => {
    it('validates standard action text with default centered false', () => {
      const node = ActionSchema.parse({
        type: 'action',
        text: 'He looks across the misty lake.',
      });
      expect(node.text).toBe('He looks across the misty lake.');
      expect(node.centered).toBe(false);
    });

    it('validates centered action text', () => {
      const node = ActionSchema.parse({
        type: 'action',
        text: 'THE END',
        centered: true,
        isCentered: true,
      });
      expect(node.centered).toBe(true);
      expect(node.isCentered).toBe(true);
    });

    it('rejects an action node missing text', () => {
      expect(() =>
        ActionSchema.parse({
          type: 'action',
        })
      ).toThrow(ZodError);
    });

    it('rejects non-boolean centered property', () => {
      expect(() =>
        ActionSchema.parse({
          type: 'action',
          text: 'Centered line',
          centered: 'true',
        })
      ).toThrow(ZodError);
    });

    it('rejects non-boolean isCentered property', () => {
      expect(() =>
        ActionSchema.parse({
          type: 'action',
          text: 'Centered line',
          isCentered: 1,
        })
      ).toThrow(ZodError);
    });
  });

  describe('CharacterSchema', () => {
    it('validates a standard character cue', () => {
      const node = CharacterSchema.parse({
        type: 'character',
        name: 'WALTER',
      });
      expect(node.name).toBe('WALTER');
      expect(node.dual).toBe(false);
      expect(node.extension).toBeUndefined();
    });

    it('validates character cue with dual dialogue and extension', () => {
      const node = CharacterSchema.parse({
        type: 'character',
        name: 'JESSE',
        dual: true,
        isDual: true,
        extension: 'O.S.',
      });
      expect(node.name).toBe('JESSE');
      expect(node.dual).toBe(true);
      expect(node.isDual).toBe(true);
      expect(node.extension).toBe('O.S.');
    });

    it('rejects an empty character name', () => {
      expect(() =>
        CharacterSchema.parse({
          type: 'character',
          name: '',
        })
      ).toThrow(ZodError);
    });

    it('rejects a character cue missing name', () => {
      expect(() =>
        CharacterSchema.parse({
          type: 'character',
        })
      ).toThrow(ZodError);
    });

    it('rejects non-boolean dual property', () => {
      expect(() =>
        CharacterSchema.parse({
          type: 'character',
          name: 'WALTER',
          dual: 'yes',
        })
      ).toThrow(ZodError);
    });

    it('rejects non-boolean isDual property', () => {
      expect(() =>
        CharacterSchema.parse({
          type: 'character',
          name: 'WALTER',
          isDual: 'yes',
        })
      ).toThrow(ZodError);
    });
  });

  describe('DialogueSchema', () => {
    it('validates dialogue spoken lines', () => {
      const node = DialogueSchema.parse({
        type: 'dialogue',
        text: 'We need to cook.',
      });
      expect(node.type).toBe('dialogue');
      expect(node.text).toBe('We need to cook.');
    });

    it('validates dialogue with empty string', () => {
      const node = DialogueSchema.parse({
        type: 'dialogue',
        text: '',
      });
      expect(node.text).toBe('');
    });

    it('rejects dialogue missing text', () => {
      expect(() =>
        DialogueSchema.parse({
          type: 'dialogue',
        })
      ).toThrow(ZodError);
    });
  });

  describe('ParentheticalSchema', () => {
    it('validates character direction parentheticals', () => {
      const node = ParentheticalSchema.parse({
        type: 'parenthetical',
        text: '(whispering)',
      });
      expect(node.type).toBe('parenthetical');
      expect(node.text).toBe('(whispering)');
    });

    it('rejects parenthetical missing text', () => {
      expect(() =>
        ParentheticalSchema.parse({
          type: 'parenthetical',
        })
      ).toThrow(ZodError);
    });
  });

  describe('TransitionSchema', () => {
    it('validates transition text', () => {
      const node = TransitionSchema.parse({
        type: 'transition',
        text: 'CUT TO:',
      });
      expect(node.type).toBe('transition');
      expect(node.text).toBe('CUT TO:');
    });

    it('rejects an empty transition', () => {
      expect(() =>
        TransitionSchema.parse({
          type: 'transition',
          text: '',
        })
      ).toThrow(ZodError);
    });

    it('rejects transition missing text', () => {
      expect(() =>
        TransitionSchema.parse({
          type: 'transition',
        })
      ).toThrow(ZodError);
    });
  });

  describe('SectionSchema', () => {
    it('validates outline section heading with depth', () => {
      const node = SectionSchema.parse({
        type: 'section',
        text: 'Act I',
        depth: 1,
      });
      expect(node.depth).toBe(1);
      expect(node.text).toBe('Act I');
    });

    it('rejects non-positive section depth', () => {
      expect(() =>
        SectionSchema.parse({
          type: 'section',
          text: 'Prologue',
          depth: 0,
        })
      ).toThrow(ZodError);
    });

    it('rejects negative section depth', () => {
      expect(() =>
        SectionSchema.parse({
          type: 'section',
          text: 'Prologue',
          depth: -3,
        })
      ).toThrow(ZodError);
    });

    it('rejects floating point section depth', () => {
      expect(() =>
        SectionSchema.parse({
          type: 'section',
          text: 'Prologue',
          depth: 1.5,
        })
      ).toThrow(ZodError);
    });

    it('rejects section missing depth', () => {
      expect(() =>
        SectionSchema.parse({
          type: 'section',
          text: 'Prologue',
        })
      ).toThrow(ZodError);
    });
  });

  describe('SynopsisSchema', () => {
    it('validates scene synopsis', () => {
      const node = SynopsisSchema.parse({
        type: 'synopsis',
        text: 'The detectives discover the hidden cache.',
      });
      expect(node.type).toBe('synopsis');
      expect(node.text).toBe('The detectives discover the hidden cache.');
    });

    it('rejects synopsis missing text', () => {
      expect(() =>
        SynopsisSchema.parse({
          type: 'synopsis',
        })
      ).toThrow(ZodError);
    });
  });

  describe('NoteSchema', () => {
    it('validates author commentary note', () => {
      const node = NoteSchema.parse({
        type: 'note',
        text: 'Fix pacing in next revision.',
      });
      expect(node.type).toBe('note');
      expect(node.text).toBe('Fix pacing in next revision.');
    });

    it('rejects note missing text', () => {
      expect(() =>
        NoteSchema.parse({
          type: 'note',
        })
      ).toThrow(ZodError);
    });
  });

  describe('BoneyardSchema', () => {
    it('validates hidden boneyard comment', () => {
      const node = BoneyardSchema.parse({
        type: 'boneyard',
        text: 'Cut scene from early draft.',
      });
      expect(node.type).toBe('boneyard');
      expect(node.text).toBe('Cut scene from early draft.');
    });

    it('rejects boneyard missing text', () => {
      expect(() =>
        BoneyardSchema.parse({
          type: 'boneyard',
        })
      ).toThrow(ZodError);
    });
  });

  describe('TitlePageSchema', () => {
    it('validates title page with default metadata dictionary', () => {
      const node = TitlePageSchema.parse({
        type: 'title_page',
      });
      expect(node.type).toBe('title_page');
      expect(node.metadata).toEqual({});
    });

    it('validates title page with metadata and structured fields', () => {
      const node = TitlePageSchema.parse({
        type: 'title_page',
        metadata: {
          Title: 'BRICK & STEEL',
          Credit: 'Written by',
          Author: 'Ben Force',
          Source: 'Story by Ben Force',
          'Draft date': '10/23/2026',
          Contact: ['123 Main St', '555-1234'],
        },
        title: 'BRICK & STEEL',
        credit: 'Written by',
        author: 'Ben Force',
        authors: ['Ben Force'],
        source: 'Story by Ben Force',
        draftDate: '10/23/2026',
        contact: ['123 Main St', '555-1234'],
      });
      expect(node.title).toBe('BRICK & STEEL');
      expect(node.author).toBe('Ben Force');
      expect(node.metadata['Title']).toBe('BRICK & STEEL');
      expect(node.contact).toEqual(['123 Main St', '555-1234']);
    });

    it('validates title page with single string author or authors', () => {
      const node = TitlePageSchema.parse({
        type: 'title_page',
        authors: 'Ben Force and John Doe',
      });
      expect(node.authors).toBe('Ben Force and John Doe');
    });

    it('rejects title page with non-string non-array metadata values', () => {
      expect(() =>
        TitlePageSchema.parse({
          type: 'title_page',
          metadata: {
            Title: 12345,
          },
        })
      ).toThrow(ZodError);
    });
  });

  describe('FountainNodeSchema discriminated union', () => {
    it('validates all 11 distinct node types through discriminated union', () => {
      const nodes: unknown[] = [
        { type: 'scene_heading', text: 'INT. OFFICE - DAY' },
        { type: 'action', text: 'Typing resumes.' },
        { type: 'character', name: 'ALICE' },
        { type: 'dialogue', text: 'Hello world.' },
        { type: 'parenthetical', text: '(sighs)' },
        { type: 'transition', text: 'FADE OUT.' },
        { type: 'section', text: 'Chapter 1', depth: 2 },
        { type: 'synopsis', text: 'Introductory sequence.' },
        { type: 'note', text: 'Verify lighting notes.' },
        { type: 'boneyard', text: 'Old dialogue option.' },
        { type: 'title_page', metadata: { Title: 'Sample Script' } },
      ];

      for (const item of nodes) {
        const parsed = FountainNodeSchema.parse(item);
        expect(parsed.type).toBe((item as { type: string }).type);
      }
    });

    it('rejects unknown node types with descriptive error', () => {
      expect(() =>
        FountainNodeSchema.parse({
          type: 'unsupported_element',
          text: 'bad data',
        })
      ).toThrow(ZodError);
    });

    it('rejects input missing discriminator type', () => {
      expect(() =>
        FountainNodeSchema.parse({
          text: 'No type provided',
        })
      ).toThrow(ZodError);
    });

    it('rejects malformed node matching known type', () => {
      expect(() =>
        FountainNodeSchema.parse({
          type: 'scene_heading',
          text: '',
        })
      ).toThrow(ZodError);
    });
  });

  describe('Validation and parsing helpers', () => {
    it('parseFountainNode returns parsed node for valid input', () => {
      const node: FountainNode = parseFountainNode({
        type: 'character',
        name: 'BOB',
      });
      expect(node.type).toBe('character');
      if (node.type === 'character') {
        expect(node.name).toBe('BOB');
        expect(node.dual).toBe(false);
      }
    });

    it('parseFountainNode throws ZodError for invalid input', () => {
      expect(() => parseFountainNode({ type: 'character', name: '' })).toThrow(
        ZodError
      );
    });

    it('safeParseFountainNode returns success true on valid input', () => {
      const result = safeParseFountainNode({
        type: 'action',
        text: 'Rain falls gently.',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('action');
      }
    });

    it('safeParseFountainNode returns success false with issues on invalid input', () => {
      const result = safeParseFountainNode({
        type: 'section',
        text: 'Bad Section',
        depth: -1,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ZodError);
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });
});
