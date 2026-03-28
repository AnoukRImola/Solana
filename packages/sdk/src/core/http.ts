import axios, { type AxiosInstance } from 'axios'
import { TrustlessWorkError } from './errors'

export function createHttpClient(baseURL: string, apiKey?: string): AxiosInstance {
	const client = axios.create({
		baseURL,
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (apiKey) {
		client.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`
	}

	client.interceptors.response.use(
		(response) => response,
		(error) => {
			if (axios.isAxiosError(error)) {
				throw new TrustlessWorkError(
					error.response?.data?.message || error.message,
					error.response?.status || 500,
					error.response?.data,
				)
			}
			throw error
		},
	)

	return client
}
