module.exports = {
  attributes: {
    challengeName: {
      type: 'string',
      required: true,
      unique: true
    },
    teams: {
      type: 'json',
      description: 'Array of team objects provided by the frontend',
      required: true,
    },
  },
};
