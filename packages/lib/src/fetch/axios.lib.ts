import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { AxiosLibError } from '../error'

/**
 * Makes an HTTP request using Axios and returns the response data.
 * Throws an AxiosLibError for HTTP errors (non-2xx status codes) or network issues.
 *
 * @template T The expected type of the response data.
 * @param {string} url The URL to request.
 * @param {AxiosRequestConfig} [config] Optional Axios request configuration.
 * @returns {Promise<T>} A promise that resolves with the response data.
 * @throws {AxiosLibError} If the request fails or returns a non-2xx status code.
 * @throws {Error} For non-Axios related errors during the request setup or processing.
 */
export async function axiosRequest<T = unknown>(
	url: string,
	config?: AxiosRequestConfig,
): Promise<T> {
	try {
		const response: AxiosResponse<T> = await axios(url, config)
		// Axios typically considers only 2xx status codes as success by default
		return response.data
	} catch (error) {
		if (axios.isAxiosError(error)) {
			// Throw our custom error wrapper for Axios errors
			throw new AxiosLibError(error)
		}

		// Re-throw other types of errors (e.g., configuration errors)
		// Or wrap it in a generic error if preferred
		throw error instanceof Error
			? error
			: new Error('An unknown error occurred')
	}
}

// Example helper methods for common HTTP verbs

export function axiosGet<T = unknown>(
	url: string,
	config?: AxiosRequestConfig,
): Promise<T> {
	return axiosRequest<T>(url, { ...config, method: 'GET' })
}

export function axiosPost<T = unknown>(
	url: string,
	data?: Record<string, unknown>,
	config?: AxiosRequestConfig,
): Promise<T> {
	return axiosRequest<T>(url, { ...config, method: 'POST', data })
}

export function axiosPut<T = unknown>(
	url: string,
	data?: Record<string, unknown>,
	config?: AxiosRequestConfig,
): Promise<T> {
	return axiosRequest<T>(url, { ...config, method: 'PUT', data })
}

export function axiosDelete<T = unknown>(
	url: string,
	config?: AxiosRequestConfig,
): Promise<T> {
	return axiosRequest<T>(url, { ...config, method: 'DELETE' })
}

export function axiosPatch<T = unknown>(
	url: string,
	data?: Record<string, unknown>,
	config?: AxiosRequestConfig,
): Promise<T> {
	return axiosRequest<T>(url, { ...config, method: 'PATCH', data })
}
