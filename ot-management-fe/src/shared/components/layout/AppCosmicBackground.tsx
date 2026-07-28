'use client';

/**
 * Decorative animated backdrop rendered once behind the whole app.
 *
 * The palette, particle type and glow are picked from the theme whose date
 * range covers today — see `@/shared/constants/seasonal-theme`. Resolution
 * happens after mount rather than on the server: the root layout is
 * statically prerendered, so a server-side `new Date()` would freeze the
 * backdrop at build time and a Christmas build would still be snowing in June.
 * The scene fades in (see `.cosmic-root`) so arriving one frame late reads as
 * intentional, and a timer re-checks at midnight so a long-lived tab rolls over
 * on its own.
 *
 * Element positions come from a seeded generator rather than Math.random, so a
 * given theme always produces the same sky. Scenes are cached per theme id —
 * building one is cheap, but re-running it on every render would reshuffle the
 * whole backdrop.
 *
 * Styling lives in src/styles/cosmic.css, including the light/dark split and
 * the prefers-reduced-motion fallback.
 */

import { useEffect, useState, type CSSProperties } from 'react';
import type { SeasonalTheme, SeasonalThemeId } from '@/shared/constants/seasonal-theme';
import { getSeasonalTheme, msUntilNextMidnight } from '@/shared/utils/seasonalTheme';

