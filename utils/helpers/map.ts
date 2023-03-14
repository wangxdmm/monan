export function groupBy<K, V, I>(
  items: I[],
  keyMapper: (item: I) => K,
  valueMapper: (item: I) => V[]
): Map<K, V[]> {
  const group: Map<K, V[]> = new Map();

  items.forEach(item => {
    const key = keyMapper(item);
    const values = group.get(key) || [];
    values.push(...valueMapper(item));

    group.set(key, values);
  });

  return group;
}

export function toMap<K, V, I>(
  items: I[],
  keyMapper: (item: I) => K,
  valueMapper: (item: I) => V
): Map<K, V> {
  const group: Map<K, V> = new Map();

  items.forEach(item => {
    const key = keyMapper(item);
    group.set(key, valueMapper(item));
  });

  return group;
}
