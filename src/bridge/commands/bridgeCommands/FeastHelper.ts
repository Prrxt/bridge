import feastData from "./feastRotations.json" with { type: "json" }

interface FeastRotation {
	endTime: number
	crops: string[]
	isGrandFeast: boolean
}

class FeastCommandHelper {
	getCurrentRotation(): FeastRotation | null {
		const now = Date.now()

		return feastData.find(rotation => now < rotation.endTime) ?? null
	}

	getNextRotation(): FeastRotation | null {
		const now = Date.now()

		const future = feastData.filter(rotation => now < rotation.endTime)

		return future.length > 1 ? future[1] : null
	}

	getFeastSummary(): string {
		const current = this.getCurrentRotation()

		if (!current) {
			return "Feast schedule unavailable."
		}

		let response = `Current: ${current.crops.join(", ")}`

		if (current.isGrandFeast) {
			response += " (Grand Feast)"
		}

		const next = this.getNextRotation()

		if (next) {
			const remaining = next.endTime - current.endTime

			const hours = Math.floor(remaining / (1000 * 60 * 60))

			response += `. Next: ${next.crops.join(", ")} in ${hours}h`
		}

		return response
	}
}

export default new FeastCommandHelper()
