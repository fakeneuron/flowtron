export function groupBy<T, K extends string | number>(
    items: T[],
    keySelector: (item: T) => K
): Record<K, T[]> {
    const groups = {} as Record<K, T[]>;
    for (const item of items) {
        const key = keySelector(item);
        if (!Object.prototype.hasOwnProperty.call(groups, key)) {
            groups[key] = [];
        }
        groups[key].push(item);
    }
    return groups;
}


