const test = require('ava')
const sinon = require('sinon')

const Joi = require('joi')
const { define } = require('../src/index')

const isJoiError = require('./helpers/isJoiError')

const testName = 'some-name'
const testAge = 12345

const schema = {
  name: Joi.string(),
  age: Joi.number()
}

const validationOptions = { abortEarly: true }

const TestModel = define(schema, validationOptions)

test.beforeEach((t) => {
  const sandbox = sinon.sandbox.create()

  const testModel = new TestModel({
    name: testName,
    age: testAge
  })

  t.context = { testModel, sandbox }
})

test.afterEach((t) => {
  const { sandbox } = t.context
  sandbox.restore()
})

test('should allow for data on the schema to be retrieved from the model', (t) => {
  t.plan(2)
  const { testModel } = t.context
  const { name, age } = testModel

  t.is(name, testName)
  t.is(age, testAge)
})

test('should allow for data to be modified if validation passes', (t) => {
  t.plan(1)
  const { testModel } = t.context

  t.notThrows(() => {
    testModel.name = 'Different name'
    testModel.age = 60000
  })
})

test('should for data to be modified if validation passes', (t) => {
  t.plan(1)
  const { testModel } = t.context

  t.throws(() => {
    testModel.name = 123456
  }, isJoiError, 'should throw an assertion error')
})

test('#Model.getSchema should return the schema that was used to define the model', (t) => {
  t.plan(1)
  t.deepEqual(TestModel.getSchema(), Joi.object().keys(schema))
})

test('#toJSON should return a pure json representation of the model', (t) => {
  t.plan(1)

  const { testModel } = t.context

  const json = testModel.toJSON()

  t.deepEqual(json, { name: testName, age: testAge })
})

test('#toJSON should return a pure json clone of the model', (t) => {
  t.plan(3)
  const { testModel } = t.context
  const json = testModel.toJSON()

  t.deepEqual(json, { name: testName, age: testAge })

  json.name = 1234

  t.not(json.name, testModel.name)
  t.is(Object.getPrototypeOf(json), Object.prototype)
})

test('#Model.validate should perform plain joi validation on the ' +
'object with the given ', (t) => {
  const { sandbox } = t.context
  const validateSpy = sandbox.spy(Joi, 'validate')

  const input = { name: 'string', age: 123 }

  const data = TestModel.validate(input)

  t.deepEqual(data, input)

  t.notThrows(() => {
    sandbox.assert.calledOnce(validateSpy)
    sandbox.assert.calledWith(validateSpy,
      input,
      Joi.object().keys(schema),
      validationOptions)
  })
})
