/**
 * @itemId 平台所有subList unique key
 */
export interface SubListUniKey<T = string | number> {
  itemId?: T;
}

export type AddSubKey<T> = T extends { itemId?: any }
  ? T
  : T & {
      itemId?: SubListUniKey;
    };
