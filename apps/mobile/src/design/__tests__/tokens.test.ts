import { aliases, colors, motion, shape, type } from '../tokens';

describe('design tokens', () => {
  describe('canonical groups', () => {
    it('defines colors', () => {
      expect(colors).toBeDefined();
      expect(typeof colors).toBe('object');
    });

    it('defines type', () => {
      expect(type).toBeDefined();
      expect(typeof type).toBe('object');
    });

    it('defines shape', () => {
      expect(shape).toBeDefined();
      expect(typeof shape).toBe('object');
    });

    it('defines motion', () => {
      expect(motion).toBeDefined();
      expect(typeof motion).toBe('object');
    });

    it('defines aliases', () => {
      expect(aliases).toBeDefined();
      expect(typeof aliases).toBe('object');
    });
  });

  describe('colors', () => {
    const colorKeys = [
      'bg0',
      'bg1',
      'bg2',
      'bg3',
      'ink0',
      'ink1',
      'ink2',
      'ink3',
      'ink4',
      'line',
      'lineStrong',
      'lineFaint',
      'hot',
      'hotSoft',
      'hotText',
      'lime',
      'limeSoft',
      'ice',
      'red',
      'amber',
      'paper',
      'paperDim',
    ] as const;

    it.each(colorKeys)('has color %s as a string', (key) => {
      const value = colors[key];
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });

    it('hex color values start with hash and have length 7', () => {
      const hexKeys: Array<keyof typeof colors> = [
        'bg0',
        'bg1',
        'bg2',
        'bg3',
        'ink0',
        'ink1',
        'ink2',
        'ink3',
        'ink4',
        'hot',
        'hotSoft',
        'hotText',
        'lime',
        'limeSoft',
        'ice',
        'red',
        'amber',
        'paper',
        'paperDim',
      ];
      for (const key of hexKeys) {
        const value = colors[key];
        expect(value.startsWith('#')).toBe(true);
        expect(value.length).toBe(7);
      }
    });

    it('rgba line values start with rgba', () => {
      expect(colors.line.startsWith('rgba')).toBe(true);
      expect(colors.lineStrong.startsWith('rgba')).toBe(true);
      expect(colors.lineFaint.startsWith('rgba')).toBe(true);
    });
  });

  describe('type', () => {
    it('display family includes Space Grotesk', () => {
      expect(type.display).toContain('Space Grotesk');
    });

    it('sans family includes Space Grotesk', () => {
      expect(type.sans).toContain('Space Grotesk');
    });

    it('mono family includes JetBrains Mono', () => {
      expect(type.mono).toContain('JetBrains Mono');
    });
  });

  describe('shape', () => {
    it('has radii at the expected values', () => {
      expect(shape.rXs).toBe(4);
      expect(shape.rSm).toBe(8);
      expect(shape.rMd).toBe(12);
      expect(shape.rLg).toBe(18);
      expect(shape.rPill).toBe(999);
    });
  });

  describe('motion', () => {
    it('has ease cubic-bezier string', () => {
      expect(motion.ease).toBe('cubic-bezier(0.2, 0.7, 0.2, 1)');
    });

    it('has ease bezier tuple', () => {
      expect(motion.easeBezier).toEqual([0.2, 0.7, 0.2, 1]);
    });

    it('has duration 220ms', () => {
      expect(motion.dur).toBe(220);
    });
  });

  describe('aliases', () => {
    it('ember references colors.hot', () => {
      expect(aliases.ember).toBe(colors.hot);
    });

    it('emberSoft references colors.hotSoft', () => {
      expect(aliases.emberSoft).toBe(colors.hotSoft);
    });

    it('sage references colors.lime', () => {
      expect(aliases.sage).toBe(colors.lime);
    });

    it('sageSoft references colors.limeSoft', () => {
      expect(aliases.sageSoft).toBe(colors.limeSoft);
    });

    it('night references colors.bg0', () => {
      expect(aliases.night).toBe(colors.bg0);
    });

    it('nightSoft references colors.bg1', () => {
      expect(aliases.nightSoft).toBe(colors.bg1);
    });

    it('nightLine references colors.line', () => {
      expect(aliases.nightLine).toBe(colors.line);
    });

    it('slate references colors.ice', () => {
      expect(aliases.slate).toBe(colors.ice);
    });

    it('ink references colors.ink0', () => {
      expect(aliases.ink).toBe(colors.ink0);
    });

    it('paperSoft references colors.bg1', () => {
      expect(aliases.paperSoft).toBe(colors.bg1);
    });

    it('paperBright references colors.bg2', () => {
      expect(aliases.paperBright).toBe(colors.bg2);
    });

    it('serif references type.display', () => {
      expect(aliases.serif).toBe(type.display);
    });

    it('muted references colors.ink2', () => {
      expect(aliases.muted).toBe(colors.ink2);
    });

    it('emberDeep is a 7-char hex string', () => {
      expect(typeof aliases.emberDeep).toBe('string');
      expect(aliases.emberDeep.startsWith('#')).toBe(true);
      expect(aliases.emberDeep.length).toBe(7);
    });

    it('amberSoft is a 7-char hex string', () => {
      expect(typeof aliases.amberSoft).toBe('string');
      expect(aliases.amberSoft.startsWith('#')).toBe(true);
      expect(aliases.amberSoft.length).toBe(7);
    });
  });
});
