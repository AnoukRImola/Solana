import type { Buffer } from 'node:buffer'
import type { Layout, Structure as StructureClass } from 'buffer-layout'

declare interface Structure<T> extends StructureClass {
	/** The span of the layout in bytes.
	 *
	 * Positive values are generally expected.
	 *
	 * Zero will only appear in {@link Constant}s and in {@link
	 * Sequence}s where the {@link Sequence#count|count} is zero.
	 *
	 * A negative value indicates that the span is value-specific, and
	 * must be obtained using {@link Layout#getSpan|getSpan}. */
	span: number

	/** The property name used when this layout is represented in an
	 * Object.
	 *
	 * Used only for layouts that {@link Layout#decode|decode} to Object
	 * instances.  If left undefined the span of the unnamed layout will
	 * be treated as padding: it will not be mutated by {@link
	 * Layout#encode|encode} nor represented as a property in the
	 * decoded Object. */
	property: string | undefined

	/** Function to create an Object into which decoded properties will
	 * be written.
	 *
	 * Used only for layouts that {@link Layout#decode|decode} to Object
	 * instances, which means:
	 * * {@link Structure}
	 * * {@link Union}
	 * * {@link VariantLayout}
	 * * {@link BitStructure}
	 *
	 * If left undefined the JavaScript representation of these layouts
	 * will be Object instances.
	 *
	 * See {@link bindConstructorLayout}.
	 */
	makeDestinationObject(): () => T

	/** The sequence of {@link Layout} values that comprise the
	 * structure.
	 *
	 * The individual elements need not be the same type, and may be
	 * either scalar or aggregate layouts.  If a member layout leaves
	 * its {@link Layout#property|property} undefined the
	 * corresponding region of the buffer associated with the element
	 * will not be mutated.
	 *
	 * @type {Layout[]} */
	fields: Layout[]

	/** Control behavior of {@link Layout#decode|decode()} given short
	 * buffers.
	 *
	 * In some situations a structure many be extended with additional
	 * fields over time, with older installations providing only a
	 * prefix of the full structure.  If this property is `true`
	 * decoding will accept those buffers and leave subsequent fields
	 * undefined, as long as the buffer ends at a field boundary.
	 * Defaults to `false`. */
	decodePrefixes?: boolean

	/** Function to create an Object into which decoded properties will
	 * be written.
	 *
	 * Used only for layouts that {@link Layout#decode|decode} to Object
	 * instances, which means:
	 * * {@link Structure}
	 * * {@link Union}
	 * * {@link VariantLayout}
	 * * {@link BitStructure}
	 *
	 * If left undefined the JavaScript representation of these layouts
	 * will be Object instances.
	 *
	 * See {@link bindConstructorLayout}.
	 */
	makeDestinationObject(): () => T

	/**
	 * Get access to the layout of a given property.
	 *
	 * @param property - the structure member of interest.
	 * @returns The layout associated with `property`, or
	 * undefined if there is no such property.
	 */
	layoutFor(property: string): Layout<keyof T> | undefined

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
	offsetOf(property: keyof T): number | undefined

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
	fromArray(values: T[]): T | undefined

	/**
	 * Replicate the layout using a new property.
	 *
	 * This function must be used to get a structurally-equivalent layout
	 * with a different name since all {@link Layout} instances are
	 * immutable.
	 *
	 * **NOTE** This is a shallow copy.  All fields except {@link
	 * Layout#property|property} are strictly equal to the origin layout.
	 *
	 * @param {String} property - the value for {@link
	 * Layout#property|property} in the replica.
	 *
	 * @returns {Layout} - the copy with {@link Layout#property|property}
	 * set to `property`.
	 */
	replicate(property): Layout<T>

	/**
	 * Get the size of the structure in bytes.
	 *
	 * @param src - the value to be encoded into the buffer.
	 * @returns The number of bytes in the structure.
	 */
	getSpan(src: T): number
}
