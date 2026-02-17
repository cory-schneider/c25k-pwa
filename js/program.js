// C25K Program Data
// 27 workouts (9 weeks x 3 days), each with timed intervals.
// Durations in seconds. Standard Couch to 5K progression.

function repeat(pattern, times) {
  const result = [];
  for (let i = 0; i < times; i++) {
    result.push(...pattern);
  }
  return result;
}

function workout(week, day, intervals) {
  return {
    week,
    day,
    label: `Week ${week} \u2022 Day ${day}`,
    intervals: [
      { type: "warmup", duration: 300, cue: "Begin your warm-up walk." },
      ...intervals,
      { type: "cooldown", duration: 300, cue: "Cool down. Walk it out." },
    ],
  };
}

export const program = [
  // Week 1: 60s run / 90s walk x 8
  workout(1, 1, repeat([
    { type: "run", duration: 60, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
  ], 8)),
  workout(1, 2, repeat([
    { type: "run", duration: 60, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
  ], 8)),
  workout(1, 3, repeat([
    { type: "run", duration: 60, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
  ], 8)),

  // Week 2: 90s run / 120s walk x 6
  workout(2, 1, repeat([
    { type: "run", duration: 90, cue: "Start running." },
    { type: "walk", duration: 120, cue: "Walk." },
  ], 6)),
  workout(2, 2, repeat([
    { type: "run", duration: 90, cue: "Start running." },
    { type: "walk", duration: 120, cue: "Walk." },
  ], 6)),
  workout(2, 3, repeat([
    { type: "run", duration: 90, cue: "Start running." },
    { type: "walk", duration: 120, cue: "Walk." },
  ], 6)),

  // Week 3: 90s run, 90s walk, 180s run, 180s walk x 2
  workout(3, 1, repeat([
    { type: "run", duration: 90, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
  ], 2)),
  workout(3, 2, repeat([
    { type: "run", duration: 90, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
  ], 2)),
  workout(3, 3, repeat([
    { type: "run", duration: 90, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
  ], 2)),

  // Week 4: 180s run, 90s walk, 300s run, 150s walk, 180s run, 90s walk, 300s run
  workout(4, 1, [
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
    { type: "walk", duration: 150, cue: "Walk." },
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
  ]),
  workout(4, 2, [
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
    { type: "walk", duration: 150, cue: "Walk." },
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
  ]),
  workout(4, 3, [
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
    { type: "walk", duration: 150, cue: "Walk." },
    { type: "run", duration: 180, cue: "Start running." },
    { type: "walk", duration: 90, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
  ]),

  // Week 5 Day 1: 300s run, 180s walk, 300s run, 180s walk, 300s run
  workout(5, 1, [
    { type: "run", duration: 300, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
  ]),
  // Week 5 Day 2: 480s run, 300s walk, 480s run
  workout(5, 2, [
    { type: "run", duration: 480, cue: "Start running." },
    { type: "walk", duration: 300, cue: "Walk." },
    { type: "run", duration: 480, cue: "Start running." },
  ]),
  // Week 5 Day 3: 1200s (20 min) continuous run
  workout(5, 3, [
    { type: "run", duration: 1200, cue: "Start running." },
  ]),

  // Week 6 Day 1: 300s run, 180s walk, 480s run, 180s walk, 300s run
  workout(6, 1, [
    { type: "run", duration: 300, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
    { type: "run", duration: 480, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
    { type: "run", duration: 300, cue: "Start running." },
  ]),
  // Week 6 Day 2: 600s run, 180s walk, 600s run
  workout(6, 2, [
    { type: "run", duration: 600, cue: "Start running." },
    { type: "walk", duration: 180, cue: "Walk." },
    { type: "run", duration: 600, cue: "Start running." },
  ]),
  // Week 6 Day 3: 1500s (25 min) continuous run
  workout(6, 3, [
    { type: "run", duration: 1500, cue: "Start running." },
  ]),

  // Week 7: 1500s (25 min) continuous run x 3
  workout(7, 1, [
    { type: "run", duration: 1500, cue: "Start running." },
  ]),
  workout(7, 2, [
    { type: "run", duration: 1500, cue: "Start running." },
  ]),
  workout(7, 3, [
    { type: "run", duration: 1500, cue: "Start running." },
  ]),

  // Week 8: 1680s (28 min) continuous run x 3
  workout(8, 1, [
    { type: "run", duration: 1680, cue: "Start running." },
  ]),
  workout(8, 2, [
    { type: "run", duration: 1680, cue: "Start running." },
  ]),
  workout(8, 3, [
    { type: "run", duration: 1680, cue: "Start running." },
  ]),

  // Week 9: 1800s (30 min) continuous run x 3
  workout(9, 1, [
    { type: "run", duration: 1800, cue: "Start running." },
  ]),
  workout(9, 2, [
    { type: "run", duration: 1800, cue: "Start running." },
  ]),
  workout(9, 3, [
    { type: "run", duration: 1800, cue: "Start running." },
  ]),

  // Testing workout: alternating 10s intervals to verify audio cues
  {
    week: 0,
    day: 0,
    label: "Testing",
    intervals: repeat([
      { type: "run", duration: 10, cue: "Test." },
      { type: "walk", duration: 10, cue: "Test." },
    ], 6),
  },
];
