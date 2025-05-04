import type { Buffer } from 'node:buffer'
import type { Structure as StructureClass } from 'buffer-layout'
import type { Layout } from 'buffer-layout'

declare interface Structure extends StructureClass {
	/**
	 * An array of the Layout instances used in the structure.
	 */
	fields: Layout<any>[]

	/**
	 * If true, fields that are themselves Structures or Unions will
	 * be decoded only up to the point needed to identify a property,
	 * rather than being fully decoded. Defaults to false.
	 */
	decodePrefixes?: boolean

	/**
	 * Get access to the layout of a given property.
	 *
	 * @param property - the structure member of interest.
	 * @returns The layout associated with `property`, or
	 * undefined if there is no such property.
	 */
	layoutFor(property: string): Layout<any> | undefined

	/**
	 * Get the offset of a structure member.
	 *
	 * @param property - the structure member of interest.
	 * @returns The offset in bytes to the start of `property`
	 * within the structure, or undefined if `property` is not a field
	 * within the structure. If the property is a member but follows a
	 * variable-length structure member a negative number will be
	 * returned.
	 */
	offsetOf(property: string): number | undefined

	/**
	 * Decode from a Buffer into the structure's fields.
	 *
	 * @param b - the buffer from which encoded data is read.
	 * @param offset - the offset at which the encoded data
	 * starts. If absent a zero offset is inferred.
	 * @returns The value of the decoded data.
	 */
	decode(b: Buffer, offset?: number): T

	/**
	 * Encode the structure's fields into a Buffer.
	 *
	 * If `src` is missing a property for a member with a defined
	 * {@link Layout.property} the corresponding region of the buffer is
	 * left unmodified.
	 *
	 * @param src - the value to be encoded into the buffer.
	 * @param b - the buffer into which encoded data will be
	 * written.
	 * @param offset - the offset at which the encoded data
	 * starts. If absent a zero offset is inferred.
	 * @returns The number of bytes encoded.
	 */
	encode(src: T, b: Buffer, offset?: number): number

	/**
	 * Create an object from layout properties and an array of values.
	 *
	 * @param values - an array of values that correspond to the
	 * default order for properties. Layout elements that have no property
	 * name are skipped. Only the top-level properties are assigned.
	 * Any unused values are ignored.
	 * @returns The created object or undefined if called on a layout
	 * that does not return an Object.
	 */
	fromArray(values: any[]): T | undefined
}
