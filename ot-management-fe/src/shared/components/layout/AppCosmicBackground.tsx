/**
 * Decorative animated backdrop rendered once behind the whole app: a nebula
 * wash, a twinkling starfield, meteors and falling snow.
 *
 * Deliberately a Server Component — it is pure markup with no interactivity, so
 * nothing ships to the browser and the random layout is baked into the HTML.
 * Positions come from a seeded generator rather than Math.random so every build
 * and every render produce the same sky (and never a hydration mismatch).
 *
 * Styling lives in src/styles/cosmic.css, including the light/dark split and the
 * prefers-reduced-motion fallback.
 */

/** Deterministic PRNG (LCG). Same seed in, same sky out. */
function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const random = createRandom(20260727);

/** Pick a float in [min, max). */
const between = (min: number, max: number) => min + random() * (max - min);

const NEBULAS = Array.from({ length: 3 }, (_, index) => ({
  key: `nebula-${index}`,
  left: `${between(-10, 65)}%`,
  top: `${between(-15, 60)}%`,
  size: `${between(30, 55)}vw`,
  color: ['rgba(99,102,241,0.55)', 'rgba(168,85,247,0.45)', 'rgba(6,182,212,0.4)'][index],
  duration: `${between(18, 30).toFixed(1)}s`,
  delay: `-${between(0, 12).toFixed(1)}s`,
}));

const STARS = Array.from({ length: 80 }, (_, index) => {
  const size = between(1, 2.6);
  return {
    key: `star-${index}`,
    left: `${between(0, 100).toFixed(2)}%`,
    top: `${between(0, 100).toFixed(2)}%`,
    size: `${size.toFixed(2)}px`,
    duration: `${between(1.8, 5.5).toFixed(2)}s`,
    delay: `-${between(0, 5).toFixed(2)}s`,
  };
});

const METEORS = Array.from({ length: 5 }, (_, index) => ({
  key: `meteor-${index}`,
  top: `${between(-5, 55).toFixed(1)}%`,
  left: `${between(-25, 20).toFixed(1)}%`,
  width: `${between(90, 180).toFixed(0)}px`,
  angle: `${between(18, 38).toFixed(1)}deg`,
  duration: `${between(4, 8).toFixed(1)}s`,
  // Long, staggered gaps so meteors read as rare events rather than a stream.
  delay: `${between(1, 22).toFixed(1)}s`,
}));

const FLAKES = Array.from({ length: 34 }, (_, index) => {
  const size = between(2, 5);
  return {
    key: `flake-${index}`,
    left: `${between(0, 100).toFixed(2)}%`,
    size: `${size.toFixed(2)}px`,
    duration: `${between(9, 20).toFixed(1)}s`,
    delay: `-${between(0, 20).toFixed(1)}s`,
    opacity: between(0.35, 0.9).toFixed(2),
  };
});

export function AppCosmicBackground() {
  return (
    <div className="cosmic-root" aria-hidden="true">
      <div className="cosmic-sky" />

      {NEBULAS.map((nebula) => (
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
        {STARS.map((star) => (
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
        {METEORS.map((meteor) => (
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
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {FLAKES.map((flake) => (
        <span
          key={flake.key}
          className="cosmic-flake"
          style={
            {
              left: flake.left,
              width: flake.size,
              height: flake.size,
              '--flake-opacity': flake.opacity,
              animationDuration: flake.duration,
              animationDelay: flake.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
