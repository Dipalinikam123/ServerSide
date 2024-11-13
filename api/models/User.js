/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    firstName: {
      type: 'string',
      required: true,
    },
    lastName: {
      type: 'string',
      required: true,
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      isEmail: true,
    },
    password: {
      type: 'string',
      required: true,
    },
    gender: {
      type: 'string',
      required: true,
    },
    token: {
      type: 'string',
      defaultsTo: '',
    },
    resetToken: {
      type: 'string',
      defaultsTo: '',
    }
  },

};

