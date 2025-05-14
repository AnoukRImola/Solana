'use client'

import type { Escrow } from '~/@types/escrow.entity'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { TopEscrowsTable } from '../tables/TopEscrowsTable'
import { SkeletonTopEscrowsTable } from '../utils/SkeletonTopEscrowsTable'

type TopEscrowsListProps = {
	escrows: Escrow[]
}

export function TopEscrowsList({ escrows }: TopEscrowsListProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Most Recents Escrows</CardTitle>
			</CardHeader>
			<CardContent className="overflow-auto px-5">
				{escrows ? (
					<TopEscrowsTable escrows={escrows} />
				) : (
					<SkeletonTopEscrowsTable />
				)}
			</CardContent>
		</Card>
	)
}
