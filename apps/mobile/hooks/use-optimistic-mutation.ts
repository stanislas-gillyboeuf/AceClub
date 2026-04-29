import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";

export interface OptimisticContext<TData> {
  previous: TData | undefined;
  key: QueryKey;
}

export interface UseOptimisticMutationOptions<TVar, TResult, TData> {
  mutationFn: (variables: TVar) => Promise<TResult>;
  queryKey: (variables: TVar) => QueryKey;
  optimisticUpdate?: (previous: TData, variables: TVar) => TData;
  invalidate?: (variables: TVar) => readonly QueryKey[];
  removeOnMutate?: boolean;
  onSuccess?: (
    data: TResult,
    variables: TVar,
    context: OptimisticContext<TData>
  ) => unknown | Promise<unknown>;
  onError?: (
    error: Error,
    variables: TVar,
    context: OptimisticContext<TData> | undefined
  ) => unknown | Promise<unknown>;
}

export function useOptimisticMutation<TVar, TResult, TData = unknown>(
  options: UseOptimisticMutationOptions<TVar, TResult, TData>
): UseMutationResult<TResult, Error, TVar, OptimisticContext<TData>> {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TVar, OptimisticContext<TData>>({
    mutationFn: options.mutationFn,
    onMutate: async (variables) => {
      const key = options.queryKey(variables);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<TData>(key);

      if (options.removeOnMutate) {
        queryClient.removeQueries({ queryKey: key });
      } else if (options.optimisticUpdate && previous !== undefined) {
        queryClient.setQueryData<TData>(key, options.optimisticUpdate(previous, variables));
      }

      return { previous, key };
    },
    onError: (err, variables, context) => {
      if (context && context.previous !== undefined) {
        queryClient.setQueryData(context.key, context.previous);
      }
      options.onError?.(err, variables, context);
    },
    onSuccess: options.onSuccess,
    onSettled: (_data, _err, variables) => {
      const keys = options.invalidate?.(variables) ?? [options.queryKey(variables)];
      for (const key of keys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
}
