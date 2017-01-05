import assert from 'assert'
import Connector from '../../src/common/connector'

describe('test for connector', function() {
    const fc = new Connector('test/conf.json', {})
    it('test for read and write', function() {
        let roleConf = [{'name': 'gate-server'}]
        fc.updateRole('gate', roleConf)
        assert.equal(fc.getRole('gate'), roleConf)
    })
})