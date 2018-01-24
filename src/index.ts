import getTraffic, { TrafficInfo } from './get-traffic'

export interface TrafficSpeed {
	receive: number
	send: number
}

export interface TrafficSpeedWatcher {
	stop(): void
}

export async function getCurrentTrafficSpeed(ifName: string, interval?: number): Promise<TrafficSpeed> {
	interval = interval || 1000
	const firstTraffic = await getTraffic(ifName)
	await wait(interval)
	const secondTraffic = await getTraffic(ifName)
	return calculateTrafficSpeed(firstTraffic, secondTraffic)
}

export async function watchTrafficSpeed(ifName: string, interval: number,
	speedReport: (speed: TrafficSpeed) => void, onError?: (err: any) => void) {
	interval = interval || 3000
	let lastTraffic = await getTraffic(ifName)
	let timer: any = setInterval(() => {
		getTraffic(ifName).then((t) => {
			speedReport(calculateTrafficSpeed(lastTraffic, t))
			lastTraffic = t
		}).catch((err) => {
			onError && onError(err)
			clearInterval(timer)
			timer = undefined
		})
	}, interval)
	return {
		stop: () => {
			timer && clearInterval(timer)
			timer = undefined
		}
	}
}

function wait(milliseconds: number) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function calculateTrafficSpeed(firstTraffic: TrafficInfo, secondTraffic: TrafficInfo): TrafficSpeed {
	const receive = Math.floor((secondTraffic.received - firstTraffic.received) * 1000
		/ (secondTraffic.timestamp - firstTraffic.timestamp))
	const send = Math.floor((secondTraffic.sent - firstTraffic.sent) * 1000
		/ (secondTraffic.timestamp - firstTraffic.timestamp))
	return {
		receive,
		send
	}
}
