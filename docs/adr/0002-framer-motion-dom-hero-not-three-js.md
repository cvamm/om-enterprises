# 0002 — Hero is framer-motion DOM transforms, not `@react-three/fiber`

**Status:** Accepted

## Context

§3 lists `@react-three/fiber` + `three` + `@react-three/drei` for "the hero
gallery and any product 3D viewers", and §8.1 describes the hero as a "3D
matrix" — `rotateY(-45 → -8deg)`, `rotateX`, `rotateZ`, `translateZ(-800px → 0)`,
four columns parallaxing on Y.

§9 then sets the hardest constraints in the document: initial JS ≤ 200 KB
gzipped, LCP ≤ 2.5s on a Moto G over 4G, Lighthouse ≥ 90.

Three.js is a ~600 KB gzipped dependency before a single object is placed. Even
lazy-loaded behind `Suspense`, it is fetched on the home route, which is the
route §9 measures. Adding it to the LCP path is close to 3× the entire JS
budget spent on one decorative effect.

## Decision

Build the hero with framer-motion DOM transforms. The specified motion — a
banner unfurling from `90vw × 80vh` to `100vw × 100vh`, then a CSS 3D matrix
settling through four rotation axes with parallaxed columns — is expressible
as a CSS 3D hierarchy with `perspective` on the parent and
`transform-style: preserve-3d` on the children. It is the same maths WebGL would
run, computed by the compositor instead of a GPU shader.

`@react-three/fiber` stays out of the home bundle entirely. If a genuine WebGL
need appears later (a product 3D viewer, per §13 task 17), it loads only on
that route, behind `next/dynamic`, and is measured on its own.

## Consequences

- Home route stays at 149.1 KB gz with 50.9 KB of headroom against the §9
  budget. Measured; see `PERF.md`.
- The hero must stay within what CSS 3D does well: transforms, opacity,
  filters. It cannot blur, deform or light surfaces. This is a real constraint
  and it is the point — §2's ambient shadows are `inset` box shadows and
  `radial-gradient` blurs, not shader work.
- `useScroll`/`useTransform`/`useSpring` are driven by scroll position, not by
  `requestAnimationFrame`, so the compositor owns the frame. That is the whole
  reason to prefer this on a Moto G.
- Parallax columns are 4 DOM nodes per column of tiles. If a future hero wants
  more than four layers, revisit this decision rather than adding a second
  animation system.