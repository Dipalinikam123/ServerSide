module.exports = {
  addSelectedTeam: async (req, res) => {
    console.log('-----req', req.body);
    try {
      const { challengeName, teams } = req.body;
      if (!challengeName || !teams) {
        return res.status(404).json({ message: 'challenge Name & Teams are required' });
      }

      if (!Array.isArray(teams)) {
        return res.badRequest({ error: 'Teams should be an array of team objects' });
      }

      // Create the new challenge record
      const newChallenge = await ConfigureBufferTeam.create({ challengeName, teams }).fetch();

      return res.json(newChallenge);
    } catch (error) {
      return res.serverError(error);
    }
  },
  getSelectedTeam: async function (req, res) {
    try {
      const teams = await ConfigureBufferTeam.find();

      if (!teams) {
        return res.status(404).json({ message: 'Buffer Team not found' });
      }
      return res.status(200).json({ success: true, teams });

    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};