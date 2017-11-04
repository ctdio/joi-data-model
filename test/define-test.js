const test = require('ava')

const Joi = require('joi')
const { define } = require('../src/index')

const isJoiError = require('./helpers/isJoiError')

test('should be able to perform simple validation on the model', (t) => {
  t.plan(1)
  const testName = 'Charlie'

  const schema = {
    name: Joi.string()
  }

  const TestModel = define(schema)

  t.throws(() => new TestModel({
    name: testName,
    value: 1234
  }))
})

test('should allow for validation options to be passed in', (t) => {
  t.plan(1)

  const testString = 'value'

  const schema = { name: Joi.string() }
  // allowUnknown is normally false
  const validationOptions = { allowUnknown: true }

  const TestModel = define(schema, validationOptions)

  t.notThrows(() => new TestModel({
    name: 'Mabry',
    value: 1234 // <- this would normally throw
  }))
})

test('should throw an error for invalid models', (t) => {
  t.plan(2)

  const schema = {
    name: Joi.string()
  }

  const TestModel = define(schema)

  const err = t.throws(() => new TestModel({
    name: 1234
  }), isJoiError, 'Expected model to throw an error')

  t.true(err.message.includes('must be a string'))
})

test('should allow for schemas models to be extended', (t) => {
  t.plan(1)

  const schema = { name: Joi.string() }

  const BaseModel = define(schema)
  const secondSchema = { age: Joi.number() }

  const TestModel = BaseModel.extend(secondSchema)

  t.notThrows(() => new TestModel({
      name: 'Austin',
      age: 1234
  }))
})

test('extended models should receive the base model\'s prototype', (t) => {
  t.plan(1)

  const schema = { name: Joi.string() }

  class BaseModel extends define(schema) {
    getString () {
      return 'some-string'
    }
  }

  const baseModel = new BaseModel({ name: 'James' })
  const baseString = baseModel.getString()

  const secondSchema = { age: Joi.number() }

  const TestModel = BaseModel.extend(secondSchema)
  const testModel = new TestModel({
    name: 'Casey',
    age: 12345
  })

  t.is(testModel.getString(), baseString)
})
