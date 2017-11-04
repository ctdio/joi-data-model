const test = require('ava')

const Joi = require('joi')
const JoiModel = require('../index')

test('should throw an error for invalid models', (t) => {
  t.plan(2)

  const schema = {
    name: Joi.string()
  }

  const TestModel = JoiModel(schema)

  try {
    const testModel = new TestModel({
      name: 'string'
    })

    const { name } = testModel

    testModel.name = 1234
  } catch (err) {
    t.true(err.isJoi)
    t.true(err.message.includes('must be a string'))
  }
})

test.only('should allow for models to be recreated', (t) => {
  t.plan(0)

  const schema = {
    name: Joi.string()
  }

  class BaseModel extends JoiModel(schema) {
    stringify () {
      return JSON.stringify(this)
    }
  }

  const secondSchema = { age: Joi.number() }
  const secondSchemaOptions = { abortEarly: false }

  const TestModel = BaseModel.extend(secondSchema, secondSchemaOptions)

  try {
    const testModel = new TestModel({
      name: 'name',
      age: 1234
    })

    console.log(testModel.stringify())
  } catch (err) {
    t.true(err.isJoi)
    t.true(err.message.includes('must be a string'))
    t.true(err.message.includes('must be a number'))
  }
})
