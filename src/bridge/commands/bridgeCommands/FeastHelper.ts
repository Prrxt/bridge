const API_BASE = "https://api.elitebot.dev";

interface FeastRotation {
	endTime: number;
	crops: string[];
	isGrandFeast: boolean;
}

interface FeastApiResponse {
	current: FeastRotation | null;
	next: FeastRotation | null;
}

class FeastHelper {
	private async fetchRotations(): Promise<FeastApiResponse> {
		const response = await fetch(`${API_BASE}/harvest-feast/current`);
		if (!response.ok) {
			throw new Error(`Failed to fetch feast data: ${response.status}`);
		}
		return response.json() as Promise<FeastApiResponse>;
	}

	async getCurrentRotation(): Promise<FeastRotation | null> {
		const { current } = await this.fetchRotations();
		return current;
	}

	async getNextRotation(): Promise<FeastRotation | null> {
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

		const { current, next } = data;

		if (!current) {
			return "Feast schedule unavailable.";
		}

		let response = `Current: ${current.crops.join(", ")}`;
		if (current.isGrandFeast) {
			response += " (Grand Feast)";
		}

		if (next) {
			const remaining = next.endTime - current.endTime;
			const hours = Math.floor(remaining / (1000 * 60 * 60));
			response += `. Next: ${next.crops.join(", ")} in ${hours}h`;
		}

		return response;
	}
}

export default new FeastHelper();
