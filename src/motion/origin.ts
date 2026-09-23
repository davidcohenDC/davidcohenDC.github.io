// Where a movement starts from: the point a change spreads out of. The
// theme's reveal opens from the centre of the control that was pressed.
export type Origin = { x: number; y: number }

export function centreOf(element: Element): Origin {
  const box = element.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}