/** Deterministic PRNG (LCG). Same seed in, same sky out. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Seed derived from the theme id so each season gets its own stable layout. */
function seedFrom(id: string): number {
  let hash = 20260727;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

interface Scene {
  nebulas: {
    key: string;
    left: string;
    top: string;
    size: string;
    color: string;
    duration: string;
    delay: string;
  }[];
  stars: { key: string; left: string; top: string; size: string; duration: string; delay: string }[];
  meteors: {
    key: string;
    top: string;
    left: string;
    width: string;
    angle: string;
    duration: string;
    delay: string;
  }[];
  particles: {
    key: string;
    left: string;
    /** Vertical anchor: `top` for falling scenes, `bottom` for rising ones. */
    offset: string;
    width: string;
    height: string;
    light: string;
    dark: string;
    opacity: string;
    duration: string;
    delay: string;
  }[];
}

function buildScene(theme: SeasonalTheme): Scene {
  const random = createRandom(seedFrom(theme.id));
  const between = (min: number, max: number) => min + random() * (max - min);

  const nebulas = theme.nebulas.map((color, index) => ({
    key: `nebula-${index}`,
    left: `${between(-10, 65).toFixed(1)}%`,
    top: `${between(-15, 60).toFixed(1)}%`,
    size: `${between(30, 55).toFixed(1)}vw`,
    color,
    duration: `${between(18, 30).toFixed(1)}s`,
    delay: `-${between(0, 12).toFixed(1)}s`,
  }));

  const stars = theme.stars
    ? Array.from({ length: 80 }, (_, index) => ({
        key: `star-${index}`,
        left: `${between(0, 100).toFixed(2)}%`,
        top: `${between(0, 100).toFixed(2)}%`,
        size: `${between(1, 2.6).toFixed(2)}px`,
        duration: `${between(1.8, 5.5).toFixed(2)}s`,
        delay: `-${between(0, 5).toFixed(2)}s`,
      }))
    : [];

  const meteors = theme.meteors
    ? Array.from({ length: 5 }, (_, index) => ({
        key: `meteor-${index}`,
        top: `${between(-5, 55).toFixed(1)}%`,
        left: `${between(-25, 20).toFixed(1)}%`,
        width: `${between(90, 180).toFixed(0)}px`,
        angle: `${between(18, 38).toFixed(1)}deg`,
        duration: `${between(4, 8).toFixed(1)}s`,
        // Long, staggered gaps so meteors read as rare events rather than a stream.
        delay: `${between(1, 22).toFixed(1)}s`,
      }))
    : [];

  const spec = theme.particles;
  const rises = spec.motion === 'rise' || spec.motion === 'drift';

  const particles = Array.from({ length: spec.count }, (_, index) => {
    const size = between(spec.size[0], spec.size[1]);
    const duration = between(spec.duration[0], spec.duration[1]);

    return {
      key: `particle-${index}`,
      left: `${between(0, 100).toFixed(2)}%`,
      // Falling particles all enter from above; rising ones are spread up the
      // viewport so they don't surface as a single wave from the bottom edge.
      offset: rises ? `${between(-12, 55).toFixed(1)}%` : '0',
      width: `${size.toFixed(2)}px`,
      height: `${(size * (spec.aspect ?? 1)).toFixed(2)}px`,
      light: spec.colors.light[index % spec.colors.light.length],
      dark: spec.colors.dark[index % spec.colors.dark.length],
      opacity: between(0.35, 0.95).toFixed(2),
      duration: `${duration.toFixed(1)}s`,
      // Negative delay starts each particle mid-flight, so the scene is already
      // in motion on the first frame instead of building up from empty.
      delay: `-${between(0, duration).toFixed(1)}s`,
    };
  });

  return { nebulas, stars, meteors, particles };
}

const sceneCache = new Map<SeasonalThemeId, Scene>();

function getScene(theme: SeasonalTheme): Scene {
  const cached = sceneCache.get(theme.id);
  if (cached) return cached;

  const scene = buildScene(theme);
  sceneCache.set(theme.id, scene);
  return scene;
}

export function AppCosmicBackground() {
  const [theme, setTheme] = useState<SeasonalTheme | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const apply = () => {
      setTheme(getSeasonalTheme());
      // Re-check just after midnight so a tab left open overnight rolls over.
      timer = setTimeout(apply, msUntilNextMidnight() + 1000);
    };

    apply();
    return () => clearTimeout(timer);
  }, []);

  if (!theme) return null;

  const scene = getScene(theme);
  const rises = theme.particles.motion === 'rise' || theme.particles.motion === 'drift';

  return (
    <div
      className="cosmic-root"
      aria-hidden="true"
      data-season={theme.id}
      style={
        {
          '--cosmic-sky': theme.sky.light,
          '--cosmic-sky-dark': theme.sky.dark,
        } as CSSProperties
      }
    >
      <div className="cosmic-sky" />

      {theme.orb && (
        <div
          className="cosmic-orb"
          style={
            {
              left: theme.orb.left,
              top: theme.orb.top,
              width: theme.orb.size,
              height: theme.orb.size,
              '--orb-color': theme.orb.light,
              '--orb-color-dark': theme.orb.dark,
            } as CSSProperties
          }
        />
      )}

      {scene.nebulas.map((nebula) => (
        <div
          key={nebula.key}
          className="cosmic-nebula"
          style={{
            left: nebula.left,
            top: nebula.top,
            width: nebula.size,
            height: nebula.size,
            background: `radial-gradient(circle, ${nebula.color}, transparent 70%)`,
            animationDuration: nebula.duration,
            animationDelay: nebula.delay,
          }}
        />
      ))}

      <div className="cosmic-stars">
        {scene.stars.map((star) => (
          <span
            key={star.key}
            className="cosmic-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="cosmic-meteors">
        {scene.meteors.map((meteor) => (
          <span
            key={meteor.key}
            className="cosmic-meteor"
            style={
              {
                top: meteor.top,
                left: meteor.left,
                width: meteor.width,
                '--angle': meteor.angle,
                animationDuration: meteor.duration,
                animationDelay: meteor.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {scene.particles.map((particle) => (
        <span
          key={particle.key}
          className="cosmic-particle"
          data-shape={theme.particles.shape}
          data-motion={theme.particles.motion}
          style={
            {
              left: particle.left,
              [rises ? 'bottom' : 'top']: particle.offset,
              width: particle.width,
              height: particle.height,
              '--p-color': particle.light,
              '--p-color-dark': particle.dark,
              '--p-opacity': particle.opacity,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
