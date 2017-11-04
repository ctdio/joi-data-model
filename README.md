# joi-data-model

Simple data modeling using [Joi](https://github.com/hapijs/joi) for validation.

### Installation

```bash
npm install joi-data-model
```

### Usage

A basic example:

```js
const Joi = require('Joi')
const joiDataModel = require('joi-data-model')

const schema = { name: Joi.string() }

const Person = joiDataModel.define(schema)

const person = new Person({
  name: 1234
})
// ^^^ throws a validation error
```

The schema that defines the model is used to validate changes to
the model instance match the schema that has been validated.

```js
const person = new Person({
  name: 'some name'
})

person.name = 1234 // throws validation err
```

### Extending models

Models can be extended easily.

```js
class BaseModel extends joiDataModel.define(schema) {
  stringify () {
    return JSON.stringify(this)
  }
}
```

The schema can be extended/overridden by using `Model.extends`

```js
const Person = joiDataModel.define({ name: Joi.string() })

const ageSchema = { age: Joi.number() }

const PersonWithAge = Person.extends(ageSchema)

const person = new PersonWithAge({
  name: 'some one',
  age: 25
})

// ^^ this is a valid model
```

### Todo
- Document model validation options
