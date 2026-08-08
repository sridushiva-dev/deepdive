export function calculateNodePositions(
  nodes: Array<{ id: string; parentId?: string | null; depth: number }>
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const HORIZONTAL_GAP = 220;
  const VERTICAL_GAP = 100;

  const childrenMap = new Map<string | null, string[]>();
  for (const node of nodes) {
    const parent = node.parentId ?? null;
    if (!childrenMap.has(parent)) childrenMap.set(parent, []);
    childrenMap.get(parent)!.push(node.id);
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  function layout(nodeId: string, depth: number, yOffset: number): number {
    const node = nodeMap.get(nodeId);
    if (!node) return yOffset;

    const children = childrenMap.get(nodeId) ?? [];
    let childStartY = yOffset;

    if (children.length === 0) {
      positions.set(nodeId, { x: depth * HORIZONTAL_GAP, y: yOffset });
      return yOffset + VERTICAL_GAP;
    }
    for (const childId of children) {
      childStartY = layout(childId, depth + 1, childStartY);
    }

    const firstChild = positions.get(children[0]);
    const lastChild = positions.get(children[children.length - 1]);
    const midY =
      firstChild && lastChild
        ? (firstChild.y + lastChild.y) / 2
        : yOffset;

    positions.set(nodeId, { x: depth * HORIZONTAL_GAP, y: midY });
    return childStartY;
  }

  const roots = childrenMap.get(null) ?? [];
  let y = 0;
  for (const rootId of roots) {
    y = layout(rootId, 0, y);
  }

  return positions;
}
