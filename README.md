# joi-data-model

[![Build Status](https://travis-ci.org/charlieduong94/joi-data-model.svg?branch=master)](https://travis-ci.org/charlieduong94/joi-data-model)
[![Coverage Status](https://coveralls.io/repos/github/charlieduong94/joi-data-model/badge.svg?branch=master)](https://coveralls.io/github/charlieduong94/joi-data-model?branch=master)

Simple data modeling that uses [Joi](https://github.com/hapijs/joi) for performing validation.

### Installation

```bash
npm install joi-data-model
```

### Usage

A minimal example:

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

#### Defining a model

Models are defined using the `define` function exposed by `joi-data-model`.

##### `define(schema [, validationOptions])`

The schema that needs to be passed in is the same input that would normally
be passed into `Joi.object().keys()`.

Example schema:

```js
const personSchema = {
  name: Joi.string(),
  age: Joi.number().integer()
}
```

To define a model class, simply just pass in the schema to the exposed `define` function.

```js
const Person = joiDataModel.define(personSchema)
```

Validation options that are normally passed as the second option of `Joi.validate` can
be passed to `define`.

Example:

```js
const Person = joiDataModel.define(personSchema, {
  abortEarly: false
})
```

#### Instantiating a model

You can create a new instance of model much like how a class instance is instantiated.

```js
const person = new Person()
```

Additionally, an object can be passed into the model's constructor for validation.

```js
const person = new Person({
  name: 'Some name',
  age: 123456
})
```

If the data does not pass validation, an error will be thrown.

```js
const person = new Person({
  name: {
    totally: 'not a string'
  }
})
// ^^^ this will throw a validation error
```

Of course, if the schema has required attributes, missing data will cause errors to be thrown.

For example with the following model:

```js
const Person = joiDataModel.define({
  name: Joi.string().required()
})
```

Performing ether of the following will throw a validation error:
```js
const person = new Person()
```
```js
const person = new Person({})
```

#### Using models

Model instances are designed to be a non-intrusive wrapper for data that ensures
that the schema is always followed.

Using the following model:

```js
const Car = joiDataModel.define({
  make: Joi.string(),
  model: Joi.string(),
  year: Joi.number().integer()
})
```

And the following instance:

```js
const car = new Car({
  make: 'Mazda',
  model: 'Miata',
  year: 1994
})
```

You can access data defined on the schema like you would for a regular object.

```js
const { make, model, year } = car

// make === 'Mazda'
// model === 'Miata'
// year === 1994
```

You can also set data on the model.

```js
car.make = 'Honda' // valid
```

However setting the data to a value that does not match
the schema will cause a validation error.

```js
car.year = 'not a valid year'
// ^^^ throws a validation error
```

#### Extending models

Since a Model is just a Class, it is easy to extend functionality.

Example:
```js
const schema = { name: Joi.string() }

class BaseModel extends joiDataModel.define(schema) {
  stringify () {
    return JSON.stringify(this)
  }
}

const model = new BaseModel({ name: 'some name' })

console.log(model.stringify()) // prints '{"name":"some name"}'
```

The schema can be extended/overridden by using `Model.extend`.

```js
const ageSchema = { age: Joi.number() }

const ExtendedModel = BaseModel.extend(ageSchema)

const model = new ExtendedModel({
  name: 'some one',
  age: 25
})
// ^^ this is a valid model
console.log(model instanceof BaseModel) // prints true
console.log(model.stringify()) // prints '{"name":"some name","age":25}'
```

### Todo
- Immutable model instances
