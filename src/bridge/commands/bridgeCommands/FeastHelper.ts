const API_BASE = "https://api.elitebot.dev";

interface FeastApiResponse {
	year: number;
	month: number;
	complete: boolean;
	current: string[];
	next: Record<string, number | null>;
	isGrandFeast: boolean;
}

class FeastHelper {
	private async fetchRotations(): Promise<FeastApiResponse> {
		const response = await fetch(`${API_BASE}/harvest-feast/current`);
		if (!response.ok) {
			throw new Error(`Failed to fetch feast data: ${response.status}`);
		}
		return response.json() as Promise<FeastApiResponse>;
	}

	async getCurrentCrops(): Promise<string[]> {
		const { current } = await this.fetchRotations();
		return current;
	}

	async getNextCrops(): Promise<Record<string, number | null>> {
		const { next } = await this.fetchRotations();
		return next;
	}

	async getFeastSummary(): Promise<string> {
		let data: FeastApiResponse;
		try {
			data = await this.fetchRotations();
		} catch {
			return "Feast schedule unavailable.";
		}

		const { current, next, isGrandFeast } = data;

		if (!current || current.length === 0) {
			return "Feast schedule unavailable.";
		}

		let summary = `Current: ${current.join(", ")}`;
		if (isGrandFeast) {
			summary += " (Grand Feast)";
		}

		const knownTimestamps = Object.values(next).filter((t): t is number => t !== null);

		if (knownTimestamps.length > 0) {
			const soonest = Math.min(...knownTimestamps);
			const nextSoonestCrops = Object.entries(next)
				.filter(([, t]) => t === soonest)
				.map(([crop]) => crop);
			const remaining = soonest * 1000 - Date.now();
			const hours = Math.floor(remaining / (1000 * 60 * 60));
			summary += `. Next: ${nextSoonestCrops.join(", ")} in ${hours}h`;
		} else if (Object.keys(next).length > 0) {
			// Next crops are known but timestamps aren't reported yet
			summary += `. Next: ${Object.keys(next).join(", ")} (time unknown)`;
		}

		return summary;
	}
}

export default new FeastHelper();
