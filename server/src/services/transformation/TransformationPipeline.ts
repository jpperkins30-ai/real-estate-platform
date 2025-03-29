/**
 * TransformationPipeline service for data transformation operations
 */

type TransformFunction<T> = (data: T) => T;

export class TransformationPipeline<T> {
  private transformers: TransformFunction<T>[] = [];

  /**
   * Add a transformation step to the pipeline
   * @param transformer Function to transform the data
   */
  addTransformer(transformer: TransformFunction<T>): TransformationPipeline<T> {
    this.transformers.push(transformer);
    return this;
  }

  /**
   * Process data through the transformation pipeline
   * @param data Data to transform
   * @returns Transformed data
   */
  process(data: T): T {
    return this.transformers.reduce(
      (transformedData, transformer) => transformer(transformedData),
      data
    );
  }

  /**
   * Reset the transformation pipeline
   */
  reset(): TransformationPipeline<T> {
    this.transformers = [];
    return this;
  }
} 