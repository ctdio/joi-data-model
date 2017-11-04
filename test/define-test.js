const test = require('ava')
const sinon = require('sinon')

const Joi = require('joi')
const { define } = require('../src/index')

const isJoiError = require('./helpers/isJoiError')

test.beforeEach('create sandbox', (t) => {
  const sandbox = sinon.sandbox.create()
  t.context = { sandbox }
})

test.afterEach((t) => {
  const { sandbox } = t.context
  sandbox.restore()
})

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
  t.plan(4)
  const { sandbox } = t.context
  const validateSpy = sandbox.spy(Joi, 'validate')

  const schema = { name: Joi.string() }

  const BaseModel = define(schema)

  const baseModelInput = { name: 'Elliot' }

  t.notThrows(() => new BaseModel(baseModelInput))

  t.notThrows(() => {
    sandbox.assert.calledOnce(validateSpy)

    sandbox.assert.calledWith(validateSpy,
      baseModelInput,
      Joi.object().keys(schema),
      undefined)
  })

  const secondSchema = { age: Joi.number() }

  const combinedSchema = Object.assign({}, schema, secondSchema)

  const TestModel = BaseModel.extend(secondSchema)

  const testModelInput = {
    name: 'Mr. Robot',
    age: 21345
  }

  t.notThrows(() => new TestModel(testModelInput))

  t.notThrows(() => {
    sandbox.assert.calledTwice(validateSpy)

    sandbox.assert.calledWith(validateSpy,
      testModelInput,
      Joi.object().keys(combinedSchema),
      {})
  })
})

test('should allow for validation options to be extended', (t) => {
  t.plan(4)
  const { sandbox } = t.context

  const validateSpy = sandbox.spy(Joi, 'validate')

  const schema = { name: Joi.string() }
  const joiSchema = Joi.object().keys(schema)
  const schemaValidationOptions = { abortEarly: false }

  const BaseModel = define(schema, schemaValidationOptions)

  const baseModelInput = { name: 'Arin' }

  t.notThrows(() => new BaseModel(baseModelInput))

  t.notThrows(() => {
    sandbox.assert.calledOnce(validateSpy)

    sandbox.assert.calledWith(validateSpy,
      baseModelInput,
      joiSchema,
      schemaValidationOptions)
  })

  const secondSchema = {}
  const secondSchemaValidationOptions = { convert: false }

  const combinedValidationOptions = Object.assign({},
    schemaValidationOptions,
    secondSchemaValidationOptions)

  const TestModel = BaseModel.extend(secondSchema,
    secondSchemaValidationOptions)

  const testModelInput = { name: 'Austin' }

  t.notThrows(() => new TestModel(testModelInput))

  t.notThrows(() => {
    sandbox.assert.calledTwice(validateSpy)

    sandbox.assert.calledWith(validateSpy,
      testModelInput,
      joiSchema,
      combinedValidationOptions)
  })
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

test('should allow for models with no required attributes to ' +
'be created with no input', (t) => {
  t.plan(1)
  const schema = {
    name: Joi.string()
  }

  const Model = define(schema)
  const model = new Model()

  t.is(model.name, undefined)
})

test('should NOT allow for models with required attributes to ' +
'be created with no input', (t) => {
  t.plan(2)
  const schema = {
    name: Joi.string().required()
  }

  const Model = define(schema)
  const err = t.throws(() => new Model(), isJoiError)
  t.true(err.message.includes('"name" is required'))
})
