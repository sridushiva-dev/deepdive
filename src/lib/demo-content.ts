export interface DemoNode {
  id: string;
  label: string;
  summary: string;
  body: string;
  children?: DemoNode[];
}

export interface DemoJourney {
  id: string;
  title: string;
  rootTopic: string;
  tree: DemoNode;
  cannedResponses: Record<string, string[]>;
}

export const DEMO_JOURNEYS: DemoJourney[] = [
  {
    id: "black-holes",
    title: "How Black Holes Form",
    rootTopic: "Black Holes",
    tree: {
      id: "root",
      label: "Black Holes",
      summary: "Regions of spacetime where gravity is so strong nothing can escape.",
      body: "A black hole forms when a massive star collapses under its own gravity at the end of its life. The core compresses beyond a point where our current physics fully describes what happens inside.",
      children: [
        {
          id: "stellar-collapse",
          label: "Stellar Collapse",
          summary: "How massive stars end their lives.",
          body: "When a star exhausts its nuclear fuel, it can no longer support itself against gravity. For stars above ~8 solar masses, the core collapses in seconds.",
          children: [
            {
              id: "supernova",
              label: "Supernova",
              summary: "The explosive death of a massive star.",
              body: "The outer layers rebound and explode outward while the core continues collapsing. This explosion can outshine entire galaxies briefly.",
            },
            {
              id: "neutron-star",
              label: "Neutron Stars",
              summary: "What happens if collapse stops early.",
              body: "If the core mass is below ~3 solar masses, collapse may stop at a neutron star — incredibly dense but not a black hole.",
            },
          ],
        },
        {
          id: "event-horizon",
          label: "Event Horizon",
          summary: "The point of no return.",
          body: "The event horizon is the boundary beyond which light cannot escape. It's not a physical surface but a mathematical boundary in spacetime.",
          children: [
            {
              id: "schwarzschild",
              label: "Schwarzschild Radius",
              summary: "The size of the event horizon.",
              body: "For a non-rotating black hole, the Schwarzschild radius is 2GM/c². Earth's mass would form a horizon about 9mm across.",
            },
          ],
        },
        {
          id: "spaghettification",
          label: "Spaghettification",
          summary: "What falling in feels like.",
          body: "Tidal forces stretch objects vertically and compress them horizontally as they approach — like spaghetti. The effect intensifies closer to the center.",
        },
      ],
    },
    cannedResponses: {
      default: [
        "That's a fascinating direction. In this region of the ocean, gravity warps spacetime so intensely that our usual intuitions break down.",
        "Let's dive deeper — each layer reveals something more surprising about how the universe works.",
        "Notice how this concept connects to what we explored earlier. The constellation grows as we go deeper.",
      ],
      stellar: [
        "Stellar collapse is where the story begins. A star's entire life is a balance between gravity pulling inward and fusion pushing outward.",
        "When fusion stops, that balance shatters. The core falls inward at a significant fraction of light speed.",
      ],
      horizon: [
        "The event horizon isn't something you could touch — it's the boundary where escape velocity exceeds the speed of light.",
        "From outside, time appears to slow for anything approaching the horizon. This is gravitational time dilation.",
      ],
    },
  },
  {
    id: "python-basics",
    title: "Python for Curious Minds",
    rootTopic: "Python Programming",
    tree: {
      id: "root",
      label: "Python Programming",
      summary: "A language designed for clarity and exploration.",
      body: "Python reads almost like English. It powers AI, web apps, data science, and automation. Perfect for curious learners who want to build things quickly.",
      children: [
        {
          id: "variables",
          label: "Variables & Types",
          summary: "Storing information in memory.",
          body: "Variables are labels for values. Python figures out types automatically: integers, floats, strings, booleans, lists, and more.",
          children: [
            {
              id: "strings",
              label: "Strings",
              summary: "Working with text.",
              body: "Strings are sequences of characters. You can slice, concatenate, and format them. f-strings make embedding values elegant: f'Hello {name}'.",
            },
            {
              id: "lists",
              label: "Lists",
              summary: "Ordered collections.",
              body: "Lists hold multiple values in order. They're mutable — you can add, remove, and change elements. Lists are one of Python's superpowers.",
            },
          ],
        },
        {
          id: "control-flow",
          label: "Control Flow",
          summary: "Making decisions and loops.",
          body: "if/elif/else lets programs branch. for and while loops repeat actions. Together they give programs logic and rhythm.",
          children: [
            {
              id: "loops",
              label: "Loops",
              summary: "Repetition patterns.",
              body: "for item in collection: is Python's most common loop. while runs until a condition is false. break and continue fine-tune behavior.",
            },
          ],
        },
        {
          id: "functions",
          label: "Functions",
          summary: "Reusable blocks of code.",
          body: "Functions encapsulate logic. def greet(name): return f'Hello {name}'. They accept parameters and can return values. Functions are how you build abstractions.",
        },
      ],
    },
    cannedResponses: {
      default: [
        "Great question! Python's philosophy is readability. Let's explore this concept step by step.",
        "Each concept in Python builds on the last. Your constellation shows how they connect.",
        "Dive deeper — there's always another layer to understand.",
      ],
    },
  },
];

export function getDemoResponsesForNode(nodeId: string): string[] {
  const journey = DEMO_JOURNEYS[0];
  if (nodeId.includes("stellar") || nodeId.includes("supernova") || nodeId.includes("neutron")) {
    return journey.cannedResponses.stellar ?? journey.cannedResponses.default;
  }
  if (nodeId.includes("horizon") || nodeId.includes("schwarz")) {
    return journey.cannedResponses.horizon ?? journey.cannedResponses.default;
  }
  return journey.cannedResponses.default;
}

export function findDemoNode(tree: DemoNode, id: string): DemoNode | null {
  if (tree.id === id) return tree;
  if (tree.children) {
    for (const child of tree.children) {
      const found = findDemoNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function flattenDemoTree(
  tree: DemoNode,
  parentId: string | null = null,
  depth = 0
): Array<{ node: DemoNode; parentId: string | null; depth: number }> {
  const result: Array<{ node: DemoNode; parentId: string | null; depth: number }> = [
    { node: tree, parentId, depth },
  ];
  if (tree.children) {
    for (const child of tree.children) {
      result.push(...flattenDemoTree(child, tree.id, depth + 1));
    }
  }
  return result;
}
