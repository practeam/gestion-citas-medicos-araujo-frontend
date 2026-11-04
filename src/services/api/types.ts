/** Envoltorio común de las respuestas del backend (`ApiResponse[T]` en OpenAPI). */
export interface ApiData<T> {
  result: T | null;
  details: Record<string, unknown> | null;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: ApiData<T>;
  code: number;
}

/** `PageResult[T]` de OpenAPI: respuesta paginada dentro de `data.result`. */
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
