'use client'

import { format, parse } from 'date-fns'
import { Bar, BarChart, CartesianGrid, Cell, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '~/components/ui/chart'
import NoData from '~/components/utils/ui/NoData'
import { useReleaseTrendChartData } from '../../hooks/release-trend-chart-data.hook'

type ReleaseTrend = {
	month: string
	count: number
}[]

export function EscrowReleaseTrendChart({ data }: { data: ReleaseTrend }) {
	const { chartConfig, formatted } = useReleaseTrendChartData(data)
	const hasData = data && data.length > 0

	return (
		<Card>
			<CardHeader>
				<CardTitle>Escrow Release Trend</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[250px] w-full">
					{hasData ? (
						<BarChart accessibilityLayer data={formatted}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="month"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								tickFormatter={(value) => {
									const date = parse(value, 'yyyy-MM', new Date())
									return format(date, 'MMM yyyy').toUpperCase()
								}}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Bar dataKey="count" radius={8}>
								{formatted.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={`hsl(var(--chart-${(index % 6) + 1}))`}
									/>
								))}
							</Bar>
						</BarChart>
					) : (
						<div className="flex flex-col items-center justify-center h-full text-center p-6">
							<NoData />
						</div>
					)}
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
