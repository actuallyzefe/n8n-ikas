export class ArrayHelper {

    /**
	 * Extracts valid IDs from a parameter object containing an array of items
     
	 * @param param - The parameter object containing the array
	 * @param key - The key of the array inside the parameter object
	 * @param idField - The field name inside each item that contains the ID
	 * @returns An array of non-empty, trimmed strings
	 */


	public static extractValidIds<T extends Record<string, any>>(
		param: T | undefined,
		key: keyof T,
		idField: string
	): string[] {
		if (!param || !param[key] || !Array.isArray(param[key])) {
			return [];
		}

		return (param[key] as any[])
			.map((item: any) => item[idField])
			.filter((id: string) => id && id.trim() !== '');
	}
}