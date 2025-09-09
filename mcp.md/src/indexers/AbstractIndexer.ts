export default abstract class AbstractIndexer<T> extends Map<string, T> {
  /**
   * Maps the indexes to whatever the callback returns
   */
  public map<U>(
    callback: (
      value: T, 
      key: string, 
      index: number
    ) => U
  ) {
    const results: U[] = [];
    let i = 0;
    for (const [ key, value ] of this.entries()) {
      results.push(callback(value, key, i));
      i++;
    }
    return results;
  }

  /**
   * Maps to object
   */
  public mapToObject<U>(
    callback: (
      value: T, 
      key: string, 
      index: number
    ) => [ string, U ]
  ) {
    const results: Record<string, U> = {};
    let i = 0;
    for (const [ key, value ] of this.entries()) {
      const [k, v] = callback(value, key, i);
      results[k] = v;
      i++;
    }
    return results;
  }
  
  /**
   * Saves the index to disk as JSON.
   */
  public abstract save(storage: string): Promise<this>;

  /**
   * Converts map to object
   */
  public toObject() {
    return Object.fromEntries(this.entries());
  }
};