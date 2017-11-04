const Joi = require('joi')

function _applyKeySchemaToProto (keySchema, proto, dataProp) {
  for (const key in keySchema) {
    Object.defineProperty(proto, key, {
      get () {
        return this[dataProp][key]
      },

      set (value) {
        const schema = keySchema[key]
        this[dataProp][key] = Joi.attempt(value, schema)
      }
    })
  }
}

function _validateSchema (input, schema, options) {
  const { value, error } = Joi.validate(input, schema, options)

  if (error) {
    throw error
  }

  return value
}

function JoiModel (keySchema, options) {
  const schema = Joi.object().keys(keySchema)
  const dataProp = Symbol('data')
  const validateProp = Symbol('validate')

  class Model {
    static wrap (input) {
      return new Model(input)
    }

    static extend (extendedSchema, options) {
      const newSchema = { ...keySchema, ...extendedSchema }

      // new model extends the current model but overrides the validation function
      class NewModel extends this {}

      _applyKeySchemaToProto(newSchema, NewModel.prototype, dataProp)

      NewModel.prototype[validateProp] = function (input) {
        return _validateSchema(input, newSchema, options)
      }

      return NewModel
    }

    constructor (input) {
      this[dataProp] = this[validateProp](input)
    }

    /**
     * Return the pure json representation of the model
     * Note: this also allows for the model to be stringified
     */
    toJSON () {
      return this[dataProp]
    }
  }

  Model.schema = schema

  _applyKeySchemaToProto(keySchema, Model.prototype, dataProp)

  Model.prototype[validateProp] = function (input) {
    return _validateSchema(input, schema, options)
  }

  return Model
}

module.exports = JoiModel
