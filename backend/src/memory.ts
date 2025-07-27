type Slots = Record<string, any>;
const store = new Map<string, Slots>();

export function getSlots(id: string): Slots {
  if (!store.has(id)) store.set(id, {});
  return store.get(id)!;
}

export function setSlot(id: string, key: string, value: any) {
  const s = getSlots(id);
  s[key] = value;
}
