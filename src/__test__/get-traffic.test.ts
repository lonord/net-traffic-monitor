import * as assert from 'assert'
import * as fake from 'fake-exec'
import * as fs from 'fs'
import 'mocha'
import * as path from 'path'
import getTraffic from '../get-traffic'

fake('ifconfig eth1', {
	stdout: fs.readFileSync(path.join(__dirname, '../../resource/__test__/eth1.txt'), 'utf8')
})

describe('test-get-traffic', () => {

	it('test-get-traffic', async () => {
		const result = await getTraffic('eth1')
		assert.equal(result.received, 2638580407)
		assert.equal(result.sent, 722584400)
	})

})
