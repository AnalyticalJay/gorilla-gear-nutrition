export type CatalogueFilterState = {
  search: string;
  categoryId?: number;
  brandId?: number;
  subcategoryId?: number;
  shopCollectionId?: number;
  maxPrice: number;
};

export function countActiveCatalogueFilters(state: CatalogueFilterState): number {
  return (
    Number(Boolean(state.search.trim())) +
    Number(state.categoryId !== undefined) +
    Number(state.brandId !== undefined) +
    Number(state.subcategoryId !== undefined) +
    Number(state.shopCollectionId !== undefined) +
    Number(state.maxPrice > 0)
  );
}

export function createEmptyCatalogueFilterState(): CatalogueFilterState {
  return {
    search: "",
    categoryId: undefined,
    brandId: undefined,
    subcategoryId: undefined,
    shopCollectionId: undefined,
    maxPrice: 0,
  };
}
