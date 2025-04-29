import type {
	AxiosError,
	AxiosRequestConfig,
	AxiosResponse,
	RawAxiosResponseHeaders,
} from 'axios'

// ? Error handling

// https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript
export type ErrorWithMessage = {
	message: string
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
	return (
		typeof error === 'object' &&
		error !== null &&
		'message' in error &&
		typeof (error as Record<string, unknown>).message === 'string'
	)
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
	if (isErrorWithMessage(maybeError)) return maybeError

	try {
		return new Error(JSON.stringify(maybeError))
	} catch {
		// fallback in case there's an error stringifying the maybeError
		// like with circular references for example.
		return new Error(String(maybeError))
	}
}

export function getErrorMessage(error: unknown) {
	return toErrorWithMessage(error).message
}

// ? Axios error handling

/**
 * Custom error class for Axios requests.
 * Encapsulates details from AxiosError for better handling.
 */
export class AxiosLibError extends Error {
	isAxiosError = true // Flag to identify Axios errors
	response?: AxiosResponse
	request?: unknown // The request that generated this error
	config?: AxiosRequestConfig // The config that was used to make the request
	code?: string // e.g. 'ECONNABORTED'

	constructor(axiosError: AxiosError) {
		// Pass the original Axios error message to the parent Error constructor
		super(axiosError.message)

		this.name = 'AxiosLibError'
		this.response = axiosError.response
		this.request = axiosError.request
		this.config = axiosError.config
		this.code = axiosError.code

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, AxiosLibError)
		}

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, AxiosLibError.prototype)
	}

	/**
	 * Returns the data from the error response, if available.
	 */
	get data(): Record<string, unknown> | undefined {
		return this.response?.data
	}

	/**
	 * Returns the status code from the error response, if available.
	 */
	get status(): number | undefined {
		return this.response?.status
	}

	/**
	 * Returns the status text from the error response, if available.
	 */
	get statusText(): string | undefined {
		return this.response?.statusText
	}

	/**
	 * Returns the headers from the error response, if available.
	 */
	get headers(): RawAxiosResponseHeaders | undefined {
		return this.response?.headers
	}

	/**
	 * Returns the request method that generated this error, if available.
	 */
	get method(): string | undefined {
		return this.config?.method
	}
}
