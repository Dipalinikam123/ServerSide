module.exports = {
  attributes: {
    teamName: {
      type: 'string',
      required: true,
      unique: true
    },
    teamImage: {
      type: 'string',
      allowNull: true
    },
    status: {
      type: 'number',
    },
  }
};
