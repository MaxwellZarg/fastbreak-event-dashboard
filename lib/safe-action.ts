export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function createSafeAction<TInput, TOutput>(
  handler: (input: TInput) => Promise<TOutput>
): (input: TInput) => Promise<ActionResult<TOutput>> {
  return async (input: TInput) => {
    try {
      const data = await handler(input);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Something went wrong",
      };
    }
  };
}
