import * as cp from 'child_process'
import * as util from 'util'

const execAsync = util.promisify(cp.exec)

export interface TrafficInfo {
	received: number
	sent: number
	timestamp: number
}

export default async function getTraffic(ifName: string): Promise<TrafficInfo> {
	if (!ifName) {
		throw new Error('ifName is required')
	}
	const result = await execAsync(`ifconfig ${ifName}`)
	if (result.stderr && !result.stdout) {
		throw new Error(result.stderr)
	}
	const output = result.stdout
	const timestamp = new Date().getTime()
	const lines = output.split('\n').map((s) => s.trim()).filter((s) => !!s)
	let received = 0
	let sent = 0
	for (const l of lines) {
		if (l.startsWith('RX')) {
			const cols = l.split(' ').map((s) => s.trim()).filter((s) => !!s)
			const byteIndex = cols.indexOf('bytes')
			if (byteIndex >= 0) {
				received = parseInt(cols[byteIndex + 1])
			}
		}
		if (l.startsWith('TX')) {
			const cols = l.split(' ').map((s) => s.trim()).filter((s) => !!s)
			const byteIndex = cols.indexOf('bytes')
			if (byteIndex >= 0) {
				sent = parseInt(cols[byteIndex + 1])
			}
		}
	}
	return {
		received,
		sent,
		timestamp
	}
}
